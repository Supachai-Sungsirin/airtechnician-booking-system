import React, { useState } from 'react'
import api from '../../services/api'
import ActionModal from './ActionModal.jsx'

// ไอคอนนาฬิกาทราย
const HourglassIcon = () => (
  <svg
    className='w-5 h-5 text-orange-500 inline-block mr-2'
    fill='none'
    stroke='currentColor'
    viewBox='0 0 24 24'
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth='2'
      d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
    ></path>
  </svg>
)

const CloseIcon = () => (
  <svg
    className='w-4 h-4'
    fill='none'
    stroke='currentColor'
    strokeWidth='3'
    viewBox='0 0 24 24'
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M6 18L18 6M6 6l12 12'
    ></path>
  </svg>
)

// --- "พจนานุกรม" (Mapper) สำหรับแปลสถานะ ---
const STATUS_TRANSLATE_MAP = {
  pending: 'รอรับงาน',
  accepted: 'รับงานแล้ว',
  on_the_way: 'กำลังเดินทาง',
  working: 'กำลังทำงาน',
  completed: 'เสร็จสิ้น',
  cancelled: 'ปฏิเสธ/ยกเลิก',
}

// (ใหม่) ฟังก์ชันสำหรับเปลี่ยนสีตามสถานะ
const getStatusColorClass = (status) => {
  const lowerStatus = (status || '').toLowerCase()
  switch (lowerStatus) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 rounded-full' // สีส้ม
    case 'accepted':
      return 'bg-indigo-100 text-indigo-800 rounded-full' // สีน้ำเงิน
    case 'on_the_way':
      return 'bg-purple-100 text-purple-800 rounded-full' // สีน้ำเงินเข้ม
    case 'working':
      return 'bg-orange-100 text-orange-800 rounded-full' // สีเหลือง
    case 'completed':
      return 'bg-green-100 text-green-800 rounded-full' // สีเขียว
    case 'cancelled':
      return 'bg-red-100 text-red-800 rounded-full' // สีแดง
    default:
      return 'bg-gray-100 text-gray-800 rounded-full' // สีเทา
  }
}

