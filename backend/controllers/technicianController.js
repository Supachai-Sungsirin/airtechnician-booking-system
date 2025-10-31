import Technician from "../models/Technician.js";
import Booking from "../models/Booking.js";

export const getAssignedBookings = async (req, res) => {
  try {
    const tech = await Technician.findOne({ userId: req.user.id });

    const bookings = await Booking.find({
      technicianId: tech._id,
    });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
};

export const acceptBooking = async (req, res) => {
  try {
    const tech = await Technician.findOne({ userId: req.user.id });

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: "accepted" },
      { new: true }
    );

    res.json({ message: "รับงานแล้ว", booking });
  } catch {
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
};
