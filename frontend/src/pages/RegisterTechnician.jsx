import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../services/api";

const RegisterTechnician = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: "",
    idCard: "",
    selfieWithIdCard: "",
    serviceArea: "",
    bio: "",
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const serviceAreas = [
    "พระนคร",
    "ดุสิต",
    "หนองจอก",
    "บางรัก",
    "บางเขน",
    "บางกะปิ",
    "ปทุมวัน",
    "ป้อมปราบศัตรูพ่าย",
    "พระโขนง",
    "มีนบุรี",
    "ลาดกระบัง",
    "ยานนาวา",
    "สัมพันธวงศ์",
    "พญาไท",
    "ธนบุรี",
    "บางกอกใหญ่",
    "ห้วยขวาง",
    "คลองสาน",
    "ตลิ่งชัน",
    "บางกอกน้อย",
    "บางขุนเทียน",
    "ภาษีเจริญ",
    "หนองแขม",
    "ราษฎร์บูรณะ",
    "บางพลัด",
    "ดินแดง",
    "บึงกุ่ม",
    "สาทร",
    "บางซื่อ",
    "จตุจักร",
    "บางคอแหลม",
    "ประเวศ",
    "คลองเตย",
    "สวนหลวง",
    "จอมทอง",
    "ดอนเมือง",
    "ราชเทวี",
    "ลาดพร้าว",
    "วัฒนา",
    "บางแค",
    "หลักสี่",
    "สายไหม",
    "คันนายาว",
    "สะพานสูง",
    "วังทองหลาง",
    "คลองสามวา",
    "บางนา",
    "ทวีวัฒนา",
    "ทุ่งครุ",
    "บางบอน",
  ];

  const handleGoogleSignup = () => {
    // Redirect to Google OAuth endpoint
    window.location.href = `${api.defaults.baseURL}/auth/google/technician`;
  };
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox" && name === "serviceArea") {
      setFormData((prev) => {
        const updatedAreas = checked
          ? [...prev.serviceArea, value]
          : prev.serviceArea.filter((area) => area !== value);
        return { ...prev, serviceArea: updatedAreas };
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          selfieWithIdCard: reader.result,
        }));
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      // ส่ง currentStep เข้า validateStep
      setMessage("");
      setCurrentStep((prev) => prev + 1);
    }
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (
          !formData.email ||
          !formData.password ||
          !formData.fullName ||
          !formData.phone
        ) {
          setMessage("กรุณากรอกข้อมูลให้ครบถ้วน");
          return false;
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;
        if (!emailRegex.test(formData.email)) {
          setMessage("กรุณากรอกอีเมลให้ถูกต้อง");
          return false;
        }

        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(formData.phone)) {
          setMessage("กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (10 หลัก)");
          return false;
        }

        if (formData.password !== formData.confirmPassword) {
          setMessage("รหัสผ่านไม่ตรงกัน");
          return false;
        }

        if (formData.password.length < 6) {
          setMessage("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
          return false;
        }
        break;

      case 2:
        if (
          !formData.idCard ||
          formData.serviceArea.length === 0 ||
          !formData.bio
        ) {
          setMessage("กรุณากรอกข้อมูลให้ครบถ้วน");
          return false;
        }
        if (formData.idCard.length !== 13 || !/^\d+$/.test(formData.idCard)) {
          setMessage("เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก");
          return false;
        }
        break;

      case 3:
        if (!formData.selfieWithIdCard) {
          setMessage("กรุณาอัพโหลดรูปถ่ายคู่บัตรประชาชน");
          return false;
        }
        break;

      default:
        break;
    }

    setMessage("");
    return true;
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setMessage("");
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  // ตรวจสอบข้อมูลสเต็บ 3 ก่อนส่ง
  if (!validateStep(3)) return;

  setIsLoading(true);
  setMessage("");
  setIsSuccess(false);

  try {
    const res = await api.post("/auth/register/technician", formData);

    // สมัครสำเร็จ
    setIsSuccess(true);
    setMessage("สมัครสมาชิกสำเร็จ! รอการอนุมัติจากทีมงาน กำลังนำคุณไปยังหน้าเข้าสู่ระบบ...");

    // รอ 3 วิ แล้ว redirect ไปหน้า login
    setTimeout(() => {
      window.location.href = "/login";
    }, 3000);
  } catch (error) {
    console.error(error);
    setIsSuccess(false);
    setMessage(error.response?.data?.message || "เกิดข้อผิดพลาดในการสมัครสมาชิก");
  } finally {
    setIsLoading(false);
  }
};


  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
              currentStep >= step
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-500"
            }`}
          >
            {step}
          </div>
          {step < 3 && (
            <div
              className={`w-16 h-1 mx-2 transition-all ${
                currentStep > step ? "bg-blue-600" : "bg-gray-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">ข้อมูลพื้นฐาน</h2>
        <p className="text-sm text-gray-600">กรอกข้อมูลส่วนตัวของคุณ</p>
      </div>

      <div>
        <label
          htmlFor="fullName"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
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
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
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
        <label
          htmlFor="phone"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          เบอร์โทรศัพท์ <span className="text-red-500">*</span>
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          placeholder="0812345678"
          value={formData.phone}
          onChange={(e) => {
            const value = e.target.value;
            // ตรวจสอบว่าเป็นตัวเลขเท่านั้น
            if (/^[0-9]*$/.test(value)) {
              setFormData({
                ...formData,
                phone: value,
              });
              // แจ้งเตือนแบบ real-time
              if (value.length > 10) {
                setMessage("กรุณากรอกเบอร์โทรศัพท์ไม่เกิน 10 หลัก");
              } else if (value.length < 10 && value.length > 0) {
                setMessage("เบอร์โทรศัพท์ต้องมี 10 หลัก");
              } else {
                setMessage("");
              }
            }
          }}
          maxLength={10}
          required
          className="text-black block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>

      <div className="relative">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
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
          className="text-black block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-2 top-13 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
        </button>
      </div>

      <div className="relative">
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          ยืนยันรหัสผ่าน <span className="text-red-500">*</span>
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
          className="text-black block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute right-2 top-13 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          {showConfirmPassword ? (
            <EyeOffIcon size={20} />
          ) : (
            <EyeIcon size={20} />
          )}
        </button>
      </div>
      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500">หรือ</span>
        </div>
      </div>
      {/* Google Sign Up Button */}
      <button
        type="button"
        onClick={handleGoogleSignup}
        className="w-full bg-white border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 hover:border-gray-400 transition-all flex items-center justify-center gap-3"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        <span>สมัครด้วย Google</span>
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">ข้อมูลวิชาชีพ</h2>
        <p className="text-sm text-gray-600">
          กรอกข้อมูลเกี่ยวกับการทำงานของคุณ
        </p>
      </div>

      <div>
        <label
          htmlFor="idCard"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          เลขบัตรประชาชน <span className="text-red-500">*</span>
        </label>
        <input
          id="idCard"
          name="idCard"
          type="text"
          placeholder="1234567890123"
          value={formData.idCard}
          onChange={(e) => {
            const onlyNums = e.target.value.replace(/[^0-9]/g, "");
            setFormData({
              ...formData,
              idCard: onlyNums,
            });
          }}
          required
          maxLength={13}
          className="text-black block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        <p className="text-xs text-gray-500 mt-1">กรอกเลข 13 หลัก</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          พื้นที่ให้บริการ (เขตในกรุงเทพฯ){" "}
          <span className="text-red-500">*</span>
        </label>

        <div className="mb-3">
          <div className="relative">
            <input
              type="text"
              placeholder="ค้นหาเขต..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-black block w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        <div className="max-h-64 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-3">
          {serviceAreas.filter((area) =>
            area.toLowerCase().includes(searchQuery.toLowerCase())
          ).length > 0 ? (
            serviceAreas
              .filter((area) =>
                area.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((area) => (
                <label
                  key={area}
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-all"
                >
                  <input
                    type="checkbox"
                    name="serviceArea"
                    value={area}
                    checked={formData.serviceArea.includes(area)}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{area}</span>
                </label>
              ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <svg
                className="w-12 h-12 mx-auto mb-2 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <p className="text-sm">ไม่พบเขตที่ค้นหา</p>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          เลือกแล้ว {formData.serviceArea.length} เขต
        </p>
      </div>

      <div>
        <label
          htmlFor="bio"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          ประสบการณ์และความเชี่ยวชาญ <span className="text-red-500">*</span>
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          placeholder="เช่น มีประสบการณ์ซ่อมแอร์มากกว่า 5 ปี เชี่ยวชาญในการติดตั้งและซ่อมแอร์ทุกยี่ห้อ..."
          value={formData.bio}
          onChange={handleChange}
          required
          className="text-black block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">
          เอกสารยืนยันตัวตน
        </h2>
        <p className="text-sm text-gray-600">
          อัพโหลดรูปถ่ายคู่บัตรประชาชนเพื่อยืนยันตัวตน
        </p>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-all relative">
        <input
          type="file"
          id="selfieWithIdCard"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <label htmlFor="selfieWithIdCard" className="cursor-pointer">
          {imagePreview ? (
            <div className="space-y-3">
              <img
                src={imagePreview}
                alt="Preview"
                className="h-auto mx-auto rounded-lg border"
              />

              <p className="text-sm font-medium text-gray-900">
                คลิกเพื่อเปลี่ยนรูปภาพ
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="w-20 h-20 mx-auto bg-blue-50 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-900">
                คลิกเพื่ออัพโหลดรูปภาพ
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG หรือ JPEG (สูงสุด 5MB)
              </p>
            </div>
          )}
        </label>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <svg
            className="w-5 h-5 text-blue-600 shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">คำแนะนำในการถ่ายรูป:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>
                ถ่ายรูปคู่กับบัตรประชาชนที่เห็นใบหน้าและข้อมูลในบัตรชัดเจน
              </li>
              <li>ถ่ายในที่ที่มีแสงสว่างเพียงพอ</li>
              <li>ข้อมูลในบัตรต้องอ่านได้ชัดเจน</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"
                />
              </svg>
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            สมัครเป็นช่างกับเรา
          </h1>
          <p className="text-gray-600">เริ่มต้นรับงานและสร้างรายได้กับ CoolQ</p>
        </div>

        {/* Registration Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {renderStepIndicator()}

          <form onSubmit={handleSubmit}>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}

            {/* Message Display */}
            {message && (
              <div
                className={`mt-5 p-4 rounded-lg ${
                  isSuccess
                    ? "bg-green-50 border border-green-200"
                    : "bg-red-50 border border-red-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  {isSuccess ? (
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  )}
                  <p
                    className={`text-sm font-medium ${
                      isSuccess ? "text-green-800" : "text-red-800"
                    }`}
                  >
                    {message}
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
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
              {currentStep < 3 ? (
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

          {/* Terms */}
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

        {/* Footer Text */}
        <p className="text-center text-sm text-gray-600 mt-6">
          มีบัญชีอยู่แล้ว?{" "}
          <Link
            to="/login"
            className="font-medium text-blue-600 hover:text-blue-700"
          >
            เข้าสู่ระบบ
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterTechnician;
