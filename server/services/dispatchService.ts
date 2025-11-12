/**
 * Serviço de Despacho Inteligente
 * Implementa o algoritmo de atribuição automática de Ordens de Serviço baseado em:
 * 1. Skill Matching (habilidades técnicas)
 * 2. Geolocalização e otimização de rota
 * 3. SLA e prioridade
 * 4. Carga horária e disponibilidade
 */

import { db } from "../db";
import { 
  workOrders, 
  technicians, 
  technicianSkills, 
  technicianLocations, 
  dispatchQueue 
} from "../../drizzle/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";

interface DispatchScore {
  technicianId: number;
  technicianName: string;
  skillScore: number;
  distanceScore: number;
  slaScore: number;
  availabilityScore: number;
  totalScore: number;
  distance?: number;
  estimatedTravelTime?: number;
}

interface WorkOrderLocation {
  latitude: number;
  longitude: number;
}

/**
 * Calcula a distância entre dois pontos usando a fórmula de Haversine
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calcula o score de habilidades técnicas
 */
async function calculateSkillScore(
  technicianId: number,
  requiredSkills: string[]
): Promise<number> {
  if (!requiredSkills || requiredSkills.length === 0) {
    return 100; // Se não há habilidades requeridas, todos têm score máximo
  }

  const skills = await db
    .select()
    .from(technicianSkills)
    .where(eq(technicianSkills.technicianId, technicianId));

  const techSkillNames = skills.map((s) => s.skillName.toLowerCase());
  const matchedSkills = requiredSkills.filter((req) =>
    techSkillNames.includes(req.toLowerCase())
  );

  return (matchedSkills.length / requiredSkills.length) * 100;
}

/**
 * Calcula o score de distância (quanto menor a distância, maior o score)
 */
function calculateDistanceScore(distanceKm: number): number {
  // Score máximo para distâncias até 5km, decrescendo até 0 para 50km+
  if (distanceKm <= 5) return 100;
  if (distanceKm >= 50) return 0;
  return 100 - ((distanceKm - 5) / 45) * 100;
}

/**
 * Calcula o score de SLA baseado na prioridade
 */
function calculateSLAScore(
  priority: number,
  slaLevel: string,
  technicianStatus: string
): number {
  let score = 50;

  // Prioridade crítica aumenta o score
  if (priority >= 8) score += 30;
  else if (priority >= 5) score += 15;

  // SLA crítico aumenta o score
  if (slaLevel === "critical") score += 20;
  else if (slaLevel === "high") score += 10;

  // Técnico disponível tem score maior
  if (technicianStatus === "available") score += 30;
  else if (technicianStatus === "finishing") score += 15;

  return Math.min(score, 100);
}

/**
 * Calcula o score de disponibilidade baseado na carga horária
 */
async function calculateAvailabilityScore(
  technicianId: number,
  estimatedDuration: number
): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Buscar OS do técnico para hoje
  const todayOrders = await db
    .select()
    .from(workOrders)
    .where(
      and(
        eq(workOrders.technicianId, technicianId),
        gte(workOrders.scheduledDate, today),
        lte(
          workOrders.scheduledDate,
          new Date(today.getTime() + 24 * 60 * 60 * 1000)
        )
      )
    );

  // Calcular horas já alocadas
  const allocatedHours = todayOrders.reduce(
    (sum, order) => sum + (order.estimatedDuration || 0),
    0
  );

  // Assumir jornada de 8 horas (480 minutos)
  const maxMinutes = 480;
  const availableMinutes = maxMinutes - allocatedHours;

  if (availableMinutes <= 0) return 0;
  if (availableMinutes >= estimatedDuration) return 100;

  return (availableMinutes / estimatedDuration) * 100;
}

/**
 * Algoritmo principal de despacho inteligente
 */
