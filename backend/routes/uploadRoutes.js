import express from 'express'
import { upload, uploadImage } from '../controllers/uploadController.js'

const router = express.Router()

/**
 * @swagger
 * tags:
 *   name: Upload
 *   description: API สำหรับอัปโหลดไฟล์หรือรูปภาพ (ใช้ Cloudinary)
 */

/**
 * @swagger
 * /upload/image:
 *   post:
 *     summary: อัปโหลดรูปภาพไปยัง Cloudinary
 *     description: ใช้สำหรับอัปโหลดรูปภาพของช่าง เช่น เอกสารยืนยันตัวตน หรือภาพอื่น ๆ โดยจะอัปโหลดเข้าสู่โฟลเดอร์ `technician_verification` บน Cloudinary
 *     tags: [Upload]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: ไฟล์ภาพที่ต้องการอัปโหลด
 *     responses:
 *       200:
 *         description: อัปโหลดสำเร็จ
 *         content:
 *           application/json:
 *             example:
 *               message: "อัปโหลดสำเร็จ"
 *               imageUrl: "https://res.cloudinary.com/demo/image/upload/v1234567/technician_verification/photo.jpg"
 *       400:
 *         description: ไม่พบไฟล์ในคำขอ
 *         content:
 *           application/json:
 *             example:
 *               message: "กรุณาเลือกไฟล์"
 *       500:
 *         description: เกิดข้อผิดพลาดจากเซิร์ฟเวอร์
 *         content:
 *           application/json:
 *             example:
 *               message: "อัปโหลดล้มเหลว"
 */
router.post('/image', upload.single('file'), uploadImage)

export default router