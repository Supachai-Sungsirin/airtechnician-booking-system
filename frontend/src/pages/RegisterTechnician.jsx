import { useState } from "react"
import { Link } from "react-router-dom"
import api from "../services/api"
import Step1BasicInfo from "../components/register-technician/Step1BasicInfo"
import Step2AddressInfo from "../components/register-technician/Step2AddressInfo"
import Step3ProfessionalInfo from "../components/register-technician/Step3ProfessionalInfo"
import Step4DocumentUpload from "../components/register-technician/Step4DocumentUpload"

const RegisterTechnician = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Step 1: ข้อมูลพื้นฐาน
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    showPassword: false,
    showConfirmPassword: false,

    // Step 2: ที่อยู่
    address: "",
    district: "",
    province: "กรุงเทพมหานคร",
    postalCode: "",

    // Step 3: ข้อมูลวิชาชีพ
    idCard: "",
    services: [], // เพิ่มฟิลด์ services (array)
    serviceArea: [], // แก้เป็น array แทน string
    bio: "",

    // Step 4: เอกสาร
    selfieWithIdCard: "",
    imagePreview: null,
  })
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)


  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.email || !formData.password || !formData.firstName || !formData.lastName || !formData.phone) {
          setMessage("กรุณากรอกข้อมูลให้ครบถ้วน")
          return false
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
        if (!emailRegex.test(formData.email)) {
          setMessage("กรุณากรอกอีเมลให้ถูกต้อง")
          return false
        }

        const phoneRegex = /^[0-9]{10}$/
        if (!phoneRegex.test(formData.phone)) {
          setMessage("กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (10 หลัก)")
          return false
        }

        if (formData.password !== formData.confirmPassword) {
          setMessage("รหัสผ่านไม่ตรงกัน")
          return false
        }

        if (formData.password.length < 6) {
          setMessage("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร")
          return false
        }
        break

      case 2:
        if (!formData.address || !formData.district || !formData.postalCode) {
          setMessage("กรุณากรอกข้อมูลที่อยู่ให้ครบถ้วน")
          return false
        }

        if (formData.postalCode.length !== 5) {
          setMessage("รหัสไปรษณีย์ต้องมี 5 หลัก")
          return false
        }
        break

      case 3:
        if (!formData.idCard || formData.services.length === 0 || formData.serviceArea.length === 0 || !formData.bio) {
          setMessage("กรุณากรอกข้อมูลให้ครบถ้วน")
          return false
        }
        if (formData.idCard.length !== 13 || !/^\d+$/.test(formData.idCard)) {
          setMessage("เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก")
          return false
        }
        break

      case 4:
        if (!formData.selfieWithIdCard) {
          setMessage("กรุณาอัพโหลดรูปถ่ายคู่บัตรประชาชน")
          return false
        }
        break

      default:
        break
    }

    setMessage("")
    return true
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setMessage("")
      setCurrentStep((prev) => prev + 1)
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
    setMessage("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateStep(4)) return

    setIsLoading(true)
    setMessage("")
    setIsSuccess(false)

    try {
      const fullName = `${formData.firstName} ${formData.lastName}`
      const submitData = {
        fullName: fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        address: formData.address,
        district: formData.district,
        province: formData.province,
        postalCode: formData.postalCode,
        idCard: formData.idCard,
        services: formData.services,
        serviceArea: formData.serviceArea,
        bio: formData.bio,
        selfieWithIdCard: formData.selfieWithIdCard,
      }

      await api.post("/auth/register/technician", submitData)

      setIsSuccess(true)
      setMessage("สมัครสมาชิกสำเร็จ! รอการอนุมัติจากทีมงาน กำลังนำคุณไปยังหน้าเข้าสู่ระบบ...")

      setTimeout(() => {
        window.location.href = "/login"
      }, 3000)
    } catch (error) {
      console.error(error)
      setIsSuccess(false)
      setMessage(error.response?.data?.message || "เกิดข้อผิดพลาดในการสมัครสมาชิก")
    } finally {
      setIsLoading(false)
    }
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
              currentStep >= step ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
            }`}
          >
            {step}
          </div>
          {step < 4 && (
            <div className={`w-12 h-1 mx-2 transition-all ${currentStep > step ? "bg-blue-600" : "bg-gray-200"}`} />
          )}
        </div>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">สมัครเป็นช่างกับเรา</h1>
          <p className="text-gray-600">เริ่มต้นรับงานและสร้างรายได้กับ CoolQ</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {renderStepIndicator()}

          <form onSubmit={handleSubmit}>
            {currentStep === 1 && (
              <>
                <Step1BasicInfo
                  formData={formData}
                  setFormData={setFormData}
                  message={message}
                  setMessage={setMessage}
                />
              </>
            )}
            {currentStep === 2 && <Step2AddressInfo formData={formData} setFormData={setFormData} />}
            {currentStep === 3 && <Step3ProfessionalInfo formData={formData} setFormData={setFormData} />}
            {currentStep === 4 && <Step4DocumentUpload formData={formData} setFormData={setFormData} />}

            {message && (
              <div
                className={`mt-5 p-4 rounded-lg ${
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

            <div className="flex gap-3 mt-6">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-all"
                >
                  ย้อนกลับ
                </button>
              )}
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-all"
                >
                  ถัดไป
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                      กำลังส่งข้อมูล...
                    </>
                  ) : (
                    "ส่งใบสมัคร"
                  )}
                </button>
              )}
            </div>
          </form>

          <p className="text-xs text-gray-500 text-center mt-6">
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

export default RegisterTechnician
