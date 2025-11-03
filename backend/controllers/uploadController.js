import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ตั้งค่า multer (เก็บไฟล์ใน memory ก่อนอัปโหลด)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Controller สำหรับอัปโหลด
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "กรุณาเลือกไฟล์" });
    }

    // แปลง buffer → base64 string เพื่ออัปโหลดเข้า Cloudinary
    const fileBase64 = Buffer.from(req.file.buffer).toString("base64");
    const fileDataUri = `data:${req.file.mimetype};base64,${fileBase64}`;

    const result = await cloudinary.uploader.upload(fileDataUri, {
      folder: "technician_verification",
    });

    res.json({
      message: "อัปโหลดสำเร็จ",
      imageUrl: result.secure_url,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "อัปโหลดล้มเหลว", error });
  }
};

// export multer middleware
export { upload };