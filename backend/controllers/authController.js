import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Technician from "../models/Technician.js";
import cloudinary from "../config/cloudinary.js";

// สมัครสมาชิก Customer
export const registerCustomer = async (req, res) => {
  try {
    const {
      email,
      password,
      fullName,
      phone,
      address,
      district,
      province,
      postalCode,
    } = req.body;

    if (!district) {
      return res.status(400).json({ message: "กรุณาระบุเขต (district)" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email นี้ถูกใช้งานแล้ว" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password: hashedPassword,
      fullName,
      phone,
      address,
      district,
      province: province || "Bangkok", // ค่า default
      postalCode,
      role: "customer",
    });

    await newUser.save();

    res.status(201).json({
      message: "สมัครสมาชิกสำเร็จ (Customer)",
      user: {
        id: newUser._id,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error(" Error in registerCustomer:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในระบบ" });
  }
};

// สมัครสมาชิก Technician
export const registerTechnician = async (req, res) => {
  try {
    const {
      email,
      password,
      fullName,
      phone,
      address,
      province,
      postalCode,
      idCard,
      selfieWithIdCard, // <-- Base64 มาจาก frontend
      district,
      serviceArea,
      bio,
      services,
    } = req.body;

    // ตรวจสอบ email ซ้ำ
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email นี้ถูกใช้งานแล้ว" });
    }

    if (!email || !password || !fullName || !address || !province || !postalCode)
      return res.status(400).json({ message: "กรุณากรอกข้อมูลส่วนตัวให้ครบถ้วน" });

    if (!district)
      return res.status(400).json({ message: "กรุณาระบุเขตที่พักอาศัย" });

    if (!serviceArea || !Array.isArray(serviceArea) || serviceArea.length === 0)
      return res.status(400).json({ message: "กรุณาระบุเขตที่ให้บริการ" });

    // 1. เข้ารหัสรหัสผ่าน
    const hashedPassword = await bcrypt.hash(password, 10);

    // 2. อัปโหลดภาพขึ้น Cloudinary (ถ้ามี)
    let selfieUrl = "";
    if (selfieWithIdCard) {
      const uploadResponse = await cloudinary.uploader.upload(selfieWithIdCard, {
        folder: "technician_verification",
      });
      selfieUrl = uploadResponse.secure_url;
    }

    // 3. สร้าง User
    const newUser = new User({
      email,
      password: hashedPassword,
      fullName,
      phone,
      address,
      province,
      postalCode,
      district,
      role: "technician",
    });

    const savedUser = await newUser.save();

    // 4. สร้าง Technician พร้อมเก็บ URL ของภาพ
    const newTechnician = new Technician({
      userId: savedUser._id,
      idCard,
      selfieWithIdCard: selfieUrl, // <-- เก็บ URL จาก Cloud
      serviceArea,
      bio,
      services,
      status: "pending",
    });

    await newTechnician.save();

    res.status(201).json({
      message: "สมัครสมาชิกสำเร็จ (Technician - รออนุมัติ)",
      technician: {
        id: newTechnician._id,
        email: savedUser.email,
        selfieUrl,
        status: newTechnician.status,
      },
    });
  } catch (error) {
    console.error("Error in registerTechnician:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในระบบ" });
  }
};


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "ไม่พบผู้ใช้งาน" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "รหัสผ่านไม่ถูกต้อง" });

    // ถ้าเป็น Technician ให้เช็คสถานะก่อน
    if (user.role === "technician") {
      const technician = await Technician.findOne({ userId: user._id });
      if (!technician) {
        return res.status(400).json({ message: "ไม่พบข้อมูลช่าง" });
      }
      if (technician.status !== "approved") {
        return res.status(403).json({ message: "บัญชียังไม่ผ่านการอนุมัติ" });
      }
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "เข้าสู่ระบบสำเร็จ",
      accessToken: token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        district: user.district,
        province: user.province,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในระบบ" });
  }
};

export const getMe = async (req, res) => {
    try {
        // req.user ถูกตั้งค่าโดย auth middleware ของคุณ
        // จาก middleware: req.user = { id: user._id, role: user.role }
        const user = await User.findById(req.user.id).select('-password'); // ไม่ส่ง password กลับไปด้วย
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user); // ส่งข้อมูลผู้ใช้ทั้งหมดกลับไป
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({ message: 'Server error' });
    }
};