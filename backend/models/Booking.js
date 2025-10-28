import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  technicianId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Technician",
    required: true
  },
  serviceType: {
    type: String,
    enum: ["cleaning", "repair", "install"],
    required: true
  },
  problemDescription: { type: String, required: true },
  requestedDateTime: { type: Date, required: true },
  address: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected", "completed", "cancelled"],
    default: "pending"
  },
  totalPrice: { type: Number },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Booking", bookingSchema);
