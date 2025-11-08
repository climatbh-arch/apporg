# Sistema de Controle de Manutenção e Instalação de Ar Condicionado - TODO

## Backend - Banco de Dados e API

### Modelos de Dados
- [x] Criar tabela de Clientes (nome, telefone, endereço, tipo: residencial/comercial)
- [x] Criar tabela de Equipamentos (marca, modelo, BTU, tipo, série, data última manutenção, cliente)
- [x] Criar tabela de Orçamentos/OS (cliente, equipamento, tipo serviço, itens, valor, status, responsável)
- [x] Criar tabela de Estoque (peças: condensadoras, tubos, gás, conectores, suportes, quantidade, preço)
- [x] Criar tabela de Transações Financeiras (tipo: entrada/saída, descrição, valor, data, categoria)
- [x] Criar tabela de Histórico de Manutenção (cliente, equipamento, data, descrição, técnico)
- [x] Criar tabela de Itens de OS (OS, produto/peça, quantidade, preço unitário)

### API - Rotas Backend
- [x] Implementar CRUD de Clientes
- [x] Implementar CRUD de Equipamentos
- [x] Implementar CRUD de Orçamentos/OS
- [x] Implementar CRUD de Estoque
- [x] Implementar CRUD de Transações Financeiras
- [x] Implementar endpoints de Relatórios (lucro, despesas, serviços realizados)
- [ ] Implementar geração de PDF para Orçamentos/OS
- [x] Implementar controle de status de OS (Pendente → Aprovado → Em Execução → Finalizado)

## Frontend - Interface do Usuário

### Layout e Navegação
- [x] Configurar DashboardLayout com sidebar navigation
- [x] Criar menu de navegação principal (Dashboard, Clientes, Equipamentos, Orçamentos/OS, Estoque, Financeiro, Relatórios)
- [x] Implementar autenticação e logout

### Dashboard
- [x] Criar página Dashboard com resumo do dia
- [x] Exibir caixa do dia (entradas/saídas)
- [x] Exibir serviços pendentes
- [x] Exibir estoque crítico (itens abaixo do mínimo)
- [ ] Exibir gráficos de desempenho (serviços por mês, lucro, etc.)

### Clientes
- [x] Criar página de lista de clientes com busca e filtros
- [x] Implementar formulário de novo cliente
- [ ] Criar página de detalhe do cliente
- [ ] Exibir histórico de serviços do cliente
- [x] Exibir equipamentos do cliente
- [x] Implementar edição de cliente

### Equipamentos
- [x] Criar página de lista de equipamentos
- [x] Implementar formulário de novo equipamento
- [ ] Criar página de detalhe do equipamento
- [ ] Exibir histórico de manutenção
- [x] Implementar edição de equipamento
- [x] Vincular equipamento a cliente

### Orçamentos e Ordens de Serviço
- [x] Criar página de lista de OS com filtros por status
- [x] Implementar formulário de novo orçamento/OS
- [ ] Criar página de detalhe de OS
- [x] Implementar seleção de cliente e equipamento
- [x] Implementar seleção de tipo de serviço
- [ ] Implementar adição de itens (peças, produtos, mão de obra)
- [ ] Implementar cálculo automático de valor total
- [x] Implementar mudança de status (Pendente → Aprovado → Em Execução → Finalizado)
- [ ] Implementar geração e download de PDF
- [ ] Implementar envio de orçamento por email/WhatsApp

### Estoque
- [x] Criar página de lista de estoque
- [x] Implementar formulário de novo item de estoque
- [ ] Implementar entrada de material (compra)
- [ ] Implementar saída de material (uso em OS)
- [x] Exibir quantidade em estoque
- [x] Exibir alerta de estoque mínimo
- [x] Implementar edição de item de estoque
- [ ] Criar relatório de movimentação de estoque

### Financeiro
- [x] Criar página de caixa diário
- [x] Implementar registro de entrada (serviço pago)
- [x] Implementar registro de saída (compra, combustível, ferramentas)
- [x] Exibir resumo diário (total entradas, total saídas, saldo)
- [ ] Implementar fechamento de caixa
- [x] Criar página de histórico de transações
- [ ] Implementar filtros por período, categoria, tipo
- [ ] Criar relatório de lucro mensal/anual
- [ ] Exibir recebimentos pendentes

### Relatórios
- [x] Criar página de relatórios
- [x] Implementar relatório de serviços realizados por período
- [x] Implementar relatório de lucro e despesas
- [ ] Implementar relatório de peças mais utilizadas
- [x] Implementar relatório de clientes mais atendidos
- [ ] Implementar relatório de faturamento por técnico
- [ ] Implementar gráficos visuais (gráficos de barras, pizza, linha)
- [ ] Implementar exportação de relatórios em PDF/Excel

