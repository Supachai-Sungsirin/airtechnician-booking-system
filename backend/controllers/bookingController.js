import Booking from "../models/Booking.js";
import Technician from "../models/Technician.js";
import User from "../models/User.js";
import Service from "../models/Service.js";

// สร้าง Booking + Match ช่างตามเขต
export const createBooking = async (req, res) => {
  try {
    // 1. รับ preferredTechnicianId จาก req.body
    const {
      requestedDateTime,
      address,
      services,
      problemDescription,
      preferredTechnicianId, // 👈  เพิ่มตัวนี้
    } = req.body;
    const customerId = req.user.id;

    const customer = await User.findById(customerId);
    if (!customer || !customer.district) {
      return res.status(400).json({ message: "กรุณาเพิ่มเขตที่อยู่ก่อนจอง" });
    }

    const requestedServiceIds = services.map((s) => s.serviceId);
    if (requestedServiceIds.length === 0) {
      return res
        .status(400)
        .json({ message: "กรุณาเลือกบริการอย่างน้อย 1 รายการ" });
    }

    // 2. ประกาศตัวแปร technician
    let technician;

    if (preferredTechnicianId) {
      // 3. ถ้ามีการเลือกช่างมา (Scenario 1: User Selected)
      console.log(
        `[Booking] Attempting to book preferred tech: ${preferredTechnicianId}`
      );
      
      technician = await Technician.findOne({
        _id: preferredTechnicianId,
        status: "approved",
        active: true,
      }).populate("userId");

      if (!technician) {
        // กรณีช่างที่เลือกมา หายไปจากระบบ หรือไม่อนุมัติ/ไม่ active
        return res
          .status(404)
          .json({ message: "ช่างที่คุณเลือกไม่พร้อมให้บริการ (อาจถูกระงับหรือออฟไลน์)" });
      }
      
      // (Optional Check) คุณอาจจะอยากเช็กว่าช่างที่เลือกมายังรับบริการนี้และอยู่ในเขตนี้จริงๆ
      // แต่โดยทั่วไปเราเชื่อถือ Frontend ที่กรองมาให้แล้วได้

    } else {
      // 4. ถ้าไม่ได้เลือกช่างมา (Scenario 2: Auto-Assign - โค้ดเดิมของคุณ)
      console.log("[Booking] No preferred tech. Auto-assigning...");
      
      const cleanDistrict = (customer.district || "").replace("เขต", "").trim();
      const districtRegex = new RegExp(cleanDistrict, "i");

      technician = await Technician.findOne({
        status: "approved",
        active: true,
        serviceArea: { $regex: districtRegex },
        services: { $all: requestedServiceIds },
      }).populate("userId");
    }

    // 5. ย้าย Logic "ไม่พบช่าง" มาไว้ตรงนี้
    if (!technician) {
      // (โค้ดส่วนนี้คือโค้ดเดิมของคุณ)
      // ลองเช็กว่าจริงๆ แล้วในเขตนี้มีช่างไหม
      const cleanDistrict = (customer.district || "").replace("เขต", "").trim();
      const districtRegex = new RegExp(cleanDistrict, "i");
      
      const techInDistrict = await Technician.findOne({
        status: "approved",
        active: true,
        serviceArea: { $regex: districtRegex },
      });
      if (!techInDistrict) {
        // ถ้าไม่มีช่างในเขตเลย
        return res
          .status(404)
          .json({ message: `ยังไม่มีช่างให้บริการในเขต ${customer.district}` });
      } else {
        // ถ้ามีช่าง แต่ช่างคนนั้นทำบริการที่ร้องขอไม่ได้
        return res.status(404).json({
          message: `ขออภัย, ช่างในเขต ${customer.district} ไม่ได้รับบริการที่คุณเลือกทั้งหมด`,
        });
      }
    }

    // 6. คำนวณราคา (โค้ดเดิม)
    let totalPrice = 0;
    const bookingServices = [];

    for (const s of services) {
      const service = await Service.findById(s.serviceId);
      if (!service) return res.status(404).json({ message: "Service ไม่พบ" });

      // หา option ตาม BTU
      let option = service.options.find((o) => (o.btuRange || "") === (s.btuRange || "")); // (แก้ให้ตรงเป๊ะ)
      if (!option && service.options.length > 0) {
        // ถ้าไม่มี BTU ที่ตรง ใช้ option แรก
        option = service.options[0];
      }

      if (!option) {
         return res.status(400).json({ message: `ไม่พบ Option สำหรับ Service ${service.name}`});
      }

      const price =
        option.unit === "per_unit"
          ? option.price * (s.quantity || 1)
          : option.price;

      totalPrice += price;

      bookingServices.push({
        serviceId: service._id,
        name: service.name, // (แนะนำให้เพิ่ม)
        btuRange: s.btuRange,
        quantity: s.quantity || 1,
        price: price,
      });
    }

    // 7. สร้าง Booking (โค้ดเดิม)
    const newBooking = new Booking({
      customerId,
      technicianId: technician._id, // 👈 นี่คือ ID ที่ถูกต้องแล้ว
      services: bookingServices,
      requestedDateTime,
      address,
      district: customer.district,
      problemDescription,
      totalPrice,
      status: "pending",
    });

    await newBooking.save();

    res.status(201).json({
      message: `จองสำเร็จ! ระบบได้แมทช์ช่างในเขต ${customer.district} แล้ว`,
      bookingId: newBooking._id,
      assignedTechnician: {
        name: technician.userId.fullName, // 👈 นี่คือชื่อที่ถูกต้องแล้ว
        phone: technician.userId.phone, // 👈 นี่คือเบอร์ที่ถูกต้องแล้ว
      },
      totalPrice,
    });
  } catch (error) {
    console.error("Error in createBooking:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในระบบ" });
  }
};

