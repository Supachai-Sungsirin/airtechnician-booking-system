import express from "express";
import { registerCustomer, registerTechnician, login } from "../controllers/authController.js";

const router = express.Router();

// สมัคร Customer
router.post("/register/customer", registerCustomer);

// สมัคร Technician
router.post("/register/technician", registerTechnician);

// เข้าสู่ระบบ
router.post("/login", login);

export default router;
