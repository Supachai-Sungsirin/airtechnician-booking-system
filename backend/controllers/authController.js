import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Technician from "../models/Technician.js";
import Services from "../models/Service.js";
import cloudinary from "../config/cloudinary.js";

// เข้าสู่ระบบด้วย Google OAuth
export const googleAuthCallback = async (req, res) => {
    // ในสถานการณ์จริง ข้อมูลนี้ (googleEmail, fullName) จะมาจาก Google API/Passport.js/Middleware
    // สำหรับการจำลอง เราสมมติว่ามีการส่ง email มาใน body
    const { googleEmail } = req.body; 

    if (!googleEmail) {
        return res.status(400).json({ message: "ไม่พบอีเมลจาก Google" });
    }

    try {
        // 1. ตรวจสอบว่าอีเมลนี้มีอยู่ในระบบหรือไม่
        const user = await User.findOne({ email: googleEmail });
        
        if (!user) {
            // กรณี: ไม่พบผู้ใช้ (ส่งกลับสถานะ 404 พร้อมข้อความแจ้งเตือน)
            return res.status(404).json({ 
                message: "ไม่พบอีเมลนี้ในระบบ กรุณาเข้าสู่ระบบด้วยรหัสผ่านหรือสมัครสมาชิกใหม่",
                googleEmail: googleEmail,
                action: "register_required"
            });
        }

        // 2. ถ้าเป็น Technician ให้เช็คสถานะการอนุมัติ (ตาม Logic เดิม)
        if (user.role === "technician") {
            const technician = await Technician.findOne({ userId: user._id });
            if (!technician) {
                return res.status(400).json({ message: "ไม่พบข้อมูลช่าง" });
            }
            if (technician.status !== "approved") {
                return res.status(403).json({ message: "บัญชีช่างนี้ยังไม่ผ่านการอนุมัติ" });
            }
        }
        
        // 3. สร้าง Token และทำการเข้าสู่ระบบ
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            message: "เข้าสู่ระบบด้วย Google สำเร็จ",
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
        console.error("Google Auth error:", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการตรวจสอบบัญชี" });
    }
};

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

// ดึงรายการบริการที่มีอยู่
export const getAvailableServices = async (req, res) => {
  try {
    const services = await Services.find({ active: true }).sort({ name: 1 }).select("_id name description options");
    res.json({
      success: true,
      data: services
    });
  } catch (error) {
    console.error("Get available services error:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลบริการ" });
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

    if (!services || !Array.isArray(services) || services.length === 0) {
        return res.status(400).json({ message: "กรุณาเลือกงานบริการที่ต้องการ" });
    }

    // ตรวจสอบว่า services ID ที่ส่งมามีอยู่จริงและเป็น ObjectId ที่ถูกต้อง
    const existingServices = await Services.find({
        _id: { $in: services }, // ตรวจสอบว่า ID เหล่านี้มีอยู่ใน Service Model หรือไม่
        active: true, // ตรวจสอบเฉพาะบริการที่เปิดใช้งานอยู่
    }).select('_id');

    if (existingServices.length !== services.length) {
        // หากจำนวน ID ที่พบไม่เท่ากับจำนวน ID ที่ส่งมา แสดงว่ามี ID ที่ไม่ถูกต้องหรือไม่มีอยู่ในระบบ
        return res.status(400).json({ message: "มีงานบริการที่เลือกไม่ถูกต้อง หรือไม่มีในระบบ" });
    }

    // 1. เข้ารหัสรหัสผ่าน
    const hashedPassword = await bcrypt.hash(password, 10);

    const selfieUrl = selfieWithIdCard;

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
      selfieWithIdCard: selfieUrl,
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
    // ตรวจสอบ Mongoose Validation Error
    if (error.name === "ValidationError") {
        const messages = Object.values(error.errors).map((val) => val.message);
        return res.status(400).json({ message: "ข้อมูลไม่ถูกต้อง: " + messages.join(", ") });
    }
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

export const updateMyProfile = async (req, res) => {
  // 1. ดึงข้อมูลที่อนุญาตให้อัปเดตจาก req.body
  const { fullName, phone, address, district, province, postalCode } = req.body

  try {
    // 2. ค้นหา User และอัปเดต
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id, // ID ผู้ใช้ที่ได้จาก authMiddleware
      {
        fullName,
        phone,
        address,
        district,
        province,
        postalCode,
      },
      { new: true, runValidators: true }, // new: true เพื่อให้ส่งข้อมูลใหม่กลับไป
    ).select('-password')

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' })
    }

    // 3. ส่งข้อมูลที่อัปเดตแล้วกลับไปให้ Frontend
    res.json(updatedUser)
  } catch (error) {
    console.error('Error updating profile:', error)
    res.status(500).json({ message: 'Error updating profile' })
  }
}

// (ใหม่) อัปโหลดรูปโปรไฟล์
export const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "กรุณาเลือกไฟล์" });
    }

    // 1. แปลง buffer → base64 string (เหมือนใน uploadController)
    const fileBase64 = Buffer.from(req.file.buffer).toString("base64");
    const fileDataUri = `data:${req.file.mimetype};base64,${fileBase64}`;

    // 2. อัปโหลด (ใช้โฟลเดอร์ใหม่, ตั้งชื่อไฟล์=userId, และย่อขนาด)
    const result = await cloudinary.uploader.upload(fileDataUri, {
      folder: "profile_pictures",
      public_id: req.user.id, // (req.user.id มาจาก 'auth' middleware)
      overwrite: true,
      transformation: [
        { width: 400, height: 400, crop: "fill", gravity: "face" }
      ]
    });

    // 3. (สำคัญ) บันทึก URL ใหม่ลงใน User Model
    // (เราต้องมั่นใจว่า userModel.js มี field 'profileImageUrl' แล้ว)
    const user = await User.findById(req.user.id);
    if (!user) {
        return res.status(404).json({ message: "ไม่พบผู้ใช้" });
    }

    user.profileImageUrl = result.secure_url; // อัปเดตช่องเก็บรูป
    await user.save();

    res.json({
      message: "อัปโหลดรูปโปรไฟล์สำเร็จ",
      profileImageUrl: result.secure_url,
    });

  } catch (error) {
    console.error("Upload profile picture error:", error);
    res.status(500).json({ message: "อัปโหลดล้มเหลว", error });
  }
};