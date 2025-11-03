import { EyeIcon, EyeOffIcon } from "lucide-react"

const Step1BasicInfo = ({ formData, setFormData, message, setMessage }) => {
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">ข้อมูลพื้นฐาน</h2>
        <p className="text-sm text-gray-600">กรอกข้อมูลส่วนตัวของคุณ</p>
      </div>

      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
          ชื่อ-นามสกุล <span className="text-red-500">*</span>
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          placeholder="กรอกชื่อ-นามสกุล"
          value={formData.fullName}
          onChange={handleChange}
          required
          className="text-black block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          อีเมล <span className="text-red-500">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="example@email.com"
          value={formData.email}
          onChange={handleChange}
          required
          className="text-black block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
          เบอร์โทรศัพท์ <span className="text-red-500">*</span>
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          placeholder="0812345678"
          value={formData.phone}
          onChange={(e) => {
            const value = e.target.value
            if (/^[0-9]*$/.test(value)) {
              setFormData((prev) => ({ ...prev, phone: value }))
              if (value.length > 10) {
                setMessage("กรุณากรอกเบอร์โทรศัพท์ไม่เกิน 10 หลัก")
              } else if (value.length < 10 && value.length > 0) {
                setMessage("เบอร์โทรศัพท์ต้องมี 10 หลัก")
              } else {
                setMessage("")
              }
            }
          }}
          maxLength={10}
          required
          className="text-black block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>

      <div className="relative">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          รหัสผ่าน <span className="text-red-500">*</span>
        </label>
        <input
          id="password"
          name="password"
          type={formData.showPassword ? "text" : "password"}
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          required
          minLength={6}
          className="text-black block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        <button
          type="button"
          onClick={() =>
            setFormData((prev) => ({
              ...prev,
              showPassword: !prev.showPassword,
            }))
          }
          className="absolute right-3 top-11 text-gray-500 hover:text-gray-700"
        >
          {formData.showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
        </button>
      </div>

      <div className="relative">
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
          ยืนยันรหัสผ่าน <span className="text-red-500">*</span>
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type={formData.showConfirmPassword ? "text" : "password"}
          placeholder="••••••••"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          minLength={6}
          className="text-black block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        <button
          type="button"
          onClick={() =>
            setFormData((prev) => ({
              ...prev,
              showConfirmPassword: !prev.showConfirmPassword,
            }))
          }
          className="absolute right-3 top-11 text-gray-500 hover:text-gray-700"
        >
          {formData.showConfirmPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
        </button>
      </div>
    </div>
  )
}

export default Step1BasicInfo
