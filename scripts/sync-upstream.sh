#!/bin/bash
set -e

echo "🔄 Sincronizando com upstream..."

# Adicionar upstream se não existir
git remote add upstream https://github.com/chatwoot/chatwoot.git 2>/dev/null || true

# Buscar atualizações
echo "📥 Buscando atualizações do upstream..."
git fetch upstream

# Mudar para branch principal
echo "🌿 Mudando para fireagent-main..."
git checkout fireagent-main

# Merge sem commit (para revisar)
echo "🔀 Fazendo merge..."
git merge upstream/main --no-commit --no-ff

# Restaurar arquivos protegidos
echo "🔒 Restaurando arquivos protegidos..."
git checkout fireagent-main -- theme/colors.js
git checkout fireagent-main -- config/installation_config.yml
git checkout fireagent-main -- public/brand-assets/

# Verificar status
echo "📊 Status do merge:"
git status

echo ""
echo "✅ Merge preparado. Revise as mudanças e faça commit:"
echo "   git commit -m 'Sync upstream: $(date +%Y-%m-%d)'"
echo ""
echo "⚠️  IMPORTANTE: Este script apenas faz merge local. Para enviar ao seu fork:"
echo "   git push origin fireagent-main"
