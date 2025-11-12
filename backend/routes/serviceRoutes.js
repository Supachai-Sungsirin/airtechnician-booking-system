import express from "express";
import Service from "../models/Service.js";

const router = express.Router();


/**
 * @swagger
 * tags:
 *   name: Services
 *   description: จัดการข้อมูลประเภทบริการของระบบ
 */

/**
 * @swagger
 * /service:
 *   get:
 *     summary: ดึงรายการบริการทั้งหมดที่เปิดใช้งาน (active)
 *     tags: [Services]
 *     description: ใช้สำหรับดึงรายการบริการทั้งหมดที่สถานะ active = true เช่น ล้างแอร์ ติดตั้งแอร์ เป็นต้น
 *     responses:
 *       200:
 *         description: คืนค่ารายการบริการทั้งหมด
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: "64f123abc4567890def00012"
 *                   name:
 *                     type: string
 *                     example: "ล้างแอร์"
 *                   description:
 *                     type: string
 *                     example: "บริการล้างเครื่องปรับอากาศ พร้อมตรวจเช็คสภาพเบื้องต้น"
 *                   price:
 *                     type: number
 *                     example: 500
 *                   active:
 *                     type: boolean
 *                     example: true
 *       500:
 *         description: เกิดข้อผิดพลาดในการดึงข้อมูลบริการ
 */
// ดึงบริการทั้งหมด (ที่ active)
router.get("/", async (req, res) => {
  try {
    const services = await Service.find({ active: true });
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลบริการ" });
  }
});

export default router;
