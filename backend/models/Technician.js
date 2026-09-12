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
  serviceArea: { type: [String], required: true },
  bio: { type: String },
  services: [
    {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true,
    },
  ],
  rating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  active: {
    type: Boolean,
    default: true,
  },

  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  reason: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Technician", technicianSchema);
