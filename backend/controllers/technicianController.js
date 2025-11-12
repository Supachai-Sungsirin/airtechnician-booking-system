import Technician from '../models/Technician.js'
import Booking from '../models/Booking.js'
import Review from '../models/Review.js'
import TechnicianHistory from '../models/TechnicianHistory.js'
import User from '../models/User.js'
import { v2 as cloudinary } from 'cloudinary'

// ช่าง: ดูรีวิวและคอมเมนต์ของตัวเอง
export const getMyReviews = async (req, res) => {
  try {
    // 1. หาโปรไฟล์ช่าง (จาก Token ที่ล็อกอิน)
    const tech = await Technician.findOne({ userId: req.user.id })
    if (!tech) {
      return res.status(404).json({ message: 'ไม่พบโปรไฟล์ช่าง' })
    } // 2. ค้นหารีวิวทั้งหมดของช่างคนนี้

    const reviews = await Review.find({ technicianId: tech._id })
      .populate('customerId', 'fullName') // ดึงชื่อลูกค้าที่รีวิว
      .populate({
        path: 'bookingId',
        select: 'services', // (เลือก field 'services' จาก Booking)
        populate: {
          path: 'services.serviceId', // (ดึงข้อมูล serviceId ใน Array 'services')
          select: 'name', // (เอาแค่ 'name' ของ Service)
        },
      })
      .sort({ createdAt: -1 }) // เรียงจากใหม่ไปเก่า

    res.json(reviews)
  } catch (error) {
    console.error('Error getMyReviews:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

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

// ช่าง: ปฏิเสธงาน (Reject)
export const rejectBooking = async (req, res) => {
  try {
    const tech = await Technician.findOne({ userId: req.user.id })
    if (!tech) {
      return res.status(404).json({ message: 'ไม่พบโปรไฟล์ช่าง' })
    }

    // ค้นหางาน (ต้องเป็น 'pending' และเป็นของช่างคนนี้)
    const booking = await Booking.findOne({
      _id: req.params.id,
      technicianId: tech._id,
      status: 'pending', // ปฏิเสธได้เฉพาะงานที่ยังไม่ได้รับ
    })

    if (!booking) {
      return res
        .status(404)
        .json({ message: 'ไม่พบงาน หรือ งานนี้ถูกรับไปแล้ว' })
    }

    // ตั้งสถานะเป็น 'cancelled' (เพราะ 'rejected' ไม่มีใน enum ของคุณ)
    booking.status = 'cancelled'
    booking.technicianNotes = 'Technician rejected the assignment.' // (เพิ่มโน้ต)
    await booking.save()

    res.json({ message: 'ปฏิเสธงานเรียบร้อย', booking })
  } catch (error) {
    console.error('Error rejectBooking:', error)
    res.status(500).json({ message: 'Server error' })
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

    const booking = await Booking.findById(req.params.id)
    if (!booking) {
      return res.status(404).json({ message: 'ไม่พบงานนี้' })
    }

    // ตรวจสอบว่างานนี้เป็นของช่างคนนี้จริงๆ
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

    const populatedBooking = await Booking.findById(booking._id)
      .populate('customerId', 'fullName phone district')
      .populate({ path: 'services.serviceId', select: 'name' })
    res.json({ message: 'รับงานเรียบร้อย', booking: populatedBooking }) // ส่งตัวที่ populate แล้ว
  } catch (error) {
    console.error('Error acceptBooking:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// ช่าง: อัปเดตสถานะ "กำลังเดินทาง"
export const setOnTheWay = async (req, res) => {
  try {
    const tech = await Technician.findOne({ userId: req.user.id })
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, technicianId: tech._id, status: 'accepted' },
      { status: 'on_the_way' },
      { new: true }
    )

    if (!booking) return res.status(404).json({ message: 'ไม่พบงาน' })

    // Populate ข้อมูลก่อนส่งกลับ (กันชื่อลูกค้าหาย)
    const populatedBooking = await booking.populate([
      { path: 'customerId', select: 'fullName phone district' },
      { path: 'services.serviceId', select: 'name' },
    ])

    res.json({
      message: "อัปเดตสถานะ 'กำลังเดินทาง' สำเร็จ",
      booking: populatedBooking,
    })
  } catch (error) {
    console.error('Error setOnTheWay:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// ช่าง: อัปเดตสถานะ "เริ่มทำงาน"
export const setWorking = async (req, res) => {
  try {
    const tech = await Technician.findOne({ userId: req.user.id })
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, technicianId: tech._id, status: 'on_the_way' },
      { status: 'working' },
      { new: true }
    )

    if (!booking)
      return res.status(404).json({ message: 'ช่างยังไม่ถึงหน้างาน' })

    // (สำคัญ) Populate ข้อมูลก่อนส่งกลับ
    const populatedBooking = await booking.populate([
      { path: 'customerId', select: 'fullName phone district' },
      { path: 'services.serviceId', select: 'name' },
    ])

    res.json({
      message: "อัปเดตสถานะ 'เริ่มทำงาน' สำเร็จ",
      booking: populatedBooking,
    })
  } catch (error) {
    console.error('Error setWorking:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// ช่าง: อัปโหลดรูปภาพสำหรับงาน (ก่อน/หลัง)
export const uploadBookingPhotos = async (req, res) => {
  try {
    // 1. ตรวจสอบไฟล์ (จาก middleware 'upload.array')
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ message: 'กรุณาเลือกไฟล์ที่ต้องการอัปโหลด' })
    }

    // ค้นหางาน (Booking)
    const booking = await Booking.findById(req.params.id)
    if (!booking) {
      return res.status(404).json({ message: 'ไม่พบใบงานนี้' })
    }

    let uploadedUrls = []

    // วนลูปอัปโหลดไฟล์ทั้งหมดขึ้น Cloudinary
    for (const file of req.files) {
      const fileBase64 = Buffer.from(file.buffer).toString('base64')
      const fileDataUri = `data:${file.mimetype};base64,${fileBase64}`

      const result = await cloudinary.uploader.upload(fileDataUri, {
        folder: 'booking_photos', // (สร้างโฟลเดอร์ใหม่สำหรับรูปงาน)
      })
      uploadedUrls.push(result.secure_url)
    }

    // บันทึก URL รูปภาพใหม่ลงใน Array
    booking.jobPhotos = (booking.jobPhotos || []).concat(uploadedUrls)
    await booking.save()

    res.json({
      message: 'อัปโหลดรูปภาพสำเร็จ!',
      booking, // (ส่ง booking ที่อัปเดตแล้วกลับไป)
    })
  } catch (error) {
    console.error('Error uploading photos:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// ช่าง: ลบรูปภาพออกจากงาน
export const deleteBookingPhoto = async (req, res) => {
  try {
    const { photoUrl } = req.body // URL ของรูปที่จะลบ
    const { id: bookingId } = req.params // ID ของงาน
    const techUserId = req.user.id // ID ของช่างที่ล็อกอิน

    if (!photoUrl) {
      return res.status(400).json({ message: 'ไม่ได้ระบุ URL ของรูปภาพ' })
    }

    const tech = await Technician.findOne({ userId: techUserId })
    const booking = await Booking.findOne({
      _id: bookingId,
      technicianId: tech._id,
    })

    if (!booking) {
      return res
        .status(404)
        .json({ message: 'ไม่พบงาน หรือ คุณไม่ใช่เจ้าของงานนี้' })
    } // ลบรูปออกจาก Cloudinary

    try {
      // (ดึง Public ID จาก URL, เช่น "booking_photos/abcdef")
      const parts = photoUrl.split('/')
      const publicIdWithFormat = parts
        .slice(parts.indexOf('booking_photos'))
        .join('/')
      const publicId = publicIdWithFormat.substring(
        0,
        publicIdWithFormat.lastIndexOf('.')
      )

      if (publicId) {
        await cloudinary.uploader.destroy(publicId)
      }
    } catch (cloudinaryError) {
      console.error(
        'Cloudinary delete error (อาจลบไปแล้ว):',
        cloudinaryError.message
      )
    } // ลบ URL ออกจาก Array ใน MongoDB

    booking.jobPhotos = booking.jobPhotos.filter((url) => url !== photoUrl)
    await booking.save()

    const populatedBooking = await booking.populate([
      { path: 'customerId', select: 'fullName phone district' },
      { path: 'services.serviceId', select: 'name' },
    ])

    res.json({ message: 'ลบรูปภาพสำเร็จ', booking: populatedBooking })
  } catch (error) {
    console.error('Error deleting photo:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// ช่าง: ปิดงาน (Complete Booking)
export const completeBooking = async (req, res) => {
  try {
    const { technicianNotes, finalPrice } = req.body // 1. ตรวจสอบข้อมูลที่รับมา

    const parsedPrice = parseFloat(finalPrice)
    if (!parsedPrice || parsedPrice <= 0) {
      return res.status(400).json({ message: 'กรุณาระบุราคาสุทธิที่ถูกต้อง' })
    }
    if (!technicianNotes || technicianNotes.trim() === '') {
      return res.status(400).json({ message: 'กรุณากรอกโน้ตสรุปงานด้วยครับ' })
    } 

    const tech = await Technician.findOne({ userId: req.user.id })
    if (!tech) {
      return res.status(404).json({ message: 'ไม่พบโปรไฟล์ช่าง' })
    } 

    // ค้นหางาน (Find)
    const booking = await Booking.findOne({
      _id: req.params.id,
      technicianId: tech._id,
    })

    if (!booking) {
      return res
        .status(404)
        .json({ message: 'ไม่พบงาน หรือ คุณไม่ใช่เจ้าของงานนี้' })
    }
    if (booking.status.toLowerCase() !== 'working') {
      return res
        .status(400)
        .json({ message: 'ไม่สามารถปิดงานที่ยังไม่ได้เริ่มทำงานได้' })
    }

    // --- ตรวจสอบราคากับราคาประเมิน ---
    const estimatedPrice = booking.totalPrice || 0
    if (parsedPrice < estimatedPrice) {
      return res.status(400).json({
        message: `ราคาสุทธิ (฿${parsedPrice}) ต้องไม่ต่ำกว่าราคาประเมิน (฿${estimatedPrice})`,
      })
    } 
    // อัปเดตข้อมูลและบันทึก (Save)

    booking.status = 'completed'
    booking.completedAt = Date.now()
    booking.technicianNotes = technicianNotes
    booking.finalPrice = parsedPrice
    booking.paymentStatus = 'pending_payment'
    await booking.save() // บันทึกการเปลี่ยนแปลง 

    // Populate ข้อมูลก่อนส่งกลับ
    const populatedBooking = await booking.populate([
      { path: 'customerId', select: 'fullName phone district' },
      { path: 'services.serviceId', select: 'name' },
    ])

    res.json({ message: 'ปิดงานเรียบร้อย', booking: populatedBooking })
  } catch (error) {
    console.error('Error completeBooking:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

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

// ช่าง: ดึงข้อมูลโปรไฟล์ตัวเอง (GET)
export const getTechnicianProfile = async (req, res) => {
  try {
    const technician = await Technician.findOne({
      userId: req.user.id,
    }).populate('services', 'name')
    if (!technician) {
      return res.status(404).json({ message: 'ไม่พบโปรไฟล์ช่าง' })
    }

    const user = await User.findById(req.user.id).select('-password')
    if (!user) {
      return res.status(404).json({ message: 'ไม่พบข้อมูลผู้ใช้' })
    }

    res.json({
      user: user,
      technician: technician,
    })
  } catch (error) {
    console.error('Error getTechnicianProfile:', error)
    res.status(500).json({ message: 'Server error' })
  }
}
