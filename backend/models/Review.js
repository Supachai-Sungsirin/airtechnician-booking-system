import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,   // งานที่รีวิว
    ref: "Booking",
    required: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,   // ลูกค้า
    ref: "User",
    required: true,
  },
  technicianId: {
    type: mongoose.Schema.Types.ObjectId,   // ช่าง
    ref: "Technician",
    required: true,
  },
  rating: { type: Number, min: 1, max: 5, required: true }, // คะแนนรีวิว
  comment: { type: String },                     // ความคิดเห็นรีวิว
  createdAt: { type: Date, default: Date.now }, // วันที่สร้างรีวิว
});

export default mongoose.model("Review", reviewSchema);