// ดึง Booking ของลูกค้า
export const getCustomerBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ customerId: req.user.id })
      .populate({
        path: "technicianId",
        populate: { path: "userId", select: "fullName phone profileImageUrl" },
      })
      .populate({
        path: "services.serviceId",
        select: "name options",
      })
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error("Error getCustomerBookings:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
};

// ช่างดูงานที่ได้รับ
export const getTechnicianBookings = async (req, res) => {
  try {
    const tech = await Technician.findOne({ userId: req.user.id });

    const bookings = await Booking.find({ technicianId: tech._id })
      .populate("customerId", "fullName phone district")
      .populate({
        path: "services.serviceId",
        select: "name options",
      })
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error("Error getTechnicianBookings:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
};

// ==========================
// Admin: ดู Booking ทั้งหมด
// ==========================
export const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("customerId", "fullName phone district")
      .populate({
        path: "technicianId",
        populate: { path: "userId", select: "fullName phone" },
      })
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error("Error getBookings:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ==========================
// Get Booking by Id
// ==========================
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("customerId", "fullName phone district")
      .populate({
        path: "technicianId",
        populate: { path: "userId", select: "fullName phone" },
      })
      .populate({
        path: "services.serviceId",
        select: "name options",
      });

    if (!booking) return res.status(404).json({ message: "ไม่พบรายการจอง" });

    res.json(booking);
  } catch (error) {
    console.error("Error getBookingById:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ==========================
// Update Booking Status
// ==========================
export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = [
      "pending",
      "assigned",
      "accepted",
      "on_the_way",
      "working",
      "completed",
      "cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "สถานะไม่ถูกต้อง" });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate("customerId", "fullName phone district")
      .populate({
        path: "technicianId",
        populate: { path: "userId", select: "fullName phone" },
      })
      .populate({
        path: "services.serviceId",
        select: "name options",
      });

    if (!booking) return res.status(404).json({ message: "ไม่พบรายการจอง" });

    res.json({ message: "อัปเดตสถานะสำเร็จ", booking });
  } catch (error) {
    console.error("Error updateBookingStatus:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ตรวจสอบความพร้อมของเวลาจอง
export const checkAvailability = async (req, res) => {
  try {
    const { dateTime } = req.query;

    if (!dateTime) {
      return res.status(400).json({ message: "กรุณาระบุวันและเวลา" });
    }

    const requestedDate = new Date(dateTime);

    // ช่วงเวลา 1 ชั่วโมงรอบ ๆ เวลาที่เลือก
    const startTime = new Date(requestedDate.getTime() - 59 * 60 * 1000); // 59 นาที ก่อน
    const endTime = new Date(requestedDate.getTime() + 59 * 60 * 1000); // 59 นาที หลัง

    const existingBooking = await Booking.findOne({
      requestedDateTime: { $gte: startTime, $lte: endTime },
      status: { $nin: ["cancelled", "completed"] },
    });

    if (existingBooking) {
      return res.json({ available: false, message: "ช่วงเวลานี้ถูกจองแล้ว" });
    }

    return res.json({ available: true, message: "เวลานี้สามารถจองได้" });
  } catch (error) {
    console.error("Error checking booking availability:", error);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดในระบบ" });
  }
};

export const mockCompletePayment = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "ไม่พบการจองนี้" });
    }

    // ตรวจสอบว่าเป็นเจ้าของ booking
    if (booking.customerId.toString() !== req.user.id) {
      return res.status(401).json({ message: "ไม่มีสิทธิ์ในการเข้าถึง" });
    }

    // ตรวจสอบสถานะก่อนจ่าย
    if (booking.status !== "completed") {
      return res.status(400).json({ message: "ช่างยังทำงานไม่เสร็จ" });
    }

    if (booking.paymentStatus === "paid") {
      return res.status(400).json({ message: "การจองนี้ถูกชำระเงินแล้ว" });
    }

    // อัปเดตสถานะการจ่ายเงิน
    booking.paymentStatus = "paid";
    
    const updatedBooking = await booking.save();
    res.status(200).json(updatedBooking);

  } catch (error) {
    console.error("Error in mockCompletePayment:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
