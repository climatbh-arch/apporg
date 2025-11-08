// TRADUÇÃO DE TERMOS PARA PORTUGUÊS BRASILEIRO

export const translations = {
  // Status de Ordem
  status: {
    pending: "Pendente",
    approved: "Aprovada",
    in_progress: "Em Progresso",
    completed: "Concluída",
    cancelled: "Cancelada",
  },

  // Tipo de Cliente
  clientType: {
    residential: "Residencial",
    commercial: "Comercial",
  },

  // Tipo de Equipamento
  equipmentType: {
    split: "Split",
    window: "Janela",
    portable: "Portátil",
    floor_ceiling: "Piso-Teto",
    cassette: "Cassete",
  },

  // Tipo de Serviço
  serviceType: {
    installation: "Instalação",
    maintenance: "Manutenção",
    gas_charge: "Carga de Gás",
    cleaning: "Limpeza",
    repair: "Reparo",
    inspection: "Inspeção",
  },

  // Tipo de Transação
  transactionType: {
    income: "Entrada",
    expense: "Saída",
  },

  // Forma de Pagamento
  paymentMethod: {
    cash: "Dinheiro",
    credit_card: "Cartão de Crédito",
    debit_card: "Cartão de Débito",
    transfer: "Transferência",
    check: "Cheque",
  },

  // Categoria de Estoque
  inventoryCategory: {
    condenser: "Condensador",
    tubing: "Tubulação",
    gas: "Gás",
    connector: "Conector",
    support: "Suporte",
    filter: "Filtro",
    compressor: "Compressor",
    other: "Outro",
  },

  // Status de Transação
  transactionStatus: {
    pending: "Pendente",
    completed: "Concluída",
    cancelled: "Cancelada",
  },

  // Movimento de Estoque
  inventoryMovementType: {
    in: "Entrada",
    out: "Saída",
  },

  // Papéis/Roles
  role: {
    admin: "Administrador",
    user: "Usuário",
    technician: "Técnico",
    client: "Cliente",
  },

  // Mensagens Gerais
  messages: {
    loading: "Carregando...",
    error: "Erro",
    success: "Sucesso",
    warning: "Aviso",
    info: "Informação",
    noData: "Sem dados",
    noResults: "Nenhum resultado encontrado",
    confirm: "Confirmar",
    cancel: "Cancelar",
    delete: "Deletar",
    edit: "Editar",
    save: "Salvar",
    create: "Criar",
    update: "Atualizar",
    export: "Exportar",
    import: "Importar",
    search: "Pesquisar",
    filter: "Filtrar",
    sort: "Ordenar",
    add: "Adicionar",
    remove: "Remover",
    back: "Voltar",
    next: "Próximo",
    previous: "Anterior",
    close: "Fechar",
    open: "Abrir",
    download: "Baixar",
    upload: "Enviar",
    send: "Enviar",
    receive: "Receber",
    view: "Visualizar",
    hide: "Ocultar",
    show: "Mostrar",
    print: "Imprimir",
    share: "Compartilhar",
    copy: "Copiar",
    paste: "Colar",
    cut: "Cortar",
    undo: "Desfazer",
    redo: "Refazer",
    refresh: "Atualizar",
    logout: "Sair",
    login: "Entrar",
    register: "Registrar",
    profile: "Perfil",
    settings: "Configurações",
    help: "Ajuda",
    about: "Sobre",
    home: "Início",
    dashboard: "Painel",
    clients: "Clientes",
    equipment: "Equipamentos",
    workOrders: "Ordens de Serviço",
    quotes: "Orçamentos",
    transactions: "Transações",
    reports: "Relatórios",
    inventory: "Estoque",
    maintenance: "Manutenção",
    schedule: "Agendamento",
    notifications: "Notificações",
    users: "Usuários",
    permissions: "Permissões",
    roles: "Papéis",
  },

  // Campos de Formulário
  fields: {
    name: "Nome",
    email: "E-mail",
    phone: "Telefone",
    address: "Endereço",
    city: "Cidade",
    state: "Estado",
    zipCode: "CEP",
    notes: "Notas",
    description: "Descrição",
    value: "Valor",
    total: "Total",
    date: "Data",
    time: "Hora",
    startDate: "Data de Início",
    endDate: "Data de Término",
    createdAt: "Criado em",
    updatedAt: "Atualizado em",
    status: "Status",
    type: "Tipo",
    category: "Categoria",
    quantity: "Quantidade",
    price: "Preço",
    brand: "Marca",
    model: "Modelo",
    serialNumber: "Número de Série",
    technician: "Técnico",
    client: "Cliente",
    equipment: "Equipamento",
    service: "Serviço",
    payment: "Pagamento",
    warranty: "Garantia",
    observations: "Observações",
  },
};

// Função auxiliar para traduzir
export function translate(key: string, value: string): string {
  const keys = key.split(".");
  let current: any = translations;
  
  for (const k of keys) {
    current = current[k];
    if (!current) return value;
  }
  
  return current[value] || value;
}

// Função para traduzir status
export function translateStatus(status: string): string {
  return translations.status[status as keyof typeof translations.status] || status;
}

// Função para traduzir tipo de serviço
export function translateServiceType(type: string): string {
  return translations.serviceType[type as keyof typeof translations.serviceType] || type;
}

// Função para traduzir tipo de cliente
export function translateClientType(type: string): string {
  return translations.clientType[type as keyof typeof translations.clientType] || type;
}

// Função para traduzir tipo de equipamento
export function translateEquipmentType(type: string): string {
  return translations.equipmentType[type as keyof typeof translations.equipmentType] || type;
}

// Função para traduzir tipo de transação
export function translateTransactionType(type: string): string {
  return translations.transactionType[type as keyof typeof translations.transactionType] || type;
}
