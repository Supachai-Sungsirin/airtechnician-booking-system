import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Technician from "../models/Technician.js";

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
      selfieWithIdCard,
      district,
      serviceArea,
      bio,
      services,
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email นี้ถูกใช้งานแล้ว" });
    } // **ตรวจสอบข้อมูลที่จำเป็นทั้งหมด**

    if (
      !email ||
      !password ||
      !fullName ||
      !address ||
      !province ||
      !postalCode
    ) {
      return res
        .status(400)
        .json({ message: "กรุณากรอกข้อมูลส่วนตัว (รวมถึงที่อยู่) ให้ครบถ้วน" });
    } // การตรวจสอบเฉพาะทาง
    if (!district)
      return res.status(400).json({ message: "กรุณาระบุเขตที่พักอาศัย" });
    if (
      !serviceArea ||
      !Array.isArray(serviceArea) ||
      serviceArea.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "กรุณาระบุเขตที่ให้บริการ (อย่างน้อย 1 เขต)" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password: hashedPassword,
      fullName,
      phone,
      address,
      province,
      postalCode,
      district: district,
      role: "technician",
    });

    // 1. บันทึก User
    const savedUser = await newUser.save();

    // 2. บันทึก Technician (อยู่ภายใน try/catch ภายใน)
    try {
      const newTechnician = new Technician({
        userId: savedUser._id,
        idCard,
        selfieWithIdCard,
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
          userId: savedUser._id,
          email: savedUser.email,
          status: newTechnician.status,
        },
      });
    } catch (techError) {
      // !!! ROLLBACK: หาก Technician บันทึกล้มเหลว ให้ลบ User ที่สร้างไปแล้วทิ้ง !!!
      await User.findByIdAndDelete(savedUser._id);

      console.error(
        " Error in registerTechnician (Technician save failed, User rolled back):",
        techError
      );

      // ตรวจสอบว่าเป็น Validation Error จาก Technician Model หรือไม่
      if (techError.name === "ValidationError") {
        return res.status(400).json({
          message:
            "ข้อมูลช่างเทคนิคไม่ถูกต้อง (กรุณาตรวจสอบข้อมูล Services หรือ ID Card)",
          error: techError.message,
        });
      }

      res.status(500).json({ message: "เกิดข้อผิดพลาดในการบันทึกข้อมูลช่าง" });
    }
  } catch (error) {
    // Catch สำหรับ Error ทั่วไป (เช่น User.save() ล้มเหลวจาก Mongoose Validation อื่นๆ)
    console.error(" Error in registerTechnician:", error);
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
