import express from "express";
import { auth, isAdmin } from "../middleware/authMiddleware.js";
import {
  updateTechnicianStatus,
  addService,
  addAdmin,
  getServices,
  updateService,
  deleteService,
} from "../controllers/adminController.js";

const router = express.Router();

// Admin เพิ่ม Admin คนใหม่
router.post("/", auth, isAdmin, addAdmin);

// Admin อนุมัติช่าง
router.patch("/technician/:id/status", auth, isAdmin, updateTechnicianStatus);

// Admin เพิ่ม งานบริการ ใหม่
router.post("/service", auth, isAdmin, addService);

// ดึงงานบริการทั้งหมด
router.get("/allservices", auth, isAdmin, getServices);

// แก้ไข งานบริการ
router.patch("/service/:id", auth, isAdmin, updateService);

// ลบ งานบริการ
router.delete("/service/:id", auth, isAdmin, deleteService);

export default router;
