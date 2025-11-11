import mongoose from 'mongoose'

const bookingSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  technicianId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Technician',
    required: true,
  },
  services: [
    {
      serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: true,
      },
      btuRange: { type: String }, // เช่น "9000-12000"
      quantity: { type: Number, default: 1 },
      price: { type: Number, required: true }, // ราคาต่อเครื่องหรือเหมาจ่าย
    },
  ],
  problemDescription: { type: String, required: true },
  requestedDateTime: { type: Date, required: true },
  address: { type: String, required: true },
  district: { type: String, required: true },
  status: {
    type: String,
    enum: [
      'pending',
      'assigned',
      'accepted',
      'on_the_way',
      'working',
      'completed',
      'cancelled',
    ],
    default: 'pending',
  },
  hasReview: {
    type: Boolean,
    default: false,
  },
  totalPrice: { type: Number }, // รวมทุก service
  createdAt: { type: Date, default: Date.now },

  // --- เพิ่ม Field ใหม่ 3 ช่องนี้ ---
  completedAt: { type: Date }, // วันที่ปิดงาน (สำหรับ completeBooking)
  technicianNotes: { type: String, default: '' }, // โน้ตจากช่าง (สำหรับ completeBooking)
  jobPhotos: [{ type: String }], // Array ของ URL รูปภาพ (สำหรับ uploadBookingPhoto)

  finalPrice: {
    type: Number,
    default: null,
  },

  paymentStatus: {
    type: String,
    enum: ['pending_payment', 'paid'],
    default: 'pending_payment',
  },
})

export default mongoose.model('Booking', bookingSchema)
