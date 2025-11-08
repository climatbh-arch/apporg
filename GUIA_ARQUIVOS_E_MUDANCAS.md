# 📋 Guia Completo: Arquivos e Como Fazer Mudanças

## 🗂️ Estrutura de Pastas

```
ac_maintenance_system/
├── client/                          # Frontend (React)
│   ├── src/
│   │   ├── pages/                  # Páginas principais
│   │   │   ├── Dashboard.tsx       # Página inicial
│   │   │   ├── Clients.tsx         # Gestão de clientes
│   │   │   ├── Equipment.tsx       # Gestão de equipamentos
│   │   │   ├── WorkOrders.tsx      # Orçamentos e OS
│   │   │   ├── Inventory.tsx       # Controle de estoque
│   │   │   ├── Financial.tsx       # Financeiro
│   │   │   ├── Reports.tsx         # Relatórios
│   │   │   └── Home.tsx            # Página de login
│   │   ├── components/             # Componentes reutilizáveis
│   │   ├── App.tsx                 # Rotas principais
│   │   ├── main.tsx                # Inicialização
│   │   ├── const.ts                # Constantes (URLs, títulos)
│   │   └── index.css               # Estilos globais
│   └── index.html                  # HTML principal
│
├── server/                          # Backend (Node/Express)
│   ├── routers.ts                  # API tRPC (CRUD)
│   ├── db.ts                       # Funções de banco de dados
│   ├── services/                   # Serviços
│   │   ├── email.ts                # Envio de emails
│   │   ├── whatsapp.ts             # Integração WhatsApp
│   │   └── reports.ts              # Geração de relatórios
│   ├── pdf-generator.ts            # Geração de PDFs
│   └── _core/                      # Configurações internas
│       ├── context.ts              # Autenticação
│       ├── trpc.ts                 # Configuração tRPC
│       ├── env.ts                  # Variáveis de ambiente
│       └── index.ts                # Inicialização do servidor
│
├── drizzle/                         # Banco de dados
│   └── schema.ts                   # Definição de tabelas
│
├── package.json                     # Dependências
├── vite.config.ts                  # Configuração Vite
└── tsconfig.json                   # Configuração TypeScript
```

---

## 🎯 Arquivos Principais e Quando Mudar

### 1️⃣ **Página de Login** (`client/src/pages/Home.tsx`)

**Quando mudar:**
- Alterar layout da página de login
- Mudar cores ou design
- Adicionar logo ou branding

**Como:**
```bash
# Editar arquivo
# Depois fazer commit e push
git add client/src/pages/Home.tsx
git commit -m "Update: Improve login page design"
git push origin main
```

---

### 2️⃣ **Constantes e URLs** (`client/src/const.ts`)

**Quando mudar:**
- Alterar título da aplicação
- Mudar URL de login
- Adicionar novas constantes

**Arquivo atual:**
```typescript
export const APP_TITLE = import.meta.env.VITE_APP_TITLE || "Sistema de Controle de AC";
export const APP_LOGO = "https://placehold.co/128x128/E1E7EF/1F2937?text=App";

export const getLoginUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL || "https://oauth.manus.im";
  const appId = import.meta.env.VITE_APP_ID || "default-app-id";
  // ...
};
```

---

### 3️⃣ **HTML Principal** (`client/index.html`)

**Quando mudar:**
- Alterar título da página
- Mudar favicon
- Adicionar meta tags

**Arquivo atual:**
```html
<title>Sistema de Controle de AC</title>
<link rel="icon" type="image/png" href="https://placehold.co/128x128/E1E7EF/1F2937?text=App" />
```

---

### 4️⃣ **Rotas da API** (`server/routers.ts`)

**Quando mudar:**
- Adicionar novo CRUD (criar, ler, atualizar, deletar)
- Mudar validações
- Adicionar novas funcionalidades

**Exemplo de rota:**
```typescript
const clientsRouter = router({
  list: protectedProcedure.query(async () => {
    return await db.getAllClients();
  }),

  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      phone: z.string().optional(),
      email: z.string().email().optional(),
    }))
    .mutation(async ({ input }) => {
      return await db.createClient(input);
    }),
});
```

---

### 5️⃣ **Banco de Dados** (`drizzle/schema.ts`)

**Quando mudar:**
- Adicionar novas tabelas
- Adicionar novos campos
- Mudar tipos de dados

**Depois de mudar:**
```bash
# Fazer push das mudanças para o banco
pnpm db:push
```

