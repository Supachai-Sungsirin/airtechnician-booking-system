import express from "express";
import { upload, uploadImage } from "../controllers/uploadController.js";

const router = express.Router();

// POST /upload/image
router.post("/image", upload.single("file"), uploadImage);

export default router;
