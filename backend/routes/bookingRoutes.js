import express from "express";
import { auth } from "../middleware/authMiddleware.js";
import {
  createBooking,
  getCustomerBookings,
  getTechnicianBookings,
  getBookings,
  getBookingById,
  updateBookingStatus,
  assignTechnician,
  checkAvailability,
  mockCompletePayment
} from "../controllers/bookingController.js";

const router = express.Router();

// ลูกค้าสร้าง Booking
router.post("/", auth, createBooking);
// PATCH /api/booking/:id/mock-pay
router.patch(
  "/:id/mock-pay", auth, mockCompletePayment);
// ตรวจสอบช่างที่ว่าง
router.get("/check-availability", checkAvailability);
// ดึง Booking ของลูกค้าและช่าง
router.get("/customer", auth, getCustomerBookings);
router.get("/technician", auth, getTechnicianBookings);
router.get("/:id", auth, getBookingById);
// อัพเดตสถานะ Booking
router.patch("/:id/status", auth, updateBookingStatus);

// (สำหรับ Admin)
router.get("/", auth, getBookings);
router.patch("/:id/assign-technician", auth, assignTechnician);

export default router;
