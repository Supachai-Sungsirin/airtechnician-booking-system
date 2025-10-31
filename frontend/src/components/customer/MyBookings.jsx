import api from "../../services/api"

export default function MyBookings({
  bookings,
  bookingsLoading,
  setSelectedBooking,
  setShowReviewModal,
  fetchMyBookings,
  serviceTypes,
}) {
  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      in_progress: "bg-purple-100 text-purple-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    }
    return colors[status] || "bg-gray-100 text-gray-800"
  }

  const getStatusText = (status) => {
    const texts = {
      pending: "รอการยืนยัน",
      confirmed: "ยืนยันแล้ว",
      in_progress: "กำลังดำเนินการ",
      completed: "เสร็จสิ้น",
      cancelled: "ยกเลิกแล้ว",
    }
    return texts[status] || status
  }

  const getServiceLabel = (value) => {
    if (!serviceTypes) return value; // ป้องกัน error ถ้า serviceTypes ยังไม่โหลด
    const service = serviceTypes.find(s => s.value === value);
    return service ? service.label : value; // ถ้าหาไม่เจอ ก็ให้แสดง value เดิมไปก่อน
  };

  const handleCancelBooking = async (bookingId) => {
    if (!confirm("คุณต้องการยกเลิกการจองนี้ใช่หรือไม่?")) return

    try {
      await api.put(`/bookings/${bookingId}/cancel`)
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
          key={booking.id}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xl flex-shrink-0">
                  👨‍🔧
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{booking.technicianName}</h3>
                  <p className="text-sm text-gray-600 mt-1">บริการ: {getServiceLabel(booking.serviceType)}</p>
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
                    onClick={() => handleCancelBooking(booking.id)}
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
