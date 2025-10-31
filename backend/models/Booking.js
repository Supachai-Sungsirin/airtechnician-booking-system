import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
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
  services: [
    {
      serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
      btuRange: { type: String },   // เช่น "9000-12000"
      quantity: { type: Number, default: 1 },
      price: { type: Number, required: true } // ราคาต่อเครื่องหรือเหมาจ่าย
    }
  ],
  problemDescription: { type: String, required: true }, 
  requestedDateTime: { type: Date, required: true }, 
  address: { type: String, required: true }, 
  district: { type: String, required: true }, 
  status: {                                  
    type: String,
    enum: ["pending", "assigned", "accepted", "on_the_way", "working", "completed", "cancelled"],
    default: "pending",
  },
  totalPrice: { type: Number }, // รวมทุก service
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Booking", bookingSchema);
