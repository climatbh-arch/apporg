# AppOrg - Sistema de Gestão de Serviços de Campo (FSM)

Sistema completo de Field Service Management para empresas de manutenção de ar condicionado, com automações inteligentes, despacho otimizado e gestão financeira integrada.

## 🚀 Funcionalidades Principais

### 📦 Gestão de Ativos (Asset Management)
- Cadastro completo de equipamentos dos clientes
- Rastreamento de histórico de manutenção
- Alertas automáticos de manutenção preventiva
- Gestão de garantias e vida útil dos equipamentos

### 🤖 Automações Inteligentes
- **Manutenção Preventiva Automática**: Sistema monitora ativos e cria leads automaticamente 30 dias antes da próxima manutenção
- **Notificações Multi-Canal**: Email, SMS e WhatsApp integrados
- **Segmentação de Clientes**: Classificação automática baseada em tipo de contrato e volume de ativos
- **Faturamento Recorrente**: Geração automática de faturas para contratos de manutenção

### 📅 Schedule Board e Despacho Inteligente
- Visualização em tempo real de técnicos e ordens de serviço
- **Algoritmo de Atribuição Automática** baseado em:
  1. Skill Matching (habilidades técnicas)
  2. Geolocalização e otimização de rota
  3. SLA e prioridade
  4. Carga horária e disponibilidade
- Rastreamento GPS de técnicos em campo
- Interface drag-and-drop para alocação manual

### 💰 Automação Financeira
- Faturamento automático ao concluir ordem de serviço
- Baixa automática de estoque
- Gestão de contratos recorrentes
- Integração preparada para NF-e/NFS-e
- Sincronização com ERP/Sistema Contábil

### 📱 App Móvel para Técnicos (Preparado)
- Check-in/Check-out com GPS obrigatório
- Captura de fotos com timestamp e geolocalização
- Relatório de serviço digital
- Assinatura digital do cliente
- Controle de peças utilizadas em tempo real

## 🛠️ Stack Tecnológica

### Frontend
- **React 19** com TypeScript
- **Vite** para build otimizado
- **TailwindCSS** para estilização
- **Radix UI** para componentes acessíveis
- **TanStack Query** para gerenciamento de estado
- **Wouter** para roteamento

### Backend
- **Node.js** com Express
- **tRPC** para APIs type-safe
- **PostgreSQL** com Drizzle ORM
- **PostGIS** para dados geográficos (preparado)
- **Redis** para cache e tempo real (preparado)

### Integrações
- **Twilio** para SMS e WhatsApp
- **Nodemailer** para emails
- **AWS S3** para armazenamento de arquivos
- **OAuth 2.0/JWT** para autenticação

## 📊 Estrutura do Banco de Dados

### Novas Tabelas Implementadas
- `assets` - Gestão de ativos dos clientes
- `technicianSkills` - Habilidades e certificações dos técnicos
- `technicianLocations` - Histórico de geolocalização
- `workOrderPhotos` - Fotos das ordens de serviço
- `automatedNotifications` - Fila de notificações
- `maintenanceContracts` - Contratos de manutenção
- `dispatchQueue` - Fila de despacho inteligente

### Campos Adicionados
- `workOrders`: assetId, serviceType, priority, slaLevel, scheduledDate, checkIn/Out com GPS
- `technicians`: currentStatus, currentLatitude/Longitude, workZone, maxWorkOrdersPerDay
- `clients`: contractType, segmentation, latitude/longitude

## 🔧 Instalação e Configuração

### Pré-requisitos
- Node.js 22+
- PostgreSQL 14+
- pnpm (gerenciador de pacotes)

### Variáveis de Ambiente
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/apporg

# Twilio (WhatsApp/SMS)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890
TWILIO_PHONE_NUMBER=+1234567890

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@apporg.com

# AWS S3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_BUCKET_NAME=apporg-files

# OAuth
OAUTH_CLIENT_ID=your_client_id
OAUTH_CLIENT_SECRET=your_client_secret
```

### Instalação
```bash
# Instalar dependências
pnpm install

# Executar migrações do banco de dados
pnpm db:push

# Modo desenvolvimento
pnpm dev

# Build para produção
pnpm build

# Iniciar produção
pnpm start
```

## 🤖 Automações Configuradas

### Execução Diária (8h)
- Monitoramento de manutenções preventivas
- Criação automática de leads de MP
- Envio de notificações de lembrete
- Geração de faturas recorrentes

### Execução Semanal (Domingo 2h)
- Segmentação automática de clientes

### Execução Contínua (5 em 5 minutos)
- Processamento da fila de notificações

### Execução Manual
Acesse a página de **Automações** no sistema para executar manualmente:
- Automações diárias
- Segmentação de clientes
- Processamento de notificações

## 📱 Páginas do Sistema

1. **Dashboard** - Visão geral de KPIs e métricas
2. **Orçamentos** - Gestão de propostas comerciais
3. **Ordens de Serviço** - Controle de execução de serviços
4. **Ativos** - Gestão de equipamentos dos clientes
5. **Schedule Board** - Despacho inteligente de técnicos
6. **Técnicos** - Cadastro e gestão de equipe
7. **Produtos** - Controle de estoque e serviços
8. **Financeiro** - Pagamentos e despesas
9. **Automações** - Monitoramento e execução de automações

## 🔐 Segurança e Conformidade

- **LGPD Compliant**: Privacy-by-design
- **Criptografia**: End-to-end para dados em trânsito
- **Autenticação**: OAuth 2.0 / JWT
- **Auditoria**: Histórico completo de alterações

## 📈 Ganhos de Eficiência Esperados

- **70%** de redução no tempo de alocação manual de técnicos
- **Aceleração do ciclo O2C** (Order-to-Cash) com faturamento automático
- **Aumento de receita recorrente** com automação de leads de MP
- **Redução de no-show** com notificações automáticas de ETA

## 🚀 Próximos Passos

### Fase 1 - Fundação (Implementada)
- ✅ Módulo de Ativos
- ✅ Automações básicas
- ✅ Schedule Board
- ✅ APIs REST

### Fase 2 - Integração (Próxima)
- [ ] Integração com NF-e/NFS-e
- [ ] Integração com ERP (SAP, TOTVS)
- [ ] App móvel nativo (React Native)
- [ ] Implementação de PostGIS para cálculos geográficos

### Fase 3 - Inteligência (Futuro)
- [ ] Machine Learning para previsão de falhas
- [ ] Otimização de rotas com algoritmos avançados
- [ ] Dashboard preditivo com BI
- [ ] Chatbot para atendimento ao cliente

## 📝 Licença

MIT License - Veja LICENSE para mais detalhes

## 👥 Suporte

Para suporte e dúvidas:
- Email: support@apporg.com
- Documentação: https://docs.apporg.com
- Issues: https://github.com/climatbh-arch/apporg/issues

---

**Desenvolvido com ❤️ para revolucionar a gestão de serviços de campo**
