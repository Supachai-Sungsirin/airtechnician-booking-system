import { useState } from "react"
import api from "../../services/api"

export default function BookingModal({ technician, onClose, onSuccess, serviceTypes }) {
  const [formData, setFormData] = useState({
    serviceType: "",
    requestedDateTime: "",
    problemDescription: "",
    address: "",
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await api.post("/bookings", {
        technicianId: technician.id,
        ...formData,
      })
      alert("จองสำเร็จ! รอช่างยืนยันการจอง")
      onSuccess()
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการจอง กรุณาลองใหม่อีกครั้ง")
      console.error("Error creating booking:", error)
      // --- 💡 [แก้ไข] ---
      // ให้แสดงข้อความ Error ที่แท้จริงจาก Backend
      if (error.response && error.response.data && error.response.data.message) {
        alert(error.response.data.message); 
      } else {
        // ถ้าเป็น Error อื่นๆ ที่ไม่ใช่จาก Backend (เช่น เน็ตตัด)
        alert("เกิดข้อผิดพลาดในการจอง กรุณาลองใหม่อีกครั้ง")
      }
      // --- จบส่วนแก้ไข ---
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">จองบริการ</h2>
              <p className="text-gray-600 mt-1">ช่าง: {technician.displayName}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ประเภทบริการ *</label>
              <select
                required
                value={formData.serviceType}
                onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">เลือกบริการ</option>
                {serviceTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">วันและเวลาที่ต้องการ *</label>
              <input
                type="datetime-local"
                required
                value={formData.requestedDateTime}
                onChange={(e) => setFormData({ ...formData, requestedDateTime: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ที่อยู่ *</label>
              <textarea
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={3}
                placeholder="กรอกที่อยู่สำหรับให้บริการ"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">อธิบายปัญหา</label>
              <textarea
                value={formData.problemDescription}
                onChange={(e) => setFormData({ ...formData, problemDescription: e.target.value })}
                rows={4}
                placeholder="อธิบายปัญหาหรือความต้องการเพิ่มเติม (ถ้ามี)"
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
                {loading ? "กำลังจอง..." : "ยืนยันการจอง"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}