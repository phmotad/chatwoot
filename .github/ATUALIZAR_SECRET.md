# Atualizar Workflow para Usar Repository Secret

## Se você criou o secret como `GHCR_TOKEN`

O workflow já foi atualizado para usar `secrets.GHCR_TOKEN`.

## Se você criou com outro nome

Edite o arquivo `.github/workflows/build-and-push-docker.yml` e altere:

```yaml
password: ${{ secrets.GHCR_TOKEN }}
```

Para o nome do seu secret:

```yaml
password: ${{ secrets.SEU_NOME_DO_SECRET }}
```

## Verificar se o Secret Existe

1. Acesse: `https://github.com/phmotad/chatwoot/settings/secrets/actions`
2. Verifique se o secret aparece na lista
3. O nome deve ser exatamente como está no workflow (case-sensitive)

## Após Atualizar

1. **Commit e push** das alterações:
   ```bash
   git add .github/workflows/build-and-push-docker.yml
   git commit -m "fix: Atualiza workflow para usar GHCR_TOKEN"
   git push origin fireagent-main
   ```

2. **Re-executar o workflow**:
   - Vá para: `https://github.com/phmotad/chatwoot/actions`
   - Encontre o workflow
   - Clique em "Re-run all jobs"

## Nomes Comuns de Secrets

- `GHCR_TOKEN` (recomendado)
- `GITHUB_TOKEN` (padrão, mas pode não ter permissão)
- `DOCKER_TOKEN`
- `REGISTRY_TOKEN`

**Importante**: O nome no workflow deve corresponder exatamente ao nome do secret (case-sensitive).
