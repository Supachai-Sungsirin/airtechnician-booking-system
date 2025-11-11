import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api.js' // (api.js interceptor)
import TechJobCard from '../components/technician/TechJobCard.jsx'
import TechMyReviews from '../components/technician/TechMyReviews.jsx'
import TechMyProfile from '../components/technician/TechMyProfile.jsx'

// --- (ไอคอนที่คุณใช้) ---
const JobIcon = () => (
  <svg
    className='w-5 h-5 mr-3'
    fill='none'
    stroke='currentColor'
    viewBox='0 0 24 24'
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth='2'
      d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
    ></path>
  </svg>
)
const HistoryIcon = () => (
  <svg
    className='w-5 h-5 mr-3'
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
const ReviewIcon = () => (
  <svg
    className='w-5 h-5 mr-3'
    fill='none'
    stroke='currentColor'
    viewBox='0 0 24 24'
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth='2'
      d='M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.175 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z'
    ></path>
  </svg>
)
const ProfileIcon = () => (
  <svg
    className='w-5 h-5 mr-3'
    fill='none'
    stroke='currentColor'
    viewBox='0 0 24 24'
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth='2'
      d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
    ></path>
  </svg>
) // 2. ไอคอนใหม่
const LogoutIcon = () => (
  <svg
    className='w-5 h-5 mr-3'
    fill='none'
    stroke='currentColor'
    viewBox='0 0 24 24'
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth='2'
      d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
    ></path>
  </svg>
)
const MenuIcon = () => (
  <svg
    className='w-6 h-6'
    fill='none'
    stroke='currentColor'
    viewBox='0 0 24 24'
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth='2'
      d='M4 6h16M4 12h16m-7 6h7'
    ></path>
  </svg>
)

const TechnicianDashboard = () => {
  const [token, setToken] = useState(null)
  const [bookings, setBookings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('activeJobs')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedRole = localStorage.getItem('role')

    if (!storedToken || storedRole !== 'technician') {
      navigate('/login')
      return
    }
    setToken(storedToken)

    if (activeTab === 'activeJobs' || activeTab === 'historyJobs') {
      fetchBookings()
    }
  }, [navigate, activeTab])

  // --- (เติมโค้ดที่ขาด) ---
  const fetchBookings = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await api.get('/technicians/bookings')
      setBookings(response.data)
    } catch (err) {
      if (err.response?.status !== 401) {
        setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // --- (เติมโค้ดที่ขาด) ---
  const handleLogout = () => {
    if (window.confirm('คุณต้องการออกจากระบบใช่หรือไม่?')) {
      localStorage.removeItem('token')
      localStorage.removeItem('role')
      localStorage.removeItem('user')
      navigate('/login')
    }
  }

  // กรอง Array 'bookings' ออกเป็น 2 ส่วน ---

  const activeJobs = bookings.filter((booking) => {
    const status = booking.status.toLowerCase()
    return (
      status === 'pending' ||
      status === 'accepted' ||
      status === 'on_the_way' ||
      status === 'working'
    )
  })

  const historyJobs = bookings.filter((booking) => {
    const status = booking.status.toLowerCase()
    return status === 'completed' || status === 'cancelled'
  })

  return (
    <div className='flex h-screen bg-gray-100'>
      {/* --- Overlay (พื้นหลังจางๆ บนมือถือ) --- */}
      {isSidebarOpen && (
        <div
          className='fixed inset-0 z-30 bg-black bg-opacity-30 backdrop-blur-sm lg:hidden'
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* --- Sidebar (เมนูซ้าย) --- */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-md transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0`}
      >
        <div className='p-6'>
          <h1 className='text-2xl font-bold text-blue-600'>CoolQ</h1>
          <p className='text-sm text-gray-500'>Technician Panel</p>
        </div>

        <nav className='mt-6'>
          <button
            onClick={() => {
              setActiveTab('activeJobs')
              setIsSidebarOpen(false)
            }}
            className={`flex items-center w-full px-6 py-3 text-left ${
              activeTab === 'activeJobs'
                ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <JobIcon />
            รายการงานที่ได้รับมอบหมาย
          </button>

          <button
            onClick={() => {
              setActiveTab('historyJobs')
              setIsSidebarOpen(false)
            }}
            className={`flex items-center w-full px-6 py-3 text-left ${
              activeTab === 'historyJobs'
                ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <HistoryIcon />
            ประวัติงาน
          </button>

          <button
            onClick={() => {
              setActiveTab('reviews')
              setIsSidebarOpen(false)
            }}
            className={`flex items-center w-full px-6 py-3 text-left ${
              activeTab === 'reviews'
                ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <ReviewIcon />
            รีวิวของฉัน
          </button>

          {/* --- 3. (ใหม่) ปุ่มโปรไฟล์ --- */}
          <button
            onClick={() => {
              setActiveTab('profile')
              setIsSidebarOpen(false)
            }}
            className={`flex items-center w-full px-6 py-3 text-left ${
              activeTab === 'profile'
                ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <ProfileIcon />
            โปรไฟล์
          </button>

          <button
            onClick={handleLogout}
            className='flex items-center w-full px-6 py-3 text-left text-gray-600 hover:bg-gray-50 mt-10'
          >
            <LogoutIcon />
            ออกจากระบบ
          </button>
        </nav>
      </aside>

      {/* --- Main Content Wrapper (เนื้อหาหลัก) --- */}
      <div className='flex-1 flex flex-col overflow-y-auto'>
        {/* --- Header (ปุ่ม 3 ขีด บนมือถือ) --- */}
        <header className='sticky top-0 z-10 bg-white shadow-sm border-b lg:hidden'>
          <div className='flex items-center justify-between px-4 py-4'>
            <h1 className='text-xl font-bold text-gray-900'>Dashboard ช่าง</h1>
            <button
              onClick={() => setIsSidebarOpen(true)}
              className='p-2 text-gray-600 rounded-md hover:bg-gray-100'
            >
              <MenuIcon />
            </button>
          </div>
        </header>

        {/* --- เนื้อหาหลัก --- */}
        <main className='p-8'>
          {activeTab === 'activeJobs' && (
            <div>
              <h2 className='text-2xl font-bold mb-4 hidden lg:block'>
                รายการงานที่ยังไม่สำเร็จ
              </h2>

              {isLoading && <p>กำลังโหลดข้อมูลงาน...</p>}
              {error && <p className='text-red-500'>{error}</p>}
              {!isLoading && !error && bookings.length === 0 && (
                <p>คุณยังไม่มีงานที่ได้รับมอบหมาย</p>
              )}

              {/* (ส่วนแสดง Job Cards) */}
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {activeJobs.map((booking) => (
                  <TechJobCard
                    key={booking._id}
                    booking={booking}
                    token={token}
                  />
                ))}
              </div>

            </div>
          )}

          {activeTab === 'historyJobs' && (
            <div>
              <h2 className='text-2xl font-bold mb-4'>
                ประวัติงาน (งานที่เสร็จสิ้น/ปฏิเสธ)
              </h2>

              {isLoading && <p>กำลังโหลดข้อมูลงาน...</p>}
              {error && <p className='text-red-500'>{error}</p>}
              {!isLoading && !error && historyJobs.length === 0 && (
                <p>ยังไม่มีประวัติการทำงาน</p>
              )}

              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {historyJobs.map((booking) => (
                  <TechJobCard
                    key={booking._id}
                    booking={booking}
                    token={token}
                  />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && <TechMyReviews />}

          {activeTab === 'profile' && <TechMyProfile />}
        </main>
      </div>
    </div>
  )
}

export default TechnicianDashboard
