import express from "express";
import { auth } from "../middleware/authMiddleware.js";
import {
  createBooking,
  getCustomerBookings,
  getTechnicianBookings,
  getBookings,
  getBookingById,
  updateBookingStatus,
  checkAvailability,
  mockCompletePayment
} from "../controllers/bookingController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: จัดการข้อมูลการจอง (Booking)
 */

/**
 * @swagger
 * /booking:
 *   post:
 *     summary: ลูกค้าสร้างการจองใหม่
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - requestedDateTime
 *               - services
 *             properties:
 *               requestedDateTime:
 *                 type: string
 *                 format: date-time
 *                 description: วันและเวลาที่ต้องการให้ช่างมาบริการ
 *                 example: "2025-11-12T14:00:00Z"
 *               address:
 *                 type: string
 *                 description: ที่อยู่สำหรับติดตั้ง/บริการ
 *                 example: "123/45 ซอยรามอินทรา 39 แขวงอนุสาวรีย์"
 *               services:
 *                 type: array
 *                 description: รายการบริการและ option ที่เลือก
 *                 items:
 *                   type: object
 *                   required:
 *                     - serviceId
 *                   properties:
 *                     serviceId:
 *                       type: string
 *                       example: "64f123abc4567890def00012"
 *                     btuRange:
 *                       type: string
 *                       example: "9,000-12,000 BTU"
 *                     quantity:
 *                       type: number
 *                       example: 2
 *               problemDescription:
 *                 type: string
 *                 description: อธิบายปัญหาหรือรายละเอียดเพิ่มเติม
 *                 example: "แอร์ไม่เย็น"
 *               preferredTechnicianId:
 *                 type: string
 *                 description: (Optional) เลือกช่างเฉพาะที่ต้องการ
 *                 example: "64f123abc4567890def11111"
 *     responses:
 *       201:
 *         description: สร้างการจองสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Booking created successfully"
 *                 booking:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     customerId:
 *                       type: string
 *                     technicianId:
 *                       type: string
 *                     services:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           serviceId:
 *                             type: string
 *                           name:
 *                             type: string
 *                           btuRange:
 *                             type: string
 *                           quantity:
 *                             type: number
 *                           price:
 *                             type: number
 *                     requestedDateTime:
 *                       type: string
 *                       format: date-time
 *                     address:
 *                       type: string
 *                     district:
 *                       type: string
 *                     problemDescription:
 *                       type: string
 *                     totalPrice:
 *                       type: number
 *                     status:
 *                       type: string
 *                       example: "pending"
 *       400:
 *         description: ข้อมูลไม่ถูกต้อง เช่น ไม่เลือกบริการ หรือไม่มีเขตของลูกค้า
 *       401:
 *         description: ต้องเข้าสู่ระบบก่อน
 *       404:
 *         description: ไม่พบช่างตามที่เลือกหรือไม่มีช่างในเขต
 *       500:
 *         description: เกิดข้อผิดพลาดในการสร้างการจอง
 */
// ลูกค้าสร้าง Booking
router.post("/", auth, createBooking);

/**
 * @swagger
 * /booking/{id}/mock-pay:
 *   patch:
 *     summary: จำลองการชำระเงิน (mock payment) สำหรับการจอง
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: รหัสการจอง (Booking ID)
 *         schema:
 *           type: string
 *           example: "64f123abc4567890def33333"
 *     responses:
 *       200:
 *         description: ชำระเงินจำลองสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 customerId:
 *                   type: string
 *                 technicianId:
 *                   type: string
 *                 services:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       serviceId:
 *                         type: string
 *                       name:
 *                         type: string
 *                       btuRange:
 *                         type: string
 *                       quantity:
 *                         type: number
 *                       price:
 *                         type: number
 *                 requestedDateTime:
 *                   type: string
 *                   format: date-time
 *                 address:
 *                   type: string
 *                 district:
 *                   type: string
 *                 problemDescription:
 *                   type: string
 *                 totalPrice:
 *                   type: number
 *                 status:
 *                   type: string
 *                   example: "completed"
 *                 paymentStatus:
 *                   type: string
 *                   example: "paid"
 *       400:
 *         description: การจองยังไม่เสร็จ หรือถูกชำระเงินแล้ว
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึงการจองนี้
 *       404:
 *         description: ไม่พบข้อมูลการจอง
 *       500:
 *         description: เกิดข้อผิดพลาดจากเซิร์ฟเวอร์
 */
// PATCH /api/booking/:id/mock-pay
router.patch("/:id/mock-pay", auth, mockCompletePayment);

