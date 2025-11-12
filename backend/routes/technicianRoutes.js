import express from 'express'
import { auth, roleAuth } from '../middleware/authMiddleware.js'
import {
  getAssignedBookings,
  acceptBooking,
  updateTechnicianProfile,
  getMyReviews,
  completeBooking,
  rejectBooking,
  getTechnicianProfile,
  uploadBookingPhotos,
  setOnTheWay,
  setWorking,
  deleteBookingPhoto,
} from '../controllers/technicianController.js'
import { upload } from '../controllers/uploadController.js'

const router = express.Router()

// GET localhost:5000/technicians/bookings
router.get('/bookings', auth, roleAuth('technician'), getAssignedBookings)
// PUT localhost:5000/technicians/bookings/.../accept
router.put('/bookings/:id/accept', auth, roleAuth('technician'), acceptBooking)
// PATCH /technicians/bookings/:id/on-the-way
router.patch(
  '/bookings/:id/on-the-way',
  auth,
  roleAuth('technician'),
  setOnTheWay
)
// PATCH /technicians/bookings/:id/start-work
router.patch(
  '/bookings/:id/start-work',
  auth,
  roleAuth('technician'),
  setWorking
)

// POST /technicians/bookings/:id/upload
router.post(
  '/bookings/:id/upload',
  auth,
  roleAuth('technician'),
  upload.array('photos', 5), // (ใช้ .array() เพื่อรับหลายไฟล์, max 5 รูป)
  uploadBookingPhotos
)
// PATCH /technicians/bookings/:id/delete-photo
router.patch(
  '/bookings/:id/delete-photo',
  auth,
  roleAuth('technician'),
  deleteBookingPhoto
)
// PATCH localhost:5000/technicians/bookings/.../complete
router.patch(
  '/bookings/:id/complete',
  auth,
  roleAuth('technician'),
  completeBooking
)
// PATCH /technicians/bookings/:id/reject
router.patch(
  '/bookings/:id/reject',
  auth,
  roleAuth('technician'),
  rejectBooking
)

// GET localhost:5000/technicians/profile
router.get('/profile', auth, roleAuth('technician'), getTechnicianProfile)
// PUT localhost:5000/technicians/profile
router.put('/profile', auth, roleAuth('technician'), updateTechnicianProfile)

// GET localhost:5000/technicians/reviews
router.get('/reviews', auth, roleAuth('technician'), getMyReviews)

export default router
