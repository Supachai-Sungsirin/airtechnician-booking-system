// middleware/auth.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// 1. Authentication Middleware
export const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Unauthorized / ไม่มี Token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role } หรือข้อมูลอื่น ๆ ที่ใส่ใน token
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token / Token ไม่ถูกต้อง" });
  }
};


// 2. Role-based Authorization Middleware 
export const roleAuth = (...roles) => {
  return (req, res, next) => {
    // ต้องแน่ใจว่า req.user มีอยู่แล้วจากการเรียกใช้ 'auth' ก่อนหน้านี้
    if (!req.user || !roles.includes(req.user.role)) { 
      return res.status(403).json({ message: "Forbidden / สิทธิ์ไม่เพียงพอ" });
    }
    next();
  };
};


// 3. Admin Authorization Middleware
// ตรวจสอบสิทธิ์ Admin โดยการดึงข้อมูลจากฐานข้อมูลเพื่อยืนยัน role ล่าสุด
export const isAdmin = async (req, res, next) => {
  // ต้องแน่ใจว่า req.user มีอยู่แล้วจากการเรียกใช้ 'auth' ก่อนหน้านี้
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: "Unauthorized / ข้อมูลผู้ใช้ไม่สมบูรณ์" });
  }
  
  try {
    const user = await User.findById(req.user.id); // ดึงข้อมูลจาก DB

    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden / สิทธิ์ไม่เพียงพอ (ไม่ใช่ Admin)" });
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error / เกิดข้อผิดพลาด" });
  }
};