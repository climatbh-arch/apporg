import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Download, Send, Zap, Edit2, Copy, Trash2, Search } from "lucide-react";

export default function QuotesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    clientId: "",
    serviceType: "installation" as const,
    totalValue: "",
    description: "",
    discountPercent: "0",
  });
  const [items, setItems] = useState<Array<{ name: string; quantity: string; unitPrice: string }>>([]);
  const [newItem, setNewItem] = useState({ name: "", quantity: "", unitPrice: "" });

  const quotesQuery = trpc.quotes.list.useQuery();
  const clientsQuery = trpc.clients.list.useQuery();
  const createQuoteMutation = trpc.quotes.create.useMutation();
  const deleteQuoteMutation = trpc.quotes.delete.useMutation();

  const quotes = quotesQuery.data || [];
  const clients = clientsQuery.data || [];

  const filteredQuotes = quotes.filter((q) =>
    q.quoteNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddItem = () => {
    if (newItem.name && newItem.quantity && newItem.unitPrice) {
      setItems([...items, newItem]);
      setNewItem({ name: "", quantity: "", unitPrice: "" });
      toast.success("Item adicionado!");
    } else {
      toast.error("Preencha todos os campos do item");
    }
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    const subtotal = items.reduce((sum, item) => {
      return sum + parseFloat(item.quantity || "0") * parseFloat(item.unitPrice || "0");
    }, 0);
    const discount = (subtotal * parseFloat(formData.discountPercent || "0")) / 100;
    return subtotal - discount;
  };

  const handleCreateQuote = async () => {
    if (!formData.clientId) {
      toast.error("Selecione um cliente");
      return;
    }

    try {
      await createQuoteMutation.mutateAsync({
        clientId: parseInt(formData.clientId),
        serviceType: formData.serviceType,
        totalValue: calculateTotal().toString(),
        description: formData.description,
        discountPercent: formData.discountPercent,
      });

      toast.success("Orçamento criado com sucesso!");
      setShowForm(false);
      setFormData({
        clientId: "",
        serviceType: "installation",
        totalValue: "",
        description: "",
        discountPercent: "0",
      });
      setItems([]);
      quotesQuery.refetch();
    } catch (error) {
      toast.error("Erro ao criar orçamento");
    }
  };

  const handleDeleteQuote = async (id: number) => {
    try {
      await deleteQuoteMutation.mutateAsync({ id });
      toast.success("Orçamento deletado!");
      quotesQuery.refetch();
    } catch (error) {
      toast.error("Erro ao deletar orçamento");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Orçamentos</h1>
          <p className="text-muted-foreground">Gerencie seus orçamentos profissionalmente</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Orçamento
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Criar Novo Orçamento</CardTitle>
            <CardDescription>Preencha os dados do orçamento</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Cliente */}
            <div>
              <Label>Cliente *</Label>
              <Select value={formData.clientId} onValueChange={(value) => setFormData({ ...formData, clientId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tipo de Serviço */}
            <div>
              <Label>Tipo de Serviço *</Label>
              <Select value={formData.serviceType} onValueChange={(value: any) => setFormData({ ...formData, serviceType: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="installation">Instalação</SelectItem>
                  <SelectItem value="maintenance">Manutenção</SelectItem>
                  <SelectItem value="repair">Reparo</SelectItem>
                  <SelectItem value="cleaning">Limpeza</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Descrição */}
            <div>
              <Label>Descrição</Label>
              <Textarea
                placeholder="Descreva o serviço"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Itens */}
            <div className="space-y-2">
              <Label>Itens do Orçamento</Label>
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={index} className="flex gap-2 items-center p-2 bg-muted rounded">
                    <span className="flex-1">{item.name}</span>
                    <span>Qtd: {item.quantity}</span>
                    <span>R$ {parseFloat(item.unitPrice).toFixed(2)}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Novo Item */}
              <div className="flex gap-2">
                <Input
                  placeholder="Nome do item"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                />
                <Input
                  placeholder="Qtd"
                  type="number"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                  className="w-20"
                />
                <Input
                  placeholder="Valor"
                  type="number"
                  value={newItem.unitPrice}
                  onChange={(e) => setNewItem({ ...newItem, unitPrice: e.target.value })}
                  className="w-24"
                />
                <Button onClick={handleAddItem} variant="outline">
                  Adicionar
                </Button>
              </div>
            </div>

            {/* Desconto */}
            <div>
              <Label>Desconto (%)</Label>
              <Input
                type="number"
                value={formData.discountPercent}
                onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
              />
            </div>

            {/* Total */}
            <div className="p-4 bg-primary/10 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total:</span>
                <span className="text-2xl font-bold text-primary">R$ {calculateTotal().toFixed(2)}</span>
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-2">
              <Button onClick={handleCreateQuote} className="flex-1">
                Salvar Orçamento
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Busca */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por número do orçamento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Lista de Orçamentos */}
      <div className="grid gap-4">
        {filteredQuotes.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              Nenhum orçamento encontrado
            </CardContent>
          </Card>
        ) : (
          filteredQuotes.map((quote) => (
            <Card key={quote.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{quote.quoteNumber}</CardTitle>
                    <CardDescription>{quote.description}</CardDescription>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    quote.status === "approved" ? "bg-green-100 text-green-800" :
                    quote.status === "rejected" ? "bg-red-100 text-red-800" :
                    "bg-yellow-100 text-yellow-800"
                  }`}>
                    {quote.status === "draft" ? "Em elaboração" :
                     quote.status === "approved" ? "Aprovado" :
                     quote.status === "rejected" ? "Reprovado" : quote.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Valor Total</p>
                    <p className="text-2xl font-bold">R$ {parseFloat(quote.totalValue || "0").toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Desconto</p>
                    <p className="text-lg font-semibold">{quote.discountPercent}%</p>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="flex gap-2 flex-wrap">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="w-4 h-4" />
                    PDF
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Send className="w-4 h-4" />
                    Enviar
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Zap className="w-4 h-4" />
                    Converter OS
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Edit2 className="w-4 h-4" />
                    Editar
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Copy className="w-4 h-4" />
                    Duplicar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="gap-2"
                    onClick={() => handleDeleteQuote(quote.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                    Deletar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
