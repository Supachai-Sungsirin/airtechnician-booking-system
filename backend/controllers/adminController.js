// controllers/adminController.js
import Technician from "../models/Technician.js";

// อนุมัติช่าง
export const approveTechnician = async (req, res) => {
  try {
    const technicianId = req.params.id;

    const technician = await Technician.findById(technicianId);
    if (!technician) {
      return res.status(404).json({ message: "ไม่พบข้อมูลช่าง" });
    }

    // อัปเดตสถานะ
    technician.status = "approved";
    await technician.save();

    res.json({
      message: "อนุมัติช่างสำเร็จ",
      technician: {
        id: technician._id,
        status: technician.status
      }
    });
  } catch (error) {
    console.error("Approve technician error:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในระบบ" });
  }
};
