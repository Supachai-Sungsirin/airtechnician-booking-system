import express from "express";
import { auth, roleAuth } from "../middleware/auth.js";
import { getAssignedBookings, acceptBooking } from "../controllers/technicianController.js";

const router = express.Router();

router.get("/bookings", auth, roleAuth("technician"), getAssignedBookings);
router.put("/booking/:id/accept", auth, roleAuth("technician"), acceptBooking);

export default router;
