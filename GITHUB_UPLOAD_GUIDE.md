# 📤 Guia: Quais Arquivos Subir para GitHub

## ✅ O Que É Subido Automaticamente

Quando você executa `git add .` e `git push`, **TODOS** os arquivos do seu projeto são enviados para o GitHub, EXCETO aqueles listados no arquivo `.gitignore`.

---

## 📁 Estrutura do Projeto

```
ac_maintenance_system/
├── client/                 ✅ SOBE (Frontend React)
│   ├── src/
│   │   ├── pages/         ✅ (Todas as páginas)
│   │   ├── components/    ✅ (Componentes reutilizáveis)
│   │   ├── App.tsx        ✅
│   │   └── main.tsx       ✅
│   ├── public/            ✅ (Imagens, assets)
│   └── index.html         ✅
│
├── server/                ✅ SOBE (Backend Node/Express)
│   ├── routers.ts         ✅ (Rotas da API)
│   ├── db.ts              ✅ (Funções de banco)
│   ├── pdf-generator.ts   ✅ (Gerador de PDF)
│   ├── services/          ✅ (WhatsApp, Email, Reports)
│   └── _core/             ✅ (Configurações internas)
│
├── drizzle/               ✅ SOBE (Schema do banco)
│   ├── schema.ts          ✅ (Definição das tabelas)
│   └── migrations/        ✅ (Histórico de mudanças)
│
├── shared/                ✅ SOBE (Código compartilhado)
│   ├── const.ts           ✅
│   └── types.ts           ✅
│
├── package.json           ✅ SOBE (Dependências)
├── pnpm-lock.yaml         ✅ SOBE (Lock file)
├── tsconfig.json          ✅ SOBE (Configuração TypeScript)
├── vite.config.ts         ✅ SOBE (Configuração Vite)
├── drizzle.config.ts      ✅ SOBE (Configuração Drizzle)
├── .gitignore             ✅ SOBE (Arquivos ignorados)
├── .env.example           ✅ SOBE (Exemplo de variáveis)
├── README.md              ✅ SOBE (Documentação)
│
├── node_modules/          ❌ NÃO SOBE (Instalado no Render)
├── dist/                  ❌ NÃO SOBE (Compilado no Render)
├── .env                   ❌ NÃO SOBE (Segurança - credenciais)
└── .DS_Store              ❌ NÃO SOBE (Arquivo do macOS)
```

---

## 🚫 Arquivos NÃO Subidos (Listados no .gitignore)

```
node_modules/              # Dependências (muito grande)
dist/                      # Build compilado
.env                       # Variáveis de ambiente (SEGURANÇA!)
.env.local                 # Variáveis locais
.DS_Store                  # Arquivo do macOS
*.log                      # Arquivos de log
.vscode/                   # Configurações do VS Code
.idea/                     # Configurações do IntelliJ
```

---

## 📊 Resumo: O Que Sobe

| Tipo | Arquivos | Sobe? | Motivo |
|------|----------|-------|--------|
| **Código** | `.ts`, `.tsx`, `.js` | ✅ | Necessário para funcionar |
| **Configuração** | `package.json`, `tsconfig.json`, etc | ✅ | Necessário para build |
| **Banco de Dados** | `drizzle/schema.ts`, migrations | ✅ | Necessário para criar tabelas |
| **Documentação** | `.md` files | ✅ | Referência |
| **Dependências** | `node_modules/` | ❌ | Muito grande (instalado no Render) |
| **Build** | `dist/` | ❌ | Compilado no Render |
| **Credenciais** | `.env` | ❌ | Segurança (adicionado no Render) |
| **Logs** | `.log` | ❌ | Não necessário |

---

## 🔐 Segurança: Arquivo .env

**⚠️ IMPORTANTE**: O arquivo `.env` com suas credenciais **NÃO** é subido para o GitHub!

Isso é controlado pelo arquivo `.gitignore`:

```
# .gitignore
.env
.env.local
.env.*.local
```

**Por quê?** Se você subisse `.env`, qualquer pessoa veria suas chaves de API!

**Como funciona no Render?**
1. Você faz upload do código (SEM `.env`)
2. No Render, você adiciona as variáveis manualmente
3. Render injeta as variáveis quando o app inicia

---

## 📝 Passo a Passo: Enviar para GitHub

### Passo 1: Criar repositório no GitHub
(Já explicado no guia anterior)

### Passo 2: Inicializar Git Localmente

```bash
cd /home/ubuntu/ac_maintenance_system

# Verificar se git já está inicializado
git status

# Se não estiver, inicializar:
git init
```

### Passo 3: Adicionar Todos os Arquivos

```bash
# Adicionar TODOS os arquivos (exceto os do .gitignore)
git add .

# Verificar o que vai ser adicionado
git status
```

**Resultado esperado**: Você verá uma lista de arquivos em verde

### Passo 4: Fazer Commit

```bash
# Criar um commit com mensagem
git commit -m "Initial commit - Sistema de Controle de AC"
```

**Resultado esperado**: Mensagem mostrando quantos arquivos foram commitados

### Passo 5: Conectar ao GitHub

```bash
# Adicionar o repositório remoto
# SUBSTITUA SEU_USUARIO pelo seu usuário GitHub
git remote add origin https://github.com/SEU_USUARIO/ac_maintenance_system.git

# Verificar se foi adicionado
git remote -v
```

### Passo 6: Fazer Push para GitHub

```bash
# Renomear branch para 'main' (padrão do GitHub)
git branch -M main

# Fazer push
git push -u origin main
```

**Resultado esperado**: Mensagens de progresso e depois "done"

---

## ✅ Verificar se Funcionou

1. Acesse [github.com](https://github.com)
2. Vá para seu repositório `ac_maintenance_system`
3. Você deve ver todos os arquivos listados
4. Clique em alguns arquivos para verificar se o código está lá

---

## 📦 Tamanho Total

O projeto tem aproximadamente:
- **Código**: ~500 KB
- **Dependências (node_modules)**: ~1.5 GB (NÃO sobe)
- **Total no GitHub**: ~500 KB

---

## 🔄 Atualizações Futuras

Depois que está no GitHub, para fazer atualizações:

```bash
# Fazer mudanças nos arquivos
# Depois:

git add .
git commit -m "Descrição da mudança"
git push origin main
```

Render detectará automaticamente o push e fará redeploy!

---

## 🆘 Problemas Comuns

### ❌ "fatal: not a git repository"

**Solução**: Execute `git init` primeiro

### ❌ "remote origin already exists"

**Solução**: Execute `git remote remove origin` e depois adicione novamente

### ❌ "Permission denied (publickey)"

**Solução**: Configure SSH no GitHub ou use HTTPS com token

### ❌ "fatal: 'origin' does not appear to be a 'git' repository"

**Solução**: Verifique a URL do repositório (deve terminar com `.git`)

---

## 📚 Resumo Final

**O que você faz:**
1. Cria repositório no GitHub
2. Executa `git init`, `git add .`, `git commit`, `git remote add`, `git push`
3. GitHub recebe TODOS os arquivos (exceto `.env` e `node_modules`)

**O que o Render faz:**
1. Clona o repositório do GitHub
2. Instala `node_modules` (de `package.json`)
3. Compila o código
4. Injeta variáveis de ambiente
5. Inicia a aplicação

**Resultado**: Seu site online! 🚀

---

**Pronto para começar?** Siga os passos acima e me avise quando terminar cada um!
