// controllers/adminController.js
import Technician from "../models/Technician.js";
import Service from "../models/Service.js";
import User from "../models/User.js";

// เพิ่ม Admin ใหม่
export const addAdmin = async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;

    if (!fullName || !email || !password) {
      return res
        .status(400)
        .json({ message: "กรุณากรอกชื่อ, อีเมล, และรหัสผ่าน" });
    }

    // ตรวจสอบว่า email มีแล้วหรือยัง
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email นี้ถูกใช้งานแล้ว" });
    }

    // hash password
    const bcrypt = await import("bcrypt");
    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new User({
      fullName,
      email,
      password: hashedPassword,
      phone: phone || "",
      role: "admin",
      createdAt: new Date(),
    });

    await newAdmin.save();

    res.status(201).json({
      message: "สร้าง Admin สำเร็จ",
      admin: {
        id: newAdmin._id,
        fullName: newAdmin.fullName,
        email: newAdmin.email,
      },
    });
  } catch (error) {
    console.error("Add admin error:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในระบบ" });
  }
};

// อัปเดตสถานะช่าง (approve / reject)
export const updateTechnicianStatus = async (req, res) => {
  try {
    const technicianId = req.params.id;
    const { status, rejectReason } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "สถานะไม่ถูกต้อง" });
    }

    const technician = await Technician.findById(technicianId);
    if (!technician) {
      return res.status(404).json({ message: "ไม่พบข้อมูลช่าง" });
    }

    technician.status = status;
    technician.rejectReason = status === "rejected" ? rejectReason : "";
    await technician.save();

    res.json({
      message: status === "approved" 
        ? "อนุมัติช่างสำเร็จ" 
        : "ปฏิเสธช่างสำเร็จ",
      technician: {
        id: technician._id,
        status: technician.status,
        rejectReason: technician.rejectReason
      }
    });
  } catch (error) {
    console.error("Update technician status error:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในระบบ" });
  }
};


// เพิ่มงานบริการใหม่
// controllers/adminController.js (ฟังก์ชัน addService ที่แก้ไข)

export const addService = async (req, res) => {
  try {
    // 1. รับค่าเฉพาะ name, description, และ options (นำ price ออกไป)
    const { name, description, options } = req.body; // 2. แก้ไขเงื่อนไขการตรวจสอบ เหลือเพียง name เท่านั้น

    if (!name) {
      return res.status(400).json({ message: "กรุณากรอกชื่อบริการ" });
    } // ตรวจสอบว่ามีบริการชื่อนี้แล้วหรือไม่

    const existingService = await Service.findOne({ name });
    if (existingService) {
      return res.status(400).json({ message: "บริการนี้มีอยู่แล้ว" });
    }

    const newService = new Service({
      name,
      description: description || "", // 3. นำ price ออกจากตรงนี้
      options: options || [], // ใช้ options ที่ส่งมา
      createdAt: new Date(),
    });

    await newService.save();

    res.status(201).json({
      message: "เพิ่มงานบริการสำเร็จ",
      service: newService,
    });
  } catch (error) {
    console.error("Add service error:", error); // Mongoose จะจัดการ Validation Error จาก 'options' และ 'btuRange' ให้เอง
    res.status(500).json({ message: "เกิดข้อผิดพลาดในระบบ" });
  }
};

// ดึงรายการบริการทั้งหมด
export const getServices = async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    res.json(services);
  } catch (error) {
    console.error("Get services error:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในระบบ" });
  }
};

// อัปเดตข้อมูลบริการ
export const updateService = async (req, res) => {
  try {
    const serviceId = req.params.id;
    const { name, description, options } = req.body;

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: "ไม่พบบริการ" });
    }

    if (name) service.name = name;
    if (description) service.description = description;

    // update options
    if (Array.isArray(options)) {
      options.forEach(opt => {
        const exist = service.options.id(opt._id);
        if (exist) {
          // update existing subdoc
          exist.btuRange = opt.btuRange ?? exist.btuRange;
          exist.price = opt.price ?? exist.price;
          exist.unit = opt.unit ?? exist.unit;
        } else {
          // push new option
          service.options.push(opt);
        }
      });
    }

    service.markModified("options");
    await service.save();

    res.json({ message: "อัปเดตบริการสำเร็จ", service });
  } catch (error) {
    console.error("Update service error:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในระบบ" });
  }
};


export const deleteService = async (req, res) => {
  try {
    const serviceId = req.params.id;

    const service = await Service.findByIdAndDelete(serviceId);
    if (!service) {
      return res.status(404).json({ message: "ไม่พบบริการ" });
    }

    res.json({ message: "ลบบริการสำเร็จ" });
  } catch (error) {
    console.error("Delete service error:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในระบบ" });
  }
};
