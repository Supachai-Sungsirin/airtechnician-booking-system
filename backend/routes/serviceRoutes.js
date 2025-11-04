import express from "express";
import Service from "../models/Service.js";

const router = express.Router();

// ดึงบริการทั้งหมด (ที่ active)
router.get("/", async (req, res) => {
  try {
    const services = await Service.find({ active: true });
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูลบริการ" });
  }
});

export default router;
