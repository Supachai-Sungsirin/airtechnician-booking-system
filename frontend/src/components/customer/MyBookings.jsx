import { useState } from "react";
import api from "../../services/api"

export default function MyBookings({
  bookings,
  bookingsLoading,
  fetchMyBookings,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
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

// --- ⭐️ (แก้ไข) 1. ฟังก์ชันนี้สำหรับเปิด Modal ---
  const openCancelModal = (booking) => {
    setBookingToCancel(booking);
    setIsModalOpen(true);
  };

  // --- ⭐️ (เพิ่ม) 2. ฟังก์ชันนี้สำหรับยิง API (ปุ่ม "ยืนยัน" ใน Modal) ---
  const handleConfirmCancel = async () => {
    if (!bookingToCancel) return;

    setIsCancelling(true);
    try {
      await api.patch(`/booking/${bookingToCancel._id}/status`, { status: "cancelled" });
      // alert("ยกเลิกการจองเรียบร้อยแล้ว"); // (ลบ alert ออก)
      fetchMyBookings();
      closeModal(); // ปิด Modal เมื่อสำเร็จ
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการยกเลิกการจอง"); // (ยังเก็บ alert นี้ไว้สำหรับ Error)
      console.error("Error cancelling booking:", error);
    } finally {
      setIsCancelling(false);
    }
  };

  // --- ⭐️ (เพิ่ม) 3. ฟังก์ชันสำหรับปิด Modal ---
  const closeModal = () => {
    setIsModalOpen(false);
    setBookingToCancel(null);
    setIsCancelling(false); // Reset loading state
  };

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
                  {booking.technicianId?.userId?.profileImageUrl ? (
                  <img
                    src={booking.technicianId.userId.profileImageUrl}
                    alt={booking.technicianId.userId.fullName || "Profile"}
                    className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xl flex-shrink-0">
                    👨‍🔧
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {booking.technicianId?.userId?.fullName || "กำลังจัดหาช่าง"}
                  </h3>
                  <div className="text-sm text-gray-600 mt-1">
                    <p className="font-medium">บริการ:</p>
                    {booking.services?.map((service, idx) => (
                      <p key={idx} className="ml-2">
                        • {service.serviceId?.name || "บริการ"}
                        {service.btuRange && ` (${service.btuRange})`}{" "}
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
                    onClick={() => openCancelModal(booking)}
                    className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    ยกเลิก
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
      {/* --- ⭐️ (เพิ่ม) 5. JSX สำหรับ Modal --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              ยืนยันการยกเลิก
            </h3>
            <p className="text-gray-600 mb-6">
              คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการจองนี้?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={closeModal}
                disabled={isCancelling}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={isCancelling}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
              >
                {isCancelling ? "กำลังยกเลิก..." : "ยืนยัน"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
