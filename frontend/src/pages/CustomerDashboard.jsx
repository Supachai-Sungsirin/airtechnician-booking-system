import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"

export default function CustomerDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("search")
  const [user, setUser] = useState(null)

  // Search state
  const [technicians, setTechnicians] = useState([])
  const [searchFilters, setSearchFilters] = useState({
    service: "",
    area: "",
    rating: "",
  })
  const [searchLoading, setSearchLoading] = useState(false)

  // Bookings state
  const [bookings, setBookings] = useState([])
  const [bookingsLoading, setBookingsLoading] = useState(false)

  // Selected technician for booking
  const [selectedTechnician, setSelectedTechnician] = useState(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [showTechnicianModal, setShowTechnicianModal] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    const role = localStorage.getItem("role")

    if (!token || role !== "customer") {
      navigate("/login")
      return
    }

    const userData = JSON.parse(localStorage.getItem("user") || "{}")
    setUser(userData)

    fetchTechnicians()
    fetchMyBookings()
  }, [navigate])

  const fetchTechnicians = async (filters = {}) => {
    setSearchLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.service) params.append("service", filters.service)
      if (filters.area) params.append("area", filters.area)
      if (filters.rating) params.append("rating", filters.rating)

      const response = await api.get(`/technicians?${params.toString()}`)
      setTechnicians(response.data)
    } catch (error) {
      console.error("Error fetching technicians:", error)
    } finally {
      setSearchLoading(false)
    }
  }

  const fetchMyBookings = async () => {
    setBookingsLoading(true)
    try {
      const response = await api.get("/bookings/my")
      setBookings(response.data)
    } catch (error) {
      console.error("Error fetching bookings:", error)
    } finally {
      setBookingsLoading(false)
    }
  }

  const handleSearch = () => {
    fetchTechnicians(searchFilters)
  }

  const handleViewTechnician = async (technicianId) => {
    try {
      const response = await api.get(`/technicians/${technicianId}`)
      setSelectedTechnician(response.data)
      setShowTechnicianModal(true)
    } catch (error) {
      console.error("Error fetching technician details:", error)
    }
  }

  const handleBookNow = (technician) => {
    setSelectedTechnician(technician)
    setShowBookingModal(true)
    setShowTechnicianModal(false)
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("role")
    localStorage.removeItem("user")
    navigate("/login")
  }

  const serviceTypes = [
    { value: "cleaning", label: "ล้างแอร์", icon: "🧼" },
    { value: "repair", label: "ซ่อมแอร์", icon: "🔧" },
    { value: "install", label: "ติดตั้งแอร์", icon: "⚙️" },
    { value: "maintenance", label: "บำรุงรักษา", icon: "🛠️" },
    { value: "refill", label: "เติมน้ำยา", icon: "💧" },
    { value: "move", label: "ย้ายแอร์", icon: "📦" },
  ]

  const bangkokDistricts = [
    "พระนคร",
    "ดุสิต",
    "หนองจอก",
    "บางรัก",
    "บางเขน",
    "บางกะปิ",
    "ปทุมวัน",
    "ป้อมปราบศัตรูพ่าย",
    "พระโขนง",
    "มีนบุรี",
    "ลาดกระบัง",
    "ยานนาวา",
    "สัมพันธวงศ์",
    "พญาไท",
    "ธนบุรี",
    "บางกอกใหญ่",
    "ห้วยขวาง",
    "คลองสาน",
    "ตลิ่งชัน",
    "บางกอกน้อย",
    "บางขุนเทียน",
    "ภาษีเจริญ",
    "หนองแขม",
    "ราษฎร์บูรณะ",
    "บางพลัด",
    "ดินแดง",
    "บึงกุ่ม",
    "สาทร",
    "บางซื่อ",
    "จตุจักร",
    "บางคอแหลม",
    "ประเวศ",
    "คลองเตย",
    "สวนหลวง",
    "จอมทอง",
    "ดอนเมือง",
    "ราชเทวี",
    "ลาดพร้าว",
    "วัฒนา",
    "บางแค",
    "หลักสี่",
    "สายไหม",
    "คันนายาว",
    "สะพานสูง",
    "วังทองหลาง",
    "คลองสามวา",
    "บางนา",
    "ทวีวัฒนา",
    "ทุ่งครุ",
    "บางบอน",
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">❄️</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">CoolTech</h1>
                <p className="text-xs text-gray-500">Customer Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user?.displayName || "ผู้ใช้งาน"}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ออกจากระบบ
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab("search")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "search"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              🔍 ค้นหาช่าง
            </button>
            <button
              onClick={() => setActiveTab("bookings")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "bookings"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              📋 การจองของฉัน
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "search" && (
          <SearchTechnicians
            technicians={technicians}
            searchFilters={searchFilters}
            setSearchFilters={setSearchFilters}
            handleSearch={handleSearch}
            searchLoading={searchLoading}
            handleViewTechnician={handleViewTechnician}
            handleBookNow={handleBookNow}
            serviceTypes={serviceTypes}
            bangkokDistricts={bangkokDistricts}
          />
        )}

        {activeTab === "bookings" && (
          <MyBookings
            bookings={bookings}
            bookingsLoading={bookingsLoading}
            setSelectedBooking={setSelectedBooking}
            setShowReviewModal={setShowReviewModal}
            fetchMyBookings={fetchMyBookings}
          />
        )}
      </main>

      {/* Modals */}
      {showTechnicianModal && selectedTechnician && (
        <TechnicianModal
          technician={selectedTechnician}
          onClose={() => setShowTechnicianModal(false)}
          onBook={() => handleBookNow(selectedTechnician)}
        />
      )}

      {showBookingModal && selectedTechnician && (
        <BookingModal
          technician={selectedTechnician}
          onClose={() => setShowBookingModal(false)}
          onSuccess={() => {
            setShowBookingModal(false)
            fetchMyBookings()
            setActiveTab("bookings")
          }}
          serviceTypes={serviceTypes}
        />
      )}

      {showReviewModal && selectedBooking && (
        <ReviewModal
          booking={selectedBooking}
          onClose={() => setShowReviewModal(false)}
          onSuccess={() => {
            setShowReviewModal(false)
            fetchMyBookings()
          }}
        />
      )}
    </div>
  )
}

