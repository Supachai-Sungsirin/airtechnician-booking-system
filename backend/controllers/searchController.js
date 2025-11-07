import Technician from "../models/Technician.js"

/**
 * ค้นหาช่างที่มีเขตและบริการตรงกัน
 * GET /api/search/technicians?district=...&serviceIds=...
 */
export const searchTechnicians = async (req, res) => {
  try {
    const { district, serviceIds } = req.query

    // ตรวจสอบว่ามีข้อมูลที่จำเป็น
    if (!district) {
      return res.status(400).json({ message: "กรุณาระบุเขตที่ต้องการ" })
    }

    if (!serviceIds) {
      return res.status(400).json({ message: "กรุณาระบุบริการที่ต้องการ" })
    }

    // แปลง serviceIds จาก string เป็น array (รองรับทั้ง string เดียวและ array)
    const serviceIdArray = Array.isArray(serviceIds) ? serviceIds : serviceIds.split(",")

    // --- vvv นี่คือส่วนที่แก้ไข vvv ---

    // 1. "ตัด" คำว่า "เขต" และ "ช่องว่าง" ออกจาก district ที่ส่งมา
    //    เช่น " เขตบางบอน " จะกลายเป็น "บางบอน"
    const cleanDistrict = (district || "").replace("เขต", "").trim()

    // 2. สร้าง Regular Expression (Regex)
    //    - 'i' = case-insensitive (ไม่สนตัวพิมพ์เล็ก/ใหญ่)
    //    - Regex นี้จะค้นหาคำว่า "บางบอน" แม้ว่าใน DB จะเก็บเป็น " บางบอน " หรือ "เขตบางบอน"
    const districtRegex = new RegExp(cleanDistrict, 'i') 

    // --- ^^^ สิ้นสุดส่วนที่แก้ไข ^^^ ---

    console.log("[v0] Searching technicians with regex:", districtRegex, "for services:", serviceIdArray)

    // ค้นหาช่างที่ตรงตามเงื่อนไข
    const technicians = await Technician.find({
      status: "approved", // ต้องได้รับการอนุมัติแล้ว
      active: true, // พร้อมให้บริการ
      serviceArea: { $regex: districtRegex }, // <-- 3. เปลี่ยนเงื่อนไขเป็น $regex
      services: { $all: serviceIdArray }, // ต้องมีบริการทั้งหมดที่ค้นหา
    })
      .populate("userId", "fullName phone email") // ดึงข้อมูลผู้ใช้
      .populate("services", "name description") // ดึงข้อมูลบริการ
      .sort({ rating: -1, totalReviews: -1 }) // เรียงตาม rating และจำนวนรีวิว
      .lean() // แปลงเป็น plain JavaScript object เพื่อประสิทธิภาพ

    console.log("[v0] Found technicians:", technicians.length)

    // ส่งผลลัพธ์กลับ
    res.json({
      success: true,
      count: technicians.length,
      data: technicians,
    })
  } catch (error) {
    console.error("Error searchTechnicians:", error)
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการค้นหาช่าง",
      error: error.message,
    })
  }
}