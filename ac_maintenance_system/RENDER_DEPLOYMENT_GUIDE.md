# 🚀 Guia Completo de Deployment no Render

## Pré-requisitos

Antes de começar, você precisa ter:

1. **Conta no Render** - Acesse [render.com](https://render.com) e crie uma conta gratuita
2. **Repositório Git** - Seu código deve estar em um repositório GitHub, GitLab ou Gitea
3. **Variáveis de Ambiente** - Você terá que configurar as variáveis de ambiente no Render

---

## Passo 1: Preparar o Repositório Git

### 1.1 Inicializar Git (se ainda não fez)

```bash
cd /home/ubuntu/ac_maintenance_system
git init
git add .
git commit -m "Initial commit - Sistema de Controle de Manutenção de AC"
```

### 1.2 Conectar ao GitHub

1. Acesse [github.com](https://github.com) e faça login
2. Clique em **"+"** no canto superior direito
3. Selecione **"New repository"**
4. Nomeie como `ac-maintenance-system`
5. Clique em **"Create repository"**

### 1.3 Fazer Push do Código

```bash
git remote add origin https://github.com/SEU_USUARIO/ac-maintenance-system.git
git branch -M main
git push -u origin main
```

---

## Passo 2: Configurar Banco de Dados no Render

### 2.1 Criar PostgreSQL Database

1. Acesse [render.com/dashboard](https://render.com/dashboard)
2. Clique em **"New +"** → **"PostgreSQL"**
3. Preencha os dados:
   - **Name**: `ac-maintenance-db`
   - **Database**: `ac_maintenance`
   - **User**: `postgres`
   - **Region**: Escolha a mais próxima (ex: São Paulo)
   - **PostgreSQL Version**: 15
4. Clique em **"Create Database"**

### 2.2 Copiar a Connection String

Após criar, você verá a **External Database URL**. Copie-a - você precisará dela mais tarde.

Exemplo: `postgresql://user:password@host:5432/database`

---

## Passo 3: Criar Web Service no Render

### 3.1 Criar o Serviço

1. No dashboard do Render, clique em **"New +"** → **"Web Service"**
2. Selecione **"Connect a repository"**
3. Escolha seu repositório `ac-maintenance-system`
4. Preencha os dados:
   - **Name**: `ac-maintenance-system`
   - **Environment**: `Node`
   - **Region**: Mesma do banco de dados
   - **Branch**: `main`
   - **Build Command**: `pnpm install && pnpm build`
   - **Start Command**: `pnpm start`

### 3.2 Configurar Variáveis de Ambiente

Clique em **"Environment"** e adicione as seguintes variáveis:

```
DATABASE_URL=postgresql://user:password@host:5432/database
NODE_ENV=production
JWT_SECRET=seu_jwt_secret_aleatorio_aqui
VITE_APP_ID=seu_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
OWNER_OPEN_ID=seu_owner_open_id
OWNER_NAME=seu_nome
VITE_APP_TITLE=Sistema de Controle de Manutenção de AC
VITE_APP_LOGO=/logo.svg
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=sua_api_key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
VITE_FRONTEND_FORGE_API_KEY=sua_frontend_api_key
VITE_ANALYTICS_ENDPOINT=https://analytics.manus.im
VITE_ANALYTICS_WEBSITE_ID=seu_website_id
```

**IMPORTANTE**: Substitua os valores com seus dados reais!

### 3.3 Criar o Serviço

Clique em **"Create Web Service"**

---

## Passo 4: Executar Migrações do Banco de Dados

Após o deploy inicial, você precisa executar as migrações:

### 4.1 Acessar o Shell do Render

1. No dashboard do Render, vá para seu Web Service
2. Clique em **"Shell"** no topo
3. Execute os comandos:

```bash
pnpm db:push
```

Isso criará todas as tabelas no banco de dados PostgreSQL.

---

## Passo 5: Configurar Domínio Personalizado (Opcional)

### 5.1 Adicionar Domínio

1. No Web Service, vá para **"Settings"**
2. Procure por **"Custom Domain"**
3. Clique em **"Add Custom Domain"**
4. Digite seu domínio (ex: `sistema-ac.com.br`)
5. Siga as instruções para configurar os DNS records

---

## Passo 6: Monitorar o Deploy

### 6.1 Verificar Logs

1. No Web Service, clique em **"Logs"**
2. Você verá o progresso da construção e inicialização
3. Procure por mensagens de erro

### 6.2 Testar a Aplicação

Após o deploy estar completo (status verde), acesse a URL fornecida pelo Render:

```
https://ac-maintenance-system.onrender.com
```

---

## Troubleshooting

### Erro: "Build failed"

**Solução**: Verifique os logs e certifique-se de que:
- Todos os arquivos estão no repositório
- O `package.json` está correto
- As dependências estão instaladas

### Erro: "Database connection failed"

**Solução**: Verifique se:
- A `DATABASE_URL` está correta
- O banco de dados foi criado
- As migrações foram executadas

### Erro: "Port 3000 is not available"

**Solução**: O Render usa a porta 10000 por padrão. Certifique-se de que seu servidor está escutando a porta correta:

```javascript
const PORT = process.env.PORT || 3000;
app.listen(PORT);
```

---

## Atualizações Futuras

Para fazer atualizações no site:

1. Faça as alterações localmente
2. Commit e push para GitHub:

```bash
git add .
git commit -m "Descrição das mudanças"
git push origin main
```

3. O Render detectará automaticamente as mudanças e fará o redeploy

---

## Monitoramento Contínuo

### Verificar Status

- **Logs**: Vá para "Logs" para ver o que está acontecendo
- **Métricas**: Clique em "Metrics" para ver CPU, memória e requisições
- **Alertas**: Configure alertas para notificações de problemas

---

## Dicas de Segurança

1. **Nunca commit secrets** - Use variáveis de ambiente
2. **Atualize dependências** - Execute `pnpm update` regularmente
3. **Faça backups** - Exporte seus dados regularmente
4. **Use HTTPS** - O Render fornece SSL automaticamente

---

## Suporte

Se tiver problemas:

1. Verifique os logs no Render
2. Consulte a documentação: [render.com/docs](https://render.com/docs)
3. Abra uma issue no seu repositório GitHub

---

**Seu site estará online em poucos minutos! 🎉**