export async function suggestTechnician(
  workOrderId: number,
  userId: number
): Promise<DispatchScore | null> {
  // Buscar a ordem de serviço
  const [workOrder] = await db
    .select()
    .from(workOrders)
    .where(eq(workOrders.id, workOrderId));

  if (!workOrder) {
    throw new Error("Ordem de serviço não encontrada");
  }

  // Buscar técnicos ativos
  const activeTechnicians = await db
    .select()
    .from(technicians)
    .where(and(eq(technicians.userId, userId), eq(technicians.isActive, true)));

  if (activeTechnicians.length === 0) {
    return null;
  }

  // Buscar localização do cliente (assumindo que está nos campos da OS ou cliente)
  // Por simplicidade, vamos assumir coordenadas padrão se não houver
  const clientLat = 0; // TODO: Buscar do cliente
  const clientLon = 0;

  const scores: DispatchScore[] = [];

  // Calcular scores para cada técnico
  for (const tech of activeTechnicians) {
    // 1. Skill Score
    const requiredSkills: string[] = []; // TODO: Extrair das especificações da OS
    const skillScore = await calculateSkillScore(tech.id, requiredSkills);

    // Se não tem as habilidades necessárias, pular
    if (skillScore === 0 && requiredSkills.length > 0) {
      continue;
    }

    // 2. Distance Score
    let distanceScore = 50;
    let distance = undefined;
    let estimatedTravelTime = undefined;

    if (tech.currentLatitude && tech.currentLongitude) {
      distance = calculateDistance(
        Number(tech.currentLatitude),
        Number(tech.currentLongitude),
        clientLat,
        clientLon
      );
      distanceScore = calculateDistanceScore(distance);
      estimatedTravelTime = Math.round((distance / 40) * 60); // Assumindo 40km/h
    }

    // 3. SLA Score
    const slaScore = calculateSLAScore(
      workOrder.priority || 5,
      workOrder.slaLevel || "normal",
      tech.currentStatus || "available"
    );

    // 4. Availability Score
    const availabilityScore = await calculateAvailabilityScore(
      tech.id,
      workOrder.estimatedDuration || 120
    );

    // Calcular score total ponderado
    const totalScore =
      skillScore * 0.4 + // 40% peso para habilidades
      distanceScore * 0.3 + // 30% peso para distância
      slaScore * 0.15 + // 15% peso para SLA
      availabilityScore * 0.15; // 15% peso para disponibilidade

    scores.push({
      technicianId: tech.id,
      technicianName: tech.name,
      skillScore,
      distanceScore,
      slaScore,
      availabilityScore,
      totalScore,
      distance,
      estimatedTravelTime,
    });
  }

  // Ordenar por score total (maior para menor)
  scores.sort((a, b) => b.totalScore - a.totalScore);

  // Retornar o melhor técnico
  return scores.length > 0 ? scores[0] : null;
}

/**
 * Adiciona uma OS à fila de despacho
 */
export async function addToDispatchQueue(
  workOrderId: number,
  userId: number,
  requiredSkills?: string[]
): Promise<void> {
  const suggestion = await suggestTechnician(workOrderId, userId);

  if (suggestion) {
    await db.insert(dispatchQueue).values({
      workOrderId,
      suggestedTechnicianId: suggestion.technicianId,
      assignmentScore: suggestion.totalScore.toString(),
      requiredSkills: requiredSkills ? JSON.stringify(requiredSkills) : null,
      status: "pending",
    });
  }
}

/**
 * Atribui automaticamente uma OS ao técnico sugerido
 */
export async function autoAssignWorkOrder(
  workOrderId: number,
  userId: number
): Promise<boolean> {
  const suggestion = await suggestTechnician(workOrderId, userId);

  if (!suggestion) {
    return false;
  }

  // Atualizar a OS com o técnico sugerido
  await db
    .update(workOrders)
    .set({
      technicianId: suggestion.technicianId,
      technician: suggestion.technicianName,
      status: "assigned",
      updatedAt: new Date(),
    })
    .where(eq(workOrders.id, workOrderId));

  // Atualizar a fila de despacho
  await db
    .update(dispatchQueue)
    .set({
      status: "assigned",
      assignedAt: new Date(),
    })
    .where(eq(dispatchQueue.workOrderId, workOrderId));

  return true;
}

/**
 * Atualiza a localização de um técnico
 */
export async function updateTechnicianLocation(
  technicianId: number,
  latitude: number,
  longitude: number,
  status: string,
  workOrderId?: number
): Promise<void> {
  // Atualizar localização atual do técnico
  await db
    .update(technicians)
    .set({
      currentLatitude: latitude.toString(),
      currentLongitude: longitude.toString(),
      currentStatus: status,
      updatedAt: new Date(),
    })
    .where(eq(technicians.id, technicianId));

  // Registrar histórico de localização
  await db.insert(technicianLocations).values({
    technicianId,
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    status,
    workOrderId,
    timestamp: new Date(),
  });
}
