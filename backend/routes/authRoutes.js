import express from "express";
import { registerCustomer, registerTechnician, login, getMe, getAvailableServices, updateMyProfile } from "../controllers/authController.js"; 
import { auth } from "../middleware/authMiddleware.js"; 

const router = express.Router();

// สมัคร Customer
router.post("/register/customer", registerCustomer);

// ดึงรายการบริการที่มีอยู่
router.get("/services", getAvailableServices);
// สมัคร Technician
router.post("/register/technician", registerTechnician);

// เข้าสู่ระบบ
router.post("/login", login);

// [ใหม่] Protected route สำหรับดึงข้อมูลผู้ใช้ปัจจุบัน
// ต้องผ่าน auth middleware ก่อน เพื่อให้ req.user มีข้อมูล
router.get("/me", auth, getMe);

// PUT /auth/me
router.put('/me', auth, updateMyProfile)

export default router;
