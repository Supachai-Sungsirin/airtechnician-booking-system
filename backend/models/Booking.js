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
      btuRange: { type: String }, 
      quantity: { type: Number, default: 1 },
      price: { type: Number, required: true }, 
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
  totalPrice: { type: Number }, 
  createdAt: { type: Date, default: Date.now },

  completedAt: { type: Date }, 
  technicianNotes: { type: String, default: '' }, 
  jobPhotos: [{ type: String }], 

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
