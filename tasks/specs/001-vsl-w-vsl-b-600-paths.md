# Feature: VSL-W / VSL-B + 600 Paths (Cloaking System)

## Contexto

**Problema:** O funil VSL do SlimFix está em `cpda/vsl/` — URL previsível, estrutura exposta.
A CartPanda inspeciona VSLs com copy agressivo ("VSL Black") e pode suspender a conta.
Leads vindos de SMS convertem melhor com copy sem restrições, mas exigem isolamento.

**Objetivo:**
1. Ocultar a estrutura real do funil por trás de 600 paths opacos.
2. Servir a VSL White (CartPanda-compliant) para qualquer um dos 599 paths públicos.
3. Servir a VSL Black (SMS-optimized) para 1 path secreto + hash token.

**Referência:** Implementação idêntica no projeto BurnForce (`/Users/gustavo/Documents/BurnForce`).

---

## Arquitetura da Solução

Dois fatores de proteção combinados:

1. **600 paths opacos via CloudFront Function** — todos os 600 servem a VSL White,
   exceto 1 path secreto que serve a VSL Black. A URL Black nunca é referenciada em
   nenhum HTML público — só existe nos links de SMS.

2. **Hash token como segundo fator** — o path secreto só ativa a VSL Black quando
   acompanhado de `#TOKEN_SECRETO` na URL. O fragment hash nunca é enviado a servidores
   (nem AWS, nem CartPanda) — é puramente client-side.

**URL para campanhas SMS:**
```
https://theslimflix.shop/p/HASH_SECRETO/#TOKEN_SECRETO
```

**URL para CartPanda (qualquer dos 599 paths públicos):**
```
https://theslimflix.shop/p/HASH_QUALQUER/
```

A única diferença entre as duas versões é o **ID do player Vturb** carregado.

---

## Parte 1 — CloudFront Function (600 paths)

### Comportamento

- Request em `/p/HASH/` → CloudFront Function decide qual HTML servir no S3.
- Hash == `BLACK_PATH` → S3 serve `p/HASH_BLACK/index.html`.
- Hash == qualquer outro dos 599 → S3 serve `p/HASH_WHITE/index.html`.
- Hash não reconhecido → retorna 404.
- Function roda em **viewer-request** (antes do cache).

### Implementação

Criar `infra/cloudfront-function.js` com:

```js
var DECOY_PATHS = {
  // 600 hashes de 12 chars gerados com uuid truncado
  // ex: "xaji0y6dpbhs": 1, "9t84azytjxep": 1, ...
};

var BLACK_PATH = "PREENCHER"; // 1 dos 600 hashes — apenas para SMS

function handler(event) {
  var request = event.request;
  var uri = request.uri;
  var path = uri.replace(/\/$/, "").replace(/^\/p\//, "");

  if (!DECOY_PATHS[path]) {
    return { statusCode: 404, statusDescription: "Not Found" };
  }

  if (path === BLACK_PATH) {
    request.uri = "/p/HASH_BLACK/index.html";
    return request;
  }

  request.uri = "/p/HASH_WHITE/index.html";
  return request;
}
```

Gerar os 600 hashes com Node.js:
```js
const { randomUUID } = require("crypto");
const paths = {};
for (let i = 0; i < 600; i++) {
  paths[randomUUID().replace(/-/g, "").slice(0, 12)] = 1;
}
console.log(JSON.stringify(paths, null, 2));
```

### Estrutura de diretórios no S3

```
p/
  HASH_WHITE/        ← gerado e fixo (ex: 3f8a12dc6e01)
    index.html
    css/
    img/
  HASH_BLACK/        ← gerado e fixo (ex: b7c94ef21a5d)
    index.html       ← idêntico ao White em HTML
    css/
    img/
```

> Os 600 paths do array são **decoy** — não existe arquivo físico no S3 para eles.
> Apenas `HASH_WHITE` e `HASH_BLACK` têm diretórios reais.

### AWS Deploy

- Distribuição CloudFront: **PREENCHER** (ex: `E34P6ONBD8CGKO` do BurnForce)
- S3 Bucket: **PREENCHER** (ex: `slimfix-lp`)
- Associar Function ao behavior `/p/*` (viewer-request).
- Criar `infra/deploy.sh` análogo ao BurnForce.

### Restrições

- **NÃO** expor `BLACK_PATH` em logs, comentários ou variáveis legíveis.
- **NÃO** criar arquivos físicos no S3 para os 599 paths decoy.
- **NÃO** revelar `HASH_WHITE` ou `HASH_BLACK` em nenhum HTML público (lgl, DTC, etc).

