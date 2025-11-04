"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"
import MyBookings from "../components/customer/MyBookings"
import BookingModal from "../components/customer/BookingModal"
import ReviewModal from "../components/customer/ReviewModal"

export default function CustomerDashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)

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

    fetchMyBookings()
  }, [navigate])

  const fetchMyBookings = async () => {
    setBookingsLoading(true)
    try {
      const response = await api.get("/bookings/customer")
      setBookings(response.data)
    } catch (error) {
      console.error("Error fetching bookings:", error)
    } finally {
      setBookingsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("role")
    localStorage.removeItem("user")
    navigate("/login")
  }

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
                <p className="text-sm font-medium text-gray-900">{user?.fullName || "ผู้ใช้งาน"}</p>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">การจองของฉัน</h2>
              <p className="text-sm text-gray-600 mt-1">ระบบจะแมทช์ช่างที่เหมาะสมให้อัตโนมัติตามเขตของคุณ</p>
            </div>
            <button
              onClick={() => setShowBookingModal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
            >
              <span className="text-xl">+</span>
              จองบริการใหม่
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MyBookings
          bookings={bookings}
          bookingsLoading={bookingsLoading}
          setSelectedBooking={setSelectedBooking}
          setShowReviewModal={setShowReviewModal}
          fetchMyBookings={fetchMyBookings}
        />
      </main>

      {/* Modals */}
      {showBookingModal && (
        <BookingModal
          onClose={() => setShowBookingModal(false)}
          onSuccess={() => {
            setShowBookingModal(false)
            fetchMyBookings()
          }}
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
