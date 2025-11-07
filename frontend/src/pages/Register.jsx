import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import api from "../services/api"
import PersonalInfoSection from "../components/register/PersonalInfoSection"
import AddressSection from "../components/register/AddressSection"

const Register = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    district: "",
    province: "กรุงเทพมหานคร",
    postalCode: "",
  })
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")
    setIsSuccess(false)

    // Validate email
    const emailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i
    if (!emailPattern.test(formData.email)) {
      setMessage("กรุณากรอกอีเมลที่เป็น @gmail.com เท่านั้น")
      setIsLoading(false)
      return
    }

    // Validate phone
    const phonePattern = /^[0-9]{10}$/
    if (!phonePattern.test(formData.phone)) {
      setMessage("กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (ตัวเลข 10 หลัก)")
      setIsLoading(false)
      return
    }

    // Validate postal code
    const postalCodePattern = /^[0-9]{5}$/
    if (!postalCodePattern.test(formData.postalCode)) {
      setMessage("กรุณากรอกรหัสไปรษณีย์ให้ถูกต้อง (ตัวเลข 5 หลัก)")
      setIsLoading(false)
      return
    }

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setMessage("รหัสผ่านไม่ตรงกัน")
      setIsLoading(false)
      return
    }

    try {
      const fullName = `${formData.firstName} ${formData.lastName}`

      const res = await api.post("/auth/register/customer", {
        email: formData.email,
        password: formData.password,
        fullName: fullName,
        phone: formData.phone,
        address: formData.address,
        district: formData.district,
        province: formData.province,
        postalCode: formData.postalCode,
      })

      setIsSuccess(true)
      setMessage("สมัครสมาชิกสำเร็จ! กำลังนำคุณไปยังหน้าเข้าสู่ระบบ...")

      setTimeout(() => {
        navigate("/login")
      }, 2000)
    } catch (err) {
      console.error(err)
      setIsSuccess(false)
      setMessage(err.response?.data?.message || "เกิดข้อผิดพลาดในการสมัครสมาชิก")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"
                />
              </svg>
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">สมัครสมาชิก</h1>
          <p className="text-gray-600">สร้างบัญชีเพื่อเริ่มใช้งาน CoolQ</p>
        </div>

        {/* Register Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Personal Info Section */}
            <PersonalInfoSection formData={formData} setFormData={setFormData} />

            {/* Address Section */}
            <AddressSection formData={formData} setFormData={setFormData} />

            {/* Message Display */}
            {message && (
              <div
                className={`p-4 rounded-lg ${
                  isSuccess ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  {isSuccess ? (
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  )}
                  <p className={`text-sm font-medium ${isSuccess ? "text-green-800" : "text-red-800"}`}>{message}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  กำลังสมัครสมาชิก...
                </>
              ) : (
                "สมัครสมาชิก"
              )}
            </button>
          </form>

          {/* Terms */}
          <p className="text-xs text-gray-500 text-center mt-4">
            การสมัครสมาชิกถือว่าคุณยอมรับ{" "}
            <Link to="/terms" className="text-blue-600 hover:underline">
              ข้อกำหนดการใช้งาน
            </Link>{" "}
            และ{" "}
            <Link to="/privacy" className="text-blue-600 hover:underline">
              นโยบายความเป็นส่วนตัว
            </Link>
          </p>
        </div>

        {/* Footer Text */}
        <p className="text-center text-sm text-gray-600 mt-6">
          มีบัญชีอยู่แล้ว?{" "}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700">
            เข้าสู่ระบบ
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register