---

### 6️⃣ **Funções de Banco de Dados** (`server/db.ts`)

**Quando mudar:**
- Adicionar novas queries
- Mudar lógica de busca
- Adicionar filtros

---

### 7️⃣ **Serviços** (`server/services/`)

**Email** (`email.ts`)
- Quando: Mudar template de email, adicionar novos tipos de email

**WhatsApp** (`whatsapp.ts`)
- Quando: Mudar mensagens, adicionar novos tipos de notificação

**Relatórios** (`reports.ts`)
- Quando: Mudar formato de relatório, adicionar novos campos

---

## 🔄 Fluxo de Mudanças

### Passo 1: Fazer a mudança
```bash
# Editar arquivo
# Ex: client/src/pages/Clients.tsx
```

### Passo 2: Testar localmente (opcional)
```bash
# Se estiver rodando localmente
npm run dev
# Testar no navegador
```

### Passo 3: Fazer commit
```bash
git add .
git commit -m "Update: Descrição da mudança"
```

### Passo 4: Fazer push
```bash
git push origin main
```

### Passo 5: Render faz deploy automático
- Detecta novo commit (automático)
- Compila código (2-3 minutos)
- Deploy completo (5-10 minutos)

---

## 🚨 Erros Comuns e Soluções

### Erro 1: "Cannot use 'import.meta' outside a module"
**Causa:** Usar `import.meta` em arquivo HTML
**Solução:** Mover para arquivo `.tsx` ou `.ts`

### Erro 2: "401 Unauthorized"
**Causa:** Usuário não está autenticado
**Solução:** Fazer login com credenciais Manus OAuth

### Erro 3: "404 Not Found"
**Causa:** Rota não existe
**Solução:** Verificar se rota está registrada em `routers.ts`

### Erro 4: "Database connection failed"
**Causa:** Variável `DATABASE_URL` não configurada
**Solução:** Adicionar em Render → Environment Variables

---

## 📝 Variáveis de Ambiente

### No Render (https://dashboard.render.com/)

| Variável | Valor | Obrigatória |
|----------|-------|-------------|
| `DATABASE_URL` | Connection string PostgreSQL | ✅ Sim |
| `NODE_ENV` | `production` | ✅ Sim |
| `JWT_SECRET` | Chave secreta para sessão | ✅ Sim |
| `VITE_APP_ID` | ID da aplicação Manus | ⚠️ Recomendado |
| `VITE_OAUTH_PORTAL_URL` | URL do OAuth Manus | ⚠️ Recomendado |
| `VITE_APP_TITLE` | Título da aplicação | ⚠️ Recomendado |

---

## 🎯 Próximas Mudanças Recomendadas

### 1. Melhorar página de login
- Arquivo: `client/src/pages/Home.tsx`
- Adicionar logo, cores, design profissional

### 2. Adicionar página pública
- Arquivo: `client/src/pages/Status.tsx`
- Mostrar status da aplicação sem login

### 3. Configurar WhatsApp
- Arquivo: `server/services/whatsapp.ts`
- Adicionar credenciais Twilio

### 4. Configurar Email
- Arquivo: `server/services/email.ts`
- Adicionar credenciais SMTP

---

## 💡 Dicas Importantes

1. **Sempre fazer commit antes de push**
   ```bash
   git add .
   git commit -m "Descrição clara"
   git push origin main
   ```

2. **Não editar variáveis de ambiente no código**
   - Usar `import.meta.env.VITE_*` no frontend
   - Usar `process.env.*` no backend

3. **Testar mudanças antes de fazer push**
   - Se possível, rodar localmente
   - Ou acompanhar logs do Render

4. **Manter commits pequenos e descritivos**
   - Um commit = uma mudança
   - Mensagem clara e em português

---

## 📞 Contatos Importantes

- **Render Dashboard:** https://dashboard.render.com/
- **GitHub Repository:** https://github.com/climatbh-arch/apporg
- **Manus OAuth:** https://oauth.manus.im
- **Manus Help:** https://help.manus.im

---

## ✅ Checklist para Novo Deploy

- [ ] Fiz a mudança no arquivo correto
- [ ] Testei localmente (se possível)
- [ ] Fiz `git add .`
- [ ] Fiz `git commit -m "..."`
- [ ] Fiz `git push origin main`
- [ ] Acompanhei o build no Render
- [ ] Testei no site ao vivo

---

**Dúvidas? Me avisa! 🚀**
