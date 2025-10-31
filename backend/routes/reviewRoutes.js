import express from "express";
import { createReview, getReviewsByTechnician } from "../controllers/ReviewController.js";
import { verifyToken } from "../middleware/authMiddleware.js"; 

const router = express.Router();

// ลูกค้าเพิ่ม Review
router.post("/", verifyToken, createReview);

// ดึง Review ของช่าง
router.get("/technician/:technicianId", getReviewsByTechnician);

export default router;
