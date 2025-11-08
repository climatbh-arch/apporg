import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, ArrowLeft, Save, AlertCircle, Plus, Trash2, CheckCircle, Download } from "lucide-react";
import { toast } from "sonner";

interface QuoteItem {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
}

interface QuoteData {
  id: number;
  clientName: string;
  description: string;
  items: QuoteItem[];
  notes: string;
  status: "pending" | "approved" | "rejected" | "converted";
  totalValue: number;
  createdAt: string;
  updatedAt: string;
}

export default function QuoteEdit() {
  const [, params] = useRoute("/quotes/:id");
  const [, navigate] = useLocation();
  const quoteId = params?.id ? parseInt(params.id) : null;

  const [formData, setFormData] = useState<Partial<QuoteData>>({
    clientName: "",
    description: "",
    items: [],
    notes: "",
    status: "pending",
    totalValue: 0,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newItem, setNewItem] = useState<Partial<QuoteItem>>({
    description: "",
    quantity: 1,
    unitPrice: 0,
  });

  // Mock data - Em produção, buscar do servidor via tRPC
  useEffect(() => {
    if (quoteId) {
      setIsLoading(true);
      setTimeout(() => {
        const mockData: QuoteData = {
          id: quoteId,
          clientName: "João Silva",
          description: "Orçamento para manutenção de ar condicionado",
          items: [
            { id: 1, description: "Manutenção preventiva", quantity: 1, unitPrice: 150 },
            { id: 2, description: "Limpeza de filtro", quantity: 2, unitPrice: 50 },
          ],
          notes: "Válido por 30 dias",
          status: "pending",
          totalValue: 250,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setFormData(mockData);
        setIsLoading(false);
      }, 500);
    }
  }, [quoteId]);

  const statusOptions = [
    { value: "pending", label: "Pendente", color: "bg-yellow-100 text-yellow-800" },
    { value: "approved", label: "Aprovado", color: "bg-green-100 text-green-800" },
    { value: "rejected", label: "Rejeitado", color: "bg-red-100 text-red-800" },
    { value: "converted", label: "Convertido em OS", color: "bg-blue-100 text-blue-800" },
  ];

  const calculateTotal = (items: QuoteItem[]) => {
    return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  };

  const handleAddItem = () => {
    if (!newItem.description?.trim()) {
      toast.error("Descrição do item é obrigatória");
      return;
    }

    if (!newItem.quantity || newItem.quantity <= 0) {
      toast.error("Quantidade deve ser maior que zero");
      return;
    }

    if (!newItem.unitPrice || newItem.unitPrice <= 0) {
      toast.error("Preço unitário deve ser maior que zero");
      return;
    }

    const items = formData.items || [];
    const newItemData = {
      id: Math.max(...items.map(i => i.id), 0) + 1,
      description: newItem.description,
      quantity: newItem.quantity,
      unitPrice: newItem.unitPrice,
    };

    const updatedItems = [...items, newItemData];
    setFormData({
      ...formData,
      items: updatedItems,
      totalValue: calculateTotal(updatedItems),
    });

    setNewItem({ description: "", quantity: 1, unitPrice: 0 });
    toast.success("Item adicionado com sucesso!");
  };

  const handleRemoveItem = (itemId: number) => {
    const items = (formData.items || []).filter(item => item.id !== itemId);
    setFormData({
      ...formData,
      items,
      totalValue: calculateTotal(items),
    });
    toast.success("Item removido com sucesso!");
  };

  const handleSave = async () => {
    if (!formData.clientName?.trim()) {
      toast.error("Nome do cliente é obrigatório");
      return;
    }

    if (!formData.description?.trim()) {
      toast.error("Descrição é obrigatória");
      return;
    }

    if (!formData.items || formData.items.length === 0) {
      toast.error("Adicione pelo menos um item ao orçamento");
      return;
    }

    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Orçamento atualizado com sucesso!");
      setTimeout(() => {
        navigate("/quotes");
      }, 1000);
    } catch (error) {
      toast.error("Erro ao salvar orçamento");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportPDF = () => {
    toast.success("Orçamento exportado para PDF!");
    // Implementar exportação real
  };

  const getStatusColor = (status: string) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option?.color || "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status: string) => {
    return statusOptions.find((opt) => opt.value === status)?.label || status;
  };

  if (!quoteId) {
    return (
      <DashboardLayout>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Orçamento não encontrado</AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/quotes")}
              title="Voltar para orçamentos"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Editar Orçamento</h1>
              <p className="text-muted-foreground">Orçamento #{quoteId}</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleExportPDF}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Exportar PDF
          </Button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client Info */}
            <Card>
              <CardHeader>
                <CardTitle>Informações do Cliente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="clientName">Nome do Cliente *</Label>
                  <Input
                    id="clientName"
                    value={formData.clientName || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, clientName: e.target.value })
                    }
                    placeholder="Nome completo do cliente"
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Descrição do Orçamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="description">Descrição *</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Descreva o serviço ou produto"
                    className="mt-1 min-h-20"
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notas Adicionais</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder="Ex: Válido por 30 dias, Inclui garantia, etc"
                    className="mt-1 min-h-20"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Items */}
            <Card>
              <CardHeader>
                <CardTitle>Itens do Orçamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items Table */}
                {formData.items && formData.items.length > 0 && (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Descrição</TableHead>
                          <TableHead className="text-right">Quantidade</TableHead>
                          <TableHead className="text-right">Preço Unitário</TableHead>
                          <TableHead className="text-right">Subtotal</TableHead>
                          <TableHead className="text-right">Ação</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {formData.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.description}</TableCell>
                            <TableCell className="text-right">{item.quantity}</TableCell>
                            <TableCell className="text-right">
                              R$ {item.unitPrice.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              R$ {(item.quantity * item.unitPrice).toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveItem(item.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {/* Add Item Form */}
                <div className="border-t pt-4 space-y-3">
                  <h3 className="font-medium">Adicionar Item</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <Label htmlFor="itemDesc" className="text-xs">Descrição</Label>
                      <Input
                        id="itemDesc"
                        value={newItem.description || ""}
                        onChange={(e) =>
                          setNewItem({ ...newItem, description: e.target.value })
                        }
                        placeholder="Ex: Manutenção"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="itemQty" className="text-xs">Quantidade</Label>
                      <Input
                        id="itemQty"
                        type="number"
                        min="1"
                        value={newItem.quantity || 1}
                        onChange={(e) =>
                          setNewItem({
                            ...newItem,
                            quantity: parseInt(e.target.value) || 1,
                          })
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="itemPrice" className="text-xs">Preço Unitário</Label>
                      <Input
                        id="itemPrice"
                        type="number"
                        step="0.01"
                        min="0"
                        value={newItem.unitPrice || ""}
                        onChange={(e) =>
                          setNewItem({
                            ...newItem,
                            unitPrice: parseFloat(e.target.value) || 0,
                          })
                        }
                        placeholder="0.00"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleAddItem}
                    className="w-full gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Adicionar Item
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Status do Orçamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={formData.status || "pending"}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value as any })
                    }
                  >
                    <SelectTrigger id="status" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Salvar Orçamento
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/quotes")}
              >
                Cancelar
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Badge */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Status Atual</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className={`${getStatusColor(formData.status || "pending")} w-full justify-center py-2`}>
                  {getStatusLabel(formData.status || "pending")}
                </Badge>
              </CardContent>
            </Card>

            {/* Total */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Resumo Financeiro</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-medium">R$ {(formData.totalValue || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-3">
                  <span>Total:</span>
                  <span>R$ {(formData.totalValue || 0).toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Informações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <p className="text-muted-foreground">ID</p>
                  <p className="font-medium">#{quoteId}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Itens</p>
                  <p className="font-medium">{formData.items?.length || 0}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
