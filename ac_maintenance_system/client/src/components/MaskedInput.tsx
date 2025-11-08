import { Input } from "@/components/ui/input";
import { InputHTMLAttributes } from "react";

interface MaskedInputProps extends InputHTMLAttributes<HTMLInputElement> {
  mask: "phone" | "cep" | "cpf" | "cnpj";
}

const masks = {
  phone: (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .replace(/(\d{4})-(\d)(\d{4})/, "$1-$2$3");
  },
  cep: (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .substring(0, 9);
  },
  cpf: (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{2})$/, "$1-$2")
      .substring(0, 14);
  },
  cnpj: (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d{2})$/, "$1-$2")
      .substring(0, 18);
  },
};

export function MaskedInput({ mask, value, onChange, ...props }: MaskedInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = masks[mask](e.target.value);
    e.target.value = masked;
    onChange?.(e);
  };

  return (
    <Input
      {...props}
      value={value}
      onChange={handleChange}
    />
  );
}
