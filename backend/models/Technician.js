import mongoose from "mongoose";

const technicianSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  idCard: { type: String },
  selfieWithIdCard: { type: String },
  serviceArea: { type: [String], required: true }, // เขตที่ให้บริการ
  bio: { type: String },
  
  // [แก้ไข] เปลี่ยนจาก enum string เป็น array of ObjectId ที่อ้างอิง Service model
  services: [
    {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service', // [สำคัญ] ตรวจสอบว่า 'Service' ตรงกับชื่อโมเดลบริการของคุณ
    required: true,
    },
  ],
  rating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },

  // [แก้ไข] เพิ่ม field active เพื่อให้ controller สามารถกรองช่างที่พร้อมให้บริการได้
  active: {
    type: Boolean,
    default: true,
  },

  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  reason: { type: String, default: "" }, // กรณีถูกปฏิเสธ
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Technician", technicianSchema);
