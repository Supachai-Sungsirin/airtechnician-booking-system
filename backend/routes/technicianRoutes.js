import express from "express";
import { auth, roleAuth } from "../middleware/authMiddleware.js";
import { getAssignedBookings, acceptBooking, updateTechnicianProfile, getMyReviews, completeBooking } from "../controllers/technicianController.js";

const router = express.Router();

// GET localhost:5000/technicians/bookings
router.get("/bookings", auth, roleAuth("technician"), getAssignedBookings);
// PUT localhost:5000/technicians/bookings/.../accept
router.put("/bookings/:id/accept", auth, roleAuth("technician"), acceptBooking);
// PATCH localhost:5000/technicians/bookings/.../complete
router.patch(
    "/bookings/:id/complete",
    auth,
    roleAuth("technician"),
    completeBooking
);

// Update technician profile
// PUT localhost:5000/technicians/profile
router.put("/profile", auth, roleAuth("technician"), updateTechnicianProfile);

// GET localhost:5000/technicians/reviews
router.get(
    "/reviews",
    auth,
    roleAuth("technician"),
    getMyReviews
);


export default router;