---

## Parte 2 — Hash Token (segundo fator client-side)

### Comportamento

- URL com `#TOKEN_SECRETO` → `window.VSL_VIDEO_ID = VSL_BLACK_ID`
- URL sem hash / hash errado → `window.VSL_VIDEO_ID = VSL_WHITE_ID` (fail-safe)
- Após detecção, hash é removido da barra de endereço via `history.replaceState`.
- `cpsales.js` (CartPanda) sempre vê URL limpa — o fragment não é enviado a servidores.

### Por que usar hash

O fragment `#` nunca é enviado ao servidor (regra do protocolo HTTP):
- Não aparece em access logs S3/CloudFront.
- Não aparece no header `Referer` enviado para terceiros.
- `cpsales.js` recebe URL limpa sem necessidade de manipulação adicional.

### Implementação

Criar `assets/shared/js/vsl-token.js`:

```js
var VSL_TOKEN = "PREENCHER";          // token secreto (ex: "a7f3c1b8e2")
var VSL_WHITE_ID = "PREENCHER";       // ID player Vturb — VSL White
var VSL_BLACK_ID = "PREENCHER";       // ID player Vturb — VSL Black
var VSL_ACCOUNT_ID = "PREENCHER";     // Account ID Vturb da SlimFix

(function () {
  var h = window.location.hash.replace("#", "");
  window.VSL_VIDEO_ID = (h === VSL_TOKEN) ? VSL_BLACK_ID : VSL_WHITE_ID;
  history.replaceState(null, "", window.location.pathname);

  window._plt = window._plt || (
    performance && performance.timeOrigin
      ? performance.timeOrigin + performance.now()
      : Date.now()
  );

  var l = document.createElement("link");
  l.rel = "preload";
  l.href = "https://scripts.converteai.net/" + VSL_ACCOUNT_ID + "/players/" + window.VSL_VIDEO_ID + "/v4/player.js";
  l.as = "script";
  document.head.appendChild(l);
})();
```

### Posição no HTML

Deve ser o **primeiro `<script>` síncrono** no `<head>`, antes do `cpsales.js`:

```html
<head>
  <!-- ... meta, fonts, bootstrap, css ... -->
  <script src="/assets/shared/js/vsl-token.js"></script>  <!-- PRIMEIRO -->
  <script src="https://assets.mycartpanda.com/cartx-ecomm-ui-assets/js/cpsales.js"></script>
  <!-- ... demais scripts ... -->
</head>
```

### Restrições

- Usar `var` (não `const`/`let`) para escopo global sem bundler.
- **NÃO** logar token ou IDs no `console`.
- Script **síncrono** (sem `defer`/`async`) — `VSL_VIDEO_ID` deve estar disponível antes do Vturb inicializar.

---

## Parte 3 — Embed do Player Vturb

### Comportamento

- Player carrega usando `window.VSL_VIDEO_ID` definido pelo `vsl-token.js`.
- Ocupa a seção `<section id="video">` já existente no HTML.
- CTA detection: poll `.smartplayer-anchor-button` a cada 500ms até ficar visível.
- Ao detectar CTA: revela `<main class="esconder">`, esconde o CTA, armazena flag em localStorage.

### Implementação

**No `<head>` (após `vsl-token.js`):**
```html
<script>
  window._plt = window._plt || Date.now();
  var s = document.createElement("script");
  s.src = "https://scripts.converteai.net/" + VSL_ACCOUNT_ID + "/players/" + window.VSL_VIDEO_ID + "/v4/player.js";
  s.async = true;
  document.head.appendChild(s);
</script>
```

**Dentro de `<section id="video">`:**
```html
<div class="container py-3">
  <div id="vid_PLAYER_ID" style="position:relative;width:100%;padding: 56.25% 0 0;">
    <img id="thumb_PLAYER_ID" src="https://images.converteai.net/VSL_ACCOUNT_ID/players/VSL_VIDEO_ID/thumbnail.png"
      style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;display:block;">
    <div id="backdrop_PLAYER_ID" style="position:absolute;top:0;width:100%;height:100%;-webkit-backdrop-filter:blur(5px);backdrop-filter:blur(5px);"></div>
  </div>
  <script type="text/javascript" id="scr_PLAYER_ID">
    var s = document.createElement("script");
    s.src = "https://scripts.converteai.net/VSL_ACCOUNT_ID/players/VSL_VIDEO_ID/player.js";
    s.async = true;
    document.head.appendChild(s);
  </script>
</div>
```

