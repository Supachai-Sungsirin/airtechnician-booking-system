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
  getAllBookings,
  deleteUser
} from "../controllers/adminController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: API สำหรับจัดการระบบหลังบ้าน (Admin Management)
 */

/**
 * @swagger
 * /admin/dashboard/stats:
 *   get:
 *     summary: ดึงข้อมูลสถิติใน Dashboard
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: ดึงข้อมูลสำเร็จ
 *       401:
 *         description: Unauthorized / ไม่มี Token หรือ Token หมดอายุ
 *       403:
 *         description: Forbidden / ไม่ใช่ Admin
 */
router.get("/dashboard/stats", auth, isAdmin, getDashboardStats);

/**
 * @swagger
 * /admin/add-admin:
 *   post:
 *     summary: เพิ่มแอดมินใหม่
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: เพิ่มแอดมินสำเร็จ
 */
router.post("/add-admin", auth, isAdmin, addAdmin);

/**
 * @swagger
 * /admin/admins:
 *   get:
 *     summary: ดึงข้อมูลแอดมินทั้งหมด
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: ดึงข้อมูลสำเร็จ
 */
router.get("/admins", auth, isAdmin, getAllAdmins);

/**
 * @swagger
 * /admin/user/{id}:
 *   delete:
 *     summary: ลบผู้ใช้ตาม ID
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: รหัสผู้ใช้
 *     responses:
 *       200:
 *         description: ลบผู้ใช้สำเร็จ
 */
router.delete("/user/:id", auth, isAdmin, deleteUser);

/**
 * @swagger
 * /admin/technicians/{id}:
 *   put:
 *     summary: อัปเดตสถานะการอนุมัติของช่าง
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
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
 *                 example: approved
 *     responses:
 *       200:
 *         description: อัปเดตสำเร็จ
 */
router.put("/technicians/:id", auth, isAdmin, updateTechnicianStatus);

/**
 * @swagger
 * /admin/technicians/pending:
 *   get:
 *     summary: ดึงข้อมูลช่างที่รออนุมัติ
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: ดึงข้อมูลสำเร็จ
 */
router.get("/technicians/pending", auth, isAdmin, getPendingTechnicians);

/**
 * @swagger
 * /admin/technicians:
 *   get:
 *     summary: ดึงข้อมูลช่างทั้งหมด
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: ดึงข้อมูลสำเร็จ
 */
router.get("/technicians", auth, isAdmin, getAllTechnicians);

/**
 * @swagger
 * /admin/technician/{id}:
 *   patch:
 *     summary: อัปเดตข้อมูลช่าง (บริการหรือพื้นที่บริการ)
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               services:
 *                 type: array
 *                 items:
 *                   type: string
 *               area:
 *                 type: string
 *     responses:
 *       200:
 *         description: อัปเดตสำเร็จ
 */
router.patch("/technician/:id", auth, isAdmin, updateTechnicianInfo);

/**
 * @swagger
 * /admin/customers:
 *   get:
 *     summary: ดึงข้อมูลลูกค้าทั้งหมด
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: ดึงข้อมูลสำเร็จ
 */
router.get("/customers", auth, isAdmin, getAllCustomers);

/**
 * @swagger
 * /admin/user/{id}:
 *   get:
 *     summary: ดึงข้อมูลผู้ใช้ตาม ID
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: ดึงข้อมูลสำเร็จ
 */
router.get("/user/:id", auth, isAdmin, getUserDetail);

/**
 * @swagger
 * /admin/user/{id}:
 *   patch:
 *     summary: อัปเดตข้อมูลผู้ใช้
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: อัปเดตสำเร็จ
 */
router.patch("/user/:id", auth, isAdmin, updateUser);

/**
 * @swagger
 * /admin/services:
 *   post:
 *     summary: เพิ่มบริการใหม่
 *     tags: [Admin]
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
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       201:
 *         description: เพิ่มบริการสำเร็จ
 */
router.post("/services", auth, isAdmin, addService);

/**
 * @swagger
 * /admin/services:
 *   get:
 *     summary: ดึงบริการทั้งหมด
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: ดึงข้อมูลสำเร็จ
 */
router.get("/services", auth, isAdmin, getServices);

/**
 * @swagger
 * /admin/services/{id}:
 *   put:
 *     summary: อัปเดตข้อมูลบริการ
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: อัปเดตสำเร็จ
 */
router.put("/services/:id", auth, isAdmin, updateService);

/**
 * @swagger
 * /admin/services/{id}:
 *   delete:
 *     summary: ลบบริการ
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: ลบสำเร็จ
 */
router.delete("/services/:id", auth, isAdmin, deleteService);

/**
 * @swagger
 * /admin/bookings:
 *   get:
 *     summary: ดึงข้อมูลการจองทั้งหมด
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: ดึงข้อมูลสำเร็จ
 */
router.get("/bookings", auth, isAdmin, getAllBookings);

export default router;
