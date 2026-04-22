# Arquitetura Futura: Single-Path + Cookie-Based VSL Switch

> **Status:** Backlog (não implementar agora)
> **Pré-requisito:** Spec 001 concluída + feat de redirect-to-White em produção.

## Motivação

Hoje o sistema tem dois paths reais no S3:

- `/p/3f86c2c3fd84/` → VSL White (compliant)
- `/p/e937187b865c/` → VSL Black (SMS-optimized)

Ambos são servidos diretamente pela CloudFront Function sem validação adicional. Isso significa que **qualquer um que descubra a string `e937187b865c` (12 chars) tem acesso direto à Black sem HMAC e sem expiração**. Risco contido hoje (string não publicada), mas é um ponto fraco do modelo de ameaça — idealmente não deveria existir *nenhum* caminho direto para a Black.

**Objetivo:** consolidar em um único path físico e deixar toda a decisão White/Black dependendo de HMAC válido gerado pelo Build-URL.

---

## Arquitetura Proposta

### Estrutura S3

```
/p/3f86c2c3fd84/     ← único diretório físico
  index.html         ← HTML único (default renderiza como White)
  css/
  img/
  upsell/, upsell2/, upsell3/, downsell/, downsell2/
```

O diretório `/p/e937187b865c/` é **removido**.

### CloudFront Function (viewer-request)

| Request | Resposta |
|---------|----------|
| `/p/PAYLOAD.SIG/` — HMAC válido + não expirado | **302** → `/p/3f86c2c3fd84/` com `Set-Cookie: vsl_mode=b; Path=/; Max-Age=3600; Secure; SameSite=Lax` |
| `/p/PAYLOAD.SIG/` — HMAC inválido ou expirado | **302** → `/p/3f86c2c3fd84/` (sem cookie) |
| `/p/3f86c2c3fd84/*` | Serve direto do S3 |
| Qualquer outro | **404** |

### Client-Side (`assets/shared/js/vsl-token.js`)

```js
(function () {
  var m = document.cookie.match(/(?:^|;\s*)vsl_mode=b(?:;|$)/);
  window.VSL_VIDEO_ID = m ? VSL_BLACK_ID : VSL_WHITE_ID;
  // preload do player permanece igual ao atual
})();
```

Remove-se a lógica antiga de `sessionStorage` e fragment hash — o cookie substitui ambos.

---

## Por que funciona

1. **Não existe mais path que serve Black diretamente.** Acesso à Black exige HMAC válido + dentro do prazo → CartPanda/revisor nunca consegue reproduzir.
2. **Cookie é first-party** (mesmo domínio), funciona mesmo com bloqueio de third-party cookies.
3. **Persiste no funil** (upsell1/upsell2/...) dentro do Max-Age sem re-passar token por step.
4. **Fail-safe extremo:** qualquer URL que não seja o path único + HMAC válido → White (ou 404 para padrões malformados).

---

## Tradeoffs

- **1 RTT extra** do 302 (negligível em CloudFront, < 50ms).
- **Cookie precisa ser legível por JS** (sem `HttpOnly`) — só carrega um bit de modo, sem dados sensíveis.
- **Vturb precisa decidir o ID antes do player carregar** — mantido via script síncrono no `<head>` (comportamento atual).

---

## Alternativas Consideradas (piores)

| Alternativa | Problema |
|-------------|----------|
| Query string `?m=b` | Vaza em `cpsales.js`, `Referer`, logs S3/CloudFront |
| Fragment hash `#TOKEN` | Quebra se lead compartilhar URL após redirect; mecanismo antigo já descontinuado |
| Lambda@Edge injetando HTML | Mais caro, mais lento, complexidade desnecessária |
| Dois HTMLs no mesmo diretório (`index.html` + `_b.html`) | Ainda expõe filename que serve Black se acessado direto |

---

## Critérios para Executar

Não implementar até que um dos seguintes seja verdade:

1. Expansão do funil para afiliados que não devem ter acesso à Black.
2. Refactor grande em `vsl-token.js` por outro motivo (aproveitar a janela).
3. Criação de novo funil (nasce já com essa arquitetura).
4. Incidente de vazamento do path `e937187b865c`.

---

## Passos de Migração (quando for hora)

1. Atualizar `vsl-token.js` para ler cookie em vez de sessionStorage/hash.
2. Atualizar CloudFront Function:
   - Remover branch `if (uri.indexOf("/p/e937187b865c") === 0)`.
   - Trocar `request.uri = "/p/e937187b865c/index.html"` por resposta 302 com Set-Cookie.
   - Manter redirect-to-White para HMAC inválido/expirado (sem cookie).
3. Remover diretório `p/e937187b865c/` do repositório.
4. Deploy CloudFront Function + `aws s3 sync --delete` (remove Black do bucket).
5. Invalidação CloudFront `/*`.
6. Smoke test:
   - Link novo do Build-URL → White com cookie → player Black carrega.
   - Acesso direto a `/p/3f86c2c3fd84/` → White (sem cookie, sem Black).
   - URL antiga `/p/e937187b865c/` → 404.
   - URL expirada → White, sem cookie.

---

## Referências

- Spec original: [001-vsl-w-vsl-b-600-paths.md](./001-vsl-w-vsl-b-600-paths.md)
- Função atual: [../../infra/cloudfront-function.js](../../infra/cloudfront-function.js)
- Token client-side: [../../assets/shared/js/vsl-token.js](../../assets/shared/js/vsl-token.js)
