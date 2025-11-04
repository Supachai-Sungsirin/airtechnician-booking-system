"use client"

import { useState } from "react"
import api from "../../services/api"

export default function ReviewModal({ booking, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    rating: 5,
    comment: "",
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await api.post("/reviews", {
        bookingId: booking._id,
        rating: formData.rating,
        comment: formData.comment,
      })
      alert("ส่งรีวิวเรียบร้อยแล้ว ขอบคุณสำหรับความคิดเห็น!")
      onSuccess()
    } catch (error) {
      console.error("Error submitting review:", error)
      if (error.response && error.response.data && error.response.data.message) {
        alert(error.response.data.message)
      } else {
        alert("เกิดข้อผิดพลาดในการส่งรีวิว กรุณาลองใหม่อีกครั้ง")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">ให้คะแนนและรีวิว</h2>
              <p className="text-gray-600 mt-1">ช่าง: {booking.technicianId?.userId?.fullName || "ช่าง"}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">ให้คะแนน *</label>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className={`text-4xl transition-all ${
                      star <= formData.rating ? "text-yellow-500" : "text-gray-300"
                    } hover:scale-110`}
                  >
                    ⭐
                  </button>
                ))}
              </div>
              <p className="text-center mt-2 text-gray-600 font-medium">{formData.rating} ดาว</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ความคิดเห็น *</label>
              <textarea
                required
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                rows={4}
                placeholder="แบ่งปันประสบการณ์การใช้บริการของคุณ..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "กำลังส่ง..." : "ส่งรีวิว"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