> **Nota:** Substituir `PLAYER_ID`, `VSL_ACCOUNT_ID`, `VSL_VIDEO_ID` pelos valores reais.
> Blocos idênticos para White e Black (o `window.VSL_VIDEO_ID` já direciona para o certo).

**Script inline de CTA detection (antes de `</body>`):**
```html
<script>
(function () {
  var LS_KEY = "slimfix_cta_displayed";
  var main = document.querySelector("main.esconder");
  var cta = document.querySelector(".smartplayer-anchor-button");

  if (localStorage.getItem(LS_KEY)) {
    if (main) main.classList.remove("esconder");
    return;
  }

  var poll = setInterval(function () {
    cta = cta || document.querySelector(".smartplayer-anchor-button");
    if (cta && cta.offsetParent !== null && cta.offsetHeight > 0) {
      clearInterval(poll);
      if (main) main.classList.remove("esconder");
      if (cta) cta.style.display = "none";
      localStorage.setItem(LS_KEY, "1");
    }
  }, 500);
})();
</script>
```

### Restrições

- localStorage key: `slimfix_cta_displayed` (diferente do BurnForce).
- Testar detecção de CTA em produção (`theslimflix.shop`) — Vturb falha no localhost por CORS/licença.
- VSL White e Black: **mesmos links CartPanda** de checkout, mesmo `data-funnel="vslfunnel"`.

---

## Parte 4 — Criação dos Diretórios `/p/`

### Estrutura resultante

```
/
├── p/
│   ├── HASH_WHITE/        ← ex: 3f8a12dc6e01
│   │   ├── index.html     ← VSL White (cópia migrada de cpda/vsl/)
│   │   ├── css/
│   │   │   ├── vsl.css
│   │   │   └── fbcomments.css
│   │   ├── img/
│   │   ├── upsell/
│   │   ├── upsell2/
│   │   ├── upsell3/
│   │   ├── downsell/
│   │   └── downsell2/
│   └── HASH_BLACK/        ← ex: b7c94ef21a5d
│       ├── index.html     ← idêntico ao White em markup HTML
│       ├── css/
│       ├── img/
│       ├── upsell/
│       ├── upsell2/
│       ├── upsell3/
│       ├── downsell/
│       └── downsell2/
├── cpda/vsl/              ← manter por enquanto (redirecionar para /p/ no futuro)
...
```

### Migração de `cpda/vsl/` → `p/HASH_WHITE/`

1. Copiar `cpda/vsl/index.html` → `p/HASH_WHITE/index.html`.
2. Atualizar caminhos relativos de assets:
   - `../../assets/` → `/assets/` (usar caminhos absolutos)
   - `../../lgl/` → `/lgl/`
   - Links de upsell/downsell: `./upsell/`, `./upsell2/`, etc. (iguais)
3. Adicionar `<meta name="robots" content="noindex, nofollow">`.
4. Adicionar `<meta name="referrer" content="no-referrer">`.
5. Remover comentários HTML descritivos (`<!-- ... -->`).
6. Adicionar `vsl-token.js` como primeiro script (antes de `cpsales.js`).
7. Substituir seção `<section id="video">` com embed Vturb.
8. Adicionar CTA detection inline antes de `</body>`.

**Para `p/HASH_BLACK/`:** HTML idêntico ao White. A diferença (player ID) é feita em runtime via `vsl-token.js + window.VSL_VIDEO_ID`.

### Migração dos sub-funis (upsells/downsells)

Copiar e adaptar de `cpda/vsl/upsell/`, `upsell2/`, `upsell3/`, `downsell/`, `downsell2/` para ambos os diretórios. Atualizar paths relativos de assets e links de navegação.

---

## Parte 5 — Domain Lock Vturb (manual)

- Configurar domain lock para `theslimflix.shop` nos dois players (White e Black) no painel Vturb/ConverteAI.
- Nenhuma mudança de código necessária.
- Previne clonagem do player em outros domínios.

---

## Informações Pendentes (requer input do usuário)

| Item | Status | Valor |
|------|--------|-------|
| Vturb Account ID (SlimFix) | PENDENTE | — |
| ID player VSL White | PENDENTE | — |
| ID player VSL Black | PENDENTE | — |
| Token hash secreto | PENDENTE | — |
| CloudFront Distribution ID | PENDENTE | — |
| S3 Bucket name | PENDENTE | — |

---

## Critérios de Aceite

