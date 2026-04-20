# AWS Setup — Deploy automatizado via GitHub Actions

Guia one-time para configurar o deploy auto do SlimFix a partir do repo GitHub.
Referencia: [Spec-006](https://github.com/guttovms-mxm/build-url/blob/main/docs/specs/006-cicd-automation.md)

## Pre-requisitos

- AWS CLI configurado localmente com credenciais admin (apenas para o setup)
- Account ID: `aws sts get-caller-identity --query Account --output text`

## Passo 1: OIDC Provider (1x por conta AWS)

Se ainda nao existe (checar em IAM > Identity providers):

```bash
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1
```

## Passo 2: IAM Role para SlimFix

Substitua `<ACCOUNT_ID>` pelo account ID e crie dois arquivos temporarios:

### `trust-policy.json`

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {
      "Federated": "arn:aws:iam::<ACCOUNT_ID>:oidc-provider/token.actions.githubusercontent.com"
    },
    "Action": "sts:AssumeRoleWithWebIdentity",
    "Condition": {
      "StringEquals": {
        "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
      },
      "StringLike": {
        "token.actions.githubusercontent.com:sub": "repo:guttovms-mxm/SlimFix:ref:refs/heads/main"
      }
    }
  }]
}
```

### `deploy-policy.json`

Substitua `<ACCOUNT_ID>` e `<CF_FUNCTION_NAME>` (descobrir via `aws cloudfront list-functions`).

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:DeleteObject", "s3:ListBucket", "s3:GetObject"],
      "Resource": [
        "arn:aws:s3:::theslimflix-lp",
        "arn:aws:s3:::theslimflix-lp/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": ["cloudfront:CreateInvalidation"],
      "Resource": "arn:aws:cloudfront::<ACCOUNT_ID>:distribution/E17C6R6JMNWP4K"
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudfront:UpdateFunction",
        "cloudfront:DescribeFunction",
        "cloudfront:PublishFunction",
        "cloudfront:GetFunction"
      ],
      "Resource": "arn:aws:cloudfront::<ACCOUNT_ID>:function/<CF_FUNCTION_NAME>"
    }
  ]
}
```

### Criar a role

```bash
aws iam create-role \
  --role-name slimfix-deploy \
  --assume-role-policy-document file://trust-policy.json

aws iam put-role-policy \
  --role-name slimfix-deploy \
  --policy-name slimfix-deploy-policy \
  --policy-document file://deploy-policy.json

# Anotar o ARN retornado
aws iam get-role --role-name slimfix-deploy --query 'Role.Arn' --output text
```

## Passo 3: Descobrir nome da CloudFront Function

```bash
aws cloudfront list-functions \
  --query 'FunctionList.Items[].{Name:Name,Stage:FunctionMetadata.Stage}' \
  --output table
```

Anotar o nome da funcao associada a distribuicao `E17C6R6JMNWP4K`.

## Passo 4: GitHub Actions Variables

No repo SlimFix: **Settings > Secrets and variables > Actions > Variables > New repository variable**

| Nome | Valor |
|------|-------|
| `AWS_DEPLOY_ROLE_ARN` | ARN da role do Passo 2 (ex: `arn:aws:iam::123456789012:role/slimfix-deploy`) |
| `S3_BUCKET` | `theslimflix-lp` |
| `CF_DISTRIBUTION_ID` | `E17C6R6JMNWP4K` |
| `CF_FUNCTION_NAME` | Valor descoberto no Passo 3 |

**Nota:** usar "Variables" (nao "Secrets") — esses valores nao sao sensiveis. Roles AWS com OIDC substituem access keys.

## Passo 5: Testar

1. Fazer push trivial pra `main` (ex: editar README)
2. Abrir aba Actions do repo → acompanhar o workflow
3. Verificar em <2min que a mudanca esta live em `theslimflix.shop`
4. Testar update de CF Function: editar `infra/cloudfront-function.js` e merge → workflow detecta e atualiza

## Troubleshooting

- **`Error: Could not assume role`**: trust policy com `sub` errado (tem que ser `repo:OWNER/REPO:ref:refs/heads/main`)
- **`AccessDenied` no S3**: policy com bucket ARN errado
- **`NoSuchFunctionExists`**: `CF_FUNCTION_NAME` incorreto
- **CF Function nao propaga**: propagacao leva 5-10min apos `PublishFunction`
