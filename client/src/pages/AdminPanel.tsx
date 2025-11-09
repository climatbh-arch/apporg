import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Users,
  Clock,
  Shield,
  LogOut,
} from "lucide-react";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function AdminPanel() {
  const [, navigate] = useLocation();
  const [selectedTab, setSelectedTab] = useState<"pending" | "approved">("pending");
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: "approve" | "reject" | null;
    userId: number | null;
    userName: string | null;
  }>({
    open: false,
    action: null,
    userId: null,
    userName: null,
  });

  // Queries
  const userQuery = trpc.auth.me.useQuery();
  const pendingUsersQuery = trpc.admin.getPendingUsers.useQuery();
  const approvedUsersQuery = trpc.admin.getAllApprovedUsers.useQuery();

  // Mutations
  const approveMutation = trpc.admin.approveUser.useMutation({
    onSuccess: () => {
      toast.success("Usuário aprovado com sucesso!");
      pendingUsersQuery.refetch();
      approvedUsersQuery.refetch();
      setConfirmDialog({ open: false, action: null, userId: null, userName: null });
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao aprovar usuário");
    },
  });

  const rejectMutation = trpc.admin.rejectUser.useMutation({
    onSuccess: () => {
      toast.success("Usuário rejeitado e removido do sistema");
      pendingUsersQuery.refetch();
      approvedUsersQuery.refetch();
      setConfirmDialog({ open: false, action: null, userId: null, userName: null });
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao rejeitar usuário");
    },
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      navigate("/");
    },
  });

  // Check if user is admin
  useEffect(() => {
    if (userQuery.data && userQuery.data.role !== "admin") {
      navigate("/");
    }
  }, [userQuery.data, navigate]);

  if (userQuery.isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (!userQuery.data || userQuery.data.role !== "admin") {
    return (
      <DashboardLayout>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Acesso Negado</AlertTitle>
          <AlertDescription>
            Você não tem permissão para acessar o painel de administração.
          </AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  const pendingUsers = pendingUsersQuery.data || [];
  const approvedUsers = approvedUsersQuery.data || [];

  const handleApprove = (userId: number, userName: string) => {
    setConfirmDialog({
      open: true,
      action: "approve",
      userId,
      userName,
    });
  };

  const handleReject = (userId: number, userName: string) => {
    setConfirmDialog({
      open: true,
      action: "reject",
      userId,
      userName,
    });
  };

  const confirmAction = () => {
    if (confirmDialog.action === "approve" && confirmDialog.userId) {
      approveMutation.mutate({ userId: confirmDialog.userId });
    } else if (confirmDialog.action === "reject" && confirmDialog.userId) {
      rejectMutation.mutate({ userId: confirmDialog.userId });
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Shield className="h-8 w-8" />
              Painel de Administração
            </h1>
            <p className="text-gray-500 mt-1">Gerenciar aprovações de usuários e controle de acesso</p>
          </div>
          <Button
            variant="outline"
            onClick={() => logoutMutation.mutate()}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-500" />
                Aguardando Aprovação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingUsers.length}</div>
              <p className="text-xs text-gray-500 mt-1">usuários pendentes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Usuários Aprovados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{approvedUsers.length}</div>
              <p className="text-xs text-gray-500 mt-1">usuários ativos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                Total de Usuários
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingUsers.length + approvedUsers.length}</div>
              <p className="text-xs text-gray-500 mt-1">no sistema</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          <button
            onClick={() => setSelectedTab("pending")}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              selectedTab === "pending"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pendentes ({pendingUsers.length})
            </div>
          </button>
          <button
            onClick={() => setSelectedTab("approved")}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              selectedTab === "approved"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Aprovados ({approvedUsers.length})
            </div>
          </button>
        </div>

        {/* Content */}
        {selectedTab === "pending" && (
          <Card>
            <CardHeader>
              <CardTitle>Usuários Aguardando Aprovação</CardTitle>
              <CardDescription>
                Revise e aprove novos usuários para acessar o sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingUsersQuery.isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : pendingUsers.length === 0 ? (
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>Nenhum usuário pendente</AlertTitle>
                  <AlertDescription>
                    Todos os usuários foram aprovados ou rejeitados.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-3">
                  {pendingUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{user.name || "Sem nome"}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          Cadastrado em: {formatDate(user.createdAt)}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleApprove(user.id, user.name || "Usuário")}
                          disabled={approveMutation.isPending}
                          className="gap-1"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Aprovar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(user.id, user.name || "Usuário")}
                          disabled={rejectMutation.isPending}
                          className="gap-1"
                        >
                          <XCircle className="h-4 w-4" />
                          Rejeitar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {selectedTab === "approved" && (
          <Card>
            <CardHeader>
              <CardTitle>Usuários Aprovados</CardTitle>
              <CardDescription>
                Lista de usuários com acesso ativo ao sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              {approvedUsersQuery.isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : approvedUsers.length === 0 ? (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Nenhum usuário aprovado</AlertTitle>
                  <AlertDescription>
                    Nenhum usuário foi aprovado ainda.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-3">
                  {approvedUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="font-medium">{user.name || "Sem nome"}</div>
                          <Badge variant="default" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Ativo
                          </Badge>
                          {user.role === "admin" && (
                            <Badge variant="secondary" className="gap-1">
                              <Shield className="h-3 w-3" />
                              Admin
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          Aprovado em: {formatDate(user.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => {
        if (!open) {
          setConfirmDialog({ open: false, action: null, userId: null, userName: null });
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmDialog.action === "approve" ? "Aprovar Usuário" : "Rejeitar Usuário"}
            </DialogTitle>
            <DialogDescription>
              {confirmDialog.action === "approve"
                ? `Você tem certeza que deseja aprovar ${confirmDialog.userName}? Este usuário terá acesso ao sistema.`
                : `Você tem certeza que deseja rejeitar ${confirmDialog.userName}? Todos os dados deste usuário serão removidos.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setConfirmDialog({ open: false, action: null, userId: null, userName: null })
              }
            >
              Cancelar
            </Button>
            <Button
              variant={confirmDialog.action === "reject" ? "destructive" : "default"}
              onClick={confirmAction}
              disabled={approveMutation.isPending || rejectMutation.isPending}
            >
              {confirmDialog.action === "approve" ? "Aprovar" : "Rejeitar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
