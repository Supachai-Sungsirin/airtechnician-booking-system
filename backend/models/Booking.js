import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  customerId: {                               // ลูกค้า
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  technicianId: {                             // ช่าง
    type: mongoose.Schema.Types.ObjectId,
    ref: "Technician",
    required: true,
  },
  serviceType: {                              // ประเภทบริการ
    type: String,
    enum: ["cleaning", "repair", "install", "maintenance", "refill", "move"],
    required: true,
  },
  problemDescription: { type: String, required: true }, // รายละเอียดปัญหา
  requestedDateTime: { type: Date, required: true }, // วันที่-เวลาที่ขอบริการ
  address: { type: String, required: true }, // ที่อยู่ให้บริการ
  district: { type: String, required: true }, // เขตที่ให้บริการ
  status: {                                   // สถานะการจอง                          
    type: String,
    enum: ["pending", "accepted", "rejected", "completed", "cancelled"],
    default: "pending",
  },
  totalPrice: { type: Number },             // ราคารวมหลังบริการเสร็จ
  createdAt: { type: Date, default: Date.now },  // วันที่สร้างการจอง
});

export default mongoose.model("Booking", bookingSchema);
