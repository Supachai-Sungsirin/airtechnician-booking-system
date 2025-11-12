import { useState, useEffect } from "react";
import api from "../../services/api";
import { Calendar } from "lucide-react";

const getStatusColor = (status) => {
  const colors = {
    pending: "bg-yellow-100 text-yellow-800",
    assigned: "bg-blue-100 text-blue-800",
    accepted: "bg-indigo-100 text-indigo-800",
    on_the_way: "bg-purple-100 text-purple-800",
    working: "bg-orange-100 text-orange-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
};

const getStatusText = (status) => {
  const texts = {
    pending: "รอการยืนยัน",
    assigned: "มอบหมายช่างแล้ว",
    accepted: "ช่างรับงานแล้ว",
    on_the_way: "ช่างกำลังเดินทาง",
    working: "กำลังดำเนินการ",
    completed: "เสร็จสิ้น",
    cancelled: "ยกเลิกแล้ว",
  };
  return texts[status] || status;
};

const getPaymentStatusText = (status) => {
  const texts = {
    pending_payment: "รอชำระเงิน",
    paid: "ชำระเงินแล้ว",
  };
  return texts[status] || status;
};

const getCombinedStatusText = (booking) => {
  const bookingText = getStatusText(booking.status);
  const paymentStatus = booking.paymentStatus;
  if (booking.status === "completed") {
    return paymentStatus === "paid" ? "เสร็จสิ้น" : "เสร็จสิ้น (รอชำระเงิน)";
  }
  if (paymentStatus === "paid") {
    return `${bookingText}`;
  }
  return bookingText;
};

const getCombinedStatusColor = (booking) => {
  if (
    booking.status === "completed" &&
    booking.paymentStatus === "pending_payment"
  ) {
    return "bg-orange-100 text-orange-800";
  }
  if (booking.status === "completed" && booking.paymentStatus === "paid") {
    return "bg-green-300 text-green-900";
  }
  return getStatusColor(booking.status);
};

export default function ManageBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState({
    bookingId: null,
    newStatus: null,
    newStatusText: null,
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  // กรองสถานะก่อน
  const filteredBookings = bookings.filter((booking) => {
    if (filterStatus === "all") {
      return true;
    }
    return booking.status === filterStatus;
  });

  // แล้วค่อยคำนวณ Pagination หลังจากนั้น
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBookings = filteredBookings.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const statusOptions = [
    { value: "all", label: "ทั้งหมด" },
    { value: "pending", label: "รอการยืนยัน" },
    { value: "accepted", label: "ช่างรับงานแล้ว" },
    { value: "on_the_way", label: "ช่างกำลังเดินทาง" },
    { value: "working", label: "กำลังดำเนินการ" },
    { value: "completed", label: "เสร็จสิ้น" },
    { value: "cancelled", label: "ยกเลิกแล้ว" },
  ];

  if (loading) {
  }

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/bookings");
      setBookings(response.data?.data || []);
    } catch (error) {
      console.error("Error fetching all bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (bookingId) => {
    setDetailLoading(true);
    setSelectedBooking(null);
    setShowDetailModal(true);
    try {
      // ดึงรายละเอียดการจองด้วย ID (ใช้ API /booking/:id)
      const response = await api.get(`/booking/${bookingId}`);
      setSelectedBooking(response.data);
    } catch (error) {
      console.error("Error fetching booking detail:", error);
      alert("เกิดข้อผิดพลาดในการดึงรายละเอียดการจอง");
      setShowDetailModal(false);
    } finally {
      setDetailLoading(false);
    }
  };

 const handleUpdateStatus = (bookingId, newStatus) => {
    // ป้องกันการทำงานหากสถานะไม่เปลี่ยนแปลง
    if (selectedBooking && selectedBooking.status === newStatus) return;

    setConfirmAction({
      bookingId: bookingId,
      newStatus: newStatus,
      newStatusText: getStatusText(newStatus),
    });
    setShowConfirmModal(true);
  };

  const performUpdateStatus = async () => {
    const { bookingId, newStatus } = confirmAction;

    if (!bookingId || !newStatus) return;

    // ปิด Modal ยืนยัน
    setShowConfirmModal(false);

    try {
      // API สำหรับอัปเดตสถานะ
      await api.patch(`/booking/${bookingId}/status`, { status: newStatus });
      alert("อัปเดตสถานะสำเร็จ");
      fetchBookings(); // ดึงข้อมูลใหม่
      setShowDetailModal(false); // ปิด Modal รายละเอียดการจอง
    } catch (error) {
      console.error("Error updating status:", error);
      alert(error.response?.data?.message || "เกิดข้อผิดพลาดในการอัปเดตสถานะ");
    } finally {
      // ล้างสถานะการยืนยัน
      setConfirmAction({ bookingId: null, newStatus: null, newStatusText: null });
    }
  };

  const cancelConfirmation = () => {
    setShowConfirmModal(false);
    setConfirmAction({ bookingId: null, newStatus: null, newStatusText: null });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
        {/* ส่วนหัวและจำนวน */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            จัดการการจองทั้งหมด
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            มีรายการจองทั้งหมด {bookings.length} รายการ
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <label
            htmlFor="statusFilter"
            className="text-sm font-medium text-gray-700 whitespace-nowrap hidden sm:block"
          >
            สถานะ:
          </label>
          <select
            id="statusFilter"
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm bg-white w-full sm:w-auto"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bookings List */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  #ID / วันที่จอง
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ลูกค้า / ช่าง
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  บริการ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ราคา
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  สถานะ
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    ไม่พบรายการจองในระบบ
                  </td>
                </tr>
              ) : (
                currentBookings.map((booking) => {
                  const technicianName =
                    booking.technicianId?.userId?.fullName || "กำลังจัดหาช่าง";
                  const serviceNames =
                    booking.services
                      ?.map((s) => s.serviceId?.name)
                      .join(", ") || "N/A";

                  return (
                    <tr key={booking._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 truncate max-w-[100px]">
                          {booking._id}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(booking.requestedDateTime).toLocaleString(
                            "th-TH"
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {booking.customerId?.fullName || "N/A"} (ลูกค้า)
                        </div>
                        <div className="text-sm text-blue-600">
                          {technicianName} (ช่าง)
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-700 max-w-[200px] truncate">
                          {serviceNames}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-green-700">
                          ฿
                          {(
                            booking.finalPrice ||
                            booking.totalPrice ||
                            0
                          )?.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getCombinedStatusColor(
                            booking
                          )}`}
                        >
                          {getCombinedStatusText(booking)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleViewDetail(booking._id)}
                          className="text-blue-600 hover:text-blue-900 font-medium"
                        >
                          ดูรายละเอียด
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          {/* Pagination Controls */}
          {filteredBookings.length > itemsPerPage && (
            <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-t">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  currentPage === 1
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-white border border-gray-300 hover:bg-gray-100"
                }`}
              >
                ย้อนกลับ
              </button>

              <span className="text-sm text-gray-600">
                หน้า {currentPage} จาก {totalPages}
              </span>

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  currentPage === totalPages
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-white border border-gray-300 hover:bg-gray-100"
                }`}
              >
                ถัดไป
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-xl w-full my-8">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">
                รายละเอียดการจอง
              </h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                &times;
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {detailLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : selectedBooking ? (
                <div className="space-y-6">
                  <div>
                    <p className="text-md font-semibold text-gray-900 mb-4">
                      ID: {selectedBooking._id}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        สถานะปัจจุบัน
                      </p>
                      <span
                        className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getCombinedStatusColor(
                          selectedBooking
                        )}`}
                      >
                        {getCombinedStatusText(selectedBooking)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        วัน/เวลาที่ต้องการ
                      </p>
                      <p className="text-gray-900 flex items-center text-sm">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(
                          selectedBooking.requestedDateTime
                        ).toLocaleString("th-TH")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        ราคารวม
                      </p>
                      <p className="text-green-600 font-semibold flex items-center text-sm">
                        {(() => {
                          const price =
                            selectedBooking.finalPrice ||
                            selectedBooking.totalPrice ||
                            0;
                          return `${price.toLocaleString()} ฿`;
                        })()}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        ที่อยู่
                      </p>
                      <p className="text-gray-900 text-sm">
                        {selectedBooking.address}
                      </p>
                      <p className="text-gray-600 text-xs">
                        เขต: {selectedBooking.district}
                      </p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="text-base font-semibold text-gray-900 mb-3">
                      ข้อมูลบริการ
                    </h4>
                    {selectedBooking.services.map((service, index) => (
                      <div
                        key={index}
                        className="flex justify-between border-b pb-2 mb-2"
                      >
                        <div className="text-sm text-gray-800 flex-1">
                          <p className="font-medium">
                            {service.serviceId?.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            BTU: {service.btuRange || "ราคาแบบเหมาจ่าย"} x{" "}
                            {service.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-gray-700">
                          {service.price?.toLocaleString()} ฿
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="text-base font-semibold text-gray-900 mb-3">
                      ลูกค้าและช่าง
                    </h4>
                    <div className="grid grid-cols-2 gap-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          ลูกค้า
                        </p>
                        <p className="text-gray-900 text-sm">
                          {selectedBooking.customerId?.fullName}
                        </p>
                        <p className="text-gray-600 text-xs">
                          {selectedBooking.customerId?.phone}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          ช่างที่ได้รับมอบหมาย
                        </p>
                        <p className="text-blue-600 text-sm">
                          {selectedBooking.technicianId?.userId?.fullName ||
                            "กำลังจัดหาช่าง"}
                        </p>
                        <p className="text-gray-600 text-xs">
                          {selectedBooking.technicianId?.userId?.phone || "-"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      คำอธิบายปัญหา
                    </p>
                    <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg">
                      {selectedBooking.problemDescription}
                    </p>
                  </div>

                  {selectedBooking.technicianNotes && (
                    <div className="border-t pt-4">
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        โน้ตจากช่าง
                      </p>
                      <p className="text-gray-700 text-sm bg-blue-50 p-3 rounded-lg">
                        {selectedBooking.technicianNotes}
                      </p>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            <div className="p-6 border-t flex gap-3">
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                ปิด
              </button>
              {/* Dropdown สำหรับเปลี่ยนสถานะ */}
              <select
                onChange={(e) =>
                  handleUpdateStatus(selectedBooking._id, e.target.value)
                }
                value={selectedBooking?.status || "pending"}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium cursor-pointer"
              >
                <option value="" disabled>
                  เปลี่ยนสถานะ
                </option>
                <option value="pending">รอการยืนยัน</option>
                <option value="accepted">ช่างรับงานแล้ว</option>
                <option value="on_the_way">ช่างกำลังเดินทาง</option>
                <option value="working">กำลังดำเนินการ</option>
                <option value="completed">เสร็จสิ้น</option>
                <option value="cancelled">ยกเลิก</option>
              </select>
            </div>
          </div>
        </div>
      )}
      {showConfirmModal && confirmAction.bookingId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full transform transition-all">
            
            <div className="p-6 sm:p-8">
              <div className="flex items-start">
                {/* ไอคอนเตือน */}
                <div className="mx-auto shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <svg
                    className="h-6 w-6 text-red-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.3 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>

                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                  <h3 className="text-lg leading-6 font-bold text-gray-900" id="modal-title">
                    ยืนยันการเปลี่ยนสถานะ
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-700">
                      คุณกำลังจะเปลี่ยนสถานะการจอง{" "}
                      <span className="font-semibold text-blue-600">
                        ID: {confirmAction.bookingId}
                      </span>{" "}
                      เป็น{" "}
                      <span className="font-semibold text-red-600">
                        '{confirmAction.newStatusText}'
                      </span>
                      <br/>
                      โปรดยืนยันการดำเนินการนี้.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ปุ่ม Actions */}
            <div className="bg-gray-50 px-6 py-4 sm:flex sm:flex-row-reverse sm:px-8 rounded-b-xl">
              <button
                type="button"
                onClick={performUpdateStatus}
                className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
              >
                ยืนยัน ({confirmAction.newStatusText})
              </button>
              <button
                type="button"
                onClick={cancelConfirmation}
                className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm transition-colors"
              >
                ยกเลิก
              </button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
