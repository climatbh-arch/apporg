import { useState } from "react";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin, User } from "lucide-react";
import { toast } from "sonner";

interface ScheduleEvent {
  id: number;
  date: string;
  time: string;
  clientName: string;
  address: string;
  type: "preventiva" | "corretiva";
  status: "scheduled" | "completed" | "cancelled";
}

export default function ScheduleCalendar() {
  const [, navigate] = useLocation();
  const [currentDate, setCurrentDate] = useState(new Date(2025, 10, 8)); // Nov 8, 2025
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showNewEventForm, setShowNewEventForm] = useState(false);

  const [newEvent, setNewEvent] = useState({
    clientName: "",
    address: "",
    time: "09:00",
    type: "preventiva" as const,
  });

  // Mock data
  const events: ScheduleEvent[] = [
    {
      id: 1,
      date: "2025-11-08",
      time: "09:00",
      clientName: "João Silva",
      address: "Rua A, 123",
      type: "preventiva",
      status: "scheduled",
    },
    {
      id: 2,
      date: "2025-11-08",
      time: "14:00",
      clientName: "Maria Santos",
      address: "Rua B, 456",
      type: "corretiva",
      status: "scheduled",
    },
    {
      id: 3,
      date: "2025-11-10",
      time: "10:00",
      clientName: "Pedro Costa",
      address: "Rua C, 789",
      type: "preventiva",
      status: "scheduled",
    },
  ];

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDateClick = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setSelectedDate(dateStr);
    setShowNewEventForm(true);
  };

  const handleAddEvent = () => {
    if (!newEvent.clientName.trim()) {
      toast.error("Nome do cliente é obrigatório");
      return;
    }

    if (!newEvent.address.trim()) {
      toast.error("Endereço é obrigatório");
      return;
    }

    toast.success("Agendamento criado com sucesso!");
    setNewEvent({ clientName: "", address: "", time: "09:00", type: "preventiva" });
    setShowNewEventForm(false);
  };

  const getEventsForDate = (dateStr: string) => {
    return events.filter((event) => event.date === dateStr);
  };

  const getTypeColor = (type: string) => {
    return type === "preventiva"
      ? "bg-blue-100 text-blue-800"
      : "bg-orange-100 text-orange-800";
  };

  const getTypeLabel = (type: string) => {
    return type === "preventiva" ? "Preventiva" : "Corretiva";
  };

  const monthName = currentDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Calendário de Agendamentos</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie todas as manutenções agendadas
            </p>
          </div>
          <Button onClick={() => setShowNewEventForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Agendamento
          </Button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="capitalize">{monthName}</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handlePrevMonth}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleNextMonth}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Weekdays */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"].map((day) => (
                    <div
                      key={day}
                      className="text-center font-semibold text-sm text-muted-foreground py-2"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Days */}
                <div className="grid grid-cols-7 gap-1">
                  {emptyDays.map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square" />
                  ))}
                  {days.map((day) => {
                    const dateStr = `${currentDate.getFullYear()}-${String(
                      currentDate.getMonth() + 1
                    ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    const dayEvents = getEventsForDate(dateStr);
                    const isSelected = selectedDate === dateStr;

                    return (
                      <button
                        key={day}
                        onClick={() => handleDateClick(day)}
                        className={`aspect-square p-1 rounded-lg border-2 transition-colors ${
                          isSelected
                            ? "border-blue-500 bg-blue-50"
                            : dayEvents.length > 0
                            ? "border-orange-300 bg-orange-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="text-sm font-medium">{day}</div>
                        {dayEvents.length > 0 && (
                          <div className="text-xs text-orange-600 mt-0.5">
                            {dayEvents.length} agendamento{dayEvents.length > 1 ? "s" : ""}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Legend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Legenda</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border-2 border-gray-200" />
                  <span>Sem agendamentos</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border-2 border-orange-300 bg-orange-50" />
                  <span>Com agendamentos</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border-2 border-blue-500 bg-blue-50" />
                  <span>Data selecionada</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Selected Date Events */}
            {selectedDate && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">
                    {new Date(selectedDate).toLocaleDateString("pt-BR", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedDateEvents.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Nenhum agendamento neste dia
                    </p>
                  ) : (
                    selectedDateEvents.map((event) => (
                      <div
                        key={event.id}
                        className="p-3 border rounded-lg hover:bg-gray-50 transition"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-sm">{event.time}</span>
                          </div>
                          <Badge className={getTypeColor(event.type)}>
                            {getTypeLabel(event.type)}
                          </Badge>
                        </div>
                        <p className="font-medium text-sm mb-1">{event.clientName}</p>
                        <div className="flex items-start gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                          <span>{event.address}</span>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            )}

            {/* New Event Form */}
            {showNewEventForm && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Novo Agendamento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="clientName" className="text-xs">
                      Cliente *
                    </Label>
                    <Input
                      id="clientName"
                      value={newEvent.clientName}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, clientName: e.target.value })
                      }
                      placeholder="Nome do cliente"
                      className="mt-1 text-sm"
                    />
                  </div>

                  <div>
                    <Label htmlFor="address" className="text-xs">
                      Endereço *
                    </Label>
                    <Input
                      id="address"
                      value={newEvent.address}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, address: e.target.value })
                      }
                      placeholder="Endereço completo"
                      className="mt-1 text-sm"
                    />
                  </div>

                  <div>
                    <Label htmlFor="time" className="text-xs">
                      Horário
                    </Label>
                    <Input
                      id="time"
                      type="time"
                      value={newEvent.time}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, time: e.target.value })
                      }
                      className="mt-1 text-sm"
                    />
                  </div>

                  <div>
                    <Label htmlFor="type" className="text-xs">
                      Tipo de Serviço
                    </Label>
                    <Select
                      value={newEvent.type}
                      onValueChange={(value) =>
                        setNewEvent({
                          ...newEvent,
                          type: value as "preventiva" | "corretiva",
                        })
                      }
                    >
                      <SelectTrigger id="type" className="mt-1 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="preventiva">Preventiva</SelectItem>
                        <SelectItem value="corretiva">Corretiva</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleAddEvent}
                      size="sm"
                      className="flex-1"
                    >
                      Agendar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowNewEventForm(false)}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Próximos Agendamentos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {events.slice(0, 3).map((event) => (
                  <div key={event.id} className="text-xs p-2 border rounded">
                    <p className="font-medium">{event.clientName}</p>
                    <p className="text-muted-foreground">
                      {new Date(event.date).toLocaleDateString("pt-BR")} às{" "}
                      {event.time}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
