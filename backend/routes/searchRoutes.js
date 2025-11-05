import express from "express"
import { searchTechnicians } from "../controllers/searchController.js"

const router = express.Router()

/**
 * Public route - ไม่ต้อง auth
 * GET /api/search/technicians?district=บางกะปิ&serviceIds=serviceId1,serviceId2
 */
router.get("/technicians", searchTechnicians)

export default router
