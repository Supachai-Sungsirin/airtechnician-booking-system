import express from "express";
import { createReview, getReviewsByTechnician } from "../controllers/reviewController.js";
import { auth } from "../middleware/authMiddleware.js"; 

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: จัดการข้อมูลรีวิวของช่าง
 */

/**
 * @swagger
 * /reviews:
 *   post:
 *     summary: ลูกค้าเพิ่มรีวิวให้ช่างจาก Booking
 *     tags: [Reviews]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookingId
 *               - rating
 *               - comment
 *             properties:
 *               bookingId:
 *                 type: string
 *                 description: รหัส Booking ที่ต้องการรีวิว
 *                 example: "64f123abc4567890def22222"
 *               rating:
 *                 type: number
 *                 format: float
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4.5
 *               comment:
 *                 type: string
 *                 example: "ช่างบริการดีมาก รวดเร็วและสุภาพ"
 *     responses:
 *       201:
 *         description: เพิ่มรีวิวสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "รีวิวสำเร็จ"
 *                 review:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     bookingId:
 *                       type: string
 *                     customerId:
 *                       type: string
 *                     technicianId:
 *                       type: string
 *                     rating:
 *                       type: number
 *                     comment:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: ข้อมูลไม่ถูกต้อง เช่น Booking ไม่ใช่ของลูกค้าคนนี้, งานยังไม่เสร็จ, หรือรีวิวซ้ำ
 *       401:
 *         description: ต้องเข้าสู่ระบบก่อน
 *       500:
 *         description: เกิดข้อผิดพลาดในการสร้างรีวิว
 */
// ลูกค้าเพิ่ม Review
router.post("/", auth, createReview);

/**
 * @swagger
 * /reviews/technician/{technicianId}:
 *   get:
 *     summary: ดึงรายการรีวิวของช่างตาม ID
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: technicianId
 *         required: true
 *         description: รหัสของช่าง
 *         schema:
 *           type: string
 *           example: "64f123abc4567890def11111"
 *     responses:
 *       200:
 *         description: ดึงข้อมูลรีวิวของช่างสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   customerName:
 *                     type: string
 *                   rating:
 *                     type: number
 *                   comment:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       404:
 *         description: ไม่พบรีวิวของช่าง
 */
// ดึง Review ของช่าง
router.get("/technician/:technicianId", getReviewsByTechnician);

export default router;
