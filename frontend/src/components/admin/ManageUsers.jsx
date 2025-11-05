import { useState, useEffect, useCallback } from "react"
import api from "../../services/api"
// อาจเพิ่ม Icon ที่ใช้ใน renderUserList เช่น User, Loader (ถ้ามี)

export default function ManageUsers() {
  const [activeUserTab, setActiveUserTab] = useState("customers")
  const [customers, setCustomers] = useState([])
  const [technicians, setTechnicians] = useState([])
  const [admins, setAdmins] = useState([])
  
  // State สำหรับการโหลด: 
  // loading: ใช้สำหรับโหลดครั้งแรก (ดึงข้อมูลทั้ง 3 ประเภท)
  const [loading, setLoading] = useState(true) 
  // tabLoading: ใช้เมื่อมีการสลับ Tab หลังจากโหลดครั้งแรก
  const [tabLoading, setTabLoading] = useState(false) 
  
  const [selectedUser, setSelectedUser] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editFormData, setEditFormData] = useState({})
  const [saving, setSaving] = useState(false)

  // --- 1. ฟังก์ชันดึงข้อมูลย่อย (ใช้ useCallback เพื่อป้องกันการสร้างฟังก์ชันใหม่ซ้ำๆ) ---
  const fetchCustomers = useCallback(async () => {
    try {
      const response = await api.get("/admin/customers")
      setCustomers(response.data.data || [])
    } catch (error) {
      console.error("Error fetching customers:", error)
    }
  }, [])

  const fetchTechnicians = useCallback(async () => {
    try {
      const response = await api.get("/admin/technicians")
      setTechnicians(response.data.data || [])
    } catch (error) {
      console.error("Error fetching technicians:", error)
    }
  }, [])

  const fetchAdmins = useCallback(async () => {
    try {
      const response = await api.get("/admin/admins")
      setAdmins(response.data.data || [])
    } catch (error) {
      console.error("Error fetching admins:", error)
    }
  }, [])

  // --- 2. useEffect สำหรับการโหลดข้อมูลทั้งหมดครั้งแรก ---
  useEffect(() => {
    const initialLoad = async () => {
      setLoading(true) 
      // ดึงข้อมูลทั้ง 3 ประเภทพร้อมกัน
      await Promise.all([fetchCustomers(), fetchTechnicians(), fetchAdmins()])
      setLoading(false)
    }
    initialLoad()
  }, [fetchCustomers, fetchTechnicians, fetchAdmins]) // Dependencies เพื่อให้ ESLint/React ไม่เตือน

  // --- 3. useEffect สำหรับการโหลดข้อมูลเมื่อเปลี่ยน Tab (สำหรับการอัปเดตข้อมูลล่าสุด) ---
  useEffect(() => {
    // ถ้ายังโหลดครั้งแรกไม่เสร็จ (loading=true) ไม่ต้องดึงซ้ำ
    if (loading) return 
    
    const fetchUsersOnTabChange = async () => {
      setTabLoading(true) // แสดง Loading เฉพาะ List ที่กำลังเปลี่ยน
      try {
        if (activeUserTab === "customers") {
          await fetchCustomers()
        } else if (activeUserTab === "technicians") {
          await fetchTechnicians()
        } else if (activeUserTab === "admins") {
          await fetchAdmins()
        }
      } catch (error) {
        console.error("Error fetching users on tab change:", error)
      } finally {
        setTabLoading(false)
      }
    }

    fetchUsersOnTabChange()
  }, [activeUserTab, loading, fetchCustomers, fetchTechnicians, fetchAdmins])


  // ฟังก์ชันอื่นๆ (ไม่มีการเปลี่ยนแปลง)
  // ... (handleViewDetail, handleSaveUser เหมือนเดิม)
  const handleViewDetail = async (userId) => {
    try {
      const response = await api.get(`/admin/user/${userId}`)
      setSelectedUser(response.data.data)
      setEditFormData({
        fullName: response.data.data.user.fullName || "",
        phone: response.data.data.user.phone || "",
        address: response.data.data.user.address || "",
        district: response.data.data.user.district || "",
        province: response.data.data.user.province || "",
        postalCode: response.data.data.user.postalCode || "",
        serviceArea: response.data.data.technician?.serviceArea || [],
        services: response.data.data.technician?.services || [],
        bio: response.data.data.technician?.bio || "",
      })
      setShowEditModal(true)
    } catch (error) {
      console.error("Error fetching user detail:", error)
      alert("เกิดข้อผิดพลาดในการดึงข้อมูล")
    }
  }

  const handleSaveUser = async () => {
    try {
      setSaving(true)

      // Update user basic info
      await api.patch(`/admin/user/${selectedUser.user._id}`, {
        fullName: editFormData.fullName,
        phone: editFormData.phone,
        address: editFormData.address,
        district: editFormData.district,
        province: editFormData.province,
        postalCode: editFormData.postalCode,
      })

      // If technician, update technician info
      if (selectedUser.technician) {
        await api.patch(`/admin/technician/${selectedUser.technician._id}`, {
          serviceArea: editFormData.serviceArea,
          services: editFormData.services,
          bio: editFormData.bio,
        })
      }

      alert("บันทึกข้อมูลสำเร็จ")
      setShowEditModal(false)
      // โหลดข้อมูล Tab ปัจจุบันใหม่
      if (activeUserTab === "customers") await fetchCustomers()
      else if (activeUserTab === "technicians") await fetchTechnicians()
      else if (activeUserTab === "admins") await fetchAdmins()
      
    } catch (error) {
      console.error("Error saving user:", error)
      alert("เกิดข้อผิดพลาดในการบันทึก")
    } finally {
      setSaving(false)
    }
  }

  const renderUserList = (users, userType) => {
    // ใช้ tabLoading แทน loading หลัก (เพราะ loading หลักจะเป็น false หลังโหลดครั้งแรก)
    if (loading || tabLoading) { 
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )
    }

    if (users.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่มีข้อมูล</h3>
          <p className="text-gray-600">ยังไม่มี{userType}ในระบบ</p>
        </div>
      )
    }

    // โค้ดส่วนแสดงตาราง (เหมือนเดิม)
    return (
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ชื่อ-นามสกุล
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">อีเมล</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  เบอร์โทร
                </th>
                {userType === "ช่าง" && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    สถานะ
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  วันที่สมัคร
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => {
                const userData = userType === "ช่าง" ? user.userId : user
                const technicianData = userType === "ช่าง" ? user : null

                return (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{userData?.fullName || "N/A"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{userData?.email || "N/A"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{userData?.phone || "-"}</div>
                    </td>
                    {userType === "ช่าง" && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            technicianData?.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : technicianData?.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {technicianData?.status === "approved"
                            ? "อนุมัติแล้ว"
                            : technicianData?.status === "pending"
                              ? "รออนุมัติ"
                              : "ปฏิเสธ"}
                        </span>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString("th-TH") : "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewDetail(userData?._id)}
                        className="text-blue-600 hover:text-blue-900 font-medium"
                      >
                        ดูรายละเอียด
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* User Type Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveUserTab("customers")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeUserTab === "customers"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
              }`}
            >
              ลูกค้า ({loading ? '...' : customers.length}) {/* แสดงจำนวนทันทีที่โหลดครั้งแรกเสร็จ */}
            </button>
            <button
              onClick={() => setActiveUserTab("technicians")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeUserTab === "technicians"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
              }`}
            >
              ช่าง ({loading ? '...' : technicians.length})
            </button>
            <button
              onClick={() => setActiveUserTab("admins")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeUserTab === "admins"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
              }`}
            >
              แอดมิน ({loading ? '...' : admins.length})
            </button>
          </nav>
        </div>
      </div>

      {/* User List */}
      {activeUserTab === "customers" && renderUserList(customers, "ลูกค้า")}
      {activeUserTab === "technicians" && renderUserList(technicians, "ช่าง")}
      {activeUserTab === "admins" && renderUserList(admins, "แอดมิน")}

      {/* Edit Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-2xl w-full my-8">
            <div className="p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900">แก้ไขข้อมูลผู้ใช้</h3>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {/* Basic Info */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-4">ข้อมูลพื้นฐาน</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อ-นามสกุล</label>
                    <input
                      type="text"
                      value={editFormData.fullName}
                      onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">เบอร์โทร</label>
                    <input
                      type="text"
                      value={editFormData.phone}
                      onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">ที่อยู่</label>
                    <input
                      type="text"
                      value={editFormData.address}
                      onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">เขต/อำเภอ</label>
                    <input
                      type="text"
                      value={editFormData.district}
                      onChange={(e) => setEditFormData({ ...editFormData, district: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">จังหวัด</label>
                    <input
                      type="text"
                      value={editFormData.province}
                      onChange={(e) => setEditFormData({ ...editFormData, province: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">รหัสไปรษณีย์</label>
                    <input
                      type="text"
                      value={editFormData.postalCode}
                      onChange={(e) => setEditFormData({ ...editFormData, postalCode: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Technician Info */}
              {selectedUser.technician && (
                <div className="mb-6 pt-6 border-t">
                  <h4 className="text-sm font-semibold text-gray-900 mb-4">ข้อมูลช่าง</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">พื้นที่ให้บริการ</label>
                      {/* Note: ส่วนนี้ควรเป็น input/select หากต้องการแก้ไข, แต่โค้ดเดิมเป็นแค่ text */}
                      <div className="text-sm text-gray-600">{editFormData.serviceArea?.join(", ") || "-"}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ข้อมูลเพิ่มเติม</label>
                      <textarea
                        value={editFormData.bio}
                        onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">สถานะ</label>
                      <span
                        className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                          selectedUser.technician.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : selectedUser.technician.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {selectedUser.technician.status === "approved"
                          ? "อนุมัติแล้ว"
                          : selectedUser.technician.status === "pending"
                            ? "รออนุมัติ"
                            : "ปฏิเสธ"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t flex gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                disabled={saving}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSaveUser}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "กำลังบันทึก..." : "บันทึก"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}