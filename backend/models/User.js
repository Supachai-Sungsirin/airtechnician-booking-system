import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },

  role: {
    type: String,
    enum: ["customer", "technician", "admin"],
    default: "customer"
  },

  // เฉพาะลูกค้า/ช่างเท่านั้นที่ต้องมี
  address: {
    type: String,
    required: function () { return this.role !== "admin"; }
  },
  district: {
    type: String,
    required: function () { return this.role !== "admin"; }
  },
  province: {
    type: String,
    required: function () { return this.role !== "admin"; }
  },
  postalCode: {
    type: String,
    required: function () { return this.role !== "admin"; }
  },

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("User", userSchema);