import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { registerCustomer, registerTechnician, login, getMe, getAvailableServices, updateMyProfile, uploadProfilePicture, googleAuthCallback } from "../controllers/authController.js";
import { auth } from "../middleware/authMiddleware.js";
import { upload } from "../controllers/uploadController.js";

const router = express.Router();

// 1. เริ่มต้น Google Auth (Redirect ไปที่ Google)
router.get(
    "/google", 
    passport.authenticate("google", { scope: ["profile", "email"] })
);

// 2. Google Callback (รับ Response จาก Google)
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

// สมัคร Customer
router.post("/register/customer", registerCustomer);

// ดึงรายการบริการที่มีอยู่
router.get("/services", getAvailableServices);
// สมัคร Technician
router.post("/register/technician", registerTechnician);

// เข้าสู่ระบบ
router.post("/login", login);

// [ใหม่] Protected route สำหรับดึงข้อมูลผู้ใช้ปัจจุบัน
// ต้องผ่าน auth middleware ก่อน เพื่อให้ req.user มีข้อมูล
router.get("/me", auth, getMe);

// PUT /auth/me
router.put('/me', auth, updateMyProfile)


// PUT /auth/profile-picture
router.put(
    "/profile-picture", 
    auth,                     // 1. ต้องล็อกอิน
    upload.single("file"),    // 2. ใช้ Multer รับไฟล์ชื่อ "file"
    uploadProfilePicture      // 3. เรียก Controller
);


export default router;
