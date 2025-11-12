import { Router } from "express";
import { db } from "../db";
import { assets } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

const router = Router();

// GET /api/assets - Listar todos os ativos
router.get("/", async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const allAssets = await db
      .select()
      .from(assets)
      .where(eq(assets.userId, userId))
      .orderBy(assets.createdAt);

    res.json(allAssets);
  } catch (error) {
    console.error("Error fetching assets:", error);
    res.status(500).json({ error: "Failed to fetch assets" });
  }
});

// GET /api/assets/:id - Buscar ativo por ID
router.get("/:id", async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    const assetId = parseInt(req.params.id);

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const [asset] = await db
      .select()
      .from(assets)
      .where(and(eq(assets.id, assetId), eq(assets.userId, userId)));

    if (!asset) {
      return res.status(404).json({ error: "Asset not found" });
    }

    res.json(asset);
  } catch (error) {
    console.error("Error fetching asset:", error);
    res.status(500).json({ error: "Failed to fetch asset" });
  }
});

// POST /api/assets - Criar novo ativo
router.post("/", async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const {
      clientId,
      serialNumber,
      brand,
      model,
      capacity,
      installationDate,
      warrantyDate,
      physicalLocation,
      nextMaintenanceDate,
      assetType,
      status,
    } = req.body;

    // Validações básicas
    if (!clientId || !serialNumber || !brand || !model) {
      return res.status(400).json({
        error: "Missing required fields: clientId, serialNumber, brand, model",
      });
    }

    const [newAsset] = await db
      .insert(assets)
      .values({
        userId,
        clientId: parseInt(clientId),
        serialNumber,
        brand,
        model,
        capacity,
        installationDate: installationDate ? new Date(installationDate) : null,
        warrantyDate: warrantyDate ? new Date(warrantyDate) : null,
        physicalLocation,
        nextMaintenanceDate: nextMaintenanceDate
          ? new Date(nextMaintenanceDate)
          : null,
        assetType: assetType || "air_conditioner",
        status: status || "active",
      })
      .returning();

    res.status(201).json(newAsset);
  } catch (error) {
    console.error("Error creating asset:", error);
    res.status(500).json({ error: "Failed to create asset" });
  }
});

// PUT /api/assets/:id - Atualizar ativo
router.put("/:id", async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    const assetId = parseInt(req.params.id);

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const {
      clientId,
      serialNumber,
      brand,
      model,
      capacity,
      installationDate,
      warrantyDate,
      physicalLocation,
      nextMaintenanceDate,
      assetType,
      status,
    } = req.body;

    const [updatedAsset] = await db
      .update(assets)
      .set({
        ...(clientId && { clientId: parseInt(clientId) }),
        ...(serialNumber && { serialNumber }),
        ...(brand && { brand }),
        ...(model && { model }),
        ...(capacity !== undefined && { capacity }),
        ...(installationDate && {
          installationDate: new Date(installationDate),
        }),
        ...(warrantyDate && { warrantyDate: new Date(warrantyDate) }),
        ...(physicalLocation !== undefined && { physicalLocation }),
        ...(nextMaintenanceDate && {
          nextMaintenanceDate: new Date(nextMaintenanceDate),
        }),
        ...(assetType && { assetType }),
        ...(status && { status }),
        updatedAt: new Date(),
      })
      .where(and(eq(assets.id, assetId), eq(assets.userId, userId)))
      .returning();

    if (!updatedAsset) {
      return res.status(404).json({ error: "Asset not found" });
    }

    res.json(updatedAsset);
  } catch (error) {
    console.error("Error updating asset:", error);
    res.status(500).json({ error: "Failed to update asset" });
  }
});

// DELETE /api/assets/:id - Deletar ativo
router.delete("/:id", async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    const assetId = parseInt(req.params.id);

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const [deletedAsset] = await db
      .delete(assets)
      .where(and(eq(assets.id, assetId), eq(assets.userId, userId)))
      .returning();

    if (!deletedAsset) {
      return res.status(404).json({ error: "Asset not found" });
    }

    res.json({ success: true, message: "Asset deleted successfully" });
  } catch (error) {
    console.error("Error deleting asset:", error);
    res.status(500).json({ error: "Failed to delete asset" });
  }
});

export default router;
