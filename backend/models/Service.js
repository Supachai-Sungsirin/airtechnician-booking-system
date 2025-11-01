import mongoose from "mongoose";

const ServiceOptionSchema = new mongoose.Schema({
  label: { type: String }, // ใช้แทน btuRange กรณีเป็นชื่อแพ็กเกจ
  btuRange: {
    type: String, // เช่น "9000-12000", "18000-24000"
    required: false
  },
  price: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    enum: ["per_unit", "fixed", "starting"], 
    default: "per_unit" // per unit = คิดตามจำนวนเครื่อง, fixed = เหมาจ่าย
  }
});

const ServiceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // เช่น "ล้างแอร์", "เติมน้ำยา", "ย้ายแอร์", "ซ่อมแอร์"
  },
  description: String,
  options: [ServiceOptionSchema], // ใช้รองรับราคาตาม BTU
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export default mongoose.model("Service", ServiceSchema);
