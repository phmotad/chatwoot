# Troubleshooting GitHub Actions - Docker Build

## Erro: permission_denied: write_package

### Causa
O GitHub Actions não tem permissão para fazer push de pacotes no GitHub Container Registry (GHCR).

### Soluções

#### 1. Verificar Permissões do Workflow

O workflow já está configurado com:
```yaml
permissions:
  contents: read
  packages: write
  id-token: write
```

#### 2. Verificar Configurações do Repositório

1. Acesse: `https://github.com/phmotad/chatwoot/settings/actions`
2. Em **"Workflow permissions"**, certifique-se de:
   - ✅ "Read and write permissions" está selecionado
   - ✅ "Allow GitHub Actions to create and approve pull requests" (opcional)

#### 3. Verificar Nome do Pacote

O nome do pacote no GHCR deve seguir o padrão:
- `ghcr.io/USERNAME/REPOSITORY-NAME` ou
- `ghcr.io/USERNAME/PACKAGE-NAME`

**Importante**: Se o repositório é `chatwoot`, o pacote deve ser:
- `ghcr.io/phmotad/chatwoot` (nome do repo)
- OU `ghcr.io/phmotad/fireagent-chat` (nome customizado)

#### 4. Criar Pacote Manualmente (se necessário)

1. Acesse: `https://github.com/phmotad/chatwoot/packages`
2. Se não existir, o GitHub criará automaticamente no primeiro push
3. Verifique se o pacote aparece após o primeiro push bem-sucedido

#### 5. Verificar Secrets

O workflow usa `GITHUB_TOKEN` automaticamente. Não precisa configurar secret manualmente.

#### 6. Verificar Branch

O workflow só executa em:
- `main`
- `fireagent-main`

Certifique-se de estar fazendo push para uma dessas branches.

### Teste Manual

Para testar se as permissões estão corretas:

```bash
# Fazer login no GHCR
echo $GITHUB_TOKEN | docker login ghcr.io -u phmotad --password-stdin

# Tentar push manual (substituir pela tag correta)
docker tag fireagent-chat:test ghcr.io/phmotad/fireagent-chat:test
docker push ghcr.io/phmotad/fireagent-chat:test
```

### Solução Alternativa: Usar Personal Access Token

Se o `GITHUB_TOKEN` não funcionar, criar um Personal Access Token:

1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Criar token com escopo: `write:packages`, `read:packages`, `delete:packages`
3. Adicionar como secret no repositório: `Settings → Secrets → Actions → New repository secret`
4. Nome: `GHCR_TOKEN`
5. Atualizar workflow para usar:

```yaml
- name: Log in to GitHub Container Registry
  uses: docker/login-action@v3
  with:
    registry: ${{ env.REGISTRY }}
    username: ${{ github.actor }}
    password: ${{ secrets.GHCR_TOKEN }}  # Mudar de GITHUB_TOKEN para GHCR_TOKEN
```

### Verificar Logs

Nos logs do GitHub Actions, procure por:
- `denied: permission_denied: write_package` - Problema de permissão
- `unauthorized` - Problema de autenticação
- `not found` - Pacote não existe ainda

### Links Úteis

- [GitHub Container Registry Documentation](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [Workflow Permissions](https://docs.github.com/en/actions/security-guides/automatic-token-authentication#permissions-for-the-github_token)
