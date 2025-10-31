import mongoose from "mongoose";

const historySchema = new mongoose.Schema({
  technicianId: {
    type: mongoose.Schema.Types.ObjectId,   // ช่าง
    ref: "Technician",
    required: true,
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,  // งาน
    ref: "Booking",
    required: true,
  },
  action: {
    type: String,
    enum: ["accepted", "rejected", "completed"], // สถานะงานที่ช่างทำ
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("TechnicianHistory", historySchema);
