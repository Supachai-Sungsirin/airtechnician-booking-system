import { useState, useEffect } from "react"
import api from "../../services/api"
import { Users, Wrench, Clock, BookOpenCheck, ListChecks } from "lucide-react"

export default function DashboardStats() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await api.get("/admin/dashboard/stats")
      setStats(response.data.data)
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Customers */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">ลูกค้าทั้งหมด</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.users.totalCustomers}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Total Technicians */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">ช่างทั้งหมด</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.users.totalTechnicians}</p>
              <p className="text-xs text-green-600 mt-1">อนุมัติแล้ว: {stats.users.approvedTechnicians}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Wrench className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Pending Technicians */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">ช่างรออนุมัติ</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.users.pendingTechnicians}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Total Bookings */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">การจองทั้งหมด</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.bookings.totalBookings}</p>
              <p className="text-xs text-gray-600 mt-1">
                สำเร็จ: {stats.bookings.completedBookings} | ยกเลิก: {stats.bookings.cancelledBookings}
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <BookOpenCheck className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Services Count */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">บริการทั้งหมด</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.services} บริการ</p>
          </div>
          <div className="p-3 bg-indigo-50 rounded-lg">
            <ListChecks className="w-8 h-8 text-indigo-600" />
          </div>
        </div>
      </div>

      {/* Top Technicians */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">ช่างยอดนิยม Top 5</h3>
          <p className="text-sm text-gray-600 mt-1">จัดอันดับตามคะแนนรีวิว</p>
        </div>
        <div className="p-6">
          {stats.topTechnicians && stats.topTechnicians.length > 0 ? (
            <div className="space-y-4">
              {stats.topTechnicians.map((tech, index) => (
                <div key={tech._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="shrink-0">
                      <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{tech.userId?.fullName || "ไม่ระบุชื่อ"}</p>
                      <p className="text-sm text-gray-600">{tech.userId?.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1">
                      <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="font-semibold text-gray-900">{tech.rating?.toFixed(1) || "0.0"}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{tech.totalReviews || 0} รีวิว</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">ยังไม่มีข้อมูลช่าง</p>
          )}
        </div>
      </div>
    </div>
  )
}
