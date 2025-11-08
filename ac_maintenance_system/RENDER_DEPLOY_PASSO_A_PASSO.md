# 🚀 Guia Completo: Deploy no Render - Passo a Passo

## ⚠️ IMPORTANTE: Leia Tudo Antes de Começar!

Este guia vai te ajudar a colocar seu sistema online no Render **sem erros**. Siga cada passo com cuidado.

---

## 📋 Pré-requisitos

Você vai precisar de:
1. ✅ Conta no GitHub (gratuita)
2. ✅ Conta no Render (gratuita)
3. ✅ Seu código no GitHub
4. ✅ Dados do Manus (VITE_APP_ID, etc)

**Tempo estimado: 30-45 minutos**

---

## PASSO 1: Preparar o Código no GitHub

### 1.1 - Criar Repositório no GitHub

1. Acesse [github.com](https://github.com)
2. Clique no **+** (canto superior direito)
3. Selecione **New repository**
4. Preencha:
   - **Repository name**: `ac_maintenance_system`
   - **Description**: Sistema de Controle de Manutenção de AC
   - **Visibility**: Public (importante para Render)
   - **Initialize repository**: Deixe em branco
5. Clique **Create repository**

### 1.2 - Enviar Código para GitHub

Abra o terminal e execute os comandos (um por um):

```bash
cd /home/ubuntu/ac_maintenance_system

# Inicializar git
git init

# Adicionar todos os arquivos
git add .

# Fazer commit
git commit -m "Initial commit - Sistema de Controle de AC"

# Adicionar remote (substitua SEU_USUARIO pelo seu usuário GitHub)
git remote add origin https://github.com/SEU_USUARIO/ac_maintenance_system.git

# Fazer push
git branch -M main
git push -u origin main
```

**Resultado esperado**: Você verá mensagens de progresso e depois "done"

---

## PASSO 2: Criar Banco de Dados PostgreSQL no Render

### 2.1 - Acessar Render

1. Acesse [render.com](https://render.com)
2. Clique **Sign up** (ou faça login se já tem conta)
3. Use GitHub para facilitar (clique "Continue with GitHub")
4. Autorize o Render a acessar sua conta GitHub

### 2.2 - Criar PostgreSQL Database

1. No dashboard do Render, clique **+ New** (canto superior direito)
2. Selecione **PostgreSQL**
3. Preencha os dados:
   - **Name**: `ac-maintenance-db`
   - **Database**: `ac_maintenance`
   - **User**: `postgres`
   - **Region**: Selecione a região mais próxima (ex: São Paulo)
   - **PostgreSQL Version**: 15
4. Clique **Create Database**

**⏳ Aguarde 2-3 minutos** enquanto o banco é criado

### 2.3 - Copiar a Conexão

Quando o banco estiver pronto:

1. Você verá uma tela com as informações
2. **IMPORTANTE**: Copie a **External Database URL** (começa com `postgresql://`)
3. Guarde em um local seguro (você vai precisar depois)

**Exemplo de URL**:
```
postgresql://postgres:SENHA@dpg-abc123.render.com/ac_maintenance
```

---

## PASSO 3: Criar Web Service no Render

### 3.1 - Criar Novo Web Service

1. No dashboard do Render, clique **+ New**
2. Selecione **Web Service**
3. Clique **Connect a repository**
4. Procure por `ac_maintenance_system`
5. Clique **Connect**

### 3.2 - Configurar Web Service

Preencha os campos:

| Campo | Valor |
|-------|-------|
| **Name** | `ac-maintenance-api` |
| **Environment** | `Node` |
| **Region** | Mesma do banco (ex: São Paulo) |
| **Branch** | `main` |
| **Build Command** | `pnpm install && pnpm build` |
| **Start Command** | `pnpm start` |
| **Plan** | Free (gratuito) |

### 3.3 - Adicionar Variáveis de Ambiente

Clique em **Environment** e adicione cada variável:

```
DATABASE_URL=postgresql://postgres:SENHA@dpg-abc123.render.com/ac_maintenance
NODE_ENV=production
VITE_APP_ID=SEU_VITE_APP_ID
VITE_APP_TITLE=Sistema de Controle de AC
VITE_APP_LOGO=/logo.svg
JWT_SECRET=gerar_uma_senha_aleatoria_aqui
OWNER_OPEN_ID=seu_owner_open_id
OWNER_NAME=Seu Nome
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://auth.manus.im
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=sua_api_key_aqui
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
VITE_FRONTEND_FORGE_API_KEY=sua_frontend_key_aqui
```

**⚠️ IMPORTANTE**: 
- Substitua os valores pelos seus dados reais
- Não compartilhe essas chaves com ninguém
- Guarde em um local seguro

### 3.4 - Iniciar Deploy

1. Clique **Create Web Service**
2. **⏳ Aguarde 5-10 minutos** enquanto o Render:
   - Clona seu repositório
   - Instala dependências
   - Constrói a aplicação
   - Faz deploy

**Você verá uma tela com logs** - procure por mensagens de sucesso

---

## PASSO 4: Verificar se Está Funcionando

### 4.1 - Acessar Seu Site

1. Quando o deploy terminar, você verá uma URL como:
   ```
   https://ac-maintenance-api.onrender.com
   ```

2. Clique nela ou copie e cole no navegador

3. **Você deve ver**:
   - Tela de login do Manus
   - Logo do seu sistema
   - Botão "Sign in"

### 4.2 - Fazer Login

1. Clique **Sign in**
2. Faça login com sua conta Manus
3. Você deve ser redirecionado para o Dashboard

**Se vir o Dashboard com os gráficos** = ✅ SUCESSO!

---

## PASSO 5: Solucionar Problemas Comuns

### ❌ Erro: "Application failed to start"

**Causa**: Variáveis de ambiente faltando

**Solução**:
1. Volte para o Web Service
2. Clique **Environment**
3. Verifique se todas as variáveis estão preenchidas
4. Clique **Save** e aguarde redeploy automático

### ❌ Erro: "Cannot connect to database"

**Causa**: DATABASE_URL incorreta

**Solução**:
1. Copie a URL do banco PostgreSQL novamente
2. Verifique se não tem espaços extras
3. Atualize a variável no Render
4. Aguarde redeploy

### ❌ Erro: "Build failed"

**Causa**: Dependências não instaladas corretamente

**Solução**:
1. Clique **Redeploy** no Render
2. Aguarde 10 minutos
3. Se persistir, entre em contato com suporte

### ❌ Página em branco ou erro 404

**Causa**: Frontend não foi construído

**Solução**:
1. Verifique se `pnpm build` está no Build Command
2. Clique **Redeploy**
3. Aguarde 10 minutos

---

## PASSO 6: Configurar Domínio Customizado (Opcional)

Se quiser um domínio customizado (ex: `meusite.com`):

1. No Render, vá para seu Web Service
2. Clique **Settings**
3. Procure por **Custom Domain**
4. Adicione seu domínio
5. Siga as instruções para apontar DNS

---

## PASSO 7: Monitorar Seu Site

### Verificar Logs

1. No Render, clique **Logs**
2. Você verá todos os eventos
3. Procure por erros (vermelho)

### Verificar Performance

1. Clique **Metrics**
2. Veja CPU, memória, requisições

### Reiniciar Aplicação

Se algo der errado:
1. Clique **Redeploy**
2. Aguarde 5 minutos

---

## 📞 Dados que Você Precisa

Antes de começar, reúna:

- [ ] VITE_APP_ID (do Manus)
- [ ] OWNER_OPEN_ID (seu ID no Manus)
- [ ] BUILT_IN_FORGE_API_KEY (do Manus)
- [ ] VITE_FRONTEND_FORGE_API_KEY (do Manus)
- [ ] Usuário GitHub
- [ ] Senha GitHub (ou token de acesso)

**Se não tiver esses dados**, entre em contato com suporte Manus em [help.manus.im](https://help.manus.im)

---

## ✅ Checklist Final

Antes de considerar pronto:

- [ ] Código está no GitHub
- [ ] PostgreSQL criado no Render
- [ ] Web Service criado no Render
- [ ] Todas as variáveis de ambiente adicionadas
- [ ] Deploy completou sem erros
- [ ] Você consegue acessar o site
- [ ] Consegue fazer login
- [ ] Dashboard carrega com gráficos
- [ ] Botões funcionam (criar cliente, OS, etc)

---

## 🎉 Pronto!

Seu sistema está online! Agora você pode:

1. **Compartilhar a URL** com seus clientes
2. **Acessar de qualquer lugar** com internet
3. **Usar no celular** (é responsivo)
4. **Fazer backup** automático (Render faz)

---

## 💡 Dicas Importantes

1. **Render coloca em sleep** se não usar por 15 dias (plano free)
   - Solução: Upgrade para plano pago ou acesse regularmente

2. **Banco de dados é gratuito** por 90 dias
   - Depois precisa de plano pago

3. **Limite de requisições** no plano free
   - Se ultrapassar, upgrade para plano pago

4. **Sempre faça backup** de dados importantes
   - Render não é responsável por perda de dados

---

## 🆘 Precisa de Ajuda?

Se algo der errado:

1. Verifique os **Logs** no Render
2. Procure pela mensagem de erro
3. Consulte a seção "Solucionar Problemas"
4. Entre em contato com suporte Manus

**Email**: support@manus.im
**Site**: https://help.manus.im

---

**Boa sorte! 🚀**
