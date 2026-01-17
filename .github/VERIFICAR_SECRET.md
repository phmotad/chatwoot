# Verificar e Configurar Secret

## Nome do Secret no Workflow

O workflow está configurado para usar: **`GHCR_TOKEN`**

Linha 40 do arquivo `.github/workflows/build-and-push-docker.yml`:
```yaml
password: ${{ secrets.GHCR_TOKEN }}
```

## Verificar se o Secret Existe

1. Acesse: `https://github.com/phmotad/chatwoot/settings/secrets/actions`
2. Procure na lista por um secret chamado **`GHCR_TOKEN`**
3. Se existir, está tudo certo! ✅
4. Se não existir ou tiver outro nome, veja abaixo

## Se o Secret tem Outro Nome

### Opção 1: Renomear o Secret (Recomendado)

1. Acesse: `https://github.com/phmotad/chatwoot/settings/secrets/actions`
2. Clique no secret existente
3. Clique em "Update" ou delete e crie novo com nome `GHCR_TOKEN`

### Opção 2: Atualizar o Workflow

Se o secret tem outro nome (ex: `DOCKER_TOKEN`, `REGISTRY_TOKEN`), edite o workflow:

```yaml
# Linha 40
password: ${{ secrets.SEU_NOME_DO_SECRET }}
```

## Criar Secret (se não existe)

1. Acesse: `https://github.com/phmotad/chatwoot/settings/secrets/actions`
2. Clique em **"New repository secret"**
3. Nome: `GHCR_TOKEN`
4. Valor: Cole o Personal Access Token
5. Clique em **"Add secret"**

## Personal Access Token Necessário

O token precisa ter os seguintes escopos:
- ✅ `write:packages`
- ✅ `read:packages`
- ✅ `delete:packages` (opcional)

## Após Configurar

1. O workflow já está atualizado e commitado
2. Re-execute o workflow:
   - `https://github.com/phmotad/chatwoot/actions`
   - Encontre o workflow
   - Clique em "Re-run all jobs"

## Teste Rápido

Para testar se o secret está funcionando, você pode verificar nos logs do workflow:

- ✅ Se aparecer "Login Succeeded" → Secret funcionando
- ❌ Se aparecer "unauthorized" ou "permission_denied" → Verificar token e permissões
