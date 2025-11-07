import api from "../../services/api"

export default function MyBookings({
  bookings,
  bookingsLoading,
  setSelectedBooking,
  setShowReviewModal,
  fetchMyBookings,
}) {
  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      assigned: "bg-blue-100 text-blue-800",
      accepted: "bg-indigo-100 text-indigo-800",
      on_the_way: "bg-purple-100 text-purple-800",
      working: "bg-orange-100 text-orange-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    }
    return colors[status] || "bg-gray-100 text-gray-800"
  }

  const getStatusText = (status) => {
    const texts = {
      pending: "รอการยืนยัน",
      assigned: "มอบหมายช่างแล้ว",
      accepted: "ช่างรับงานแล้ว",
      on_the_way: "ช่างกำลังเดินทาง",
      working: "กำลังดำเนินการ",
      completed: "เสร็จสิ้น",
      cancelled: "ยกเลิกแล้ว",
    }
    return texts[status] || status
  }

  const handleCancelBooking = async (bookingId) => {
    if (!confirm("คุณต้องการยกเลิกการจองนี้ใช่หรือไม่?")) return

    try {
      await api.patch(`/booking/${bookingId}/status`, { status: "cancelled" })
      alert("ยกเลิกการจองเรียบร้อยแล้ว")
      fetchMyBookings()
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการยกเลิกการจอง")
      console.error("Error cancelling booking:", error)
    }
  }

  const handleReview = (booking) => {
    setSelectedBooking(booking)
    setShowReviewModal(true)
  }

  if (bookingsLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        <p className="mt-4 text-gray-600">กำลังโหลดข้อมูลการจอง...</p>
      </div>
    )
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
        <div className="text-6xl mb-4">📋</div>
        <p className="text-gray-500 text-lg">ยังไม่มีการจอง</p>
        <p className="text-gray-400 text-sm mt-2">เริ่มค้นหาช่างและจองบริการได้เลย</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <div
          key={booking._id}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xl flex-shrink-0">
                  👨‍🔧
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {booking.technicianId?.userId?.fullName || "กำลังจัดหาช่าง"}
                  </h3>
                  <div className="text-sm text-gray-600 mt-1">
                    <p className="font-medium">บริการ:</p>
                    {booking.services?.map((service, idx) => (
                      <p key={idx} className="ml-2">
                        • {service.serviceId?.name || "บริการ"}
                            {/* vvv นี่คือส่วนที่แก้ไข vvv */}
                        {service.btuRange && ` (${service.btuRange})`}{" "}
                            {/* ^^^ สิ้นสุดส่วนที่แก้ไข ^^^ */}
                            x{service.quantity} - ฿
                        {service.price}
                      </p>
                    ))}
                    <p className="font-semibold mt-1">รวม: ฿{booking.totalPrice}</p>
                  </div>
                  <p className="text-sm text-gray-600">
                    วันที่: {new Date(booking.requestedDateTime).toLocaleString("th-TH")}
                  </p>
                  {booking.address && <p className="text-sm text-gray-600">สถานที่: {booking.address}</p>}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                {getStatusText(booking.status)}
              </span>

              <div className="flex gap-2">
                {booking.status === "pending" && (
                  <button
                    onClick={() => handleCancelBooking(booking._id)}
                    className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    ยกเลิก
                  </button>
                )}

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
          </div>
        </div>
      ))}
    </div>
  )
}
