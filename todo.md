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
