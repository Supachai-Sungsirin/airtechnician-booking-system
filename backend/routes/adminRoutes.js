import express from "express";
import { approveTechnician } from "../controllers/adminController.js";
import { auth, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Admin อนุมัติช่าง
router.patch("/technician/:id/approve", auth, isAdmin, approveTechnician);

export default router;