## Funcionalidades Adicionais
- [ ] Implementar notificações de estoque mínimo
- [ ] Implementar agendamento de manutenção preventiva
- [ ] Implementar sistema de backup automático
- [ ] Implementar temas claro/escuro
- [ ] Implementar responsividade mobile
- [ ] Implementar validações de formulários
- [ ] Implementar tratamento de erros

## Funcionalidades Avançadas (Completas)

### PDF de Orçamentos
- [x] Instalar pdfkit e dependências
- [x] Criar rota tRPC para gerar PDF
- [x] Implementar template de PDF com dados da OS
- [x] Adicionar botão "Baixar PDF" na tela de Orçamentos/OS
- [x] Testar geração de PDF

### Integração WhatsApp (Twilio)
- [ ] Configurar conta Twilio (Opcional - requer credenciais do usuário)
- [ ] Instalar SDK Twilio
- [ ] Criar rota tRPC para enviar mensagem WhatsApp
- [ ] Adicionar botão "Enviar via WhatsApp" na tela de Orçamentos/OS
- [ ] Testar envio de mensagens

### Gráficos no Dashboard
- [x] Instalar Recharts
- [x] Criar gráfico de Lucro por Mês
- [x] Criar gráfico de Serviços por Tipo
- [x] Criar gráfico de Distribuição de Status de OS
- [x] Integrar gráficos no Dashboard
- [x] Testar responsividade dos gráficos

## Testes e Qualidade
- [ ] Testar CRUD de todas as entidades
- [ ] Testar fluxo de criação de OS
- [ ] Testar cálculos financeiros
- [ ] Testar geração de PDF
- [ ] Testar responsividade em mobile
- [ ] Testar performance do sistema

## Deployment
- [ ] Preparar para produção
- [ ] Configurar variáveis de ambiente
- [ ] Fazer backup do banco de dados
- [ ] Publicar sistema


## Funcionalidades Avançadas - Fase 2 (Em Desenvolvimento)

### Integração WhatsApp (Twilio)
- [ ] Instalar SDK Twilio
- [ ] Configurar variáveis de ambiente (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER)
- [ ] Criar rota tRPC para enviar mensagem WhatsApp
- [ ] Adicionar botão "Enviar via WhatsApp" na tela de Orçamentos/OS
- [ ] Testar envio de mensagens WhatsApp

### Relatórios em PDF/Excel
- [ ] Instalar bibliotecas (exceljs para Excel, pdfkit para PDF avançado)
- [ ] Criar rota tRPC para exportar relatório em PDF
- [ ] Criar rota tRPC para exportar relatório em Excel
- [ ] Adicionar botões de exportação na página de Relatórios
- [ ] Incluir gráficos nos PDFs exportados
- [ ] Testar exportação de relatórios

### Notificações por Email
- [ ] Configurar serviço de email (Nodemailer ou SendGrid)
- [ ] Adicionar variáveis de ambiente para email
- [ ] Criar template de email para confirmação de OS
- [ ] Criar template de email para lembretes de manutenção
- [ ] Criar rota tRPC para enviar emails
- [ ] Testar envio de emails


---

## 🚀 NOVAS MELHORIAS - FASE 3 (Solicitadas pelo usuário)

### 🎨 Fase 1: Dashboard com Gráficos e KPIs
- [ ] Melhorar dashboard com cards de KPIs (total clientes, equipamentos, receita)
- [ ] Adicionar gráfico de receita/despesa por período
- [ ] Mostrar próximas manutenções agendadas
- [ ] Criar timeline de atividades recentes
- [ ] Adicionar filtros de período (semana, mês, ano)

### 📊 Fase 2: Relatórios Avançados
- [ ] Implementar relatório de manutenção por período com filtros
- [ ] Implementar relatório financeiro detalhado (receita/despesa)
- [ ] Adicionar exportação para PDF com gráficos
- [ ] Adicionar exportação para Excel
- [ ] Criar gráficos de performance (serviços por técnico, etc.)

### 🔍 Fase 3: Busca, Filtros e Paginação
- [ ] Implementar busca global por cliente/equipamento
- [ ] Adicionar filtros avançados em listas (cliente, status, período)
- [ ] Implementar ordenação de colunas
- [ ] Adicionar paginação (10, 25, 50 itens por página)
- [ ] Salvar preferências de filtros do usuário

### 📅 Fase 4: Calendário e Agendamentos
- [ ] Implementar calendário visual de agendamentos
- [ ] Criar modal de agendamento com seleção de data/hora
- [ ] Implementar lembretes de manutenção preventiva
- [ ] Bloquear datas/horários ocupados
- [ ] Enviar notificações de agendamento

