import Booking from "../models/Booking.js";
import Technician from "../models/Technician.js";
import User from "../models/User.js";
import Service from "../models/Service.js";

// สร้าง Booking + Match ช่างตามเขต
export const createBooking = async (req, res) => {
  try {
    const { requestedDateTime, address, services } = req.body; 
    const customerId = req.user.id;

    const customer = await User.findById(customerId);
    if (!customer || !customer.district) {
      return res.status(400).json({ message: "กรุณาเพิ่มเขตที่อยู่ก่อนจอง" });
    }

    // หา technician ที่ approved และให้บริการในเขตลูกค้า
    const technician = await Technician.findOne({
      status: "approved",
      serviceArea: { $in: [customer.district] },
    }).populate("userId");

    if (!technician) {
      return res.status(404).json({ message: `ยังไม่มีช่างให้บริการในเขต ${customer.district}` });
    }

    // คำนวณราคารวม
    let totalPrice = 0;
    const bookingServices = [];

    for (const s of services) {
      const service = await Service.findById(s.serviceId);
      if (!service) return res.status(404).json({ message: "Service ไม่พบ" });

      // หา option ตาม BTU
      let option = service.options.find(o => o.btuRange === s.btuRange);
      if (!option) {
        // ถ้าไม่มี BTU ที่ตรง ใช้ option แรก
        option = service.options[0];
      }

      const price = option.unit === "per_unit" ? option.price * (s.quantity || 1) : option.price;

      totalPrice += price;

      bookingServices.push({
        serviceId: service._id,
        btuRange: s.btuRange,
        quantity: s.quantity || 1,
        price: price
      });
    }

    const newBooking = new Booking({
      customerId,
      technicianId: technician._id,
      services: bookingServices,
      requestedDateTime,
      address,
      district: customer.district,
      totalPrice,
      status: "pending"
    });

    await newBooking.save();

    res.status(201).json({
      message: `จองสำเร็จ! ระบบได้แมทช์ช่างในเขต ${customer.district} แล้ว`,
      bookingId: newBooking._id,
      assignedTechnician: {
        name: technician.userId.fullName,
        phone: technician.userId.phone
      },
      totalPrice
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
        populate: { path: "userId", select: "fullName phone" }
      })
      .populate({
        path: "services.serviceId",
        select: "name options"
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
        select: "name options"
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
        populate: { path: "userId", select: "fullName phone" }
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
        populate: { path: "userId", select: "fullName phone" }
      })
      .populate({
        path: "services.serviceId",
        select: "name options"
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
      "cancelled"
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
        populate: { path: "userId", select: "fullName phone" }
      })
      .populate({
        path: "services.serviceId",
        select: "name options"
      });

    if (!booking) return res.status(404).json({ message: "ไม่พบรายการจอง" });

    res.json({ message: "อัปเดตสถานะสำเร็จ", booking });
  } catch (error) {
    console.error("Error updateBookingStatus:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// ==========================
// Assign Technician (Admin ใช้)
// ==========================
export const assignTechnician = async (req, res) => {
  try {
    const { technicianId } = req.body;

    const tech = await Technician.findById(technicianId).populate("userId");
    if (!tech) return res.status(404).json({ message: "ไม่พบช่าง" });

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { technicianId, status: "assigned" },
      { new: true }
    )
      .populate("customerId", "fullName phone district")
      .populate({
        path: "technicianId",
        populate: { path: "userId", select: "fullName phone" }
      })
      .populate({
        path: "services.serviceId",
        select: "name options"
      });

    if (!booking) return res.status(404).json({ message: "ไม่พบรายการจอง" });

    res.json({
      message: `มอบหมายงานให้ ${tech.userId.fullName} แล้ว`,
      booking,
    });
  } catch (error) {
    console.error("Error assignTechnician:", error);
    res.status(500).json({ message: "Server error" });
  }
};