const TechJobCard = ({ booking, onJobUpdate }) => {
  const [technicianNotes, setTechnicianNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // State สำหรับเก็บไฟล์ที่เลือก ---
  const [selectedFiles, setSelectedFiles] = useState(null)
  const [isUploading, setIsUploading] = useState(false)

  const [finalPrice, setFinalPrice] = useState(booking.totalPrice || '')

  // State สำหรับควบคุม Modal (ทั้ง Alert และ Confirm)
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null, // (ถ้ามี onConfirm = โหมด Confirm)
  })

  // ฟังก์ชันปิด Modal
  const closeModal = () =>
    setModalConfig({ isOpen: false, title: '', message: '', onConfirm: null })

  // ฟังก์ชันแสดง Alert (Modal ที่มีแค่ปุ่ม "ตกลง")
  const showAlert = (title, message) => {
    setModalConfig({ isOpen: true, title, message, onConfirm: null })
  }

  // (Refactor) แยก Logic การยิง API ออกมา
  const executeApiCall = async (apiPromise, successMessage) => {
    closeModal() // ปิด Modal ยืนยัน (ถ้ามี)
    setIsLoading(true)

    try {
      const response = await apiPromise()
      showAlert('สำเร็จ', successMessage || response.data.message)
      onJobUpdate(response.data.booking)
    } catch (err) {
      showAlert('เกิดข้อผิดพลาด', err.response?.data?.message || 'Server Error')
    } finally {
      setIsLoading(false)
    }
  }

  // --- (Refactor) ฟังก์ชัน 'รับงาน' ---
  const handleAcceptJob = () => {
    setModalConfig({
      isOpen: true,
      title: 'ยืนยันการรับงาน',
      message: 'คุณต้องการรับงานนี้ใช่หรือไม่?',
      onConfirm: () =>
        executeApiCall(
          () => api.put(`/technicians/bookings/${booking._id}/accept`),
          'รับงานสำเร็จ!'
        ),
    })
  }

  // --- (Refactor) ฟังก์ชันอัปเดตสถานะ (On The Way / Working) ---
  const handleUpdateStatus = (newStatus) => {
    let apiPath = ''
    let confirmText = ''

    if (newStatus === 'on_the_way') {
      apiPath = `/technicians/bookings/${booking._id}/on-the-way`
      confirmText = 'ยืนยันการเดินทางไปหน้างาน?'
    } else if (newStatus === 'working') {
      apiPath = `/technicians/bookings/${booking._id}/start-work`
      confirmText = 'ยืนยันการเริ่มทำงาน (ถึงหน้างานแล้ว)?'
    } else {
      return
    }

    setModalConfig({
      isOpen: true,
      title: 'ยืนยันสถานะ',
      message: confirmText,
      onConfirm: () =>
        executeApiCall(() => api.patch(apiPath), 'อัปเดตสถานะสำเร็จ'),
    })
  }

  // --- (Refactor) ฟังก์ชัน 'ปฏิเสธงาน' ---
  const handleRejectJob = () => {
    setModalConfig({
      isOpen: true,
      title: 'ยืนยันการปฏิเสธงาน',
      message: 'คุณยืนยันที่จะปฏิเสธงานนี้ใช่หรือไม่?',
      onConfirm: () =>
        executeApiCall(
          () => api.patch(`/technicians/bookings/${booking._id}/reject`),
          'ปฏิเสธงานเรียบร้อย'
        ),
    })
  }

  // --- (Refactor) ฟังก์ชันอัปโหลดรูปภาพ ---
  const handleFileSelect = (event) => {
    setSelectedFiles(event.target.files)
  }
  const handleUploadPhotos = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      showAlert('อัปโหลดล้มเหลว', 'กรุณาเลือกไฟล์ก่อนอัปโหลด')
      return
    }

    const formData = new FormData()
    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append('photos', selectedFiles[i])
    }

    setIsUploading(true)
    // (ฟังก์ชันนี้ไม่ใช้ executeApiCall เพราะ Logic ซับซ้อนกว่า)
    try {
      const API_URL = `/technicians/bookings/${booking._id}/upload`
      const response = await api.post(API_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      showAlert('สำเร็จ', 'อัปโหลดรูปสำเร็จ!')
      onJobUpdate(response.data.booking) // อัปเดต UI
      setSelectedFiles(null)
      document.getElementById(`file-input-${booking._id}`).value = null
    } catch (err) {
      showAlert(
        'อัปโหลดล้มเหลว',
        err.response?.data?.message || 'อัปโหลดไม่สำเร็จ'
      )
    } finally {
      setIsUploading(false)
    }
  }

  // --- (ใหม่) ฟังก์ชันลบรูปภาพ ---
  const handleDeletePhoto = (photoUrl) => {
    setModalConfig({
      isOpen: true,
      title: 'ยืนยันการลบรูปภาพ',
      message: 'คุณต้องการลบรูปภาพนี้ใช่หรือไม่? (รูปจะหายถาวร)',
      confirmText: 'ลบรูปภาพ', // (เปลี่ยนข้อความปุ่ม)
      onConfirm: () =>
        executeApiCall(
          // (เรียก API ใหม่ที่เราเพิ่งสร้าง)
          () =>
            api.patch(`/technicians/bookings/${booking._id}/delete-photo`, {
              photoUrl,
            }),
          'ลบรูปภาพสำเร็จ'
        ),
    })
  }

  // --- (Refactor) ฟังก์ชัน 'ปิดงาน' ---
  const handleCompleteJob = () => {
    if (!technicianNotes || technicianNotes.trim() === '') {
      showAlert(
        'ข้อมูลไม่ครบถ้วน',
        'กรุณากรอก "โน้ตสรุปงาน" (เช่น รายละเอียดการซ่อม) ก่อนปิดงาน'
      )
      return
    }
    if (!booking.jobPhotos || booking.jobPhotos.length < 2) {
      showAlert(
        'ยังไม่สามารถปิดงานได้',
        'กรุณาอัปโหลดรูปภาพหน้างาน (ก่อน/หลัง) อย่างน้อย 2 รูปก่อน'
      )
      return
    }
    const parsedFinalPrice = parseFloat(finalPrice)
    if (!parsedFinalPrice || parsedFinalPrice <= 0) {
      showAlert('ข้อมูลไม่ครบถ้วน', 'กรุณากรอกราคาสุทธิให้ถูกต้อง')
      return
    }

    const estimatedPrice = parseFloat(booking.totalPrice) || 0
    if (parsedFinalPrice < estimatedPrice) {
      showAlert(
        'ราคาสุทธิไม่ถูกต้อง',
        `ราคาสุทธิ (฿${parsedFinalPrice.toLocaleString()}) ที่คุณกรอก ต้องไม่ต่ำกว่าราคาประเมิน (฿${estimatedPrice.toLocaleString()})`
      )
      return
    }

    setModalConfig({
      isOpen: true,
      title: 'ยืนยันการปิดงาน',
      message: `ยืนยันปิดงานด้วยยอด ${parsedFinalPrice.toLocaleString()} บาท?`,
      onConfirm: () =>
        executeApiCall(
          () =>
            api.patch(`/technicians/bookings/${booking._id}/complete`, {
              technicianNotes,
              finalPrice: parsedFinalPrice,
            }),
          'ปิดงานเรียบร้อย'
        ),
    })
  }

  // --- (นี่คือ UI ที่มี Logic สลับปุ่ม) ---
  return (
    <div className='job-card bg-white shadow-md rounded-lg p-6 border border-gray-200'>
      <h2 className='text-xl font-bold mb-2'>
        {booking.services[0]?.serviceId?.name || booking._id}
      </h2>

      <p>
        <strong>ลูกค้า:&nbsp;</strong> {booking.customerId.fullName}
      </p>

      <p>
        <strong>ที่อยู่:</strong>&nbsp;{booking.address}
      </p>

      <p className='mb-4'>
        <strong>สถานะ:&nbsp;</strong>
        <span className={`${getStatusColorClass(booking.status)} capitalize`}>
          {/* (ใช้ Mapper แปล, ถ้าไม่เจอให้แสดงค่าเดิม) */}
          {STATUS_TRANSLATE_MAP[booking.status.toLowerCase()] || booking.status}
        </span>
      </p>

      <ul className='mb-4 list-disc pl-5'>
        {booking.services.map((s) => (
          <li key={s.serviceId._id}>
            {s.serviceId.name} (BTU: {s.btuRange || 'N/A'}) - {s.quantity}{' '}
            เครื่อง
          </li>
        ))}
      </ul>

      <div className='mb-4'>
        <strong>รายละเอียดปัญหา (จากลูกค้า):</strong>
        <p className='text-gray-600 p-2 bg-gray-50 rounded-md mt-1 whitespace-pre-wrap'>
          {booking.problemDescription}
        </p>
      </div>
      {/* --- Logic การสลับปุ่มตามสถานะ --- */}
      {(() => {
        // (ใช้ .toLowerCase() เพื่อความปลอดภัย)
        const status = (booking.status || '').toLowerCase()

        switch (
          status // 1. งานที่รอรับ
        ) {
          case 'pending':
            return (
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
            ) // 2. รับงานแล้ว (รอกดเดินทาง)

          case 'accepted':
            return (
              <div className='flex gap-2 mt-4'>
                <button
                  onClick={() => handleUpdateStatus('on_the_way')}
                  disabled={isLoading}
                  className='flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50'
                >
                  {isLoading ? '...' : 'ยืนยันกำลังเดินทาง'}
                </button>
              </div>
            ) // 3. กำลังเดินทาง (รอกดเริ่มงาน)

          case 'on_the_way':
            return (
              <div className='flex gap-2 mt-4'>
                <button
                  onClick={() => handleUpdateStatus('working')}
                  disabled={isLoading}
                  className='flex-1 px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 disabled:opacity-50'
                >
                  {isLoading ? '...' : 'เริ่มทำงาน (ถึงหน้างาน)'}
                </button>
              </div>
            )

          case 'working':
            return (
              <div className='complete-section mt-4 border-t pt-4'>
                {/* --- ส่วนอัปโหลดรูป --- */}
                <div className='mb-4'>
                  <h3 className='font-semibold mb-2'>
                    รูปภาพหน้างาน (ก่อน/หลัง){' '}
                  </h3>
                  {/* (แสดงรูปที่อัปโหลดไปแล้ว) */}

                  <div className='flex flex-wrap gap-2 mb-2'>
                    {(booking.jobPhotos || []).map((photoUrl, index) => (
                      <div key={index} className='relative'>
                        <img
                          src={photoUrl}
                          alt={`Job photo`}
                          className='w-20 h-20 object-cover rounded'
                        />
                        {/* (ปุ่มลบ 'X') */}
                        <button
                          type='button'
                          onClick={() => handleDeletePhoto(photoUrl)}
                          className='absolute top-0 right-0 p-0.5 bg-red-600 text-white rounded-full leading-none -mt-1 -mr-1 hover:bg-red-700'
                          disabled={isLoading || isUploading}
                        >
                          <CloseIcon />
                        </button>
                      </div>
                    ))}
                  </div>
                  <input
                    type='file'
                    multiple
                    accept='image/png, image/jpeg'
                    id={`file-input-${booking._id}`}
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
                <div className='mb-2 p-3 bg-gray-50 rounded-md'>
                  <p className='text-sm text-gray-600'>
                    <strong>ราคาประเมิน :</strong> ฿
                    {(booking.totalPrice || 0).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>

                <div className='mb-3'>
                  <label className='block text-sm text-gray-700 mb-1'>
                    ราคาสุทธิ (บาท) *
                  </label>

                  <input
                    type='number'
                    min='0'
                    placeholder='ระบุยอดที่ลูกค้าต้องชำระจริง'
                    value={finalPrice}
                    onChange={(e) => setFinalPrice(e.target.value)}
                    className='w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500'
                  />
                </div>

                <div className='mb-3'>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    โน้ตสรุปงาน (บังคับกรอก) *
                  </label>
                  <textarea
                    rows='3'
                    placeholder='เช่น เปลี่ยนฟิลเตอร์, ล้างคอยล์เย็นเรียบร้อย'
                    value={technicianNotes}
                    onChange={(e) => setTechnicianNotes(e.target.value)}
                    className='w-full p-2 border border-gray-300 rounded-md'
                    required
                  />
                </div>

                <button
                  onClick={handleCompleteJob}
                  disabled={
                    isLoading ||
                    isUploading ||
                    !booking.jobPhotos ||
                    booking.jobPhotos.length < 2 ||
                    !finalPrice ||
                    parseFloat(finalPrice) === 0 ||
                    !technicianNotes ||
                    technicianNotes.trim() === ''
                  }
                  className='w-full mt-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50'
                >
                  {isLoading ? 'กำลังบันทึก...' : 'ยืนยันงานเสร็จสิ้น'}
                </button>

                {(!booking.jobPhotos || booking.jobPhotos.length === 0) && (
                  <p className=' text-red-500 text-sm mt-2 text-center'>
                    ***กรุณาอัปโหลดรูปภาพหน้างานก่อนปิดงาน***
                  </p>
                )}
              </div>
            ) // งานเสร็จแล้ว

          case 'completed':
            return (
              <div>
                <div className='flex flex-wrap gap-2 mb-2 mt-4'>
                  {(booking.jobPhotos || []).map((photoUrl, index) => (
                    <img
                      key={index}
                      src={photoUrl}
                      alt={`Job photo ${index + 1}`}
                      className='w-20 h-20 object-cover rounded'
                    />
                  ))}
                </div>

                <div className='mt-4 p-3 bg-gray-50 rounded-md'>
                  {booking.services.some(
                    (s) => s.serviceId.name === 'ซ่อมแอร์'
                  ) && (
                    <p className='text-sm text-gray-600'>
                      <strong>ราคาประเมิน:</strong> ฿
                      {(booking.totalPrice || 0).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  )}

                  <p>
                    <strong>ราคาสุทธิ:</strong> ฿
                    {(booking.finalPrice || 0).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                    })}
                  </p>

                  <p>
                    <strong>สถานะการชำระเงิน: </strong>
                    <span
                      className={
                        (booking.paymentStatus || 'pending_payment') === 'paid'
                          ? 'text-green-600'
                          : 'text-orange-500'
                      }
                    >
                      {(booking.paymentStatus || 'pending_payment') === 'paid'
                        ? 'ชำระเงินเรียบร้อย'
                        : 'รอชำระเงิน'}
                    </span>
                  </p>
                </div>
                {/* (Logic แสดง 'รอชำระ' หรือ 'จ่ายแล้ว') */}

                {(booking.paymentStatus || 'pending_payment') ===
                  'pending_payment' && (
                  <p className='font-semibold text-orange-500 border-t pt-4 mt-4 flex items-center'>
                    <HourglassIcon /> รอการชำระเงิน
                  </p>
                )}

                {booking.paymentStatus === 'paid' && (
                  <p className='font-semibold text-green-600 border-t pt-4 mt-4'>
                    ✓ งานนี้เสร็จสิ้น (จ่ายแล้ว)
                  </p>
                )}
              </div>
            )

          case 'cancelled':
            return (
              <p className='font-semibold text-red-600 border-t pt-4 mt-4'>
                ✗ คุณได้ปฏิเสธงานนี้
              </p>
            )

          default:
            return null // ไม่แสดงอะไรเลยถ้าสถานะไม่รู้จัก
        }
      })()}
      {/* --- Modal alert / Confirm --- */}

      <ActionModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        onConfirm={modalConfig.onConfirm}
        onClose={closeModal}
      />
    </div>
  )
}

export default TechJobCard
