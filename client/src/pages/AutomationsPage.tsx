import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Play,
  RefreshCw,
  Bell,
  Calendar,
  Users,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

interface AutomatedNotification {
  id: number;
  notificationType: string;
  recipientType: string;
  recipientContact: string;
  channel: string;
  subject?: string;
  message: string;
  status: string;
  scheduledFor?: string;
  sentAt?: string;
  errorMessage?: string;
  createdAt: string;
}

interface AutomationStats {
  maintenanceAlertsCount: number;
  leadsCreatedCount: number;
  notificationsSentCount: number;
  recurringInvoicesCount: number;
}

export default function AutomationsPage() {
  const [isRunning, setIsRunning] = useState(false);
  const queryClient = useQueryClient();

  // Query para buscar notificações
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["/api/notifications"],
  });

  // Query para buscar estatísticas de automação
  const { data: stats } = useQuery<AutomationStats>({
    queryKey: ["/api/automations/stats"],
  });

  // Mutation para executar automações diárias
  const runDailyAutomationsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/automations/run-daily", {
        method: "POST",
      });
      if (!response.ok) throw new Error("Erro ao executar automações");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/automations/stats"] });
      toast.success(
        `Automações executadas! ${data.leadsCreated} leads criados, ${data.notificationsSent} notificações enviadas`
      );
      setIsRunning(false);
    },
    onError: () => {
      toast.error("Erro ao executar automações");
      setIsRunning(false);
    },
  });

  // Mutation para processar fila de notificações
  const processNotificationsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/notifications/process", {
        method: "POST",
      });
      if (!response.ok) throw new Error("Erro ao processar notificações");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      toast.success(`${data.processed} notificações processadas`);
    },
    onError: () => {
      toast.error("Erro ao processar notificações");
    },
  });

  // Mutation para segmentar clientes
  const segmentClientsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/automations/segment-clients", {
        method: "POST",
      });
      if (!response.ok) throw new Error("Erro ao segmentar clientes");
      return response.json();
    },
    onSuccess: () => {
      toast.success("Clientes segmentados com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao segmentar clientes");
    },
  });

  const handleRunDailyAutomations = () => {
    setIsRunning(true);
    runDailyAutomationsMutation.mutate();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getChannelBadge = (channel: string) => {
    const colors: Record<string, string> = {
      email: "default",
      whatsapp: "success",
      sms: "warning",
    };
    return colors[channel] || "secondary";
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Automações</h1>
          <p className="text-muted-foreground">
            Gerencie e monitore automações do sistema
          </p>
        </div>
        <Button
          onClick={() => queryClient.invalidateQueries()}
          variant="outline"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Atualizar
        </Button>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Alertas de MP
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.maintenanceAlertsCount || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Ativos precisando de manutenção
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Leads Criados
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.leadsCreatedCount || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Orçamentos gerados automaticamente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Notificações Enviadas
            </CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.notificationsSentCount || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Últimas 24 horas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Faturas Recorrentes
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.recurringInvoicesCount || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Contratos ativos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Ações de Automação */}
      <Card>
        <CardHeader>
          <CardTitle>Executar Automações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={handleRunDailyAutomations}
              disabled={isRunning}
              className="w-full"
            >
              <Play className="mr-2 h-4 w-4" />
              {isRunning ? "Executando..." : "Automações Diárias"}
            </Button>

            <Button
              onClick={() => processNotificationsMutation.mutate()}
              variant="outline"
              className="w-full"
            >
              <Bell className="mr-2 h-4 w-4" />
              Processar Notificações
            </Button>

            <Button
              onClick={() => segmentClientsMutation.mutate()}
              variant="outline"
              className="w-full"
            >
              <Users className="mr-2 h-4 w-4" />
              Segmentar Clientes
            </Button>
          </div>

          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Automações Diárias Incluem:</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>✓ Monitoramento de manutenções preventivas</li>
              <li>✓ Criação automática de leads de MP</li>
              <li>✓ Envio de notificações de lembrete</li>
              <li>✓ Geração de faturas recorrentes</li>
              <li>✓ Processamento da fila de notificações</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Notificações */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Notificações</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="pending">Pendentes</TabsTrigger>
              <TabsTrigger value="sent">Enviadas</TabsTrigger>
              <TabsTrigger value="failed">Falhas</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              {isLoading ? (
                <p>Carregando...</p>
              ) : notifications.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma notificação encontrada
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Destinatário</TableHead>
                      <TableHead>Canal</TableHead>
                      <TableHead>Assunto</TableHead>
                      <TableHead>Data</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notifications.map((notif: AutomatedNotification) => (
                      <TableRow key={notif.id}>
                        <TableCell>{getStatusIcon(notif.status)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {notif.notificationType}
                          </Badge>
                        </TableCell>
                        <TableCell>{notif.recipientContact}</TableCell>
                        <TableCell>
                          <Badge variant={getChannelBadge(notif.channel)}>
                            {notif.channel}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {notif.subject || notif.message.substring(0, 50)}...
                        </TableCell>
                        <TableCell>
                          {notif.sentAt
                            ? new Date(notif.sentAt).toLocaleString("pt-BR")
                            : new Date(notif.createdAt).toLocaleString("pt-BR")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="pending">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Destinatário</TableHead>
                    <TableHead>Canal</TableHead>
                    <TableHead>Agendado Para</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notifications
                    .filter((n: AutomatedNotification) => n.status === "pending")
                    .map((notif: AutomatedNotification) => (
                      <TableRow key={notif.id}>
                        <TableCell>
                          <Badge variant="outline">
                            {notif.notificationType}
                          </Badge>
                        </TableCell>
                        <TableCell>{notif.recipientContact}</TableCell>
                        <TableCell>
                          <Badge variant={getChannelBadge(notif.channel)}>
                            {notif.channel}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {notif.scheduledFor
                            ? new Date(notif.scheduledFor).toLocaleString(
                                "pt-BR"
                              )
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="sent">
              <p className="text-sm text-muted-foreground mb-4">
                {
                  notifications.filter(
                    (n: AutomatedNotification) => n.status === "sent"
                  ).length
                }{" "}
                notificações enviadas com sucesso
              </p>
            </TabsContent>

            <TabsContent value="failed">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Destinatário</TableHead>
                    <TableHead>Erro</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notifications
                    .filter((n: AutomatedNotification) => n.status === "failed")
                    .map((notif: AutomatedNotification) => (
                      <TableRow key={notif.id}>
                        <TableCell>
                          <Badge variant="outline">
                            {notif.notificationType}
                          </Badge>
                        </TableCell>
                        <TableCell>{notif.recipientContact}</TableCell>
                        <TableCell className="text-red-500">
                          {notif.errorMessage || "Erro desconhecido"}
                        </TableCell>
                        <TableCell>
                          {new Date(notif.createdAt).toLocaleString("pt-BR")}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
