import { useState } from "react"
import { EyeIcon, EyeOffIcon } from "lucide-react"

const PersonalInfoSection = ({ formData, setFormData }) => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handlePhoneChange = (e) => {
    const onlyNums = e.target.value.replace(/[^0-9]/g, "")
    setFormData({ ...formData, phone: onlyNums })
  }

  return (
    <div className="space-y-5">
      <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
          กรอกข้อมูลส่วนตัวของคุณ
        </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* First Name */}
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
            ชื่อ (First Name) <span className="text-red-500">*</span>
          </label>
          <input
            id="firstName"
            name="firstName" me
            type="text"
            placeholder="กรอกชื่อ"
            value={formData.firstName}
            onChange={handleChange}
            required
            className="text-black block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
        {/* Last Name */}
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
            นามสกุล (Last Name) <span className="text-red-500">*</span>
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            placeholder="กรอกนามสกุล"
            value={formData.lastName}
            onChange={handleChange}
            required
            className="text-black block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          อีเมล <span className="text-red-500">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="example@gmail.com"
          value={formData.email}
          onChange={handleChange}
          required
          className="text-black block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>

      {/* Phone */}
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
          onChange={handlePhoneChange}
          required
          maxLength={10}
          className="text-black block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>

      {/* Password */}
      <div className="relative">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
          รหัสผ่าน <span className="text-red-500">*</span>
        </label>
        <input
          id="password"
          name="password"
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          required
          minLength={6}
          className="text-black block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-10"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-[42px] text-gray-500 hover:text-gray-700"
        >
          {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
        </button>
      </div>

      {/* Confirm Password */}
      <div className="relative">
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
          ยืนยันรหัสผ่าน
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type={showConfirmPassword ? "text" : "password"}
          placeholder="••••••••"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          minLength={6}
          className="text-black block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-10"
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute right-3 top-[42px] text-gray-500 hover:text-gray-700"
        >
          {showConfirmPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
        </button>
      </div>
    </div>
  )
}

export default PersonalInfoSection
