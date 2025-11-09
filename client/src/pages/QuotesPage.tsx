import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { useState } from "react";
import { Plus, Trash2, Edit2, FileText } from "lucide-react";
import { toast } from "sonner";

export default function QuotesPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    clientWhatsapp: "",
    serviceDescription: "",
    subtotal: "",
    discountPercent: "0",
    validityDate: "",
    notes: "",
  });

  const { data: quotes, refetch } = trpc.quotes.list.useQuery(undefined, {
    enabled: !!user,
  });

  const createQuoteMutation = trpc.quotes.create.useMutation({
    onSuccess: () => {
      toast.success("Orçamento criado com sucesso!");
      setFormData({
        clientName: "",
        clientEmail: "",
        clientPhone: "",
        clientWhatsapp: "",
        serviceDescription: "",
        subtotal: "",
        discountPercent: "0",
        validityDate: "",
        notes: "",
      });
      setShowForm(false);
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao criar orçamento");
      console.error(error);
    },
  });

  const createClientMutation = trpc.clients.create.useMutation();

  const deleteQuoteMutation = trpc.quotes.delete.useMutation({
    onSuccess: () => {
      toast.success("Orçamento deletado com sucesso!");
      refetch();
    },
    onError: () => {
      toast.error("Erro ao deletar orçamento");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientName || !formData.subtotal) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    try {
      // Criar cliente primeiro
      const clientResult = await createClientMutation.mutateAsync({
        name: formData.clientName,
        email: formData.clientEmail || undefined,
        phone: formData.clientPhone || undefined,
        whatsapp: formData.clientWhatsapp || undefined,
      });

      const discountAmount = (parseFloat(formData.subtotal) * parseFloat(formData.discountPercent)) / 100;
      const totalValue = parseFloat(formData.subtotal) - discountAmount;
      createQuoteMutation.mutate({
        clientId: clientResult.id,
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        clientPhone: formData.clientPhone,
        clientWhatsapp: formData.clientWhatsapp,
        serviceDescription: formData.serviceDescription,
        subtotal: formData.subtotal,
        discountPercent: formData.discountPercent,
        discountAmount: discountAmount.toString(),
        totalValue: totalValue.toString(),
        validityDate: formData.validityDate ? new Date(formData.validityDate) : undefined,
        notes: formData.notes,
      });
    } catch (error) {
      toast.error("Erro ao criar cliente");
      console.error(error);
    }
  };

  const calculateTotal = () => {
    const subtotal = parseFloat(formData.subtotal) || 0;
    const discount = (subtotal * parseFloat(formData.discountPercent || "0")) / 100;
    return (subtotal - discount).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Orçamentos</h1>
              <p className="text-muted-foreground mt-1">Gerencie seus orçamentos</p>
            </div>
            <Button onClick={() => setShowForm(!showForm)}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Orçamento
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="border-b bg-background sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-8">
            <button
              onClick={() => setLocation("/")}
              className="py-4 px-2 border-b-2 border-transparent font-medium text-muted-foreground hover:text-foreground transition"
            >
              Dashboard
            </button>
            <button
              onClick={() => setLocation("/quotes")}
              className="py-4 px-2 border-b-2 border-primary font-medium text-foreground hover:text-primary transition"
            >
              Orçamentos
            </button>
            <button
              onClick={() => setLocation("/work-orders")}
              className="py-4 px-2 border-b-2 border-transparent font-medium text-muted-foreground hover:text-foreground transition"
            >
              Ordens de Serviço
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Form */}
        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Novo Orçamento</CardTitle>
              <CardDescription>Preencha os dados do orçamento</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="clientName">Nome do Cliente *</Label>
                    <Input
                      id="clientName"
                      placeholder="Ex: João Silva"
                      value={formData.clientName}
                      onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="clientEmail">E-mail</Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      placeholder="cliente@example.com"
                      value={formData.clientEmail}
                      onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="clientPhone">Telefone</Label>
                    <Input
                      id="clientPhone"
                      placeholder="(11) 99999-9999"
                      value={formData.clientPhone}
                      onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="clientWhatsapp">WhatsApp</Label>
                    <Input
                      id="clientWhatsapp"
                      placeholder="(11) 99999-9999"
                      value={formData.clientWhatsapp}
                      onChange={(e) => setFormData({ ...formData, clientWhatsapp: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="serviceDescription">Descrição do Serviço</Label>
                  <Textarea
                    id="serviceDescription"
                    placeholder="Descreva o serviço a ser realizado"
                    value={formData.serviceDescription}
                    onChange={(e) => setFormData({ ...formData, serviceDescription: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="subtotal">Subtotal *</Label>
                    <Input
                      id="subtotal"
                      type="number"
                      placeholder="0.00"
                      step="0.01"
                      value={formData.subtotal}
                      onChange={(e) => setFormData({ ...formData, subtotal: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="discountPercent">Desconto (%)</Label>
                    <Input
                      id="discountPercent"
                      type="number"
                      placeholder="0"
                      step="0.01"
                      value={formData.discountPercent}
                      onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="total">Total</Label>
                    <Input
                      id="total"
                      type="text"
                      value={`R$ ${calculateTotal()}`}
                      disabled
                      className="bg-slate-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="validityDate">Data de Validade</Label>
                    <Input
                      id="validityDate"
                      type="date"
                      value={formData.validityDate}
                      onChange={(e) => setFormData({ ...formData, validityDate: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    placeholder="Adicione observações adicionais"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={createQuoteMutation.isPending}>
                    {createQuoteMutation.isPending ? "Salvando..." : "Salvar Orçamento"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* List */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Orçamentos</CardTitle>
            <CardDescription>Todos os orçamentos cadastrados</CardDescription>
          </CardHeader>
          <CardContent>
            {quotes && quotes.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Valor Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quotes.map((quote) => (
                      <TableRow key={quote.id}>
                        <TableCell className="font-medium">{quote.quoteNumber}</TableCell>
                        <TableCell>{quote.clientName}</TableCell>
                        <TableCell>R$ {parseFloat(quote.totalValue as any).toFixed(2)}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                            quote.status === "approved" ? "bg-green-100 text-green-800" :
                            quote.status === "rejected" ? "bg-red-100 text-red-800" :
                            quote.status === "sent" ? "bg-blue-100 text-blue-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {quote.status === "draft" ? "Em elaboração" :
                             quote.status === "sent" ? "Enviado" :
                             quote.status === "approved" ? "Aprovado" :
                             quote.status === "rejected" ? "Reprovado" :
                             "Convertido"}
                          </span>
                        </TableCell>
                        <TableCell>{new Date(quote.createdAt as any).toLocaleDateString("pt-BR")}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {}}
                            >
                              <FileText className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteQuoteMutation.mutate({ id: quote.id })}
                              disabled={deleteQuoteMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Nenhum orçamento cadastrado</p>
                <Button onClick={() => setShowForm(true)} className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeiro Orçamento
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
