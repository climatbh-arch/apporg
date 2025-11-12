import { Router } from "express";
import {
  suggestTechnician,
  autoAssignWorkOrder,
  updateTechnicianLocation,
  addToDispatchQueue,
} from "../services/dispatchService";

const router = Router();

// POST /api/dispatch/suggest/:workOrderId - Sugerir técnico para OS
router.post("/suggest/:workOrderId", async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    const workOrderId = parseInt(req.params.workOrderId);

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const suggestion = await suggestTechnician(workOrderId, userId);

    if (!suggestion) {
      return res.status(404).json({
        error: "No suitable technician found for this work order",
      });
    }

    res.json(suggestion);
  } catch (error) {
    console.error("Error suggesting technician:", error);
    res.status(500).json({ error: "Failed to suggest technician" });
  }
});

// POST /api/dispatch/auto-assign/:workOrderId - Atribuir automaticamente
router.post("/auto-assign/:workOrderId", async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    const workOrderId = parseInt(req.params.workOrderId);

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const success = await autoAssignWorkOrder(workOrderId, userId);

    if (!success) {
      return res.status(404).json({
        error: "No suitable technician found for this work order",
      });
    }

    res.json({
      success: true,
      message: "Work order assigned successfully",
    });
  } catch (error) {
    console.error("Error auto-assigning work order:", error);
    res.status(500).json({ error: "Failed to auto-assign work order" });
  }
});

// POST /api/dispatch/queue - Adicionar OS à fila de despacho
router.post("/queue", async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    const { workOrderId, requiredSkills } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!workOrderId) {
      return res.status(400).json({ error: "workOrderId is required" });
    }

    await addToDispatchQueue(
      parseInt(workOrderId),
      userId,
      requiredSkills
    );

    res.json({
      success: true,
      message: "Work order added to dispatch queue",
    });
  } catch (error) {
    console.error("Error adding to dispatch queue:", error);
    res.status(500).json({ error: "Failed to add to dispatch queue" });
  }
});

// POST /api/dispatch/technician-location - Atualizar localização do técnico
router.post("/technician-location", async (req, res) => {
  try {
    const { technicianId, latitude, longitude, status, workOrderId } = req.body;

    if (!technicianId || !latitude || !longitude || !status) {
      return res.status(400).json({
        error: "technicianId, latitude, longitude, and status are required",
      });
    }

    await updateTechnicianLocation(
      parseInt(technicianId),
      parseFloat(latitude),
      parseFloat(longitude),
      status,
      workOrderId ? parseInt(workOrderId) : undefined
    );

    res.json({
      success: true,
      message: "Technician location updated successfully",
    });
  } catch (error) {
    console.error("Error updating technician location:", error);
    res.status(500).json({ error: "Failed to update technician location" });
  }
});

export default router;
