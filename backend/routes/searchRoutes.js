import express from "express"
import { searchTechnicians } from "../controllers/searchController.js"

const router = express.Router()

/**
 * @swagger
 * tags:
 *   name: Search
 *   description: ค้นหาช่างตามเขตและประเภทบริการ
 */

/**
 * @swagger
 * /search/technicians:
 *   get:
 *     summary: ค้นหาช่างที่มีเขตและบริการตรงกัน
 *     tags: [Search]
 *     description: ใช้สำหรับค้นหาช่างแอร์ที่ให้บริการในเขตที่ลูกค้าเลือก และรองรับบริการที่ระบุ
 *     parameters:
 *       - in: query
 *         name: district
 *         required: true
 *         schema:
 *           type: string
 *         description: เขตที่ต้องการค้นหา
 *         example: "บางกะปิ"
 *       - in: query
 *         name: serviceIds
 *         required: true
 *         schema:
 *           type: string
 *         description: รายการรหัสบริการ (คั่นด้วยเครื่องหมายจุลภาค)
 *         example: "64f123abc4567890def00012,64f123abc4567890def00013"
 *     responses:
 *       200:
 *         description: คืนค่ารายชื่อช่างที่ตรงกับเงื่อนไข
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: "64f123abc4567890def99999"
 *                   fullName:
 *                     type: string
 *                     example: "นายสมชาย แอร์ดี"
 *                   district:
 *                     type: string
 *                     example: "บางกะปิ"
 *                   services:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["ล้างแอร์", "ซ่อมแอร์"]
 *                   averageRating:
 *                     type: number
 *                     example: 4.7
 *       400:
 *         description: พารามิเตอร์ไม่ครบหรือไม่ถูกต้อง
 *       404:
 *         description: ไม่พบช่างในเขตหรือบริการที่ระบุ
 */
router.get("/technicians", searchTechnicians)

export default router
