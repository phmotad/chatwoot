# 🎨 Como Personalizar Branding no Chatwoot

## 📍 Como Acessar

1. **Faça login** no Chatwoot como **administrador**
2. Vá para **Configurações** (Settings) no menu lateral
3. Acesse a página de **Branding** através da URL:
   ```
   http://localhost:3000/app/accounts/{SEU_ACCOUNT_ID}/settings/branding
   ```
   
   Ou navegue pelo menu: **Settings → Branding**

## 🎨 Personalizar Cores

### Cor Primária
- **O que é**: Cor principal da sua marca, usada em botões, links e elementos de destaque
- **Como mudar**: 
  1. Clique no seletor de cor ao lado de "Cor Primária"
  2. Escolha uma cor ou digite o código hexadecimal (ex: `#FF5C00`)
  3. Clique em **Salvar**

### Cor Secundária
- **O que é**: Cor complementar da marca, usada em elementos secundários
- **Como mudar**: Mesmo processo da cor primária

**Formato**: Use códigos hexadecimais de 6 dígitos (ex: `#FF5C00`, `#0066CC`)

## 🖼️ Personalizar Logos

Você pode fazer upload de 3 tipos de logos:

### 1. Logo Principal (Modo Claro)
- **Uso**: Logo para exibição em temas claros
- **Formatos aceitos**: SVG, PNG, JPEG, JPG
- **Tamanho máximo**: 5MB
- **Como fazer upload**:
  1. Clique em "Escolher arquivo" no campo "Logo (Modo Claro)"
  2. Selecione sua imagem
  3. Aguarde o upload (aparecerá uma prévia)
  4. Clique em **Salvar**

### 2. Logo (Modo Escuro)
- **Uso**: Logo otimizado para temas escuros
- **Recomendação**: Use uma versão com cores invertidas ou adaptadas
- **Mesmo processo de upload**

### 3. Logo Thumbnail
- **Uso**: Versão pequena do logo (favicons, avatares, etc.)
- **Recomendação**: Use uma versão simplificada ou ícone
- **Mesmo processo de upload**

## ✅ Salvar Alterações

1. Após fazer as alterações desejadas (cores e/ou logos)
2. Clique no botão **Salvar** no final da página
3. As alterações serão aplicadas **imediatamente** na interface
4. Você verá uma mensagem de sucesso

## 🔄 Resetar para Padrão

Se quiser voltar aos valores padrão:
1. Clique no botão **Resetar para Padrão**
2. Confirme a ação
3. Todas as personalizações serão removidas

## 📝 Notas Importantes

- **Permissões**: Apenas usuários com perfil **administrador** podem alterar o branding
- **Aplicação**: As cores são aplicadas automaticamente via CSS custom properties
- **Logos**: Os logos são armazenados via ActiveStorage e servidos via CDN/storage configurado
- **Validação**: 
  - Cores devem ser hexadecimais válidos (ex: `#FF5C00`)
  - Arquivos devem ter no máximo 5MB
  - Formatos aceitos: SVG, PNG, JPEG, JPG

## 🔍 Onde as Alterações Aparecem

As personalizações de branding são aplicadas em:
- **Cores**: Botões, links, elementos de destaque, tema geral
- **Logos**: Header da aplicação, favicon, widgets, emails

## 🐛 Troubleshooting

### As cores não estão mudando?
- Verifique se você clicou em **Salvar**
- Limpe o cache do navegador (Ctrl+F5)
- Verifique se o código hexadecimal está correto (formato: `#RRGGBB`)

### O logo não aparece?
- Verifique o tamanho do arquivo (máx 5MB)
- Verifique o formato (SVG, PNG, JPEG, JPG)
- Aguarde alguns segundos para o upload completar
- Verifique os logs do servidor para erros

### Não consigo acessar a página?
- Verifique se você está logado como **administrador**
- Verifique se a URL está correta (incluindo o `accountId`)
- Verifique os logs do console do navegador (F12)

## 📚 Exemplos de Cores

- **Laranja FireAgent**: `#FF5C00`
- **Azul**: `#0066CC`
- **Verde**: `#00CC66`
- **Roxo**: `#9933CC`
- **Vermelho**: `#CC0000`

## 🎯 Dicas

1. **Teste as cores**: Use ferramentas online como [Coolors](https://coolors.co) para escolher paletas harmoniosas
2. **Logos SVG**: Prefira SVG para logos, pois são vetoriais e escalam melhor
3. **Contraste**: Certifique-se de que as cores têm bom contraste para acessibilidade
4. **Consistência**: Use as mesmas cores em todos os materiais da sua marca
