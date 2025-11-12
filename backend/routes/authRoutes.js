import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import {
  registerCustomer,
  registerTechnician,
  login,
  getMe,
  getAvailableServices,
  updateMyProfile,
  uploadProfilePicture,
  googleAuthCallback
} from "../controllers/authController.js";
import { auth } from "../middleware/authMiddleware.js";
import { upload } from "../controllers/uploadController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: API สำหรับจัดการการเข้าสู่ระบบ การสมัครสมาชิก และ Google OAuth
 */

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Login ด้วย Google OAuth
 *     description: |
 *       เมื่อเรียก URL นี้ จะ redirect ไปที่ Google login page.
 *       หลังจาก login เสร็จ ระบบจะ redirect กลับไปยัง:
 *       `http://localhost:5173/auth/callback?token=<JWT>&role=<role>`
 *     tags: [Authentication]
 *     responses:
 *       302:
 *         description: Redirect ไป Google login
 */
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Google OAuth Callback
 *     description: |
 *       Endpoint นี้รับ response จาก Google หลังผู้ใช้ login.
 *       - สร้าง JWT token และ role ของผู้ใช้
 *       - redirect กลับ frontend ที่:
 *         `http://localhost:5173/auth/callback?token=<JWT>&role=<role>`
 *       - ถ้า login ไม่สำเร็จ จะ redirect กลับ:
 *         `http://localhost:5173/login?error=<message>`
 *     tags: [Authentication]
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         description: รหัส authorization จาก Google
 *       - in: query
 *         name: scope
 *         schema:
 *           type: string
 *         description: Scope ที่ผู้ใช้อนุญาต
 *     responses:
 *       302:
 *         description: Redirect ไป frontend พร้อม JWT token หรือ error message
 */
router.get(
  "/google/callback",
  (req, res, next) => {
    const FRONTEND_ORIGIN = "http://localhost:5173";

    passport.authenticate("google", { session: false }, (err, user, info) => {
      if (err) {
        return res.redirect(`${FRONTEND_ORIGIN}/login?error=Server Error`);
      }
      if (!user) {
        const errorMessage = info?.message ? encodeURIComponent(info.message) : encodeURIComponent("Authentication failed.");
        return res.redirect(`${FRONTEND_ORIGIN}/login?error=${errorMessage}`);
      }

      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      const role = user.role;
      const redirectUrl = `${FRONTEND_ORIGIN}/auth/callback?token=${token}&role=${role}`;

      return res.redirect(redirectUrl);
    })(req, res, next);
  }
);

/**
 * @swagger
 * /auth/register/customer:
 *   post:
 *     summary: สมัครสมาชิกประเภทลูกค้า (Customer)
 *     tags: [Authentication]
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
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               district:
 *                 type: string
 *               province:
 *                 type: string
 *               postalCode:
 *                 type: string
 *             required:
 *               - fullName
 *               - email
 *               - password
 *               - district
 *     responses:
 *       201:
 *         description: สมัครสมาชิกสำเร็จ
 *       400:
 *         description: ข้อมูลไม่ครบหรือ Email ซ้ำ
 *       500:
 *         description: เกิดข้อผิดพลาดในระบบ
 */
router.post("/register/customer", registerCustomer);

/**
 * @swagger
 * /auth/services:
 *   get:
 *     summary: ดึงรายการบริการทั้งหมด (ใช้ตอนสมัครช่าง)
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: ดึงรายการบริการสำเร็จ
 */
router.get("/services", getAvailableServices);

/**
 * @swagger
 * /auth/register/technician:
 *   post:
 *     summary: สมัครสมาชิกประเภทช่างแอร์ (Technician)
 *     tags: [Authentication]
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
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               district:
 *                 type: string
 *               province:
 *                 type: string
 *               postalCode:
 *                 type: string
 *               idCard:
 *                 type: string
 *               selfieWithIdCard:
 *                 type: string
 *               serviceArea:
 *                 type: array
 *                 items:
 *                   type: string
 *               bio:
 *                 type: string
 *               services:
 *                 type: array
 *                 items:
 *                   type: string
 *             required:
 *               - fullName
 *               - email
 *               - password
 *               - address
 *               - province
 *               - postalCode
 *               - district
 *               - serviceArea
 *               - services
 *     responses:
 *       201:
 *         description: สมัครช่างสำเร็จ (รออนุมัติ)
 *       400:
 *         description: ข้อมูลไม่ครบหรือมีค่าผิดพลาด
 *       500:
 *         description: เกิดข้อผิดพลาดในระบบ
 */
router.post("/register/technician", registerTechnician);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: เข้าสู่ระบบ (Email + Password)
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: เข้าสู่ระบบสำเร็จ (คืนค่า JWT token)
 */
router.post("/login", login);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: ดึงข้อมูลโปรไฟล์ของผู้ใช้ที่เข้าสู่ระบบ
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: ดึงข้อมูลสำเร็จ
 */
router.get("/me", auth, getMe);

/**
 * @swagger
 * /auth/me:
 *   put:
 *     summary: อัปเดตข้อมูลโปรไฟล์ของผู้ใช้
 *     tags: [Authentication]
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
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: อัปเดตโปรไฟล์สำเร็จ
 */
router.put("/me", auth, updateMyProfile);

/**
 * @swagger
 * /auth/profile-picture:
 *   put:
 *     summary: อัปโหลดรูปโปรไฟล์ใหม่
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
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
 *                 description: ไฟล์รูปภาพโปรไฟล์ใหม่
 *     responses:
 *       200:
 *         description: อัปโหลดรูปสำเร็จ
 */
router.put(
  "/profile-picture",
  auth,
  upload.single("file"),
  uploadProfilePicture
);

export default router;
