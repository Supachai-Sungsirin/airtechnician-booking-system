// controllers/reviewController.js
import Review from "../models/Review.js";
import Technician from "../models/Technician.js";
import Booking from "../models/Booking.js";

// ลูกค้าเพิ่ม Review หลังงานเสร็จ
export const createReview = async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;
    const customerId = req.user.id;

    // เช็ค Booking ว่าของลูกค้าคนนี้หรือไม่ และงานเสร็จแล้ว
    const booking = await Booking.findById(bookingId);
    if (!booking || booking.customerId.toString() !== customerId) {
      return res.status(400).json({ message: "ไม่พบ Booking ของคุณ หรือไม่สามารถรีวิวได้" });
    }

    if (booking.status !== "completed") {
      return res.status(400).json({ message: "ยังไม่สามารถรีวิวงานที่ยังไม่เสร็จได้" });
    }

    // เช็คว่ามี Review ของ Booking นี้แล้วหรือยัง
    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) {
      return res.status(400).json({ message: "คุณได้รีวิวงานนี้ไปแล้ว" });
    }

    // สร้าง Review
    const newReview = new Review({
      bookingId,
      customerId,
      technicianId: booking.technicianId,
      rating,
      comment
    });
    await newReview.save();

    // อัปเดต rating ของช่าง
    const technician = await Technician.findById(booking.technicianId);
    const totalRating = technician.rating * technician.totalReviews + rating;
    technician.totalReviews += 1;
    technician.rating = totalRating / technician.totalReviews;
    await technician.save();
    await Booking.findByIdAndUpdate(bookingId, { hasReview: true });

    res.status(201).json({ message: "รีวิวสำเร็จ", review: newReview });
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการสร้างรีวิว" });
  }
};

// ดึง Review ของช่าง
export const getReviewsByTechnician = async (req, res) => {
  try {
    const { technicianId } = req.params;
    const reviews = await Review.find({ technicianId }).populate("customerId", "fullName");
    res.json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงรีวิว" });
  }
};
