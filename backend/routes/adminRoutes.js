import express from "express";
import { auth, isAdmin } from "../middleware/authMiddleware.js";
import { approveTechnician, addService, addAdmin } from "../controllers/adminController.js";

const router = express.Router();

// Admin เพิ่ม Admin คนใหม่
router.post("/", auth, isAdmin, addAdmin);

// Admin อนุมัติช่าง
router.patch("/technician/:id/approve", auth, isAdmin, approveTechnician);

// Admin เพิ่ม งานบริการ ใหม่
router.post("/service", auth, isAdmin, addService);


export default router;
