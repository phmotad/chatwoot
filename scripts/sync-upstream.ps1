Write-Host "🔄 Sincronizando com upstream..." -ForegroundColor Cyan

# Adicionar upstream se não existir
git remote add upstream https://github.com/chatwoot/chatwoot.git 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Upstream já existe ou erro ao adicionar" -ForegroundColor Yellow
}

# Buscar atualizações
Write-Host "📥 Buscando atualizações do upstream..." -ForegroundColor Cyan
git fetch upstream

# Mudar para branch principal
Write-Host "🌿 Mudando para fireagent-main..." -ForegroundColor Cyan
git checkout fireagent-main

# Merge sem commit
Write-Host "🔀 Fazendo merge..." -ForegroundColor Cyan
git merge upstream/main --no-commit --no-ff

# Restaurar arquivos protegidos
Write-Host "🔒 Restaurando arquivos protegidos..." -ForegroundColor Cyan
git checkout fireagent-main -- theme/colors.js
git checkout fireagent-main -- config/installation_config.yml
git checkout fireagent-main -- public/brand-assets/

# Verificar status
Write-Host "📊 Status do merge:" -ForegroundColor Cyan
git status

Write-Host ""
Write-Host "✅ Merge preparado. Revise as mudanças e faça commit:" -ForegroundColor Green
Write-Host "   git commit -m 'Sync upstream: $(Get-Date -Format 'yyyy-MM-dd')'" -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠️  IMPORTANTE: Este script apenas faz merge local. Para enviar ao seu fork:" -ForegroundColor Yellow
Write-Host "   git push origin fireagent-main" -ForegroundColor Yellow
