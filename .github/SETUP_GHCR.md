# Setup GitHub Container Registry (GHCR)

## Configuração Inicial

### 1. Verificar Permissões do Repositório

1. Acesse: `https://github.com/phmotad/chatwoot/settings/actions`
2. Role até **"Workflow permissions"**
3. Certifique-se de que:
   - ✅ **"Read and write permissions"** está selecionado
   - ✅ **"Allow GitHub Actions to create and approve pull requests"** (opcional)

### 2. Verificar Nome do Pacote

O nome do pacote no workflow está configurado como:
```yaml
IMAGE_NAME: phmotad/fireagent-chat
```

Isso criará o pacote: `ghcr.io/phmotad/fireagent-chat`

**Importante**: O nome do pacote deve seguir o padrão:
- `ghcr.io/USERNAME/PACKAGE-NAME`

### 3. Primeiro Push

Na primeira execução do workflow:
- O GitHub criará automaticamente o pacote no GHCR
- Pode levar alguns minutos para aparecer
- Verifique em: `https://github.com/phmotad?tab=packages`

### 4. Visibilidade do Pacote

Por padrão, pacotes criados via GitHub Actions são:
- **Privados** se o repositório for privado
- **Públicos** se o repositório for público

Para mudar:
1. Acesse: `https://github.com/phmotad?tab=packages`
2. Clique no pacote `fireagent-chat`
3. Settings → Change visibility

## Troubleshooting

### Erro: permission_denied: write_package

**Causa**: O workflow não tem permissão para escrever no GHCR.

**Soluções**:

1. **Verificar permissões do workflow** (passo 1 acima)
2. **Verificar se o repositório tem Actions habilitadas**
3. **Verificar se o GITHUB_TOKEN tem escopo correto**

O workflow já está configurado com:
```yaml
permissions:
  contents: read
  packages: write
  id-token: write
```

### Erro: unauthorized

**Causa**: Problema de autenticação.

**Solução**: O workflow usa `GITHUB_TOKEN` automaticamente. Se persistir, criar Personal Access Token (ver TROUBLESHOOTING.md)

### Verificar se Funcionou

Após o workflow executar com sucesso:

1. Acesse: `https://github.com/phmotad?tab=packages`
2. Procure por `fireagent-chat`
3. Clique para ver as tags disponíveis

### Pull da Imagem

```bash
# Fazer login (se necessário)
echo $GITHUB_TOKEN | docker login ghcr.io -u phmotad --password-stdin

# Pull da imagem
docker pull ghcr.io/phmotad/fireagent-chat:latest
docker pull ghcr.io/phmotad/fireagent-chat:fireagent-main-{sha}
```

## Links Úteis

- [GitHub Container Registry Docs](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [Workflow Permissions](https://docs.github.com/en/actions/security-guides/automatic-token-authentication#permissions-for-the-github_token)
- [Package Visibility](https://docs.github.com/en/packages/learn-github-packages/configuring-a-packages-access-control-and-visibility)
