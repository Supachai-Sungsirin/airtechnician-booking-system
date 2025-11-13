import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,   
    ref: "Booking",
    required: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,   
    ref: "User",
    required: true,
  },
  technicianId: {
    type: mongoose.Schema.Types.ObjectId,   
    ref: "Technician",
    required: true,
  },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String },                     
  createdAt: { type: Date, default: Date.now }, 
});

export default mongoose.model("Review", reviewSchema);
