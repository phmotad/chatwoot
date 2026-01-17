# Configurar Permissões do GitHub Actions

## Configurações Necessárias para GHCR

Siga estas configurações exatas para que o workflow de build Docker funcione:

### 1. Permitir ações e fluxos de trabalho reutilizáveis

**Selecione:**
- ✅ **"Permitir todas as ações e fluxos de trabalho reutilizáveis"**

Ou, se preferir mais segurança:
- ✅ **"Permitir phmotad e selecionar ações não phmotad e fluxos de trabalho reutilizáveis"**
  - Adicione as ações necessárias:
    - `actions/checkout@v4`
    - `docker/setup-buildx-action@v3`
    - `docker/login-action@v3`
    - `docker/metadata-action@v5`
    - `docker/build-push-action@v5`

### 2. Retenção de artefatos e registros

**Configure:**
- ✅ **90 dias** (ou o valor que preferir, máximo 90)

### 3. Aprovação para execução de fluxos de trabalho de solicitação de fork pull

**Escolha:**
- ✅ **"Exigir aprovação para colaboradores iniciantes"** (recomendado)
- OU **"Exigir aprovação para todos os colaboradores externos"** (mais seguro)
- OU deixe desabilitado se confiar nos colaboradores

### 4. Permissões de fluxo de trabalho ⚠️ **IMPORTANTE**

**Selecione:**
- ✅ **"Permissões de leitura e gravação"**

**Esta é a configuração mais importante!** Sem isso, o workflow não conseguirá fazer push para o GHCR.

### 5. Permitir que o GitHub Actions crie e aprove solicitações pull

**Marque:**
- ✅ **"Permitir que o GitHub Actions crie e aprove solicitações pull"** (opcional, mas útil)

---

## Resumo das Configurações Recomendadas

```
✅ Permitir todas as ações e fluxos de trabalho reutilizáveis
✅ Retenção: 90 dias
✅ Exigir aprovação para colaboradores iniciantes
✅ Permissões de leitura e gravação  ← CRÍTICO
✅ Permitir que o GitHub Actions crie e aprove solicitações pull
```

## Após Configurar

1. **Salve as alterações**
2. **Re-execute o workflow**:
   - Vá para: `https://github.com/phmotad/chatwoot/actions`
   - Encontre o workflow que falhou
   - Clique em **"Re-run all jobs"**

3. **Verifique se funcionou**:
   - Acesse: `https://github.com/phmotad?tab=packages`
   - Procure por `fireagent-chat`
   - Se aparecer, está funcionando! ✅

## Troubleshooting

Se ainda der erro após configurar:

1. Verifique se salvou as alterações
2. Verifique se o workflow está na branch correta (`fireagent-main` ou `main`)
3. Verifique os logs do workflow para mais detalhes
4. Consulte `.github/TROUBLESHOOTING.md` para mais soluções

---

**Nota**: A configuração mais crítica é **"Permissões de leitura e gravação"**. Sem ela, o `GITHUB_TOKEN` não terá permissão para fazer push de pacotes no GHCR.
