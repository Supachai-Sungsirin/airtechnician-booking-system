import { useState, useEffect } from "react"
import api from "../../services/api"
import { Calendar, DollarSign } from "lucide-react"

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

export default function ManageBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    fetchBookings()
  }, [])

const fetchBookings = async () => {
    try {
      setLoading(true)
      const response = await api.get("/admin/bookings") 
      setBookings(response.data?.data || []) 
    } catch (error) {
      console.error("Error fetching all bookings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetail = async (bookingId) => {
    setDetailLoading(true)
    setSelectedBooking(null)
    setShowDetailModal(true)
    try {
      // ดึงรายละเอียดการจองด้วย ID (ใช้ API /booking/:id)
      const response = await api.get(`/booking/${bookingId}`)
      setSelectedBooking(response.data) 
    } catch (error) {
      console.error("Error fetching booking detail:", error)
      alert("เกิดข้อผิดพลาดในการดึงรายละเอียดการจอง")
      setShowDetailModal(false)
    } finally {
      setDetailLoading(false)
    }
  }

  const handleUpdateStatus = async (bookingId, newStatus) => {
    if (!window.confirm(`คุณต้องการเปลี่ยนสถานะเป็น '${getStatusText(newStatus)}' ใช่หรือไม่?`)) return
    
    try {
        // API สำหรับอัปเดตสถานะ
        await api.patch(`/booking/${bookingId}/status`, { status: newStatus })
        alert("อัปเดตสถานะสำเร็จ")
        fetchBookings()
        setShowDetailModal(false)
    } catch (error) {
        console.error("Error updating status:", error)
        alert(error.response?.data?.message || "เกิดข้อผิดพลาดในการอัปเดตสถานะ")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">จัดการการจองทั้งหมด</h2>
        <p className="text-sm text-gray-600 mt-1">มีรายการจองทั้งหมด {bookings.length} รายการ</p>
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
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    ไม่พบรายการจองในระบบ
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => {
                    const technicianName = booking.technicianId?.userId?.fullName || "กำลังจัดหาช่าง";
                    const serviceNames = booking.services?.map(s => s.serviceId?.name).join(', ') || 'N/A';

                    return (
                        <tr key={booking._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900 truncate max-w-[100px]">
                                    {booking._id}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {new Date(booking.requestedDateTime).toLocaleString("th-TH")}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{booking.customerId?.fullName || 'N/A'} (ลูกค้า)</div>
                                <div className="text-sm text-blue-600">{technicianName} (ช่าง)</div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="text-sm text-gray-700 max-w-[200px] truncate">{serviceNames}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-semibold text-green-700">฿{booking.totalPrice?.toLocaleString() || '0'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                                    {getStatusText(booking.status)}
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
                    )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Detail Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-xl w-full my-8">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">รายละเอียดการจอง</h3>
              <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600">
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
                        <p className="text-md font-semibold text-gray-900 mb-4">ID: {selectedBooking._id}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                        <div className="col-span-2">
                            <p className="text-sm font-medium text-gray-700 mb-1">สถานะปัจจุบัน</p>
                            <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusColor(selectedBooking.status)}`}>
                                {getStatusText(selectedBooking.status)}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-1">วัน/เวลาที่ต้องการ</p>
                            <p className="text-gray-900 flex items-center text-sm"><Calendar className="w-4 h-4 mr-2" />{new Date(selectedBooking.requestedDateTime).toLocaleString("th-TH")}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-1">ราคารวม (ประมาณการ)</p>
                            <p className="text-green-600 font-semibold flex items-center text-sm"><DollarSign className="w-4 h-4 mr-2" />฿{selectedBooking.totalPrice?.toLocaleString()}</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-sm font-medium text-gray-700 mb-1">ที่อยู่</p>
                            <p className="text-gray-900 text-sm">{selectedBooking.address}</p>
                            <p className="text-gray-600 text-xs">เขต: {selectedBooking.district}</p>
                        </div>
                    </div>
                    
                    <div className="border-t pt-4">
                        <h4 className="text-base font-semibold text-gray-900 mb-3">ข้อมูลบริการ</h4>
                        {selectedBooking.services.map((service, index) => (
                            <div key={index} className="flex justify-between border-b pb-2 mb-2">
                                <div className="text-sm text-gray-800 flex-1">
                                    <p className="font-medium">{service.serviceId?.name}</p>
                                    <p className="text-xs text-gray-500">BTU: {service.btuRange || 'ราคาแบบเหมาจ่าย'} x {service.quantity}</p>
                                </div>
                                <p className="text-sm font-semibold text-gray-700">฿{service.price?.toLocaleString()}</p>
                            </div>
                        ))}
                    </div>

                    <div className="border-t pt-4">
                        <h4 className="text-base font-semibold text-gray-900 mb-3">ลูกค้าและช่าง</h4>
                        <div className="grid grid-cols-2 gap-y-3">
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-1">ลูกค้า</p>
                                <p className="text-gray-900 text-sm">{selectedBooking.customerId?.fullName}</p>
                                <p className="text-gray-600 text-xs">{selectedBooking.customerId?.phone}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-1">ช่างที่ได้รับมอบหมาย</p>
                                <p className="text-blue-600 text-sm">{selectedBooking.technicianId?.userId?.fullName || 'กำลังจัดหาช่าง'}</p>
                                <p className="text-gray-600 text-xs">{selectedBooking.technicianId?.userId?.phone || '-'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <p className="text-sm font-medium text-gray-700 mb-1">คำอธิบายปัญหา</p>
                        <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg">{selectedBooking.problemDescription}</p>
                    </div>

                    {selectedBooking.technicianNotes && (
                        <div className="border-t pt-4">
                            <p className="text-sm font-medium text-gray-700 mb-1">โน้ตจากช่าง</p>
                            <p className="text-gray-700 text-sm bg-blue-50 p-3 rounded-lg">{selectedBooking.technicianNotes}</p>
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
                onChange={(e) => handleUpdateStatus(selectedBooking._id, e.target.value)}
                value={selectedBooking?.status || "pending"}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium cursor-pointer"
              >
                <option value="" disabled>เปลี่ยนสถานะ</option>
                <option value="pending">รอการยืนยัน</option>
                <option value="assigned">มอบหมายช่างแล้ว</option>
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
    </div>
  )
}