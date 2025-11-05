import express from "express";
import { auth, isAdmin } from "../middleware/authMiddleware.js";
import {
    updateTechnicianStatus,
    addService,
    addAdmin,
    getServices,
    updateService,
    deleteService,
    getDashboardStats,
    getPendingTechnicians,
    getAllCustomers,
    getAllTechnicians,
    getAllAdmins,
    getUserDetail,
    updateUser,
    updateTechnicianInfo,
} from "../controllers/adminController.js";

const router = express.Router();

/*  =======================
        DASHBOARD ROUTES 
    ======================= */
router.get("/dashboard/stats", auth, isAdmin, getDashboardStats);

/*  =======================
        ADMIN MANAGEMENT
    ======================= */
router.post("/add-admin", auth, isAdmin, addAdmin);
router.get("/admins", auth, isAdmin, getAllAdmins);

/*  =======================
        TECHNICIAN MANAGEMENT
    ======================= */
// อนุมัติ/ปฏิเสธช่าง
router.put("/technicians/:id", auth, isAdmin, updateTechnicianStatus);

// ดึงช่างที่รออนุมัติ
router.get("/technicians/pending", auth, isAdmin, getPendingTechnicians);

// ดึงช่างทั้งหมด
router.get("/technicians", auth, isAdmin, getAllTechnicians);

// อัปเดตข้อมูลช่าง (เช่น แก้บริการ/โซนบริการ)
router.patch("/technician/:id", auth, isAdmin, updateTechnicianInfo);

/*  =======================
        CUSTOMER MANAGEMENT
    ======================= */
router.get("/customers", auth, isAdmin, getAllCustomers);

/*  =======================
        USER MANAGEMENT     (ใช้กับทั้ง admin/customer/technician)
    ======================= */
router.get("/user/:id", auth, isAdmin, getUserDetail);
router.patch("/user/:id", auth, isAdmin, updateUser);

/*  =======================
        SERVICE MANAGEMENT
    ======================= */
router.post("/services", auth, isAdmin, addService);
router.get("/services", auth, isAdmin, getServices);
router.put("/services/:id", auth, isAdmin, updateService);
router.delete("/services/:id", auth, isAdmin, deleteService);

export default router;