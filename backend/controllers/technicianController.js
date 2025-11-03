import Technician from '../models/Technician.js'
import Booking from '../models/Booking.js'
import Review from '../models/Review.js'
import TechnicianHistory from '../models/TechnicianHistory.js'

// ช่าง: ดูรีวิวและคอมเมนต์ของตัวเอง
export const getMyReviews = async (req, res) => {
  try {
    // 1. หาโปรไฟล์ช่าง (จาก Token ที่ล็อกอิน)
    const tech = await Technician.findOne({ userId: req.user.id });
    if (!tech) {
      return res.status(404).json({ message: "ไม่พบโปรไฟล์ช่าง" });
    }

    // 2. ค้นหารีวิวทั้งหมดของช่างคนนี้
    const reviews = await Review.find({ technicianId: tech._id })
      .populate("customerId", "fullName") // ดึงชื่อลูกค้าที่รีวิว
      .sort({ createdAt: -1 }); // เรียงจากใหม่ไปเก่า

    res.json(reviews);

  } catch (error) {
    console.error("Error getMyReviews:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ช่าง: ดูรายการงานที่ได้รับมอบหมาย
export const getAssignedBookings = async (req, res) => {
  try {
    const tech = await Technician.findOne({ userId: req.user.id })
    if (!tech) {
      return res.status(404).json({ message: 'ไม่พบโปรไฟล์ช่าง' })
    }

    // ค้นหางานทั้งหมดที่มอบหมายให้ช่างคนนี้
    const bookings = await Booking.find({ technicianId: tech._id })
      .populate('customerId', 'fullName phone district') // ดึงข้อมูลลูกค้า
      .populate({
        path: 'services.serviceId', // ดึงข้อมูลบริการ
        select: 'name',
      })
      .sort({ createdAt: -1 })

    res.json(bookings)
  } catch (error) {
    console.error('Error getAssignedBookings:', error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาด' })
  }
}

// ช่าง: รับงาน
export const acceptBooking = async (req, res) => {
  try {
    // หาโปรไฟล์ช่างที่ล็อกอิน
    const tech = await Technician.findOne({ userId: req.user.id })
    if (!tech) {
      return res.status(404).json({ message: 'ไม่พบโปรไฟล์ช่าง' })
    }

    // ค้นหางานด้วย ID ที่ส่งมา
    const booking = await Booking.findById(req.params.id)
    if (!booking) {
      return res.status(404).json({ message: 'ไม่พบงานนี้' })
    }

    // (สำคัญ) ตรวจสอบว่างานนี้เป็นของช่างคนนี้จริงๆ
    if (booking.technicianId.toString() !== tech._id.toString()) {
      return res.status(403).json({ message: 'คุณไม่มีสิทธิ์รับงานนี้' })
    }
    booking.status = 'accepted'
    await booking.save()

    // (Optional) บันทึกประวัติ
    const history = new TechnicianHistory({
      technicianId: tech._id,
      bookingId: booking._id,
      action: 'accepted',
    })
    await history.save()

    res.json({ message: 'รับงานเรียบร้อย', booking })
  } catch (error) {
    console.error('Error acceptBooking:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// ช่าง: ปิดงาน (Complete Booking)
export const completeBooking = async (req, res) => {
  try {
    // รับ "โน้ตสรุปงาน" จาก Body
    const { technicianNotes } = req.body;

    // หาโปรไฟล์ช่าง (จาก Token)
    const tech = await Technician.findOne({ userId: req.user.id });
    if (!tech) {
      return res.status(404).json({ message: "ไม่พบโปรไฟล์ช่าง" });
    }

    // ค้นหางาน และอัปเดตสถานะ (ต้องเป็นงานของช่างคนนี้เท่านั้น)
    const booking = await Booking.findOneAndUpdate(
      { 
        _id: req.params.id, 
        technicianId: tech._id 
      },
      { 
        status: "completed",
        completedAt: Date.now(), // ใช้วันที่ปัจจุบัน
        technicianNotes: technicianNotes || "" // เก็บโน้ต (ถ้ามี)
      },
      { new: true } // คืนค่าเอกสารที่อัปเดตแล้ว
    );

    res.json({ message: "ปิดงานเรียบร้อย", booking });
  } catch (error) {
    console.error("Error completeBooking:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ช่าง: อัปเดตโปรไฟล์ของตัวเอง
export const updateTechnicianProfile = async (req, res) => {
  try {
    // ค้นหาโปรไฟล์ช่าง โดยอิงจาก userId ของ User ที่ล็อกอิน
    const technician = await Technician.findOne({ userId: req.user.id })

    if (!technician) {
      return res.status(404).json({ message: 'ไม่พบโปรไฟล์ช่าง' })
    }
    // ดึงข้อมูลที่อนุญาตให้แก้ไขได้จาก req.body
    const { bio, serviceArea, services } = req.body
    // อัปเดตเฉพาะฟิลด์ที่ช่างควรแก้ไขได้
    technician.bio = bio ?? technician.bio
    technician.serviceArea = serviceArea || technician.serviceArea // รับค่า array ใหม่
    technician.services = services || technician.services // รับค่า array ใหม่
    // บันทึกข้อมูลที่อัปเดต
    const updatedTechnician = await technician.save()
    // ส่งข้อมูลโปรไฟล์ที่อัปเดตแล้วกลับไป
    res.json({
      _id: updatedTechnician._id,
      userId: updatedTechnician.userId,
      bio: updatedTechnician.bio,
      serviceArea: updatedTechnician.serviceArea,
      services: updatedTechnician.services,
      status: updatedTechnician.status,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์' })
  }
}
