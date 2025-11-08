import React, { useState, useEffect } from 'react'
import api from '../../services/api'
import DistrictNoRequire from './DistrictNoRequire.jsx'

// Mapper สำหรับแปลชื่อบริการเป็นภาษาไทย
const SERVICE_NAME_MAP = {
    "cleaning": "ล้างแอร์",
    "repair": "ซ่อมแอร์",
    "install": "ติดตั้งแอร์",
    "maintenance": "บำรุงรักษาแอร์",
    "refill": "เติมน้ำยาแอร์"
};

// (ไอคอนเล็กๆ สำหรับ UI)
const StarIcon = () => (
  <svg
    className='w-5 h-5 text-yellow-400'
    fill='currentColor'
    viewBox='0 0 20 20'
  >
    <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z'></path>
  </svg>
)
const CheckCircleIcon = () => (
  <svg
    className='w-5 h-5 text-green-500'
    fill='currentColor'
    viewBox='0 0 20 20'
  >
    <path
      fillRule='evenodd'
      d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
      clipRule='evenodd'
    ></path>
  </svg>
)

const TechMyProfile = () => {
  // (State สำหรับข้อมูลในฟอร์ม)
  const [bio, setBio] = useState('')
  const [serviceArea, setServiceArea] = useState([])
  const [services, setServices] = useState([]) // ["cleaning", "repair"]

  // State สำหรับเก็บเขตที่ 'กำลังเลือก' ใน Dropdown ---
  const [currentDistrict, setCurrentDistrict] = useState(null) // (จะเก็บ { district: "...", postalCode: "..." })

  // (State สำหรับแสดงผลเฉยๆ)
  const [userName, setUserName] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('')
  const [rating, setRating] = useState(0)
  const [totalReviews, setTotalReviews] = useState(0)

  // --- (ใหม่) State สำหรับรูปโปรไฟล์ ---
  const [profileImageUrl, setProfileImageUrl] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  // (State จัดการสถานะ)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // 1. ดึงข้อมูลโปรไฟล์ (GET)
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true)
      setError(null) // เคลียร์ Error เก่า
      try {
        const response = await api.get('/technicians/profile')
        const { user, technician } = response.data

        // (ข้อมูลแสดงผล)
        setUserName(user.fullName || user.name)
        setEmail(user.email)
        setStatus(technician.status)
        setRating(technician.rating || 0)
        setTotalReviews(technician.totalReviews || 0)
        setServices(technician.services || [])

        // --- (ใหม่) ตั้งค่ารูปโปรไฟล์ ---
        setProfileImageUrl(user.profileImageUrl || '') // (ดึง URL รูปเก่ามาโชว์)

        // (ข้อมูลสำหรับฟอร์ม)
        setBio(technician.bio || '')
        setServiceArea(technician.serviceArea || [])
      } catch (err) {
        setError('ไม่สามารถดึงข้อมูลโปรไฟล์ได้')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, []) // [] = ทำงานครั้งเดียว

  // 2. ฟังก์ชันเมื่อกดบันทึก (PUT)
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const body = {
        bio: bio,
        serviceArea: serviceArea,
      }

      const response = await api.put('/technicians/profile', body)
      setSuccess('อัปเดตโปรไฟล์สำเร็จ!')
    } catch (err) {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาด')
    } finally {
      setIsLoading(false)
    }
  }

  // --- ฟังก์ชันสำหรับเพิ่มเขต ---
  const handleAddArea = () => {
    if (!currentDistrict || !currentDistrict.district) {
      alert('กรุณาเลือกเขตก่อนกดเพิ่ม')
      return
    }
    // (เช็คว่ามีเขตนี้ใน Array แล้วหรือยัง)
    if (serviceArea.includes(currentDistrict.district)) {
      alert('คุณได้เพิ่มเขตนี้ไปแล้ว')
      return
    }
    // (เพิ่มเขตใหม่เข้าไปใน Array)
    setServiceArea([...serviceArea, currentDistrict.district])

    setCurrentDistrict(null) // (รีเซ็ต Dropdown กลับเป็นค่าเริ่มต้น)
  }

  // --- ฟังก์ชันสำหรับลบเขต ---
  const handleRemoveArea = (districtToRemove) => {
    setServiceArea(serviceArea.filter((area) => area !== districtToRemove))
  }

  // --- ฟังก์ชันสำหรับอัปโหลดรูป ---
  const handleImageUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file) // (ชื่อ "file" ต้องตรงกับ upload.single("file") ใน Backend)

    setIsUploading(true)
    setError(null)
    setSuccess(null)
    try {
      // (ยิง API ใหม่: PUT /auth/profile-picture)
      const response = await api.put('/auth/profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      setProfileImageUrl(response.data.profileImageUrl)
      setSuccess('อัปโหลดรูปสำเร็จ!')
    } catch (err) {
      setError(err.response?.data?.message || 'อัปโหลดรูปไม่สำเร็จ')
    } finally {
      setIsUploading(false)
    }
  }

  if (isLoading && !userName) return <p>กำลังโหลดข้อมูลโปรไฟล์...</p>
  if (error && !userName) return <p className='text-red-500'>{error}</p> // ถ้าโหลดไม่สำเร็จเลย

  return (
    <div className='profile-container max-w-4xl mx-auto'>
      <h2 className='text-2xl font-bold mb-4'>โปรไฟล์ของฉัน</h2>

      <div className='bg-white p-6 rounded-lg shadow-md mb-6'>
        <div className='flex items-center'>
          <img
            src={profileImageUrl || 'https://placeholder.com/100'} // ถ้าไม่มี URL รูป, ใช้ placeholder
            alt='Profile'
            className='w-24 h-24 rounded-full object-cover border-4 border-gray-200'
          />
          <div className='ml-6'>
            <h3 className='text-xl font-bold text-gray-800'>{userName}</h3>
            <p className='text-gray-600'>{email}</p>
            {/* (ปุ่มอัปโหลด) */}
            <label className='mt-2 inline-block px-4 py-2 bg-blue-100 text-blue-700 text-sm font-medium rounded-md cursor-pointer hover:bg-blue-200'>
              {isUploading ? 'กำลังอัปโหลด...' : 'เปลี่ยนรูปโปรไฟล์'}
              <input
                type='file'
                className='hidden'
                accept='image/png, image/jpeg'
                onChange={handleImageUpload}
                disabled={isUploading}
              />
            </label>
          </div>
        </div>
      </div>

      {/* --- 1. สรุปข้อมูลช่าง (แสดงผลอย่างเดียว) --- */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
        {/* ข้อมูล User */}
        <div className='bg-white p-4 rounded-lg shadow'>
          <h3 className='font-bold text-gray-800'>{userName}</h3>
          <p className='text-sm text-gray-600'>{email}</p>
        </div>
        {/* สถานะ */}
        <div className='bg-white p-4 rounded-lg shadow flex items-center'>
          <CheckCircleIcon />
          <div className='ml-3'>
            <h3 className='font-bold text-gray-800'>สถานะ</h3>
            <p className='text-sm text-gray-600 capitalize'>{status}</p>
          </div>
        </div>
        {/* คะแนน */}
        <div className='bg-white p-4 rounded-lg shadow flex items-center'>
          <StarIcon />
          <div className='ml-3'>
            <h3 className='font-bold text-gray-800'>คะแนนเฉลี่ย</h3>
            <p className='text-sm text-gray-600'>
              {rating.toFixed(1)} (จาก {totalReviews} รีวิว)
            </p>
          </div>
        </div>
      </div>

      {/* --- 2. ฟอร์มแก้ไขโปรไฟล์ --- */}
      <form
        onSubmit={handleSubmit}
        className='bg-white p-6 rounded-lg shadow-md'
      >
        {/* (แสดงบริการที่รับทำ) */}
        <div className='mb-4'>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            บริการที่รับทำ
          </label>
          <div className='flex flex-wrap gap-2'>
            {services.length > 0 ? (
              services.map((service) => (
                <span
                  key={service._id}
                  className='px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-sm'
                >
                  {service.name}
                </span>
              ))
            ) : (
              <p className='text-sm text-gray-500'>ยังไม่มีบริการ</p>
            )}
          </div>
        </div>

        {/* (แก้ไข Bio) */}
        <div className='mb-4'>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            ประวัติส่วนตัว (Bio)
          </label>
          <textarea
            rows='4'
            className='w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500'
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder='แนะนำตัวเอง บริการที่เชี่ยวชาญ...'
          />
        </div>

        {/* (แก้ไข เขตบริการ) */}
        <div className='mb-4'>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            เขตที่ให้บริการ
          </label>
          {/* (Dropdown + ปุ่ม Add) */}
          <div className='flex items-end gap-2'>
            <DistrictNoRequire
              value={currentDistrict ? currentDistrict.district : ''} // (ส่งชื่อเขตไป)
              onChange={(data) => setCurrentDistrict(data)}
            />
            <button
              type='button' // (สำคัญมาก: type="button" ป้องกันไม่ให้ Form Submit)
              onClick={handleAddArea}
              className='px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200'
            >
              เพิ่ม
            </button>
          </div>
          {/* (แสดงผลเขตที่เลือก (Tags)) */}
          <div className='flex flex-wrap gap-2 mt-3'>
            {serviceArea.length === 0 ? (
              <p className='text-sm text-gray-500'>
                ยังไม่ได้เลือกเขตที่ให้บริการ
              </p>
            ) : (
              serviceArea.map((area) => (
                <span
                  key={area}
                  className='flex items-center px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-sm'
                >
                  {area}
                  <button
                    type='button'
                    onClick={() => handleRemoveArea(area)}
                    className='ml-2 text-blue-600 hover:text-blue-800'
                  >
                    &times; {/* (กากบาท) */}
                  </button>
                </span>
              ))
            )}
          </div>
        </div>

        <button
          type='submit'
          disabled={isLoading}
          className='w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50'
        >
          {isLoading ? 'กำลังบันทึก...' : 'บันทึกโปรไฟล์'}
        </button>

        {success && (
          <p className='text-green-600 mt-4 text-center'>{success}</p>
        )}
        {error && <p className='text-red-600 mt-4 text-center'>{error}</p>}
      </form>
    </div>
  )
}

export default TechMyProfile
