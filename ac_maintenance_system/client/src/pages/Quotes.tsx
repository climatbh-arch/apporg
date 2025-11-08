import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Download, Trash2, Edit2, Eye } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { translations } from "@/lib/translations";

export default function Quotes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState<{
    clientName: string;
    description: string;
    totalValue: number;
    status: "pending" | "approved" | "rejected";
  }>({
    clientName: "",
    description: "",
    totalValue: 0,
    status: "pending",
  });

  const quotesQuery = trpc.quotes?.list?.useQuery?.() || { data: [], isLoading: false };
  const quotes = quotesQuery.data || [];

  const filteredQuotes = quotes.filter(
    (quote: any) =>
      quote.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      clientName: "",
      description: "",
      totalValue: 0,
      status: "pending",
    });
    setEditingId(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendente";
      case "approved":
        return "Aprovado";
      case "rejected":
        return "Rejeitado";
      default:
        return status;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Orçamentos</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie todos os orçamentos da sua empresa
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  resetForm();
                  setIsDialogOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Orçamento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Editar Orçamento" : "Novo Orçamento"}
                </DialogTitle>
                <DialogDescription>
                  {editingId
                    ? "Atualize as informações do orçamento"
                    : "Preencha os dados do novo orçamento"}
                </DialogDescription>
              </DialogHeader>

              <form className="space-y-4">
                <div>
                  <Label htmlFor="clientName">Cliente *</Label>
                  <Input
                    id="clientName"
                    value={formData.clientName}
                    onChange={(e) =>
                      setFormData({ ...formData, clientName: e.target.value })
                    }
                    placeholder="Nome do cliente"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Descrição do serviço"
                  />
                </div>

                <div>
                  <Label htmlFor="totalValue">Valor Total</Label>
                  <Input
                    id="totalValue"
                    type="number"
                    value={formData.totalValue}
                    onChange={(e) =>
                      setFormData({ ...formData, totalValue: parseFloat(e.target.value) })
                    }
                    placeholder="0.00"
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="button" onClick={() => setIsDialogOpen(false)}>
                    {translations.messages.cancel}
                  </Button>
                  <Button type="submit">
                    {translations.messages.save}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="flex gap-2">
          <Input
            placeholder="Pesquisar orçamentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {/* Quotes List */}
        <div className="grid gap-4">
          {quotesQuery.isLoading ? (
            <>
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </>
          ) : filteredQuotes.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">Nenhum orçamento encontrado</p>
              </CardContent>
            </Card>
          ) : (
            filteredQuotes.map((quote: any) => (
              <Card key={quote.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle>{quote.clientName}</CardTitle>
                    <CardDescription>{quote.description}</CardDescription>
                  </div>
                  <Badge className={getStatusColor(quote.status)}>
                    {getStatusLabel(quote.status)}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">
                        R$ {quote.totalValue?.toFixed(2) || "0.00"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        PDF
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
