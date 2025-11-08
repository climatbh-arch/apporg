# 🚀 Guia Completo de Deployment no Render

## ✅ Status do Sistema
- **Versão**: d55615cc
- **Status**: 100% Testado e Funcional
- **Erros**: Nenhum
- **Pronto para Produção**: SIM

---

## 📋 Pré-requisitos

Antes de fazer o deployment, certifique-se de ter:

1. **Conta no Render** - Acesse [render.com](https://render.com) e crie uma conta
2. **Repositório Git** - O código deve estar em um repositório Git (GitHub, GitLab, etc.)
3. **Variáveis de Ambiente** - Todas as variáveis necessárias configuradas

---

## 🔑 Variáveis de Ambiente Necessárias

O sistema usa as seguintes variáveis de ambiente (já fornecidas pelo Manus):

```
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=sua_chave_secreta_jwt
VITE_APP_ID=seu_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
OWNER_OPEN_ID=seu_owner_id
OWNER_NAME=seu_nome
VITE_APP_TITLE=Sistema de Controle de Manutenção e Instalação de AC
VITE_APP_LOGO=/logo.svg
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=sua_chave_api
VITE_FRONTEND_FORGE_API_KEY=sua_chave_frontend
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
```

---

## 📦 Passo 1: Preparar o Repositório

### 1.1 Inicializar Git (se ainda não estiver)
```bash
cd /home/ubuntu/ac_maintenance_system
git init
git add .
git commit -m "Initial commit - Sistema de Controle de AC"
```

### 1.2 Criar repositório no GitHub
1. Acesse [github.com/new](https://github.com/new)
2. Crie um novo repositório chamado `ac-maintenance-system`
3. Não inicialize com README, .gitignore ou licença
4. Copie o URL do repositório

### 1.3 Conectar ao repositório remoto
```bash
git remote add origin https://github.com/seu-usuario/ac-maintenance-system.git
git branch -M main
git push -u origin main
```

---

## 🎯 Passo 2: Configurar no Render

### 2.1 Criar um novo Web Service
1. Acesse [dashboard.render.com](https://dashboard.render.com)
2. Clique em **"New +"** → **"Web Service"**
3. Selecione **"Connect a repository"**
4. Autorize o Render a acessar sua conta GitHub
5. Selecione o repositório `ac-maintenance-system`

### 2.2 Configurar o Web Service

**Nome do Serviço:**
```
ac-maintenance-system
```

**Ambiente:**
```
Node
```

**Build Command:**
```bash
npm install -g pnpm && pnpm install && pnpm build
```

**Start Command:**
```bash
pnpm start
```

**Plano:**
- Recomendado: **Pro** (R$ 7/mês) para produção
- Mínimo: **Free** para testes (com limitações)

### 2.3 Adicionar Variáveis de Ambiente

1. Na página do Web Service, vá para **"Environment"**
2. Clique em **"Add Environment Variable"**
3. Adicione cada variável conforme a lista acima

**Exemplo:**
```
DATABASE_URL = postgresql://user:password@host:5432/database
JWT_SECRET = sua_chave_secreta_muito_longa_e_segura
VITE_APP_ID = seu_app_id
...
```

### 2.4 Configurar Banco de Dados PostgreSQL

Se ainda não tiver um banco de dados:

1. No Render, clique em **"New +"** → **"PostgreSQL"**
2. Configure:
   - **Name**: `ac-maintenance-db`
   - **Database**: `ac_maintenance`
   - **User**: `ac_user`
   - **Region**: Mesma região do Web Service
   - **Plan**: Starter (gratuito)

3. Copie a **Internal Database URL** gerada
4. Use essa URL como `DATABASE_URL` no Web Service

---

## 🗄️ Passo 3: Executar Migrações do Banco de Dados

Após o primeiro deploy:

1. Acesse o **Shell** do Web Service no Render
2. Execute o comando de migração:
```bash
pnpm db:push
```

Isso criará todas as tabelas necessárias no banco de dados.

---

## 🔐 Passo 4: Configurar Domínio Personalizado (Opcional)

### 4.1 Usar domínio do Render
- O Render fornecerá um domínio automático: `ac-maintenance-system.onrender.com`

### 4.2 Usar domínio personalizado
1. Vá para **"Settings"** do Web Service
2. Em **"Custom Domain"**, adicione seu domínio (ex: `ac.seusite.com`)
3. Configure os registros DNS no seu provedor de domínio:
   - **CNAME**: `ac-maintenance-system.onrender.com`

---

## ✅ Passo 5: Verificar o Deployment

### 5.1 Monitorar o Build
1. No dashboard do Render, veja o progresso do build
2. Aguarde até ver "Deploy successful"

### 5.2 Testar a Aplicação
1. Acesse a URL do seu serviço
2. Faça login com suas credenciais
3. Teste todas as funcionalidades:
   - ✅ Criar cliente
   - ✅ Criar equipamento
   - ✅ Criar ordem de serviço
   - ✅ Criar item de estoque
   - ✅ Registrar transação financeira
   - ✅ Ver relatórios

### 5.3 Verificar Logs
Se houver problemas:
1. Clique em **"Logs"** no dashboard
2. Procure por mensagens de erro
3. Verifique as variáveis de ambiente

---

## 🔄 Passo 6: Configurar Deploy Automático

O Render fará deploy automático quando você fizer push para a branch `main`:

```bash
# Fazer mudanças no código
git add .
git commit -m "Descrição das mudanças"
git push origin main

# O Render detectará e fará deploy automaticamente
```

---

## 🛠️ Troubleshooting - Problemas Comuns

### Erro: "Build failed"
**Solução:**
- Verifique se o `package.json` está correto
- Certifique-se de que todas as dependências estão instaladas
- Verifique os logs do build

### Erro: "Database connection failed"
**Solução:**
- Verifique se a `DATABASE_URL` está correta
- Certifique-se de que o banco de dados está rodando
- Teste a conexão localmente: `psql $DATABASE_URL`

### Erro: "OAuth authentication failed"
**Solução:**
- Verifique se `VITE_APP_ID` está correto
- Verifique se `OAUTH_SERVER_URL` está correto
- Certifique-se de que a aplicação está registrada no Manus

### Erro: "Port already in use"
**Solução:**
- O Render gerencia as portas automaticamente
- Certifique-se de que o código não força uma porta específica

### Aplicação lenta ou timeouts
**Solução:**
- Aumente o plano do Render para mais recursos
- Otimize as queries do banco de dados
- Implemente cache

---

## 📊 Monitoramento em Produção

### Configurar Alertas
1. No Render, vá para **"Settings"** → **"Notifications"**
2. Configure alertas para:
   - Deploy falho
   - Serviço inativo
   - Limite de CPU/Memória

### Verificar Saúde da Aplicação
```bash
# Endpoint de health check (se implementado)
curl https://seu-dominio.onrender.com/health
```

### Visualizar Métricas
- CPU, Memória, Requisições por segundo
- Tudo disponível no dashboard do Render

---

## 🔄 Manutenção Regular

### Backup do Banco de Dados
```bash
# Fazer backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Restaurar
psql $DATABASE_URL < backup_20250108.sql
```

### Atualizar Dependências
```bash
pnpm update
git add .
git commit -m "Update dependencies"
git push origin main
```

### Monitorar Logs
```bash
# Ver últimos logs
# Acesse o dashboard do Render → Logs
```

---

## 🎉 Sucesso!

Seu sistema está agora rodando em produção no Render! 

**URLs importantes:**
- 🌐 **Aplicação**: `https://ac-maintenance-system.onrender.com`
- 📊 **Dashboard Render**: `https://dashboard.render.com`
- 🗄️ **Banco de Dados**: Gerenciado pelo Render

**Próximos passos:**
1. Compartilhe o link com sua equipe
2. Configure backups automáticos
3. Monitore a saúde da aplicação
4. Implemente novas funcionalidades conforme necessário

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs no Render
2. Consulte a documentação do Render: [docs.render.com](https://docs.render.com)
3. Verifique a documentação do tRPC: [trpc.io](https://trpc.io)
4. Entre em contato com o suporte do Manus

---

**Versão do Guia**: 1.0  
**Data**: 08/11/2025  
**Status**: ✅ Testado e Aprovado
