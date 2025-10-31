import express from "express";
import { auth, roleAuth } from "../middleware/authMiddleware.js";
import { getAssignedBookings, acceptBooking } from "../controllers/technicianController.js";

const router = express.Router();

router.get("/", auth, roleAuth("technician"), getAssignedBookings);
router.put("/:id/accept", auth, roleAuth("technician"), acceptBooking);

export default router;
