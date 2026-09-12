import mongoose from "mongoose";

const ServiceOptionSchema = new mongoose.Schema({
  label: { type: String },
  btuRange: {
    type: String,
    required: false
  },
  price: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    enum: ["per_unit", "fixed", "starting"], 
    default: "per_unit"
  }
});
const ServiceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, 
  },
  description: String,
  options: [ServiceOptionSchema],
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export default mongoose.model("Service", ServiceSchema);