// Search Technicians Component
function SearchTechnicians({
  technicians,
  searchFilters,
  setSearchFilters,
  handleSearch,
  searchLoading,
  handleViewTechnician,
  handleBookNow,
  serviceTypes,
  bangkokDistricts,
}) {
  return (
    <div className="space-y-6">
      {/* Search Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">ค้นหาช่างแอร์</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ประเภทบริการ</label>
            <select
              value={searchFilters.service}
              onChange={(e) => setSearchFilters({ ...searchFilters, service: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">ทั้งหมด</option>
              {serviceTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">พื้นที่</label>
            <select
              value={searchFilters.area}
              onChange={(e) => setSearchFilters({ ...searchFilters, area: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">ทั้งหมด</option>
              {bangkokDistricts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">คะแนนขั้นต่ำ</label>
            <select
              value={searchFilters.rating}
              onChange={(e) => setSearchFilters({ ...searchFilters, rating: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">ทั้งหมด</option>
              <option value="4.5">⭐ 4.5+</option>
              <option value="4.0">⭐ 4.0+</option>
              <option value="3.5">⭐ 3.5+</option>
              <option value="3.0">⭐ 3.0+</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleSearch}
          disabled={searchLoading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {searchLoading ? "กำลังค้นหา..." : "🔍 ค้นหา"}
        </button>
      </div>

      {/* Technicians Grid */}
      {searchLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">กำลังโหลดข้อมูลช่าง...</p>
        </div>
      ) : technicians.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500 text-lg">ไม่พบช่างที่ตรงกับเงื่อนไขการค้นหา</p>
          <p className="text-gray-400 text-sm mt-2">ลองปรับเปลี่ยนตัวกรองและค้นหาใหม่อีกครั้ง</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {technicians.map((technician) => (
            <div
              key={technician.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl flex-shrink-0">
                    {technician.profileImage ? (
                      <img
                        src={technician.profileImage || "/placeholder.svg"}
                        alt={technician.displayName}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      "👨‍🔧"
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{technician.displayName}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-yellow-500">⭐</span>
                      <span className="font-medium text-gray-900">{technician.rating?.toFixed(1) || "N/A"}</span>
                      <span className="text-gray-400 text-sm">({technician.reviewCount || 0})</span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{technician.bio || "ช่างมืออาชีพ พร้อมให้บริการ"}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {technician.services?.slice(0, 3).map((service, idx) => (
                    <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                      {service}
                    </span>
                  ))}
                  {technician.services?.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{technician.services.length - 3}
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewTechnician(technician.id)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    ดูโปรไฟล์
                  </button>
                  <button
                    onClick={() => handleBookNow(technician)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    จองเลย
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// My Bookings Component
function MyBookings({ bookings, bookingsLoading, setSelectedBooking, setShowReviewModal, fetchMyBookings }) {
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
                  <p className="text-sm text-gray-600 mt-1">บริการ: {booking.serviceType}</p>
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

// Technician Modal Component
function TechnicianModal({ technician, onClose, onBook }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-gray-900">โปรไฟล์ช่าง</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
              ×
            </button>
          </div>

          <div className="flex items-start gap-6 mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-4xl flex-shrink-0">
              {technician.profileImage ? (
                <img
                  src={technician.profileImage || "/placeholder.svg"}
                  alt={technician.displayName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                "👨‍🔧"
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900">{technician.displayName}</h3>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-yellow-500 text-xl">⭐</span>
                <span className="font-semibold text-gray-900">{technician.rating?.toFixed(1) || "N/A"}</span>
                <span className="text-gray-400">({technician.reviewCount || 0} รีวิว)</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">เกี่ยวกับช่าง</h4>
              <p className="text-gray-600">{technician.bio || "ช่างมืออาชีพ พร้อมให้บริการ"}</p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">บริการที่ให้</h4>
              <div className="flex flex-wrap gap-2">
                {technician.services?.map((service, idx) => (
                  <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full">
                    {service}
                  </span>
                ))}
              </div>
            </div>

            {technician.reviews && technician.reviews.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">รีวิวจากลูกค้า</h4>
                <div className="space-y-3">
                  {technician.reviews.slice(0, 3).map((review, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-yellow-500">⭐</span>
                        <span className="font-medium">{review.rating}</span>
                        <span className="text-gray-400 text-sm">• {review.customerName}</span>
                      </div>
                      <p className="text-gray-600 text-sm">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={onBook}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            จองช่างคนนี้
          </button>
        </div>
      </div>
    </div>
  )
}

// Booking Modal Component
function BookingModal({ technician, onClose, onSuccess, serviceTypes }) {
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

// Review Modal Component
function ReviewModal({ booking, onClose, onSuccess }) {
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
        bookingId: booking.id,
        ...formData,
      })
      alert("ส่งรีวิวเรียบร้อยแล้ว ขอบคุณสำหรับความคิดเห็น!")
      onSuccess()
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการส่งรีวิว กรุณาลองใหม่อีกครั้ง")
      console.error("Error submitting review:", error)
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
              <p className="text-gray-600 mt-1">ช่าง: {booking.technicianName}</p>
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
