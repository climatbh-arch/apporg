// EXEMPLOS DE COMO USAR AS TRADUÇÕES

import { 
  translateStatus, 
  translateServiceType, 
  translateClientType,
  translateEquipmentType,
  translateTransactionType,
  translations
} from './translations';

// EXEMPLO 1: Traduzir Status
// ANTES:
// <span>{workOrder.status}</span>  // Mostra "pending"

// DEPOIS:
// <span>{translateStatus(workOrder.status)}</span>  // Mostra "Pendente"

// EXEMPLO 2: Traduzir Tipo de Serviço
// ANTES:
// <span>{workOrder.serviceType}</span>  // Mostra "installation"

// DEPOIS:
// <span>{translateServiceType(workOrder.serviceType)}</span>  // Mostra "Instalação"

// EXEMPLO 3: Traduzir Tipo de Cliente
// ANTES:
// <span>{client.clientType}</span>  // Mostra "residential"

// DEPOIS:
// <span>{translateClientType(client.clientType)}</span>  // Mostra "Residencial"

// EXEMPLO 4: Usar mensagens gerais
// <button>{translations.messages.save}</button>  // Mostra "Salvar"
// <button>{translations.messages.cancel}</button>  // Mostra "Cancelar"
// <button>{translations.messages.delete}</button>  // Mostra "Deletar"

// EXEMPLO 5: Usar campos de formulário
// <label>{translations.fields.name}</label>  // Mostra "Nome"
// <label>{translations.fields.email}</label>  // Mostra "E-mail"
// <label>{translations.fields.phone}</label>  // Mostra "Telefone"

// EXEMPLO 6: Em um componente React
export function WorkOrderCard({ workOrder }: any) {
  return (
    <div>
      <h3>Ordem #{workOrder.id}</h3>
      <p>Status: {translateStatus(workOrder.status)}</p>
      <p>Tipo: {translateServiceType(workOrder.serviceType)}</p>
      <p>Valor: R$ {workOrder.totalValue}</p>
      <button>{translations.messages.edit}</button>
      <button>{translations.messages.delete}</button>
    </div>
  );
}

// EXEMPLO 7: Em um select/dropdown
export function ServiceTypeSelect() {
  const serviceTypes = [
    'installation',
    'maintenance',
    'gas_charge',
    'cleaning',
    'repair',
    'inspection'
  ];

  return (
    <select>
      {serviceTypes.map((type) => (
        <option key={type} value={type}>
          {translateServiceType(type)}
        </option>
      ))}
    </select>
  );
}

// EXEMPLO 8: Em uma tabela
export function WorkOrdersTable({ workOrders }: any) {
  return (
    <table>
      <thead>
        <tr>
          <th>{translations.fields.name}</th>
          <th>{translations.fields.status}</th>
          <th>{translations.fields.type}</th>
          <th>{translations.fields.value}</th>
        </tr>
      </thead>
      <tbody>
        {workOrders.map((wo: any) => (
          <tr key={wo.id}>
            <td>{wo.clientName}</td>
            <td>{translateStatus(wo.status)}</td>
            <td>{translateServiceType(wo.serviceType)}</td>
            <td>R$ {wo.totalValue}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
