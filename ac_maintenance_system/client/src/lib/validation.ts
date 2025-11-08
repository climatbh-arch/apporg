export const validators = {
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  phone: (phone: string): boolean => {
    const phoneRegex = /^\(\d{2}\) \d{4,5}-\d{4}$/;
    return phoneRegex.test(phone);
  },

  cep: (cep: string): boolean => {
    const cepRegex = /^\d{5}-\d{3}$/;
    return cepRegex.test(cep);
  },

  cpf: (cpf: string): boolean => {
    const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
    if (!cpfRegex.test(cpf)) return false;

    // Validar dígitos verificadores
    let sum = 0;
    let remainder;

    const digits = cpf.replace(/\D/g, "");

    // Primeiro dígito verificador
    for (let i = 1; i <= 9; i++) {
      sum += parseInt(digits.substring(i - 1, i)) * (11 - i);
    }

    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(digits.substring(9, 10))) return false;

    // Segundo dígito verificador
    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(digits.substring(i - 1, i)) * (12 - i);
    }

    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(digits.substring(10, 11))) return false;

    return true;
  },

  cnpj: (cnpj: string): boolean => {
    const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
    if (!cnpjRegex.test(cnpj)) return false;

    // Validar dígitos verificadores
    let sum = 0;
    let remainder;

    const digits = cnpj.replace(/\D/g, "");

    // Primeiro dígito verificador
    const firstMultipliers = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    for (let i = 0; i < 12; i++) {
      sum += parseInt(digits[i]) * firstMultipliers[i];
    }

    remainder = sum % 11;
    if (remainder < 2) remainder = 0;
    else remainder = 11 - remainder;

    if (remainder !== parseInt(digits[12])) return false;

    // Segundo dígito verificador
    sum = 0;
    const secondMultipliers = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    for (let i = 0; i < 13; i++) {
      sum += parseInt(digits[i]) * secondMultipliers[i];
    }

    remainder = sum % 11;
    if (remainder < 2) remainder = 0;
    else remainder = 11 - remainder;

    if (remainder !== parseInt(digits[13])) return false;

    return true;
  },

  password: (password: string): boolean => {
    // Mínimo 8 caracteres, pelo menos 1 maiúscula, 1 minúscula, 1 número
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  },

  url: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  minLength: (value: string, min: number): boolean => {
    return value.length >= min;
  },

  maxLength: (value: string, max: number): boolean => {
    return value.length <= max;
  },

  required: (value: string): boolean => {
    return value.trim().length > 0;
  },

  numeric: (value: string): boolean => {
    return /^\d+$/.test(value);
  },

  alphanumeric: (value: string): boolean => {
    return /^[a-zA-Z0-9]+$/.test(value);
  },
};

export const getValidationMessage = (field: string, rule: string): string => {
  const messages: Record<string, Record<string, string>> = {
    email: {
      email: "Email inválido",
      required: "Email é obrigatório",
    },
    phone: {
      phone: "Telefone inválido. Use o formato: (XX) XXXXX-XXXX",
      required: "Telefone é obrigatório",
    },
    cep: {
      cep: "CEP inválido. Use o formato: XXXXX-XXX",
      required: "CEP é obrigatório",
    },
    cpf: {
      cpf: "CPF inválido",
      required: "CPF é obrigatório",
    },
    cnpj: {
      cnpj: "CNPJ inválido",
      required: "CNPJ é obrigatório",
    },
    password: {
      password: "Senha deve ter mínimo 8 caracteres, 1 maiúscula, 1 minúscula e 1 número",
      required: "Senha é obrigatória",
    },
    name: {
      required: "Nome é obrigatório",
      minLength: "Nome deve ter pelo menos 3 caracteres",
    },
  };

  return messages[field]?.[rule] || "Campo inválido";
};
