"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"
import SearchTechnicians from "../components/customer/SearchTechnicians"
import MyBookings from "../components/customer/MyBookings"
import TechnicianModal from "../components/customer/TechnicianModal"
import BookingModal from "../components/customer/BookingModal"
import ReviewModal from "../components/customer/ReviewModal"

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
            serviceTypes={serviceTypes}
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
