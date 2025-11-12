import express from 'express'
import { auth, roleAuth } from '../middleware/authMiddleware.js'
import {
  getAssignedBookings,
  acceptBooking,
  updateTechnicianProfile,
  getMyReviews,
  completeBooking,
  rejectBooking,
  getTechnicianProfile,
  uploadBookingPhotos,
  deleteBookingPhoto,
  setOnTheWay,
  setWorking,
} from '../controllers/technicianController.js'
import { upload } from '../controllers/uploadController.js'

const router = express.Router()

/**
 * @swagger
 * tags:
 *   name: Technician
 *   description: API สำหรับช่าง (Technician) ใช้จัดการงานที่ได้รับมอบหมายและโปรไฟล์ส่วนตัว
*/

/**
 * @swagger
 * /technicians/bookings:
 *   get:
 *     summary: ดึงรายการจองที่ได้รับมอบหมายของช่าง
 *     tags: [Technician]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: คืนค่ารายการจองทั้งหมดของช่างที่ได้รับมอบหมาย
*/
router.get('/bookings', auth, roleAuth('technician'), getAssignedBookings)

/**
 * @swagger
 * /technicians/bookings/{id}/accept:
 *   put:
 *     summary: ช่างยอมรับการจองงาน
 *     tags: [Technician]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: รหัสของการจองงาน
 *     responses:
 *       200:
 *         description: ยอมรับงานสำเร็จ
*/
router.put('/bookings/:id/accept', auth, roleAuth('technician'), acceptBooking)

/**
 * @swagger
 * /technicians/bookings/{id}/on-the-way:
 *   patch:
 *     summary: ตั้งสถานะงานเป็น "กำลังเดินทาง"
 *     tags: [Technician]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: รหัสของการจองงาน
 *     responses:
 *       200:
 *         description: ตั้งสถานะกำลังเดินทางสำเร็จ
*/
router.patch(
  '/bookings/:id/on-the-way',
  auth,
  roleAuth('technician'),
  setOnTheWay
)

/**
 * @swagger
 * /technicians/bookings/{id}/start-work:
 *   patch:
 *     summary: ตั้งสถานะงานเป็น "เริ่มทำงาน"
 *     tags: [Technician]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: รหัสของการจองงาน
 *     responses:
 *       200:
 *         description: ตั้งสถานะเริ่มทำงานสำเร็จ
*/
router.patch(
  '/bookings/:id/start-work',
  auth,
  roleAuth('technician'),
  setWorking
)

/**
 * @swagger
 * /technicians/bookings/{id}/complete:
 *   patch:
 *     summary: ปิดงาน (Complete Booking)
 *     description: >
 *       ใช้สำหรับให้ช่างทำการ **ปิดงานหลังจากเริ่มทำงานแล้ว (working)**  
 *       ระบบจะตรวจสอบราคา, โน้ตสรุปงาน และอัปเดตสถานะงานเป็น `completed`  
 *       โดยช่างต้องล็อกอินและมี role = technician เท่านั้น
 *     tags: [Technician]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: รหัสของการจองงาน (Booking ID)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - technicianNotes
 *               - finalPrice
 *             properties:
 *               technicianNotes:
 *                 type: string
 *                 description: โน้ตสรุปงานของช่าง (จำเป็นต้องกรอก)
 *                 example: "ทำความสะอาดเรียบร้อย เปลี่ยนอะไหล่เล็กน้อย"
 *               finalPrice:
 *                 type: number
 *                 description: ราคาสุทธิหลังจากทำงานเสร็จ (ต้องไม่ต่ำกว่าราคาประเมิน)
 *                 example: 1200
 *     responses:
 *       200:
 *         description: ปิดงานสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: ปิดงานเรียบร้อย
 *                 booking:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 64d3a1b4f9f4a20012e3b111
 *                     status:
 *                       type: string
 *                       example: completed
 *                     finalPrice:
 *                       type: number
 *                       example: 1200
 *                     technicianNotes:
 *                       type: string
 *                       example: ทำความสะอาดเรียบร้อย
 *                     completedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-11-12T15:42:31.123Z"
 *       400:
 *         description: ข้อมูลไม่ถูกต้อง
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: กรุณากรอกโน้ตสรุปงาน
 *       404:
 *         description: ไม่พบงาน
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: ไม่พบงาน
 *       500:
 *         description: เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Server error
 */
router.patch(
  '/bookings/:id/complete',
  auth,
  roleAuth('technician'),
  completeBooking
)


/**
 * @swagger
 * /technicians/bookings/{id}/reject:
 *   patch:
 *     summary: ปฏิเสธงานที่ได้รับ
 *     tags: [Technician]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: รหัสของการจองงาน
 *     responses:
 *       200:
 *         description: ปฏิเสธงานสำเร็จ
 */
 router.patch(
  '/bookings/:id/reject',
  auth,
  roleAuth('technician'),
  rejectBooking
)

/**
 * @swagger
 * /technicians/bookings/{id}/upload:
 *   post:
 *     summary: อัปโหลดรูปภาพประกอบงาน
 *     tags: [Technician]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: รหัสของการจองงาน
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: อัปโหลดรูปภาพสำเร็จ
 */
router.post(
  '/bookings/:id/upload',
  auth,
  roleAuth('technician'),
  upload.array('photos', 5),
  uploadBookingPhotos
)

/**
 * @swagger
 * /technicians/bookings/{id}/delete-photo:
 *   patch:
 *     summary: ลบรูปภาพประกอบงาน
 *     tags: [Technician]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: รหัสของการจองงาน
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               photoUrl:
 *                 type: string
 *                 description: URL ของรูปภาพที่จะลบ
 *     responses:
 *       200:
 *         description: ลบรูปภาพเรียบร้อย
 */
router.patch(
  '/bookings/:id/delete-photo',
  auth,
  roleAuth('technician'),
  deleteBookingPhoto
)

/**
 * @swagger
 * /technicians/profile:
 *   get:
 *     summary: ดูข้อมูลโปรไฟล์ของช่าง
 *     tags: [Technician]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: ข้อมูลโปรไฟล์ของช่าง
 *   put:
 *     summary: แก้ไขข้อมูลโปรไฟล์ของช่าง
 *     tags: [Technician]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: นายสมชาย ช่างเย็น
 *               phone:
 *                 type: string
 *                 example: '0812345678'
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *                   example: ล้างแอร์
 *     responses:
 *       200:
 *         description: แก้ไขข้อมูลโปรไฟล์สำเร็จ
 */
router.get('/profile', auth, roleAuth('technician'), getTechnicianProfile)
router.put('/profile', auth, roleAuth('technician'), updateTechnicianProfile)

/**
 * @swagger
 * /technicians/reviews:
 *   get:
 *     summary: ดูรีวิวทั้งหมดของช่าง
 *     tags: [Technician]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: คืนค่ารายการรีวิวทั้งหมดของช่าง
 */
router.get('/reviews', auth, roleAuth('technician'), getMyReviews)

export default router
