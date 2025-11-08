#!/bin/bash

# Script para preparar o projeto para deploy no Render
# Execute: bash prepare-deploy.sh

echo "🚀 Preparando projeto para deploy no Render..."
echo ""

# Verificar se git está inicializado
if [ ! -d ".git" ]; then
    echo "❌ Git não está inicializado"
    echo "Execute: git init"
    exit 1
fi

echo "✅ Git está inicializado"
echo ""

# Verificar se package.json existe
if [ ! -f "package.json" ]; then
    echo "❌ package.json não encontrado"
    exit 1
fi

echo "✅ package.json encontrado"
echo ""

# Instalar dependências
echo "📦 Instalando dependências..."
pnpm install

if [ $? -ne 0 ]; then
    echo "❌ Erro ao instalar dependências"
    exit 1
fi

echo "✅ Dependências instaladas"
echo ""

# Build
echo "🔨 Compilando projeto..."
pnpm build

if [ $? -ne 0 ]; then
    echo "❌ Erro ao compilar"
    exit 1
fi

echo "✅ Projeto compilado com sucesso"
echo ""

# Verificar arquivo .env
if [ ! -f ".env" ]; then
    echo "⚠️  Arquivo .env não encontrado"
    echo "Você precisa criar um arquivo .env com as variáveis de ambiente"
    echo ""
    echo "Variáveis necessárias:"
    echo "  DATABASE_URL=postgresql://..."
    echo "  NODE_ENV=production"
    echo "  VITE_APP_ID=..."
    echo "  JWT_SECRET=..."
    echo "  OWNER_OPEN_ID=..."
    echo "  BUILT_IN_FORGE_API_KEY=..."
else
    echo "✅ Arquivo .env encontrado"
fi

echo ""
echo "🎉 Projeto pronto para deploy!"
echo ""
echo "Próximos passos:"
echo "1. Faça push para GitHub: git push -u origin main"
echo "2. Crie um Web Service no Render"
echo "3. Adicione as variáveis de ambiente no Render"
echo "4. Aguarde o deploy completar"
echo ""
