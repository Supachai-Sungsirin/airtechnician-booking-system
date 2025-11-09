import { useState } from "react"

export default function BookingHistory({ 
  bookings, 
  bookingsLoading, 
  setSelectedBooking, 
  setShowReviewModal 
}) {
  const [selectedImage, setSelectedImage] = useState(null)
  const [filterStatus, setFilterStatus] = useState("all") // สำหรับเก็บค่าที่เลือกจาก dropdown

  const getStatusColor = (status) => {
    const colors = {
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    }
    return colors[status] || "bg-gray-100 text-gray-800"
  }

  const getStatusText = (status) => {
    const texts = {
      completed: "เสร็จสิ้น",
      cancelled: "ยกเลิกแล้ว",
    }
    return texts[status] || status
  }

  const handleReview = (booking) => {
    setSelectedBooking(booking)
    setShowReviewModal(true)
  }

  // กรอง booking ที่เสร็จสิ้นหรือยกเลิก
  const filteredBookings = bookings
    .filter((b) => ["completed", "cancelled"].includes(b.status))
    .filter((b) => (filterStatus === "all" ? true : b.status === filterStatus))

  return (
    <>
      {/* 🔽 Dropdown สำหรับกรอง */}
      <div className="flex justify-end mb-4">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">ทั้งหมด</option>
          <option value="completed">เสร็จสิ้น</option>
          <option value="cancelled">ยกเลิกแล้ว</option>
        </select>
      </div>

      {/* 🔽 Loading / Empty / Booking List */}
      {bookingsLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <div className="text-6xl mb-4">📜</div>
          <p className="text-gray-500 text-lg">ไม่พบประวัติการจอง</p>
          <p className="text-gray-400 text-sm mt-2">
            ประวัติจะแสดงเมื่องานเสร็จสิ้นหรือถูกยกเลิก
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div
              key={booking._id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-xl flex-shrink-0 ${
                          booking.status === "completed"
                            ? "bg-gradient-to-br from-green-500 to-green-600"
                            : "bg-gradient-to-br from-red-500 to-red-600"
                        }`}
                      >
                        {booking.status === "completed" ? "✓" : "✕"}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {booking.technicianId?.userId?.fullName || "ไม่มีข้อมูลช่าง"}
                        </h3>
                        <div className="text-sm text-gray-600 mt-1">
                          <p className="font-medium">บริการ:</p>
                          {booking.services?.map((service, idx) => (
                            <p key={idx} className="ml-2">
                              • {service.serviceId?.name || "บริการ"}
                              {service.btuRange && ` (${service.btuRange})`} x{service.quantity} - ฿{service.price}
                            </p>
                          ))}
                          <p className="font-semibold mt-1">รวม: ฿{booking.totalPrice}</p>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          วันที่จอง: {new Date(booking.requestedDateTime).toLocaleString("th-TH")}
                        </p>
                        {booking.completedAt && (
                          <p className="text-sm text-gray-600">
                            วันที่เสร็จสิ้น: {new Date(booking.completedAt).toLocaleString("th-TH")}
                          </p>
                        )}
                        {booking.address && <p className="text-sm text-gray-600">สถานที่: {booking.address}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {getStatusText(booking.status)}
                    </span>
                    {booking.status === "completed" && !booking.hasReview && (
                      <button
                        onClick={() => handleReview(booking)}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        ให้คะแนน
                      </button>
                    )}
                    {booking.hasReview && (
                      <span className="px-3 py-1 text-sm text-green-600 bg-green-50 rounded-lg">✓ รีวิวแล้ว</span>
                    )}
                  </div>
                </div>

                {booking.status === "completed" && (
                  <div className="border-t border-gray-200 pt-4 space-y-3">
                    {booking.technicianNotes && (
                      <div className="bg-blue-50 rounded-lg p-4">
                        <p className="text-sm font-medium text-blue-900 mb-1">โน้ตจากช่าง:</p>
                        <p className="text-sm text-blue-800">{booking.technicianNotes}</p>
                      </div>
                    )}

                    {booking.jobPhotos && booking.jobPhotos.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">รูปภาพงาน:</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                          {booking.jobPhotos.map((photo, idx) => (
                            <div
                              key={idx}
                              className="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity border border-gray-200"
                              onClick={() => setSelectedImage(photo)}
                            >
                              <img
                                src={photo || "/placeholder.svg"}
                                alt={`งานที่ ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 📷 Modal แสดงภาพขยาย */}
      {selectedImage && (
        <div
          className="fixed inset-0 backdrop-blur-md bg-black/30 flex items-center justify-center z-50 p-4 transition-all"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              className="absolute -top-10 right-0 text-white hover:text-gray-300 text-2xl"
              onClick={() => setSelectedImage(null)}
            >
              ✕
            </button>
            <img
              src={selectedImage || "/placeholder.svg"}
              alt="ภาพขยาย"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  )
}
