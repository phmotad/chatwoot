# Quick Fix: Erro permission_denied no GHCR

## Solução Rápida

### 1. Verificar Configurações do Repositório

Acesse: `https://github.com/phmotad/chatwoot/settings/actions`

Em **"Workflow permissions"**:
- ✅ Selecione **"Read and write permissions"**
- ✅ Salve as alterações

### 2. Re-executar o Workflow

1. Vá para: `https://github.com/phmotad/chatwoot/actions`
2. Encontre o workflow que falhou
3. Clique em **"Re-run all jobs"**

### 3. Verificar se Funcionou

Após o workflow executar:
- Acesse: `https://github.com/phmotad?tab=packages`
- Procure por `fireagent-chat`
- Se aparecer, está funcionando! ✅

## Se Ainda Não Funcionar

### Opção 1: Criar Personal Access Token

1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token (classic)
3. Marque: `write:packages`, `read:packages`
4. Copie o token
5. Repositório → Settings → Secrets → Actions → New repository secret
6. Nome: `GHCR_TOKEN`
7. Valor: Cole o token
8. Atualize o workflow para usar `secrets.GHCR_TOKEN` em vez de `secrets.GITHUB_TOKEN`

### Opção 2: Verificar Nome do Pacote

O nome do pacote deve ser:
- `ghcr.io/phmotad/fireagent-chat` (atual)
- OU `ghcr.io/phmotad/chatwoot` (nome do repo)

Se quiser mudar, edite `.github/workflows/build-and-push-docker.yml`:
```yaml
IMAGE_NAME: phmotad/chatwoot  # ou manter fireagent-chat
```

## Checklist

- [ ] Workflow permissions: Read and write
- [ ] Workflow executou após mudança
- [ ] Pacote aparece em https://github.com/phmotad?tab=packages
- [ ] Imagem pode ser puxada: `docker pull ghcr.io/phmotad/fireagent-chat:latest`
