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
  services: [
    {
      type: String,
      enum: ["cleaning", "repair", "install", "maintenance", "refill"],
      required: true,
    },
  ],
  rating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  reason: { type: String, default: "" }, // กรณีถูกปฏิเสธ
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Technician", technicianSchema);
