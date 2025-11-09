# Sistema de Orçamentos e Ordens de Serviço - TODO

## Fase 1: Banco de Dados e Backend
- [x] Definir esquema do banco de dados (Drizzle ORM)
  - [x] Tabela de Clientes
  - [x] Tabela de Orçamentos
  - [x] Tabela de Itens de Orçamento
  - [x] Tabela de Ordens de Serviço
  - [x] Tabela de Itens de Ordem de Serviço
- [x] Implementar tRPC Routers para Orçamentos
  - [x] CRUD completo (Create, Read, Update, Delete)
  - [x] Listar orçamentos com filtros
  - [x] Buscar orçamento por ID
  - [x] Cálculos automáticos (subtotal, desconto, total)
  - [x] Mudança de status
- [x] Implementar tRPC Routers para Ordens de Serviço
  - [x] CRUD completo (Create, Read, Update, Delete)
  - [x] Listar ordens com filtros
  - [x] Buscar ordem por ID
  - [x] Cálculos automáticos (mão de obra, materiais, total)
  - [x] Mudança de status
- [x] Implementar tRPC Router para Clientes
  - [x] CRUD completo
  - [x] Listar clientes
- [x] Implementar tRPC Router para Dashboard
  - [x] Estatísticas de orçamentos
  - [x] Estatísticas de ordens de serviço
  - [x] Resumo geral

## Fase 2: Frontend - Estrutura e Navegação
- [x] Criar layout principal com abas/menu
- [x] Página 1: Orçamentos
- [x] Página 2: Ordens de Serviço
- [x] Página 3: Dashboard (Painel Inicial)
- [x] Implementar navegação entre páginas
- [x] Design limpo, profissional e responsivo

## Fase 3: Página de Orçamentos
- [x] Formulário de criação de orçamento
  - [x] Número do orçamento (gerado automaticamente)
  - [x] Data de criação (automática)
  - [ ] Nome do cliente (seleção de lista)
  - [x] Telefone / WhatsApp
  - [x] E-mail
  - [x] Descrição do serviço
  - [ ] Lista dinâmica de itens
    - [ ] Nome do item
    - [ ] Quantidade
    - [ ] Valor unitário
    - [ ] Valor total automático (quantidade × valor unitário)
  - [x] Campo para desconto (%)
  - [x] Valor total geral (calculado automaticamente)
  - [ ] Status (Em elaboração / Aprovado / Reprovado)
- [x] Botões de ação
  - [x] Salvar rascunho
  - [ ] Gerar PDF
  - [ ] Enviar para cliente
  - [ ] Converter em Ordem de Serviço
- [x] Lista de orçamentos
  - [x] Exibir todos os orçamentos
  - [ ] Buscar orçamentos
  - [ ] Editar orçamento
  - [ ] Duplicar orçamento
  - [x] Deletar orçamento
  - [ ] Filtrar por status

## Fase 4: Página de Ordens de Serviço
- [x] Formulário de criação de ordem de serviço
  - [x] Número da OS (gerado automaticamente)
  - [x] Data de abertura (automática)
  - [ ] Data de conclusão
  - [ ] Cliente (seleção de lista)
  - [x] Descrição do serviço executado
  - [ ] Materiais utilizados (com controle de estoque opcional)
  - [x] Mão de obra
    - [x] Horas trabalhadas
    - [x] Valor por hora
    - [x] Total automático
  - [x] Técnico responsável
  - [ ] Status (Aberta / Em andamento / Concluída / Entregue)
- [x] Botões de ação
  - [x] Salvar
  - [ ] Gerar PDF
  - [ ] Marcar como concluída
  - [ ] Enviar para cliente
- [x] Lista de ordens de serviço
  - [x] Exibir todas as ordens
  - [ ] Buscar ordens
  - [ ] Editar ordem
  - [ ] Duplicar ordem
  - [x] Deletar ordem
  - [ ] Filtrar por status

## Fase 5: Funcionalidades Adicionais
- [ ] Geração de PDF para orçamentos
- [ ] Geração de PDF para ordens de serviço
- [ ] Exportar relatórios em Excel
- [ ] Busca global e filtros avançados
- [ ] Paginação em listas
- [x] Número sequencial automático (orçamento e OS)

## Fase 6: Dashboard (Painel Inicial)
- [x] Resumo de orçamentos ativos
- [x] Resumo de ordens de serviço ativas
- [ ] Gráficos de status
- [x] Estatísticas gerais
- [ ] Alertas e notificações

## Fase 7: Testes e Documentação
- [ ] Testar CRUD de orçamentos
- [ ] Testar CRUD de ordens de serviço
- [x] Testar cálculos automáticos
- [ ] Testar geração de PDF
- [ ] Testar responsividade do design
- [ ] Documentar o projeto
- [ ] Criar README com instruções de uso

## Fase 8: Deploy e Finalização
- [x] Fazer commit e push para o GitHub
- [ ] Verificar deploy
- [ ] Testar em produção