/**
 * @swagger
 * /booking/check-availability:
 *   get:
 *     summary: ตรวจสอบเวลาที่ช่างว่าง
 *     tags: [Bookings]
 *     description: คืนค่า available = true หากไม่มี booking ในช่วงเวลาที่ระบุ ±59 นาที
 *     parameters:
 *       - in: query
 *         name: dateTime
 *         schema:
 *           type: string
 *           format: date-time
 *         required: true
 *         description: วันและเวลาที่ต้องการตรวจสอบ เช่น "2025-11-15T14:00:00Z"
 *         example: "2025-11-15T14:00:00Z"
 *     responses:
 *       200:
 *         description: ผลลัพธ์ตรวจสอบความว่างของช่าง
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 available:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "เวลานี้สามารถจองได้"
 *       400:
 *         description: ไม่ได้ระบุวันและเวลา
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "กรุณาระบุวันและเวลา"
 *       500:
 *         description: เกิดข้อผิดพลาดในระบบ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "เกิดข้อผิดพลาดในระบบ"
 */
// ตรวจสอบช่างที่ว่าง
router.get("/check-availability", checkAvailability);

/**
 * @swagger
 * /booking/customer:
 *   get:
 *     summary: ดึงข้อมูลการจองของลูกค้า
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: รายการการจองของลูกค้า
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   customerId:
 *                     type: string
 *                   technicianId:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       userId:
 *                         type: object
 *                         properties:
 *                           fullName:
 *                             type: string
 *                           phone:
 *                             type: string
 *                           profileImageUrl:
 *                             type: string
 *                   services:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         serviceId:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                             name:
 *                               type: string
 *                             options:
 *                               type: array
 *                               items:
 *                                 type: object
 *                         btuRange:
 *                           type: string
 *                         quantity:
 *                           type: number
 *                         price:
 *                           type: number
 *                   requestedDateTime:
 *                     type: string
 *                     format: date-time
 *                   address:
 *                     type: string
 *                   district:
 *                     type: string
 *                   problemDescription:
 *                     type: string
 *                   totalPrice:
 *                     type: number
 *                   status:
 *                     type: string
 *                   paymentStatus:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: ต้องเข้าสู่ระบบก่อน
 *       500:
 *         description: เกิดข้อผิดพลาด
 */
// ดึง Booking ของลูกค้าและช่าง
router.get("/customer", auth, getCustomerBookings);

/**
 * @swagger
 * /booking/technician:
 *   get:
 *     summary: ดึงข้อมูลการจองของช่าง
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: รายการการจองของช่าง
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   customerId:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       fullName:
 *                         type: string
 *                       phone:
 *                         type: string
 *                       district:
 *                         type: string
 *                   technicianId:
 *                     type: string
 *                   services:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         serviceId:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                             name:
 *                               type: string
 *                             options:
 *                               type: array
 *                               items:
 *                                 type: object
 *                         btuRange:
 *                           type: string
 *                         quantity:
 *                           type: number
 *                         price:
 *                           type: number
 *                   requestedDateTime:
 *                     type: string
 *                     format: date-time
 *                   address:
 *                     type: string
 *                   district:
 *                     type: string
 *                   problemDescription:
 *                     type: string
 *                   totalPrice:
 *                     type: number
 *                   status:
 *                     type: string
 *                   paymentStatus:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: ต้องเข้าสู่ระบบก่อน
 *       500:
 *         description: เกิดข้อผิดพลาด
 */
router.get("/technician", auth, getTechnicianBookings);

/**
 * @swagger
 * /booking/{id}:
 *   get:
 *     summary: ดึงรายละเอียดการจองตาม ID
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: รหัสการจอง
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: ข้อมูลการจอง
 *       404:
 *         description: ไม่พบการจอง
 */
router.get("/:id", auth, getBookingById);

/**
 * @swagger
 * /booking/{id}/status:
 *   patch:
 *     summary: อัปเดตสถานะการจอง
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: รหัสการจอง
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, completed, cancelled]
 *                 example: "confirmed"
 *     responses:
 *       200:
 *         description: อัปเดตสถานะสำเร็จ
 *       400:
 *         description: สถานะไม่ถูกต้อง
 *       404:
 *         description: ไม่พบการจอง
 */
// อัพเดตสถานะ Booking
router.patch("/:id/status", auth, updateBookingStatus);

/**
 * @swagger
 * /booking:
 *   get:
 *     summary: ดึงรายการการจองทั้งหมด (สำหรับแอดมิน)
 *     tags: [Bookings]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: ดึงข้อมูลทั้งหมดสำเร็จ
 *       403:
 *         description: ไม่มีสิทธิ์เข้าถึง
 */
// (สำหรับ Admin)
router.get("/", auth, getBookings);

export default router;
