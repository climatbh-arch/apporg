# ⚡ Guia Rápido - Deploy em 5 Minutos

## Resumo dos Passos

### 1️⃣ Criar Repositório GitHub
```bash
cd /home/ubuntu/ac_maintenance_system
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/SEU_USUARIO/ac-maintenance-system.git
git branch -M main
git push -u origin main
```

### 2️⃣ Criar Conta no Render
- Acesse [render.com](https://render.com)
- Faça login com GitHub
- Clique em "Dashboard"

### 3️⃣ Criar PostgreSQL Database
- Clique em **"New +"** → **"PostgreSQL"**
- Nome: `ac-maintenance-db`
- Copie a **External Database URL**

### 4️⃣ Criar Web Service
- Clique em **"New +"** → **"Web Service"**
- Conecte seu repositório GitHub
- **Build Command**: `pnpm install && pnpm build`
- **Start Command**: `pnpm start`

### 5️⃣ Adicionar Variáveis de Ambiente

Copie e cole no Render (Settings → Environment):

```
DATABASE_URL=COPIE_DA_URL_DO_BANCO_DE_DADOS
NODE_ENV=production
JWT_SECRET=gerar_uma_senha_aleatoria_aqui
VITE_APP_ID=seu_app_id_manus
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
OWNER_OPEN_ID=seu_owner_id
OWNER_NAME=Seu Nome
VITE_APP_TITLE=Sistema de Controle de Manutenção de AC
VITE_APP_LOGO=/logo.svg
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=sua_api_key_manus
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
VITE_FRONTEND_FORGE_API_KEY=sua_frontend_key_manus
VITE_ANALYTICS_ENDPOINT=https://analytics.manus.im
VITE_ANALYTICS_WEBSITE_ID=seu_website_id
```

### 6️⃣ Deploy
- Clique em **"Create Web Service"**
- Aguarde o deploy (status verde = sucesso)
- Acesse sua URL: `https://ac-maintenance-system.onrender.com`

### 7️⃣ Executar Migrações
- No Render, clique em **"Shell"**
- Execute: `pnpm db:push`

✅ **Pronto! Seu site está online!**

---

## Próximas Atualizações

Para fazer mudanças:

```bash
git add .
git commit -m "Descrição da mudança"
git push origin main
```

O Render fará o redeploy automaticamente!

---

## Onde Encontrar Valores Necessários?

| Variável | Onde Encontrar |
|----------|---|
| `DATABASE_URL` | Render → PostgreSQL → External Database URL |
| `JWT_SECRET` | Gere uma senha aleatória (ex: `openssl rand -base64 32`) |
| `VITE_APP_ID` | Manus Dashboard → Settings → App ID |
| `OWNER_OPEN_ID` | Seu ID de usuário Manus |
| `OWNER_NAME` | Seu nome |
| `BUILT_IN_FORGE_API_KEY` | Manus Dashboard → API Keys |

---

## Troubleshooting Rápido

| Problema | Solução |
|----------|---------|
| Build failed | Verifique os logs no Render |
| Database connection error | Copie a DATABASE_URL corretamente |
| Site não carrega | Aguarde 5 minutos e recarregue |
| Erro de autenticação | Verifique VITE_APP_ID e OWNER_OPEN_ID |

---

**Dúvidas? Veja o guia completo em `RENDER_DEPLOYMENT_GUIDE.md`**
