import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Home from "./pages/home"
import Login from "./pages/login"
import Register from "./pages/Register"
import RegisterTechnician from "./pages/RegisterTechnician"
import CustomerDashboard from "./pages/CustomerDashboard"
import Navbar from "./components/Navbar"

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/technician-register" element={<RegisterTechnician />} />
        <Route path="/CustomerDashboard" element={<CustomerDashboard />} />
      </Routes>
    </Router>
  )
}

export default App
