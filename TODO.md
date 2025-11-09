# Sistema de Gestão de Orçamentos e Ordens de Serviço (AC)

## 📋 Progresso Geral

**Commit Base:** `0866b6f` - Schema do banco de dados com 9 tabelas ✅

---

## ✅ Concluído

### Banco de Dados
- [x] Schema com 9 tabelas (users, clients, equipments, quotes, quoteItems, workOrders, workOrderMaterials, maintenanceHistory, maintenanceReminders)
- [x] Relacionamentos entre tabelas
- [x] Tipos TypeScript gerados automaticamente

---

## ⏳ Em Progresso

### Backend (tRPC)
- [x] Procedures CRUD para Clientes
- [x] Procedures CRUD para Equipamentos
- [x] Procedures CRUD para Orçamentos
- [x] Procedures CRUD para Ordens de Serviço
- [x] Procedures para adicionar/remover itens de orçamentos
- [x] Procedures para adicionar/remover materiais de ordens
- [ ] Geração automática de números sequenciais (ORC-*, OS-*)
- [ ] Cálculos automáticos de totais

### Frontend (React)
- [ ] Página de Clientes (CRUD)
- [ ] Página de Equipamentos (CRUD)
- [ ] Página de Orçamentos (CRUD + itens)
- [ ] Página de Ordens de Serviço (CRUD + materiais)
- [ ] Página de Manutenção
- [ ] Página de Relatórios

### Recursos Avançados
- [ ] Geração de PDF para orçamentos
- [ ] Geração de PDF para ordens de serviço
- [ ] Envio de email
- [ ] Exportação em Excel

---

## 🎯 Próximas Etapas

1. Implementar backend tRPC com procedures CRUD
2. Criar páginas de Clientes e Equipamentos
3. Criar páginas de Orçamentos e Ordens de Serviço
4. Implementar recursos avançados
5. Testes e deploy

---

## 📊 Status Geral

**Progresso:** 30% ✅

- Banco de Dados: 100% ✅
- Backend: 70% ⏳ (Procedures CRUD implementadas)
- Frontend: 0% ⏳
- Recursos Avançados: 0% ⏳

**Último Commit:** `252b448` - Backend: Implementar procedures CRUD

