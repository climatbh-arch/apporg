import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Mail,
  MessageSquare,
  Phone,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Eye,
} from "lucide-react";
import { toast } from "sonner";

interface Notification {
  id: number;
  type: "email" | "sms" | "whatsapp";
  recipient: string;
  subject: string;
  message: string;
  status: "sent" | "pending" | "failed";
  createdAt: string;
  sentAt?: string;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: "email",
      recipient: "joao@example.com",
      subject: "Orçamento #123 - AC Maintenance",
      message: "Seu orçamento foi criado com sucesso!",
      status: "sent",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      sentAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 2,
      type: "whatsapp",
      recipient: "+5511999999999",
      subject: "Agendamento Confirmado",
      message: "Seu agendamento foi confirmado para 10/11/2025 às 14:00",
      status: "sent",
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      sentAt: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: 3,
      type: "sms",
      recipient: "+5511988888888",
      subject: "Lembrete de Manutenção",
      message: "Lembrete: Sua manutenção está agendada para 12/11/2025",
      status: "pending",
      createdAt: new Date(Date.now() - 1800000).toISOString(),
    },
    {
      id: 4,
      type: "email",
      recipient: "maria@example.com",
      subject: "Ordem de Serviço #456 Finalizada",
      message: "Sua ordem de serviço foi finalizada com sucesso!",
      status: "failed",
      createdAt: new Date(Date.now() - 10800000).toISOString(),
    },
  ]);

  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "email":
        return <Mail className="h-4 w-4" />;
      case "sms":
        return <Phone className="h-4 w-4" />;
      case "whatsapp":
        return <MessageSquare className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "email":
        return "Email";
      case "sms":
        return "SMS";
      case "whatsapp":
        return "WhatsApp";
      default:
        return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "sent":
        return "Enviado";
      case "pending":
        return "Pendente";
      case "failed":
        return "Falhou";
      default:
        return status;
    }
  };

  const handleDelete = (id: number) => {
    setNotifications(notifications.filter((n) => n.id !== id));
    toast.success("Notificação deletada!");
  };

  const handleRetry = (id: number) => {
    setNotifications(
      notifications.map((n) =>
        n.id === id ? { ...n, status: "sent" as const } : n
      )
    );
    toast.success("Notificação reenviada!");
  };

  const sentCount = notifications.filter((n) => n.status === "sent").length;
  const pendingCount = notifications.filter((n) => n.status === "pending").length;
  const failedCount = notifications.filter((n) => n.status === "failed").length;

  const filteredByType = (type: string) => notifications.filter((n) => n.type === type);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Notificações</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie todas as notificações enviadas aos clientes
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Enviadas</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{sentCount}</div>
              <p className="text-xs text-muted-foreground">Notificações enviadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
              <p className="text-xs text-muted-foreground">Aguardando envio</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Falhadas</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{failedCount}</div>
              <p className="text-xs text-muted-foreground">Erro no envio</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Notificações</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">Todas</TabsTrigger>
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="sms">SMS</TabsTrigger>
                <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-3 mt-4">
                {notifications.length === 0 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>Nenhuma notificação encontrada</AlertDescription>
                  </Alert>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition"
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <div className="mt-1">{getTypeIcon(notification.type)}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-sm">{notification.subject}</p>
                            <Badge className={getStatusColor(notification.status)}>
                              {getStatusLabel(notification.status)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Para: {notification.recipient}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(notification.createdAt).toLocaleString("pt-BR")}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedNotification(notification)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {notification.status === "failed" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRetry(notification.id)}
                          >
                            Reenviar
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(notification.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>

              <TabsContent value="email" className="space-y-3 mt-4">
                {filteredByType("email").length === 0 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>Nenhum email encontrado</AlertDescription>
                  </Alert>
                ) : (
                  filteredByType("email").map((notification) => (
                    <div
                      key={notification.id}
                      className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">{notification.subject}</p>
                        <p className="text-sm text-muted-foreground">{notification.recipient}</p>
                      </div>
                      <Badge className={getStatusColor(notification.status)}>
                        {getStatusLabel(notification.status)}
                      </Badge>
                    </div>
                  ))
                )}
              </TabsContent>

              <TabsContent value="sms" className="space-y-3 mt-4">
                {filteredByType("sms").length === 0 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>Nenhum SMS encontrado</AlertDescription>
                  </Alert>
                ) : (
                  filteredByType("sms").map((notification) => (
                    <div
                      key={notification.id}
                      className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">{notification.message}</p>
                        <p className="text-sm text-muted-foreground">{notification.recipient}</p>
                      </div>
                      <Badge className={getStatusColor(notification.status)}>
                        {getStatusLabel(notification.status)}
                      </Badge>
                    </div>
                  ))
                )}
              </TabsContent>

              <TabsContent value="whatsapp" className="space-y-3 mt-4">
                {filteredByType("whatsapp").length === 0 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>Nenhuma mensagem WhatsApp encontrada</AlertDescription>
                  </Alert>
                ) : (
                  filteredByType("whatsapp").map((notification) => (
                    <div
                      key={notification.id}
                      className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">{notification.message}</p>
                        <p className="text-sm text-muted-foreground">{notification.recipient}</p>
                      </div>
                      <Badge className={getStatusColor(notification.status)}>
                        {getStatusLabel(notification.status)}
                      </Badge>
                    </div>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
