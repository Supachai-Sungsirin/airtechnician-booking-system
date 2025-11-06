import { useState, useEffect } from "react"
import api from "../../services/api"
import DistrictSelector from "../DistrictSelector"

export default function ProfileSection() {
  const [profile, setProfile] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    district: "",
    province: "",
    postalCode: "",
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/auth/me")
        const userData = response.data

        // 1. แก้ไข: ใช้ setProfile (จาก state ที่คุณสร้าง)
        setProfile(userData)

        // 2. เพิ่ม: เติมข้อมูลลง formData เพื่อให้ฟอร์มพร้อมใช้งาน
        setFormData({
          fullName: userData.fullName || "",
          phone: userData.phone || "",
          email: userData.email || "",
          address: userData.address || "",
          district: userData.district || "",
          province: userData.province || "",
          postalCode: userData.postalCode || "",
        })
      } catch (error) {
        console.error("Failed to fetch user profile:", error)
        setError("ไม่สามารถโหลดข้อมูลโปรไฟล์ได้")
      } finally {
        // 3. เพิ่ม: หยุด loading หลังจาก API ทำงานเสร็จ
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setSaving(true)
      setError(null)

      // 4. แก้ไข: เปลี่ยน updateProfile เป็น api.put (หรือ .patch)
      // (สมมติว่า endpoint ของคุณคือ PUT /auth/me)
      const response = await api.put("/auth/me", formData)
      const updatedProfile = response.data

      setProfile(updatedProfile)
      
      // อัปเดต localStorage ด้วย (เผื่อส่วนอื่นของเว็บต้องใช้)
      localStorage.setItem("user", JSON.stringify(updatedProfile))

      setIsEditing(false)
      alert("บันทึกข้อมูลโปรไฟล์สำเร็จ")
    } catch (err) {
      console.error("Error updating profile:", err)
      setError(err.response?.data?.message || "ไม่สามารถบันทึกข้อมูลได้")
    } finally {
      setSaving(false)
    }
  }
  // 2. สร้างฟังก์ชันสำหรับรับข้อมูลจาก DistrictSelector
  const handleAddressChange = ({ district, postalCode }) => {
    setFormData((prevData) => ({
      ...prevData,
      district: district,
      postalCode: postalCode,
    }))
  }

  const handleCancel = () => {
    // โค้ดส่วนนี้ถูกต้องแล้ว (ดึงข้อมูลจาก profile มาใส่ form)
    setFormData({
      fullName: profile.fullName || "",
      phone: profile.phone || "",
      email: profile.email || "",
      address: profile.address || "",
      district: profile.district || "",
      province: profile.province || "",
      postalCode: profile.postalCode || "",
    })
    setIsEditing(false)
    setError(null)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">ข้อมูลโปรไฟล์</h2>
          <p className="text-gray-600 text-sm mt-1">จัดการข้อมูลส่วนตัวของคุณ</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            แก้ไขข้อมูล
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">⚠️ {error}</div>
      )}

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อ-นามสกุล *</label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">เบอร์โทรศัพท์ *</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">อีเมล</label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">*ไม่สามารถแก้ไขอีเมลได้</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">ที่อยู่</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={3}
                placeholder="บ้านเลขที่, ซอย, ถนน, แขวง/ตำบล"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* 3. นำ Component มาวางแทนที่ Input เขตและรหัสไปรษณีย์เดิม */}
            <DistrictSelector
        // ส่งค่า district ที่มีอยู่ (จาก profile) เป็นค่าเริ่มต้น
            initialDistrict={profile?.district || ""} 
        // ส่งฟังก์ชันนี้ลงไปเพื่อให้ลูกอัปเดต formData
            onDataChange={handleAddressChange} 
        />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">จังหวัด</label>
              <input
                type="text"
                value={formData.province}
                onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                placeholder="จังหวัด"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">รหัสไปรษณีย์</label>
              <input
                type="text"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                placeholder="รหัสไปรษณีย์"
                maxLength={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">ชื่อ-นามสกุล</label>
              <p className="text-gray-900">{profile?.fullName || "-"}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">เบอร์โทรศัพท์</label>
              <p className="text-gray-900">{profile?.phone || "-"}</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-500 mb-1">อีเมล</label>
              <p className="text-gray-900">{profile?.email || "-"}</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-500 mb-1">ที่อยู่</label>
              <p className="text-gray-900">
                {/* โค้ดส่วนนี้ถูกต้องแล้ว ไม่ต้องแก้ไข 
                  ใช้ profile?.address แทน formData?.address
                */}
                {profile?.address || "-"}
                {profile?.district && `, ${profile.district}`}
                {profile?.province && `, ${profile.province}`}
                {profile?.postalCode && ` ${profile.postalCode}`}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}