### 📧 Fase 5: Notificações e Integrações
- [ ] Implementar envio de orçamento por email
- [ ] Integrar WhatsApp para confirmação de serviço
- [ ] Implementar SMS de lembretes
- [ ] Criar templates de email profissionais
- [ ] Adicionar fila de envio de mensagens

### 🎨 Fase 6: Melhorias de UX/Formulários
- [ ] Adicionar máscaras de entrada (telefone, CEP)
- [ ] Implementar validações em tempo real
- [ ] Adicionar autocompletar de cidades/estados
- [ ] Implementar upload de fotos de equipamentos
- [ ] Melhorar toast notifications com ícones
- [ ] Adicionar confirmações antes de deletar

### 🌙 Fase 7: Dark Mode e Performance
- [ ] Implementar dark mode toggle
- [ ] Adicionar temas de cores customizáveis
- [ ] Implementar atalhos de teclado (Cmd+K para busca global)
- [ ] Implementar PWA (modo offline)
- [ ] Adicionar cache de dados
- [ ] Lazy loading de imagens
- [ ] Compressão de dados

### 📝 Fase 8: Edição de Ordens e Orçamentos
- [ ] Implementar edição completa de ordens de serviço
- [ ] Adicionar mudança de status (pendente → concluída)
- [ ] Criar módulo de orçamento separado
- [ ] Implementar aprovação de orçamento
- [ ] Adicionar histórico de alterações de cada OS

### 🔐 Fase 9: Segurança e Permissões
- [ ] Implementar roles (admin, técnico, gerente)
- [ ] Adicionar controle de acesso por página
- [ ] Implementar auditoria de ações
- [ ] Adicionar 2FA (autenticação de dois fatores)
- [ ] Implementar backup automático
- [ ] Criar histórico de alterações

### ✅ Fase 10: Testes e Ajustes Finais
- [ ] Testar todas as funcionalidades
- [ ] Verificar responsividade mobile
- [ ] Otimizar performance
- [ ] Corrigir bugs encontrados
- [ ] Documentar novas funcionalidades
- [ ] Fazer checkpoint final

---

## 📊 PROJETO PROFISSIONAL COMPLETO - 10 FASES

### FASE 1: Corrigir e Melhorar Edição de Ordens e Orçamentos
- [ ] Atualizar WorkOrderEdit com seleção de andamento (pendente → em andamento → concluída)
- [ ] Adicionar histórico de status
- [ ] Atualizar QuoteEdit com funcionalidades completas
- [ ] Integrar com banco de dados
- [ ] Testar sem erros

### FASE 2: Relatórios (PDF/Excel)
- [ ] Criar página de relatórios profissional
- [ ] Implementar exportação para PDF
- [ ] Implementar exportação para Excel
- [ ] Adicionar gráficos nos relatórios
- [ ] Testar sem erros

### FASE 3: Busca, Filtros e Paginação
- [ ] Implementar busca global
- [ ] Adicionar filtros avançados
- [ ] Implementar paginação
- [ ] Adicionar ordenação de colunas
- [ ] Testar sem erros

### FASE 4: Calendário e Agendamentos
- [ ] Criar calendário funcional
- [ ] Implementar agendamentos
- [ ] Lembretes automáticos
- [ ] Testar sem erros

### FASE 5: Notificações e Integrações
- [ ] Email, SMS, WhatsApp
- [ ] Integração com Twilio
- [ ] Testar sem erros

### FASE 6: Melhorias de UX
- [ ] Máscaras de entrada
- [ ] Validações em tempo real
- [ ] Upload de fotos
- [ ] Testar sem erros

### FASE 7: Dark Mode e PWA
- [ ] Dark mode
- [ ] PWA offline
- [ ] Testar sem erros

### FASE 8: Segurança e Permissões
- [ ] Roles (admin, técnico, gerente)
- [ ] 2FA
- [ ] Auditoria
- [ ] Testar sem erros

### FASE 9: Testes Exaustivos
- [ ] Testar todos os links
- [ ] Verificar erros 404
- [ ] Testar em mobile
- [ ] Testar performance
- [ ] Corrigir todos os erros

### FASE 10: Entregar Aplicativo Profissional Final
- [ ] Documentação completa
- [ ] Deploy final
- [ ] Testes de aceitação

**Status:** Iniciando FASE 1 - Corrigir e Melhorar Edição de Ordens e Orçamentos

**Objetivo:** Aplicativo PROFISSIONAL, COMPLETO e FUNCIONAL - SEM ERROS 404, SEM LINKS QUEBRADOS
