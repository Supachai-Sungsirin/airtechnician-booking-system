import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom"
import Home from "./pages/home"
import Login from "./pages/login"
import Register from "./pages/Register"
import RegisterTechnician from "./pages/RegisterTechnician"
import CustomerDashboard from "./pages/CustomerDashboard"
import Navbar from "./components/Navbar"
import AdminDashboard from "./pages/AdminDashboard"
import TechnicianDashboard from "./pages/TechnicianDashboard"

function AppContent() {
  const location = useLocation()
  
  // กำหนดเส้นทางที่ไม่ต้องการให้แสดง Navbar ของหน้าหลัก
  const noNavbarPaths = ["/AdminDashboard", "/CustomerDashboard", "/dashboard", "/technician/dashboard"]
  
  // ตรวจสอบว่าเส้นทางปัจจุบันอยู่ในรายการที่ซ่อน Navbar หรือไม่
  const shouldShowNavbar = !noNavbarPaths.includes(location.pathname)

  return (
    <>
      {shouldShowNavbar && <Navbar />} {/* แสดง Navbar เมื่อไม่ใช่หน้า Dashboard */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/technician-register" element={<RegisterTechnician />} />
        <Route path="/CustomerDashboard" element={<CustomerDashboard />} />
        <Route path="/AdminDashboard" element={<AdminDashboard />} />
        <Route path="/technician/dashboard" element={<TechnicianDashboard />} />
      </Routes>
    </>
  )
}

function App() {
  return (
    <Router>
      <AppContent /> 
    </Router>
  )
}

export default App
