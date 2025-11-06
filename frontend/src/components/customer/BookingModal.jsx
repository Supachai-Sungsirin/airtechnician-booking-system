import { useState, useEffect } from "react"
import api from "../../services/api"
import SearchTechnicians from "./SearchTechnicians" 

export default function BookingModal({ onClose, onSuccess }) {
  const [services, setServices] = useState([])
  const [formData, setFormData] = useState({
    services: [{ serviceId: "", btuRange: "", quantity: 1 }],
    requestedDateTime: "",
    problemDescription: "",
    address: "",
    district: "",
  })
  const [loading, setLoading] = useState(false)
  const [estimatedPrice, setEstimatedPrice] = useState(0)
  const [userProfile, setUserProfile] = useState(null)
  const [fetchError, setFetchError] = useState(null)

  const [currentStep, setCurrentStep] = useState(1)
  const [availableTechnicians, setAvailableTechnicians] = useState([])
  const [selectedTechnician, setSelectedTechnician] = useState(null)

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const serviceResponse = await api.get("/service")
        setServices(serviceResponse.data.filter((s) => s.active))
        console.log(
          "Fetched Services (all active from API):",
          serviceResponse.data.filter((s) => s.active),
        )

        const userResponse = await api.get("/auth/me")
        const userData = userResponse.data
        setUserProfile(userData)

        if (userData.address && userData.district && userData.province && userData.postalCode) {
          setFormData((prevFormData) => ({
            ...prevFormData,
            address: `${userData.address}, ${userData.district}, ${userData.province} ${userData.postalCode}`,
            district: userData.district,
          }))
        } else {
          console.warn("User address or district not fully available in profile. User needs to fill manually.")
          setFetchError("ไม่พบข้อมูลที่อยู่และเขต/อำเภอของผู้ใช้ในโปรไฟล์ กรุณากรอกเอง")
        }
      } catch (error) {
        console.error("Error fetching initial data (services or user profile):", error)
        setFetchError("ไม่สามารถดึงข้อมูลที่อยู่ผู้ใช้ได้ กรุณาตรวจสอบการเข้าสู่ระบบหรือกรอกข้อมูลเอง")
        setFormData((prevFormData) => ({
          ...prevFormData,
          address: "",
          district: "",
        }))
      }
    }
    fetchInitialData()
  }, [])

  useEffect(() => {
    let total = 0
    formData.services.forEach((serviceItem) => {
      const service = services.find((s) => s._id === serviceItem.serviceId)

      if (service) {
        const option = service.options.find((o) => (o.btuRange || "") === (serviceItem.btuRange || ""))
        if (option) {
          const price = option.unit === "per_unit" ? option.price * serviceItem.quantity : option.price
          total += price
        }
      }
    })
    setEstimatedPrice(total)
  }, [formData.services, services])

  const addServiceItem = () => {
    setFormData({
      ...formData,
      services: [...formData.services, { serviceId: "", btuRange: "", quantity: 1 }],
    })
  }

  const removeServiceItem = (index) => {
    const newServices = formData.services.filter((_, i) => i !== index)
    setFormData({ ...formData, services: newServices })
  }

  const updateServiceItem = (index, field, value) => {
    const newServices = [...formData.services]
    newServices[index][field] = value

    if (field === "serviceId") {
      const service = services.find((s) => s._id === value)
      if (service) {
        const hasBtuOptions = service.options.some((opt) => opt.btuRange)

        if (!hasBtuOptions && service.options.length > 0) {
          newServices[index]["btuRange"] = service.options[0].btuRange || ""
        } else {
          newServices[index]["btuRange"] = ""
        }
      } else {
        newServices[index]["btuRange"] = ""
      }
      newServices[index]["quantity"] = 1
    }
    setFormData({ ...formData, services: newServices })
  }

  const handleNextStep = async (e) => {
    e.preventDefault()

    if (!formData.district) {
      alert("กรุณาระบุเขต/อำเภอ (ไม่สามารถดึงจากโปรไฟล์ได้หรือไม่ได้กรอก)")
      return
    }

    const hasValidService = formData.services.some((s) => {
      if (!s.serviceId || s.quantity < 1) return false
      const service = services.find((svc) => svc._id === s.serviceId)
      if (!service) return false

      const hasBtuOptions = service.options.some((opt) => opt.btuRange)

      if (hasBtuOptions && s.btuRange === "") return false

      return true
    })

    if (!hasValidService) {
      alert("กรุณาเลือกบริการ และ BTU (ถ้ามี) ให้ครบถ้วน")
      return
    }

    const requestedDate = new Date(formData.requestedDateTime)
    const now = new Date()
    if (requestedDate <= now) {
      alert("กรุณาเลือกวันและเวลาที่เป็นอนาคต")
      return
    }

    setLoading(true)

    try {
      const validServices = formData.services
        .filter((s) => s.serviceId && s.quantity > 0)
        .map((s) => {
          const service = services.find((svc) => svc._id === s.serviceId)
          const option = service.options.find((o) => (o.btuRange || "") === (s.btuRange || ""))
          return {
            serviceId: s.serviceId,
            btuRange: s.btuRange,
            quantity: s.quantity,
            price: option ? option.price : 0,
          }
        })

      const serviceIdsToFindTechnicians = validServices.map((s) => s.serviceId)

      console.log("[v0] Searching technicians for:", {
        district: formData.district,
        serviceIds: serviceIdsToFindTechnicians,
      })

      // 1. แปลง Array [id1, id2] ให้เป็น String "id1,id2"
      const serviceIdString = serviceIdsToFindTechnicians.join(",")

      // 2. ยิง API ด้วย .get และส่งข้อมูลผ่าน params
      const searchResult = await api.get("/search/technicians", {
        params: {
          district: formData.district,
          serviceIds: serviceIdString, // ส่งเป็น String ที่คั่นด้วย ,
        },
      })

      console.log("[v0] Search result:", searchResult)

      // แปลงข้อมูลช่างให้ตรงกับ format ที่ UI ต้องการ
      const foundTechnicians = searchResult.data.data.map((tech) => ({
        _id: tech._id,
        name: tech.userId?.fullName || "ไม่ระบุชื่อ",
        phone: tech.userId?.phone || "ไม่ระบุเบอร์",
        email: tech.userId?.email,
        serviceAreas: tech.serviceArea || [],
        specializations: tech.services?.map((s) => s.name) || [],
        rating: tech.rating || 0,
        completedJobs: tech.totalReviews || 0,
      }))

      setAvailableTechnicians(foundTechnicians)
      setCurrentStep(2)
    } catch (error) {
      console.error("[v0] Error finding technicians:", error)
      if (error.response?.status === 401) {
        alert("คุณต้องเข้าสู่ระบบก่อนทำการจอง")
      } else if (error.response?.data?.message) {
        alert(error.response.data.message)
      } else {
        alert("เกิดข้อผิดพลาดในการค้นหาช่าง กรุณาลองใหม่อีกครั้ง")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmBooking = async () => {
    setLoading(true)

    try {
      const validServices = formData.services
        .filter((s) => s.serviceId && s.quantity > 0)
        .map((s) => {
          const service = services.find((svc) => svc._id === s.serviceId)
          const option = service.options.find((o) => (o.btuRange || "") === (s.btuRange || ""))
          return {
            serviceId: s.serviceId,
            btuRange: s.btuRange,
            quantity: s.quantity,
            price: option ? option.price : 0,
          }
        })

      const bookingData = {
        requestedDateTime: formData.requestedDateTime,
        address: formData.address,
        district: formData.district,
        services: validServices,
        problemDescription: formData.problemDescription,
      }

      if (selectedTechnician) {
        bookingData.preferredTechnicianId = selectedTechnician._id
      }

      const bookingResponse = await api.post("/booking", bookingData)

      const { message, assignedTechnician, totalPrice } = bookingResponse.data

      alert(
        `${message}\n\nราคารวม: ฿${totalPrice.toLocaleString()}` +
          `${assignedTechnician ? `\n\nช่างที่ได้รับมอบหมาย:\n${assignedTechnician.name}\nเบอร์โทร: ${assignedTechnician.phone}` : ""}`,
      )

      onSuccess()
    } catch (error) {
      console.error("Error creating booking:", error)
      if (error.response?.status === 401) {
        alert("คุณต้องเข้าสู่ระบบก่อนทำการจอง")
      } else if (error.response?.data?.message) {
        alert(error.response.data.message)
      } else {
        alert("เกิดข้อผิดพลาดในการจอง กรุณาลองใหม่อีกครั้ง")
      }
    } finally {
      setLoading(false)
    }
  }

  const getMinDateTime = () => {
    const now = new Date()
    now.setHours(now.getHours() + 1)
    now.setMinutes(now.getMinutes() - (now.getMinutes() % 5))
    return now.toISOString().slice(0, 16)
  }

  const isAddressFromProfile =
    userProfile && userProfile.address && userProfile.district && userProfile.province && userProfile.postalCode

  // 2. แก้ไขส่วนนี้ให้เรียกใช้ Component ใหม่
  if (currentStep === 2) {
    return (
      <SearchTechnicians
        onClose={onClose}
        formData={formData}
        estimatedPrice={estimatedPrice}
        availableTechnicians={availableTechnicians}
        selectedTechnician={selectedTechnician}
        setSelectedTechnician={setSelectedTechnician}
        setCurrentStep={setCurrentStep}
        handleConfirmBooking={handleConfirmBooking}
        loading={loading}
      />
    )
  }

  // 3. ส่วนที่เหลือคือ UI ของ "ขั้นตอนที่ 1" (หน้ากรอกข้อมูล)
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">จองบริการ</h2>
              <p className="text-gray-600 mt-1">ระบบจะแมทช์ช่างในเขตของคุณให้อัตโนมัติ</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
              ×
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex gap-3">
              <span className="text-blue-600 text-xl">ℹ️</span>
              <div className="text-sm text-blue-800">
                <p className="font-medium">ระบบแมทช์ช่างอัตโนมัติ</p>
                <p className="mt-1">เมื่อคุณจองบริการ ระบบจะหาช่างที่ให้บริการในเขตของคุณโดยอัตโนมัติ</p>
              </div>
            </div>
          </div>

          {fetchError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-800">
              ⚠️ {fetchError}
            </div>
          )}

          <form onSubmit={handleNextStep} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">บริการที่ต้องการ *</label>
              {formData.services.map((service, index) => {
                const selectedService = services.find((s) => s._id === service.serviceId)
                const hasBtuOptions = selectedService && selectedService.options.some((opt) => opt.btuRange)

                return (
                  <div key={index} className="mb-3 p-4 border border-gray-200 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <select
                          required
                          value={service.serviceId}
                          onChange={(e) => updateServiceItem(index, "serviceId", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        >
                          <option value="">เลือกบริการ</option>
                          {services.map((s) => (
                            <option key={s._id} value={s._id}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {selectedService && (
                        <>
                          {hasBtuOptions ? (
                            <div>
                              <select
                                required
                                value={service.btuRange}
                                onChange={(e) => updateServiceItem(index, "btuRange", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              >
                                <option value="">เลือก BTU</option>
                                {selectedService.options
                                  .filter((opt) => opt.btuRange)
                                  .map((opt, i) => (
                                    <option key={i} value={opt.btuRange}>
                                      {opt.label || opt.btuRange} - ฿{opt.price.toLocaleString()}
                                    </option>
                                  ))}
                              </select>
                            </div>
                          ) : selectedService.options.length > 0 ? (
                            <div>
                              <select
                                required
                                value={service.btuRange || ""}
                                onChange={(e) => updateServiceItem(index, "btuRange", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              >
                                {selectedService.options
                                  .filter((opt) => !opt.btuRange)
                                  .map((opt, i) => (
                                    <option key={i} value={opt.btuRange || ""}>
                                      {opt.label} - ฿{opt.price.toLocaleString()}
                                    </option>
                                  ))}
                              </select>
                            </div>
                          ) : (
                            <div className="col-span-2 text-red-500 text-sm">ไม่มีตัวเลือกสำหรับบริการนี้</div>
                          )}

                          <div className="flex gap-2">
                            <input
                              type="number"
                              min="1"
                              required
                              value={service.quantity}
                              onChange={(e) =>
                                updateServiceItem(index, "quantity", Number.parseInt(e.target.value) || 1)
                              }
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              placeholder="จำนวน"
                            />
                            {formData.services.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeServiceItem(index)}
                                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
                              >
                                ลบ
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}

              <button
                type="button"
                onClick={addServiceItem}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                + เพิ่มบริการ
              </button>
            </div>

            {estimatedPrice > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-green-800">ราคาประมาณการ:</span>
                  <span className="text-lg font-bold text-green-900">฿{estimatedPrice.toLocaleString()}</span>
                </div>
                <p className="text-xs text-green-700 mt-1">*ราคาอาจมีการเปลี่ยนแปลงตามสภาพงานจริง</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">วันและเวลาที่ต้องการ *</label>
              <input
                type="datetime-local"
                required
                min={getMinDateTime()}
                value={formData.requestedDateTime}
                onChange={(e) => setFormData({ ...formData, requestedDateTime: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">*กรุณาจองล่วงหน้าอย่างน้อย 1 ชั่วโมง</p>
            </div>

            {isAddressFromProfile ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ที่อยู่</label>
                  <p className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 text-sm">
                    {formData.address}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">(หากต้องการแก้ไขที่อยู่ กรุณาไปที่หน้าข้อมูลโปรไฟล์)</p>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ที่อยู่ *</label>
                  <textarea
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={3}
                    placeholder="กรอกที่อยู่สำหรับให้บริการ (บ้านเลขที่, ซอย, ถนน, แขวง/ตำบล, จังหวัด, รหัสไปรษณีย์)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">เขต/อำเภอ *</label>
                  <input
                    type="text"
                    required
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    placeholder="กรอกเขต/อำเภอ"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">อธิบายปัญหา *</label>
              <textarea
                required
                value={formData.problemDescription}
                onChange={(e) => setFormData({ ...formData, problemDescription: e.target.value })}
                rows={4}
                placeholder="อธิบายปัญหาหรือความต้องการเพิ่มเติม เช่น แอร์ไม่เย็น, มีเสียงดัง, น้ำหยด ฯลฯ"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "กำลังค้นหาช่าง..." : "ถัดไป →"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}