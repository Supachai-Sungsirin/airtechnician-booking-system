import { useState, useEffect } from "react"
import api from "../../services/api"
import DistrictSelector from "../DistrictSelector" // 1. ตรวจสอบว่า import ถูกต้อง

// 2. สร้างฟังก์ชันสำหรับ "ตัด" คำว่า "เขต" และช่องว่าง
const cleanDistrictName = (district) => {
  if (!district) return ""
  return district.replace("เขต", "").trim()
}

export default function ProfileSection() {
  const [profile, setProfile] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
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

        setProfile(userData)

        // 3. "ตัด" คำว่า "เขต" ออกจาก userData ก่อนเก็บลง formData
        setFormData({
          fullName: userData.fullName || "",
          phone: userData.phone || "",
          email: userData.email || "",
          address: userData.address || "",
          district: cleanDistrictName(userData.district), // <-- ใช้ฟังก์ชัน cleanDistrictName
          province: userData.province || "",
          postalCode: userData.postalCode || "",
        })
      } catch (error) {
        console.error("Failed to fetch user profile:", error)
        setError("ไม่สามารถโหลดข้อมูลโปรไฟล์ได้")
      } finally {
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
      setSuccessMessage(null)

      // 4. "เติม" คำว่า "เขต" กลับเข้าไป ก่อนส่งไปบันทึก
      const districtToSave = formData.district.startsWith("เขต") 
        ? formData.district 
        : `เขต${formData.district}`

      const dataToSave = {
        ...formData,
        district: districtToSave.trim(),
      }

      const response = await api.put("/auth/me", dataToSave)
      const updatedProfile = response.data

      setProfile(updatedProfile)
      
      // 5. อัปเดต formData อีกครั้งด้วยข้อมูลที่ "ตัด" แล้ว
      setFormData((prev) => ({
        ...prev,
        // อัปเดต State ของ form ให้ตรงกับที่เพิ่งบันทึก (แบบ "ตัด" แล้ว)
        district: cleanDistrictName(updatedProfile.district) 
      }))
      
      localStorage.setItem("user", JSON.stringify(updatedProfile))
      setIsEditing(false)
      setSuccessMessage("บันทึกข้อมูลโปรไฟล์สำเร็จ!")
      setTimeout(() => {
        setSuccessMessage(null)
      }, 3000)
    } catch (err) {
      console.error("Error updating profile:", err)
      setError(err.response?.data?.message || "ไม่สามารถบันทึกข้อมูลได้")
    } finally {
      setSaving(false)
    }
  }
  
  // 6. เปลี่ยนชื่อฟังก์ชัน (ชื่อเดิมก็ได้ แต่ต้องตรงกับ prop ที่ส่ง)
  const handleAddressChange = ({ district, postalCode }) => {
    setFormData((prevData) => ({
      ...prevData,
      district: district,
      postalCode: postalCode,
    }))
  }

  const handleCancel = () => {
    setFormData({
      fullName: profile.fullName || "",
      phone: profile.phone || "",
      email: profile.email || "",
      address: profile.address || "",
      district: cleanDistrictName(profile.district), // 8. "ตัด" เขต ตอนกดยกเลิก
      province: profile.province || "",
      postalCode: profile.postalCode || "",
    })
    setIsEditing(false)
    setError(null)
    setSuccessMessage(null)
  }

  //ฟังก์ชันใหม่สำหรับเคลียร์ข้อความก่อนเริ่มแก้ไข
  const handleStartEditing = () => {
    setError(null)
    setSuccessMessage(null)
    setIsEditing(true)
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
            onClick={handleStartEditing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            แก้ไขข้อมูล
          </button>
        )}
      </div>
      
      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
          ✓ {successMessage}
        </div>
      )}
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
                type="tel" // ใช้ type="tel" ดีอยู่แล้ว
                required
                value={formData.phone}
                onChange={(e) => {
                  // กรองให้รับเฉพาะตัวเลข
                  const numericValue = e.target.value.replace(/[^0-9]/g, '');
                  // ตัดให้เหลือ 10 ตัวอักษร
                  setFormData({ ...formData, phone: numericValue.slice(0, 10) })
                }}
                maxLength={10} // 1. จำกัดความยาวสูงสุด 10 ตัว
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

            {/* vvv นี่คือส่วนที่แก้ไข vvv */}
            <DistrictSelector
              // 9. ส่ง value จาก formData (ซึ่ง "ตัด" เขตแล้ว)
              value={formData.district} 
              // 10. เปลี่ยน onDataChange เป็น onChange ให้ตรงกับที่ลูกเรียก
              onChange={handleAddressChange} 
            />
            {/* ^^^ สิ้นสุดส่วนที่แก้ไข ^^^ */}

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
                readOnly 
                placeholder="จะแสดงอัตโนมัติ"
                maxLength={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
              />
            </div>
          </div>

          {/* (ส่วนปุ่ม... ถูกต้องแล้ว) */}
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
        // (ส่วนแสดงผล... ถูกต้องแล้ว)
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">ชื่อ-นามสกุล</label>
              <p className="text-gray-900">{profile?.fullName || "-"}</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-500 mb-1">อีเมล</label>
              <p className="text-gray-900">{profile?.email || "-"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">เบอร์โทรศัพท์</label>
              <p className="text-gray-900">{profile?.phone || "-"}</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-500 mb-1">ที่อยู่</label>
              <p className="text-gray-900">
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