### Parte 1 — CloudFront Function
- [ ] Qualquer `/p/HASH_DECOY/` serve a VSL White corretamente.
- [ ] O path secreto (`BLACK_PATH`) serve a VSL Black.
- [ ] Paths não reconhecidos retornam 404.
- [ ] Function associada ao behavior `/p/*` (viewer-request).

### Parte 2 — Token
- [ ] Acessar path Black **sem** hash → VSL White (fail-safe).
- [ ] Acessar path Black **com** `#TOKEN` → VSL Black.
- [ ] Após carregamento, barra de endereço não exibe o hash.
- [ ] `cpsales.js` recebe URL limpa em ambos os casos.

### Parte 3 — Player
- [ ] Player Vturb carrega com o ID correto para cada versão.
- [ ] CTA detection revela `<main class="esconder">` no tempo configurado.
- [ ] `localStorage.slimfix_cta_displayed` persiste entre reloads.
- [ ] Links de checkout CartPanda idênticos nas duas versões.

### Parte 4 — Estrutura
- [ ] `/p/HASH_WHITE/` e `/p/HASH_BLACK/` existem com conteúdo migrado.
- [ ] Caminhos de assets usam `/assets/...` (absolutos).
- [ ] URL não contém "cpda", "vsl", "pages" ou qualquer indicador de estrutura.
- [ ] Código-fonte sem comentários HTML descritivos.

### Parte 5 — Vturb
- [ ] Player Black não reproduz fora de `theslimflix.shop`.
- [ ] Player White idem.

---

## Ordem de Implementação Sugerida

1. **Coletar pendências** — IDs Vturb, token, CloudFront, S3.
2. **Gerar 600 hashes** — script Node.js, escolher `HASH_WHITE` e `HASH_BLACK`.
3. **Criar `vsl-token.js`** — com IDs e token reais.
4. **Criar `p/HASH_WHITE/`** — migrar e adaptar VSL atual.
5. **Criar `p/HASH_BLACK/`** — copiar White (HTML idêntico).
6. **Criar `infra/cloudfront-function.js`** — 600 paths + roteamento.
7. **Criar `infra/deploy.sh`** — S3 sync + CloudFront invalidation.
8. **Testar localmente** — verificar paths relativos, scripts.
9. **Deploy AWS** — S3 upload + associar Function.
10. **Configurar domain lock** — painel Vturb.
11. **Smoke test em produção** — White path, Black path + token.

---

## Adendo — Evolução da Política de Fallback

> **Data do adendo:** 2026-04-22

A implementação final divergiu do plano original (600 paths decoy) e adotou **URLs assinadas com HMAC geradas pelo Build-URL** com TTL (default 120h). A CloudFront Function ([infra/cloudfront-function.js](../../infra/cloudfront-function.js)) valida:

1. Formato do path: `/p/PAYLOAD.SIG/`
2. Assinatura HMAC-SHA256 (truncada em 10 bytes, base64url)
3. Timestamp de expiração (payload base64url → Unix time)

### Política anterior (deprecada)

| Condição | Resposta |
|----------|----------|
| Formato não bate | 404 |
| HMAC inválido | 404 |
| Expirado | 404 |
| Válido + dentro do prazo | Black |

### Política atual

| Condição | Resposta |
|----------|----------|
| Formato não bate | 404 |
| HMAC inválido | **White** (rewrite para `/p/3f86c2c3fd84/index.html`) |
| Expirado | **White** (rewrite para `/p/3f86c2c3fd84/index.html`) |
| Válido + dentro do prazo | Black |

### Justificativa

Dashboard "Sessões/Visitas em meus promolinks" da CartPanda armazena as URLs exatas dos links que receberam tráfego. Qualquer revisor da CartPanda pode clicar nessas URLs para inspecionar manualmente. Se o link retornar 404 após expiração, o padrão "URL vendeu ontem, hoje morreu" é sinal clássico de bait-and-switch e expõe o cloaking.

Servindo White em qualquer fallback:
- Inspeção manual sempre encontra página legítima e funcional.
- Probing aleatório de paths `/p/*.*/` não revela comportamento anômalo.
- Lead legítimo que clicar em link de SMS expirado continua conseguindo comprar (via White).

### Limitação conhecida

O path fixo `/p/e937187b865c/` ainda serve Black diretamente sem HMAC/expiração. Risco pré-existente, não resolvido por essa política. Mitigação planejada em [002-single-path-future-architecture.md](./002-single-path-future-architecture.md).
