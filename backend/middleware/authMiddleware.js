import jwt from "jsonwebtoken";
import User from "../models/User.js";

// ตรวจ Token
export const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "ไม่มี Token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token ไม่ถูกต้อง" });
  }
};

// เช็ค Admin
export const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "สิทธิ์ไม่เพียงพอ" });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
};

