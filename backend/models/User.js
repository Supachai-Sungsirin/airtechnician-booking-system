import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  address: { type: String },
  role: {
    type: String,
    enum: ["customer", "technician", "admin"],
    default: "customer"
  },
  address: { type: String },
  district: { type: String, required: true }, // เขต เช่น บางนา ลาดพร้าว ดินแดง
  province: { type: String, default: "Bangkok" }, // กรุงเทพล้วน
  zipCode: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("User", userSchema);