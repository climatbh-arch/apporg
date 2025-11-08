# ⚡ Guia Rápido - Deploy no Render em 5 Minutos

## 🎯 Resumo Executivo

Seu sistema está **100% pronto para produção**. Siga este guia para colocar online no Render em menos de 5 minutos.

---

## 📋 Checklist Pré-Deploy

- [ ] Conta no Render criada ([render.com](https://render.com))
- [ ] Repositório GitHub criado e código enviado
- [ ] Banco de dados PostgreSQL criado no Render
- [ ] Variáveis de ambiente copiadas

---

## 🚀 Passos Rápidos

### 1️⃣ Criar Repositório GitHub (2 min)

```bash
cd /home/ubuntu/ac_maintenance_system
git init
git add .
git commit -m "Sistema de Controle de AC - Pronto para Produção"
git remote add origin https://github.com/SEU_USUARIO/ac-maintenance-system.git
git branch -M main
git push -u origin main
```

### 2️⃣ Criar Banco de Dados no Render (1 min)

1. Acesse [dashboard.render.com](https://dashboard.render.com)
2. Clique em **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `ac-maintenance-db`
   - **Database**: `ac_maintenance`
   - **User**: `ac_user`
4. Clique em **"Create Database"**
5. Copie a **Internal Database URL**

### 3️⃣ Criar Web Service no Render (1 min)

1. Clique em **"New +"** → **"Web Service"**
2. Selecione seu repositório `ac-maintenance-system`
3. Configure:
   - **Name**: `ac-maintenance-system`
   - **Environment**: `Node`
   - **Build Command**: `npm install -g pnpm && pnpm install && pnpm build`
   - **Start Command**: `pnpm start`
4. Clique em **"Create Web Service"**

### 4️⃣ Adicionar Variáveis de Ambiente (1 min)

Na página do Web Service, vá para **"Environment"** e adicione:

```
DATABASE_URL = [Cole aqui a URL do banco de dados]
JWT_SECRET = sua_chave_secreta_muito_longa_e_segura_123456789
VITE_APP_ID = seu_app_id
OAUTH_SERVER_URL = https://api.manus.im
VITE_OAUTH_PORTAL_URL = https://portal.manus.im
OWNER_OPEN_ID = seu_owner_id
OWNER_NAME = seu_nome
VITE_APP_TITLE = Sistema de Controle de Manutenção e Instalação de AC
VITE_APP_LOGO = /logo.svg
BUILT_IN_FORGE_API_URL = https://api.manus.im
BUILT_IN_FORGE_API_KEY = sua_chave_api
VITE_FRONTEND_FORGE_API_KEY = sua_chave_frontend
VITE_FRONTEND_FORGE_API_URL = https://api.manus.im
```

### 5️⃣ Executar Migrações (1 min)

1. Aguarde o deploy terminar (você verá "Deploy successful")
2. Clique em **"Shell"** no Web Service
3. Execute:
```bash
pnpm db:push
```

---

## ✅ Verificar se Está Funcionando

1. Acesse a URL: `https://ac-maintenance-system.onrender.com`
2. Faça login com suas credenciais
3. Teste:
   - ✅ Criar um cliente
   - ✅ Criar um equipamento
   - ✅ Criar uma ordem de serviço
   - ✅ Ver o dashboard

---

## 🎉 Pronto!

Seu sistema está online e funcionando! 

**URL de Acesso**: `https://ac-maintenance-system.onrender.com`

---

## 🆘 Problemas?

### Build falhou?
- Verifique se o repositório foi enviado corretamente
- Veja os logs do build no Render

### Banco de dados não conecta?
- Verifique se a `DATABASE_URL` está correta
- Certifique-se de que o banco foi criado

### Aplicação não inicia?
- Verifique as variáveis de ambiente
- Veja os logs em **"Logs"** no dashboard

---

## 📞 Próximos Passos

1. **Configurar domínio personalizado** (opcional)
   - Vá para **"Settings"** → **"Custom Domain"**

2. **Configurar backups automáticos**
   - No banco de dados PostgreSQL, ative backups

3. **Monitorar a saúde**
   - Configure alertas em **"Settings"** → **"Notifications"**

---

**Documentação Completa**: Veja `DEPLOYMENT_RENDER.md` para mais detalhes.

**Versão**: 1.0 | **Data**: 08/11/2025 | **Status**: ✅ Pronto para Produção
