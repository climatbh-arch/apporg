// TEMPLATES PROFISSIONAIS DE PDF

export const QUOTE_PDF_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      color: #333;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #0066cc;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #0066cc;
    }
    .date {
      color: #0066cc;
      font-weight: bold;
    }
    .title {
      font-size: 20px;
      font-weight: bold;
      text-align: center;
      margin-bottom: 30px;
      color: #333;
    }
    .section {
      margin-bottom: 25px;
    }
    .section-title {
      font-weight: bold;
      font-size: 14px;
      margin-bottom: 10px;
      border-bottom: 1px solid #ccc;
      padding-bottom: 5px;
    }
    .section-content {
      font-size: 12px;
      line-height: 1.6;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }
    th {
      background-color: #0066cc;
      color: white;
      padding: 10px;
      text-align: left;
      font-weight: bold;
    }
    td {
      padding: 10px;
      border-bottom: 1px solid #ddd;
    }
    .total {
      font-size: 16px;
      font-weight: bold;
      text-align: right;
      margin-top: 20px;
      padding-top: 10px;
      border-top: 2px solid #0066cc;
    }
    .footer {
      margin-top: 40px;
      font-size: 11px;
      color: #666;
      text-align: center;
      border-top: 1px solid #ccc;
      padding-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- HEADER -->
    <div class="header">
      <div class="logo">CLIMA BH</div>
      <div class="date">Data: {{DATE}}</div>
    </div>

    <!-- TITLE -->
    <div class="title">ORÇAMENTO</div>

    <!-- CLIENT INFO -->
    <div class="section">
      <div class="section-title">DADOS DO CLIENTE</div>
      <div class="section-content">
        <p><strong>Cliente:</strong> {{CLIENT_NAME}}</p>
        <p><strong>Endereço:</strong> {{CLIENT_ADDRESS}}</p>
        <p><strong>Tel:</strong> {{CLIENT_PHONE}}</p>
        <p><strong>E-mail:</strong> {{CLIENT_EMAIL}}</p>
      </div>
    </div>

    <!-- EQUIPMENT INFO -->
    <div class="section">
      <div class="section-title">EQUIPAMENTO</div>
      <div class="section-content">
        <p><strong>Marca:</strong> {{EQUIPMENT_BRAND}}</p>
        <p><strong>Modelo:</strong> {{EQUIPMENT_MODEL}}</p>
        <p><strong>BTU:</strong> {{EQUIPMENT_BTU}}</p>
      </div>
    </div>

    <!-- SERVICE DESCRIPTION -->
    <div class="section">
      <div class="section-title">DESCRIÇÃO DO SERVIÇO</div>
      <div class="section-content">
        {{SERVICE_DESCRIPTION}}
      </div>
    </div>

    <!-- ITEMS TABLE -->
    <div class="section">
      <div class="section-title">ITENS</div>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Qtd</th>
            <th>Valor Unit.</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {{ITEMS}}
        </tbody>
      </table>
    </div>

    <!-- TOTAL -->
    <div class="total">
      TOTAL: R$ {{TOTAL}}
    </div>

    <!-- PAYMENT METHODS -->
    <div class="section">
      <div class="section-title">FORMAS DE PAGAMENTO</div>
      <div class="section-content">
        {{PAYMENT_METHODS}}
      </div>
    </div>

    <!-- INCLUDED SERVICES -->
    <div class="section">
      <div class="section-title">SERVIÇOS INCLUSOS</div>
      <div class="section-content">
        {{INCLUDED_SERVICES}}
      </div>
    </div>

    <!-- WARRANTY -->
    <div class="section">
      <div class="section-title">GARANTIA</div>
      <div class="section-content">
        {{WARRANTY}}
      </div>
    </div>

    <!-- COMPANY INFO -->
    <div class="section">
      <div class="section-title">EMPRESA RESPONSÁVEL</div>
      <div class="section-content">
        <p><strong>Nome:</strong> {{COMPANY_NAME}}</p>
        <p><strong>E-MAIL:</strong> {{COMPANY_EMAIL}}</p>
        <p><strong>Endereço:</strong> {{COMPANY_ADDRESS}}</p>
        <p><strong>CNPJ:</strong> {{COMPANY_CNPJ}}</p>
        <p><strong>Validade da Proposta:</strong> {{QUOTE_VALIDITY}}</p>
      </div>
    </div>

    <!-- FOOTER -->
    <div class="footer">
      <p>Este documento é válido como comprovante de orçamento.</p>
      <p>Gerado automaticamente pelo Sistema de Controle de Manutenção de AC</p>
    </div>
  </div>
</body>
</html>
`;

export const ORDER_PDF_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      color: #333;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #00aa00;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #00aa00;
    }
    .date {
      color: #00aa00;
      font-weight: bold;
    }
    .title {
      font-size: 20px;
      font-weight: bold;
      text-align: center;
      margin-bottom: 30px;
      color: #333;
    }
    .section {
      margin-bottom: 25px;
    }
    .section-title {
      font-weight: bold;
      font-size: 14px;
      margin-bottom: 10px;
      border-bottom: 1px solid #ccc;
      padding-bottom: 5px;
    }
    .section-content {
      font-size: 12px;
      line-height: 1.6;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }
    th {
      background-color: #00aa00;
      color: white;
      padding: 10px;
      text-align: left;
      font-weight: bold;
    }
    td {
      padding: 10px;
      border-bottom: 1px solid #ddd;
    }
    .total {
      font-size: 16px;
      font-weight: bold;
      text-align: right;
      margin-top: 20px;
      padding-top: 10px;
      border-top: 2px solid #00aa00;
    }
    .footer {
      margin-top: 40px;
      font-size: 11px;
      color: #666;
      text-align: center;
      border-top: 1px solid #ccc;
      padding-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- HEADER -->
    <div class="header">
      <div class="logo">CLIMA BH</div>
      <div class="date">Data: {{DATE}}</div>
    </div>

    <!-- TITLE -->
    <div class="title">ORDEM DE SERVIÇO</div>

    <!-- CLIENT INFO -->
    <div class="section">
      <div class="section-title">DADOS DO CLIENTE</div>
      <div class="section-content">
        <p><strong>Cliente:</strong> {{CLIENT_NAME}}</p>
        <p><strong>Endereço:</strong> {{CLIENT_ADDRESS}}</p>
        <p><strong>Tel:</strong> {{CLIENT_PHONE}}</p>
      </div>
    </div>

    <!-- SERVICE INFO -->
    <div class="section">
      <div class="section-title">INFORMAÇÕES DO SERVIÇO</div>
      <div class="section-content">
        <p><strong>Tipo:</strong> {{SERVICE_TYPE}}</p>
        <p><strong>Descrição:</strong> {{SERVICE_DESCRIPTION}}</p>
        <p><strong>Técnico:</strong> {{TECHNICIAN}}</p>
        <p><strong>Data de Execução:</strong> {{EXECUTION_DATE}}</p>
      </div>
    </div>

    <!-- ITEMS TABLE -->
    <div class="section">
      <div class="section-title">ITENS EXECUTADOS</div>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Qtd</th>
            <th>Valor Unit.</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {{ITEMS}}
        </tbody>
      </table>
    </div>

    <!-- TOTAL -->
    <div class="total">
      TOTAL: R$ {{TOTAL}}
    </div>

    <!-- OBSERVATIONS -->
    <div class="section">
      <div class="section-title">OBSERVAÇÕES</div>
      <div class="section-content">
        {{OBSERVATIONS}}
      </div>
    </div>

    <!-- FOOTER -->
    <div class="footer">
      <p>Este documento é válido como comprovante de serviço executado.</p>
      <p>Gerado automaticamente pelo Sistema de Controle de Manutenção de AC</p>
    </div>
  </div>
</body>
</html>
`;
