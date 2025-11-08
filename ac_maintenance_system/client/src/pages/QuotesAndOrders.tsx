import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, FileText, Plus } from "lucide-react";
import { toast } from "sonner";

export default function QuotesAndOrders() {
  const [activeTab, setActiveTab] = useState("quotes");

  // Queries
  const workOrdersQuery = trpc.workOrders.list.useQuery();
  const workOrders = workOrdersQuery.data || [];

  // Separar orçamentos (pending) de ordens (approved/in_progress/completed)
  const quotes = workOrders.filter((wo) => wo.status === "pending");
  const orders = workOrders.filter((wo) => wo.status !== "pending");

  // Exportar como PDF
  const handleExportQuotePDF = (quote: any) => {
    toast.info("Exportando orçamento em PDF...");
    // TODO: Implementar exportação
  };

  const handleExportOrderPDF = (order: any) => {
    toast.info("Exportando ordem de serviço em PDF...");
    // TODO: Implementar exportação
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Orçamentos & Ordens</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie seus orçamentos e ordens de serviço
            </p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Novo
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="quotes">
              Orçamentos ({quotes.length})
            </TabsTrigger>
            <TabsTrigger value="orders">
              Ordens de Serviço ({orders.length})
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: ORÇAMENTOS */}
          <TabsContent value="quotes" className="space-y-4">
            {quotes.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    Nenhum orçamento pendente
                  </p>
                </CardContent>
              </Card>
            ) : (
              quotes.map((quote) => (
                <Card key={quote.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          Orçamento #{quote.id}
                        </CardTitle>
                        <CardDescription>
                          {new Date(quote.createdAt).toLocaleDateString("pt-BR")}
                        </CardDescription>
                      </div>
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                        Pendente
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Cliente</p>
                        <p className="font-medium">{quote.clientId}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Tipo de Serviço</p>
                        <p className="font-medium">{quote.serviceType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Valor</p>
                        <p className="font-medium text-lg">R$ {parseFloat(quote.totalValue).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Técnico</p>
                        <p className="font-medium">{quote.technician || "N/A"}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExportQuotePDF(quote)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Exportar PDF
                      </Button>
                      <Button variant="outline" size="sm">
                        Editar
                      </Button>
                      <Button variant="outline" size="sm">
                        Aprovar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* TAB 2: ORDENS DE SERVIÇO */}
          <TabsContent value="orders" className="space-y-4">
            {orders.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    Nenhuma ordem de serviço
                  </p>
                </CardContent>
              </Card>
            ) : (
              orders.map((order) => (
                <Card key={order.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          OS #{order.id}
                        </CardTitle>
                        <CardDescription>
                          {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                        </CardDescription>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          order.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : order.status === "in_progress"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {order.status === "completed"
                          ? "Concluída"
                          : order.status === "in_progress"
                          ? "Em Progresso"
                          : "Aprovada"}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Cliente</p>
                        <p className="font-medium">{order.clientId}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Tipo de Serviço</p>
                        <p className="font-medium">{order.serviceType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Valor</p>
                        <p className="font-medium text-lg">R$ {parseFloat(order.totalValue).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Técnico</p>
                        <p className="font-medium">{order.technician || "N/A"}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExportOrderPDF(order)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Exportar PDF
                      </Button>
                      <Button variant="outline" size="sm">
                        Editar
                      </Button>
                      {order.status !== "completed" && (
                        <Button variant="outline" size="sm">
                          Marcar Concluída
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
