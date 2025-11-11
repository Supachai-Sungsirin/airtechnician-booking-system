import React, { useState } from 'react'
import api from '../../services/api' // (Import api interceptor)

const TechJobCard = ({ booking, token }) => {
  const [technicianNotes, setTechnicianNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [currentBooking, setCurrentBooking] = useState(booking)

  // State สำหรับเก็บไฟล์ที่เลือก ---
  const [selectedFiles, setSelectedFiles] = useState(null)
  const [isUploading, setIsUploading] = useState(false)

  const [finalPrice, setFinalPrice] = useState('')

  // --- ฟังก์ชัน 'รับงาน' ---
  const handleAcceptJob = async () => {
    if (!window.confirm('คุณต้องการรับงานนี้ใช่หรือไม่?')) return

    setIsLoading(true)
    setError(null)
    try {
      // (Backend API: PUT /technicians/bookings/:id/accept)
      const API_URL = `/technicians/bookings/${currentBooking._id}/accept`
      const response = await api.put(API_URL) // (เราใช้ PUT)

      alert('รับงานสำเร็จ!')
      setCurrentBooking(response.data.booking) // อัปเดต UI
    } catch (err) {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาด')
    } finally {
      setIsLoading(false)
    }
  }

  // --- ฟังก์ชัน 'ปฏิเสธงาน' ---
  const handleRejectJob = async () => {
    if (!window.confirm('คุณยืนยันที่จะปฏิเสธงานนี้ใช่หรือไม่?')) return

    setIsLoading(true)
    setError(null)
    try {
      // (Backend API: PATCH /technicians/bookings/:id/reject)
      const API_URL = `/technicians/bookings/${currentBooking._id}/reject`
      const response = await api.patch(API_URL) // (เราใช้ PATCH)

      alert('ปฏิเสธงานเรียบร้อย')
      setCurrentBooking(response.data.booking) // อัปเดต UI
    } catch (err) {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาด')
    } finally {
      setIsLoading(false)
    }
  }

  // --- ฟังก์ชันอัปโหลดรูปภาพ ---
  const handleFileSelect = (event) => {
    setSelectedFiles(event.target.files)
  }

  const handleUploadPhotos = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      alert('กรุณาเลือกไฟล์ก่อนอัปโหลด')
      return
    }

    const formData = new FormData()
    for (let i = 0; i < selectedFiles.length; i++) {
      // (ชื่อ 'photos' ต้องตรงกับ upload.array('photos') ใน Backend)
      formData.append('photos', selectedFiles[i])
    }

    setIsUploading(true)
    setError(null)
    try {
      // (นี่คือ API ใหม่ที่เราเพิ่งสร้าง)
      const API_URL = `/technicians/bookings/${currentBooking._id}/upload`

      const response = await api.post(API_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      alert('อัปโหลดรูปสำเร็จ!')
      setCurrentBooking(response.data.booking) // อัปเดต UI ให้โชว์รูปใหม่
      setSelectedFiles(null) // เคลียร์ไฟล์ที่เลือก

      // เคลียร์ค่าใน input file (ถ้าจำเป็น)
      document.getElementById(`file-input-${currentBooking._id}`).value = null
    } catch (err) {
      alert(err.response?.data?.message || 'อัปโหลดไม่สำเร็จ')
    } finally {
      setIsUploading(false)
    }
  }

  // --- ฟังก์ชัน 'ปิดงาน' ---
  const handleCompleteJob = async () => {
    // ตรวจสอบว่ากรอกราคาหรือยัง
    if (!finalPrice || parseFloat(finalPrice) <= 0) {
      alert('กรุณากรอกราคาสุทธิให้ถูกต้อง')
      return
    }

    if (!window.confirm(`ยืนยันปิดงานด้วยยอด ${finalPrice} บาท?`)) return

    setIsLoading(true)
    setError(null)
    try {
      // (Backend API: PATCH /technicians/bookings/:id/complete)
      const API_URL = `/technicians/bookings/${currentBooking._id}/complete`
      const body = { technicianNotes, finalPrice: parseFloat(finalPrice) }
      const response = await api.patch(API_URL, body)

      alert(response.data.message)
      setCurrentBooking(response.data.booking) // อัปเดต UI
    } catch (err) {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาด')
    } finally {
      setIsLoading(false)
    }
  }

  // --- (นี่คือ UI ที่มี Logic สลับปุ่ม) ---
  return (
    <div className='job-card bg-white shadow-md rounded-lg p-6 border border-gray-200'>
      {/* (ใช้ currentBooking เพื่อให้ UI อัปเดต) */}
      <h2 className='text-xl font-bold mb-2'>
        รายละเอียดงาน: {currentBooking._id}
      </h2>
      <p>
        <strong>ลูกค้า:</strong> {currentBooking.customerId.fullName} (เขต:{' '}
        {currentBooking.customerId.district})
      </p>
      <p>
        <strong>ที่อยู่:</strong> {currentBooking.address}
      </p>
      <p className='mb-4'>
        <strong>สถานะ:</strong>{' '}
        <span className='font-semibold text-blue-600 capitalize'>
          {currentBooking.status}
        </span>
      </p>

      <ul className='mb-4 list-disc pl-5'>
        {currentBooking.services.map((s) => (
          <li key={s.serviceId._id}>
            {s.serviceId.name} (BTU: {s.btuRange || 'N/A'}) - {s.quantity}{' '}
            เครื่อง
          </li>
        ))}
      </ul>

      {/* --- Logic การสลับปุ่มตามสถานะ --- */}

      {/* ถ้างานเป็น 'pending' */}
      {currentBooking.status === 'pending' && (
        <div className='flex gap-2 mt-4'>
          <button
            onClick={handleAcceptJob}
            disabled={isLoading}
            className='flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50'
          >
            {isLoading ? '...' : 'รับงาน'}
          </button>
          <button
            onClick={handleRejectJob}
            disabled={isLoading}
            className='flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50'
          >
            {isLoading ? '...' : 'ปฏิเสธ'}
          </button>
        </div>
      )}

      {/* ถ้างานเป็น 'accepted' */}
      {currentBooking.status === 'accepted' && (
        <div className='complete-section mt-4 border-t pt-4'>
          {/* --- ส่วนอัปโหลดรูป --- */}
          <div className='mb-4'>
            <h3 className='font-semibold mb-2'>รูปภาพหน้างาน (ก่อน/หลัง)</h3>

            {/* (แสดงรูปที่อัปโหลดไปแล้ว) */}
            <div className='flex flex-wrap gap-2 mb-2'>
              {(currentBooking.jobPhotos || []).map((photoUrl, index) => (
                <img
                  key={index}
                  src={photoUrl}
                  alt={`Job photo ${index + 1}`}
                  className='w-20 h-20 object-cover rounded'
                />
              ))}
            </div>

            {/* (ฟอร์ม อัปโหลด) */}
            <input
              type='file'
              multiple // (อนุญาตเลือกหลายไฟล์)
              accept='image/png, image/jpeg'
              id={`file-input-${currentBooking._id}`} // (ID เฉพาะ)
              onChange={handleFileSelect}
              className='block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
            />
            <button
              onClick={handleUploadPhotos}
              disabled={isUploading || !selectedFiles}
              className='w-full mt-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50'
            >
              {isUploading ? 'กำลังอัปโหลด...' : 'อัปโหลดรูปที่เลือก'}
            </button>
          </div>

          <h3 className='font-semibold mb-2'>สรุปงาน</h3>

          <div className='mb-3'>
            <label className='block text-sm text-gray-700 mb-1'>
              ราคาสุทธิ (บาท) *
            </label>
            <input
              type='number'
              min='0'
              placeholder='ระบุยอดที่ลูกค้าต้องจ่ายจริง'
              value={finalPrice}
              onChange={(e) => setFinalPrice(e.target.value)}
              className='w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500'
            />
          </div>

          <textarea
            rows='3'
            placeholder='เพิ่มโน้ตสรุปงาน (ถ้ามี)...'
            value={technicianNotes}
            onChange={(e) => setTechnicianNotes(e.target.value)}
            className='w-full p-2 border border-gray-300 rounded-md'
          />
          <button
            onClick={handleCompleteJob}
            disabled={isLoading}
            className='w-full mt-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50'
          >
            {isLoading ? 'กำลังบันทึก...' : 'ยืนยันปิดงาน'}
          </button>
          {error && <p className='text-red-500 text-sm mt-2'>{error}</p>}
        </div>
      )}

      {/* ถ้างานเป็น 'completed' */}
      {currentBooking.status === 'completed' && (
        <div>
          <div className='flex flex-wrap gap-2 mb-2 mt-4'>
            {(currentBooking.jobPhotos || []).map((photoUrl, index) => (
              <img
                key={index}
                src={photoUrl}
                alt={`Job photo ${index + 1}`}
                className='w-20 h-20 object-cover rounded'
              />
            ))}
          </div>

          <div className='mt-4 p-3 bg-gray-50 rounded-md'>
            {/* แสดงราคาประเมิน (totalPrice)
             * เฉพาะเมื่องานนั้นมี "ซ่อมแอร์" อยู่
             */}
            {currentBooking.services.some(
              (s) => s.serviceId.name === 'ซ่อมแอร์'
            ) && (
              <p className='text-sm text-gray-600'>
                <strong>ราคาประเมิน:</strong> ฿
                {(currentBooking.totalPrice || 0).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                })}
              </p>
            )}
            <p>
              <strong>ราคาสุทธิ:</strong> ฿
              {(currentBooking.finalPrice || 0).toLocaleString('en-US', {
                minimumFractionDigits: 2,
              })}
            </p>
            <p>
              <strong>สถานะการชำระเงิน: </strong>
              <span
                className={
                  (currentBooking.paymentStatus || 'pending_payment') === 'paid'
                    ? 'text-green-600'
                    : 'text-orange-500'
                }
              >
                {(currentBooking.paymentStatus || 'pending_payment') === 'paid'
                  ? 'จ่ายแล้ว'
                  : 'รอชำระเงิน'}
              </span>
            </p>
          </div>

          <p className='font-semibold text-green-600 border-t pt-4 mt-4'>
            ✓ งานนี้เสร็จสิ้นแล้ว
          </p>
        </div>
      )}

      {/* ถ้างานถูก 'cancelled' */}
      {currentBooking.status === 'cancelled' && (
        <p className='font-semibold text-red-600 border-t pt-4 mt-4'>
          ✗ คุณได้ปฏิเสธงานนี้ไปแล้ว
        </p>
      )}
    </div>
  )
}

export default TechJobCard
