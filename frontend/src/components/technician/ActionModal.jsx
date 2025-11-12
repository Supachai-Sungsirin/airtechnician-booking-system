// ไฟล์: components/technician/ActionModal.jsx
import React from 'react'

/**
 * Modal อเนกประสงค์สำหรับ "ยืนยัน" (Confirm) หรือ "แจ้งเตือน" (Alert)
 *
 * @param {boolean} isOpen - สถานะเปิด/ปิด
 * @param {string} title - หัวข้อ
 * @param {string} message - ข้อความ
 * @param {function} onClose - ฟังก์ชันเมื่อกด "ยกเลิก" หรือ "ปิด"
 * @param {function} onConfirm - (Optional) ฟังก์ชันเมื่อกด "ยืนยัน"
 * @param {string} confirmText - (Optional) ข้อความปุ่มยืนยัน (Default: "ยืนยัน")
 */
const ActionModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'ยืนยัน',
}) => {
  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50'>
      <div className='bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl'>
        <h3 className='text-xl font-bold text-gray-900 mb-4'>{title}</h3>
        <p className='text-gray-600 mb-6 whitespace-pre-wrap'>{message}</p>
        <div className='flex gap-3'>
          {/* ถ้า 'onConfirm' (ฟังก์ชันยืนยัน) ถูกส่งมา 
            ให้แสดงปุ่ม "ยกเลิก" และ "ยืนยัน" (นี่คือโหมด Confirm)
          */}

          {onConfirm && (
            <>
              <button
                type='button'
                onClick={onClose}
                className='flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium'
              >
                ยกเลิก
              </button>

              <button
                type='button'
                onClick={onConfirm}
                className='flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium'
              >
                {confirmText}
              </button>
            </>
          )}
          {/* ถ้าไม่มี 'onConfirm' 
            ให้แสดงแค่ปุ่ม "ตกลง" (นี่คือโหมด Alert)
          */}
          {!onConfirm && (
            <button
              type='button'
              onClick={onClose}
              className='w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium'
            >
              ตกลง
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ActionModal
