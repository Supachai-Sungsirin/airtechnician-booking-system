// controllers/adminController.js
import Technician from "../models/Technician.js";
import Service from "../models/Service.js";
import User from "../models/User.js";
import Booking from "../models/Booking.js";

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
      message: status === "approved" ? "อนุมัติช่างสำเร็จ" : "ปฏิเสธช่างสำเร็จ",
      technician: {
        id: technician._id,
        status: technician.status,
        rejectReason: technician.rejectReason,
      },
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
    } // 1. อัปเดตฟิลด์ทั่วไป

    if (name) service.name = name;
    if (description) service.description = description;

    // **ส่วนนี้ถูกต้องแล้วสำหรับการแทนที่อาร์เรย์ทั้งหมด:**
    if (Array.isArray(options)) {
      service.options = options;
    } else if (options === null || options === undefined) {
      // หาก Frontend ไม่ได้ส่ง options มา อาจหมายถึงต้องการลบทั้งหมด
      service.options = [];
    }

    await service.save();

    res.json({ message: "อัปเดตบริการสำเร็จ", service });
  } catch (error) {

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      console.error("Mongoose Validation Error:", messages);
      return res.status(400).json({
        message:
          "ข้อมูลไม่ถูกต้อง (Mongoose Validation): " + messages.join(", "),
      });
    }

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

// ดึงสถิติภาพรวมสำหรับแดชบอร์ด
export const getDashboardStats = async (req, res) => {
  try {
    const totalCustomers = await User.countDocuments({ role: "customer" });
    const totalTechnicians = await User.countDocuments({ role: "technician" });

    const pendingTechnicians = await Technician.countDocuments({
      status: "pending",
    });
    const approvedTechnicians = await Technician.countDocuments({
      status: "approved",
    });

    const totalBookings = await Booking.countDocuments();
    const completedBookings = await Booking.countDocuments({
      status: "completed",
    });
    const cancelledBookings = await Booking.countDocuments({
      status: "cancelled",
    });

    const servicesCount = await Service.countDocuments();

    // Top 5 technicians by rating
    const topTechnicians = await Technician.find({ status: "approved" })
      .sort({ rating: -1, totalReviews: -1 })
      .limit(5)
      .select("userId rating totalReviews")
      .populate("userId", "fullName email");

    res.json({
      success: true,
      data: {
        users: {
          totalCustomers,
          totalTechnicians,
          pendingTechnicians,
          approvedTechnicians,
        },
        bookings: {
          totalBookings,
          completedBookings,
          cancelledBookings,
        },
        services: servicesCount,
        topTechnicians,
      },
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในระบบ" });
  }
};

// ดึงรายการช่างที่รออนุมัติทั้งหมด (status: pending)
export const getPendingTechnicians = async (req, res) => {
  try {
    // ดึงข้อมูลช่างจาก Technician model ที่มีสถานะเป็น 'pending'
    // อาจต้อง populate ข้อมูล User (ชื่อ, อีเมล, เบอร์โทร) เข้ามาด้วย
    const pendingTechnicians = await Technician.find({ status: "pending" })
      .populate("userId", "fullName email phone") // สมมติว่า Technician model มี field ชื่อ userId
      .sort({ createdAt: 1 });

    // จัดรูปแบบข้อมูลให้เหมือนกับที่ Frontend คาดหวัง
    const formattedTechnicians = pendingTechnicians.map((tech) => ({
      id: tech._id,
      name: tech.userId ? tech.userId.fullName : "N/A",
      email: tech.userId ? tech.userId.email : "N/A",
      phone: tech.userId ? tech.userId.phone : "N/A",
      idCard: tech.idCard,
      service: tech.services,
      serviceArea: tech.serviceArea,
      bio: tech.bio,
      selfieWithIdCard: tech.selfieWithIdCard,
    }));

    res.json(formattedTechnicians);
  } catch (error) {
    console.error("Get pending technicians error:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลช่าง" });
  }
};

// ดึงรายชื่อลูกค้าทั้งหมด
export const getAllCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: "customer" }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: customers
    });
  } catch (error) {
    console.error("Get customers error:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
};

// ดึงรายชื่อแอดมินทั้งหมด
export const getAllAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: "admin" }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: admins
    });
  } catch (error) {
    console.error("Get admins error:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
};

// ดึงรายชื่อช่างทั้งหมด
export const getAllTechnicians = async (req, res) => {
  try {
    const technicians = await Technician.find()
      .populate("userId", "fullName email phone address district province postalCode createdAt")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: technicians
    });
  } catch (error) {
    console.error("Get technicians error:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
};

// ดึงข้อมูล user ตามid (ลูกค้า / ช่าง / แอดมิน)
export const getUserDetail = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: "ไม่พบผู้ใช้" });

    let technician = null;

    if (user.role === "technician") {
      technician = await Technician.findOne({ userId: user._id });
    }

    res.json({
      success: true,
      data: { user, technician }
    });
  } catch (error) {
    console.error("Get user detail error:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
};

// อัปเดตข้อมูล user
export const updateUser = async (req, res) => {
  try {
    const fields = ["fullName","phone","address","district","province","postalCode"];
    const updateData = {};

    fields.forEach((field) => {
      if (req.body[field]) updateData[field] = req.body[field];
    });

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json({
      success: true,
      message: "อัปเดตข้อมูลสำเร็จ",
      data: updatedUser
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
};

// สำหรับช่าง (แก้ข้อมูล technician เพิ่ม)
export const updateTechnicianInfo = async (req, res) => {
  try {
    const technician = await Technician.findById(req.params.id);
    if (!technician) return res.status(404).json({ message: "ไม่พบข้อมูลช่าง" });

    if (req.body.serviceArea) technician.serviceArea = req.body.serviceArea;
    if (req.body.services) technician.services = req.body.services;
    if (req.body.bio) technician.bio = req.body.bio;

    await technician.save();

    res.json({
      success: true,
      message: "อัปเดตข้อมูลช่างสำเร็จ",
      data: technician
    });

  } catch (error) {
    console.error("Update technician error:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
};
