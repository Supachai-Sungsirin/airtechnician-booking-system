import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  createBooking,
  getCustomerBookings,
  getTechnicianBookings,
  getBookings,
  getBookingById,
  updateBookingStatus,
  assignTechnician,
} from "../controllers/bookingController.js";

const router = express.Router();

// ลูกค้าสร้าง Booking
router.post("/", verifyToken, createBooking);
// ดึง Booking ของลูกค้าและช่าง
router.get("/customer", verifyToken, getCustomerBookings);
router.get("/technician", verifyToken, getTechnicianBookings);
router.get("/:id", verifyToken, getBookingById);
// อัพเดตสถานะ Booking
router.patch("/:id/status", verifyToken, updateBookingStatus);

// (สำหรับ Admin)
router.get("/", verifyToken, getBookings);
router.patch("/:id/assign-technician", verifyToken, assignTechnician);

export default router;
