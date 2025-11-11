import { useState, useEffect } from "react";
import api from "../../services/api";
import SearchTechnicians from "./SearchTechnicians";

export default function BookingModal({ onClose, onSuccess }) {
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({
    services: [{ serviceId: "", btuRange: "", quantity: 1 }],
    requestedDateTime: "",
    problemDescription: "",
    address: "",
    district: "",
  });
  const [loading, setLoading] = useState(false);
  const [estimatedPrice, setEstimatedPrice] = useState(0);
  const [userProfile, setUserProfile] = useState(null);
  const [fetchError, setFetchError] = useState(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [availableTechnicians, setAvailableTechnicians] = useState([]);
  const [selectedTechnician, setSelectedTechnician] = useState(null);

  const [timeAvailable, setTimeAvailable] = useState(true);
  const [availabilityMessage, setAvailabilityMessage] = useState("");

  const [bookingResult, setBookingResult] = useState(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const serviceResponse = await api.get("/service");
        setServices(serviceResponse.data.filter((s) => s.active));
        console.log(
          "Fetched Services (all active from API):",
          serviceResponse.data.filter((s) => s.active)
        );

        const userResponse = await api.get("/auth/me");
        const userData = userResponse.data;
        setUserProfile(userData);

        if (
          userData.address &&
          userData.district &&
          userData.province &&
          userData.postalCode
        ) {
          setFormData((prevFormData) => ({
            ...prevFormData,
            address: `${userData.address}, ${userData.district}, ${userData.province} ${userData.postalCode}`,
            district: userData.district,
          }));
        } else {
          console.warn(
            "User address or district not fully available in profile. User needs to fill manually."
          );
          setFetchError(
            "ไม่พบข้อมูลที่อยู่และเขต/อำเภอของผู้ใช้ในโปรไฟล์ กรุณากรอกเอง"
          );
        }
      } catch (error) {
        console.error(
          "Error fetching initial data (services or user profile):",
          error
        );
        setFetchError(
          "ไม่สามารถดึงข้อมูลที่อยู่ผู้ใช้ได้ กรุณาตรวจสอบการเข้าสู่ระบบหรือกรอกข้อมูลเอง"
        );
        setFormData((prevFormData) => ({
          ...prevFormData,
          address: "",
          district: "",
        }));
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    let total = 0;
    formData.services.forEach((serviceItem) => {
      const service = services.find((s) => s._id === serviceItem.serviceId);

      if (service) {
        const option = service.options.find(
          (o) => (o.btuRange || "") === (serviceItem.btuRange || "")
        );
        if (option) {
          const price =
            option.unit === "per_unit"
              ? option.price * serviceItem.quantity
              : option.price;
          total += price;
        }
      }
    });
    setEstimatedPrice(total);
  }, [formData.services, services]);

  const addServiceItem = () => {
    setFormData({
      ...formData,
      services: [
        ...formData.services,
        { serviceId: "", btuRange: "", quantity: 1 },
      ],
    });
  };

  const removeServiceItem = (index) => {
    const newServices = formData.services.filter((_, i) => i !== index);
    setFormData({ ...formData, services: newServices });
  };

  const updateServiceItem = (index, field, value) => {
    const newServices = [...formData.services];
    newServices[index][field] = value;

    if (field === "serviceId") {
      const service = services.find((s) => s._id === value);
      if (service) {
        const hasBtuOptions = service.options.some((opt) => opt.btuRange);

        if (!hasBtuOptions && service.options.length > 0) {
          newServices[index]["btuRange"] = service.options[0].btuRange || "";
        } else {
          newServices[index]["btuRange"] = "";
        }
      } else {
        newServices[index]["btuRange"] = "";
      }
      newServices[index]["quantity"] = 1;
    }
    setFormData({ ...formData, services: newServices });
  };

  const handleNextStep = async (e) => {
    e.preventDefault();

    if (!formData.district) {
      alert("กรุณาระบุเขต/อำเภอ (ไม่สามารถดึงจากโปรไฟล์ได้หรือไม่ได้กรอก)");
      return;
    }

    const hasValidService = formData.services.some((s) => {
      if (!s.serviceId || s.quantity < 1) return false;
      const service = services.find((svc) => svc._id === s.serviceId);
      if (!service) return false;

      const hasBtuOptions = service.options.some((opt) => opt.btuRange);
      if (hasBtuOptions && s.btuRange === "") return false;

      return true;
    });

    if (!hasValidService) {
      alert("กรุณาเลือกบริการ และ BTU (ถ้ามี) ให้ครบถ้วน");
      return;
    }

    const requestedDate = new Date(formData.requestedDateTime);
    const now = new Date();
    if (requestedDate <= now) {
      alert("กรุณาเลือกวันและเวลาที่เป็นอนาคต");
      return;
    }

    // ✅ ตรวจสอบความพร้อมของเวลาอีกครั้งก่อนไปขั้นตอนถัดไป
    try {
      const res = await api.get("/booking/check-availability", {
        params: { dateTime: formData.requestedDateTime },
      });
      setTimeAvailable(res.data.available);
      setAvailabilityMessage(res.data.message);

      if (!res.data.available) {
        alert("เวลาที่คุณเลือกไม่สามารถจองได้ กรุณาเลือกเวลาอื่น");
        return; // หยุดการ submit
      }
    } catch (err) {
      console.error("Error checking availability:", err);
      alert("ไม่สามารถตรวจสอบเวลาที่เลือกได้ กรุณาลองใหม่");
      return;
    }

    setLoading(true);

    try {
      const validServices = formData.services
        .filter((s) => s.serviceId && s.quantity > 0)
        .map((s) => {
          const service = services.find((svc) => svc._id === s.serviceId);
          const option = service.options.find(
            (o) => (o.btuRange || "") === (s.btuRange || "")
          );
          return {
            serviceId: s.serviceId,
            btuRange: s.btuRange,
            quantity: s.quantity,
            price: option ? option.price : 0,
          };
        });

      const serviceIdsToFindTechnicians = validServices.map((s) => s.serviceId);
      const serviceIdString = serviceIdsToFindTechnicians.join(",");

      const searchResult = await api.get("/search/technicians", {
        params: { district: formData.district, serviceIds: serviceIdString },
      });

      const foundTechnicians = searchResult.data.data.map((tech) => ({
        _id: tech._id,
        name: tech.userId?.fullName || "ไม่ระบุชื่อ",
        phone: tech.userId?.phone || "ไม่ระบุเบอร์",
        email: tech.userId?.email,
        serviceAreas: tech.serviceArea || [],
        specializations: tech.services?.map((s) => s.name) || [],
        rating: tech.rating || 0,
        completedJobs: tech.totalReviews || 0,
        profileImageUrl: tech.userId?.profileImageUrl || null,
      }));

      setAvailableTechnicians(foundTechnicians);
      setCurrentStep(2);
    } catch (error) {
      console.error("[v0] Error finding technicians:", error);
      if (error.response?.status === 401) {
        alert("คุณต้องเข้าสู่ระบบก่อนทำการจอง");
      } else if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert("เกิดข้อผิดพลาดในการค้นหาช่าง กรุณาลองใหม่อีกครั้ง");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmBooking = async (tech) => {
    setSelectedTechnician(tech);
    setLoading(true);

    try {
      const validServices = formData.services
        .filter((s) => s.serviceId && s.quantity > 0)
        .map((s) => {
          const service = services.find((svc) => svc._id === s.serviceId);
          const option = service.options.find(
            (o) => (o.btuRange || "") === (s.btuRange || "")
          );
          return {
            serviceId: s.serviceId,
            btuRange: s.btuRange,
            quantity: s.quantity,
            price: option ? option.price : 0,
          };
        });

      const bookingData = {
        requestedDateTime: formData.requestedDateTime,
        address: formData.address,
        district: formData.district,
        services: validServices,
        problemDescription: formData.problemDescription,
      };

      if (tech) {
        bookingData.preferredTechnicianId = tech._id;
      }

      const bookingResponse = await api.post("/booking", bookingData);

      const { message, assignedTechnician, totalPrice } = bookingResponse.data;

      setBookingResult({
        message: message,
        totalPrice: totalPrice,
        assignedTechnician: assignedTechnician || null,
      });
      setCurrentStep(3);
    } catch (error) {
      console.error("Error creating booking:", error);
      if (error.response?.status === 401) {
        alert("คุณต้องเข้าสู่ระบบก่อนทำการจอง");
      } else if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert("เกิดข้อผิดพลาดในการจอง กรุณาลองใหม่อีกครั้ง");
      }
    } finally {
      setLoading(false);
    }
  };

  const checkDateTimeAvailability = async (dateTimeString) => {
    if (!dateTimeString || dateTimeString.includes("T")) {
      // (ป้องกันการยิง API ถ้าข้อมูลยังไม่ครบ)
      const parts = dateTimeString.split('T');
      if (!parts[0] || !parts[1] || parts[1] === "") {
         setTimeAvailable(false); // ยังเลือกไม่ครบ
         setAvailabilityMessage("กรุณาเลือกวันและเวลาให้ครบถ้วน");
         return;
      }
    }
    
    try {
      const res = await api.get(
        "/booking/check-availability",
        { params: { dateTime: dateTimeString } }
      );
      setTimeAvailable(res.data.available);
      setAvailabilityMessage(res.data.message);
    } catch (err) {
      console.error("Error checking availability:", err);
      setTimeAvailable(false);
      setAvailabilityMessage("ไม่สามารถตรวจสอบเวลาได้");
    }
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    now.setMinutes(now.getMinutes()); // ไม่ต้องปัดลง
    return now.toISOString().slice(0, 16);
  };

  const isAddressFromProfile =
    userProfile &&
    userProfile.address &&
    userProfile.district &&
    userProfile.province &&
    userProfile.postalCode;

    if (currentStep === 3 && bookingResult) {
    return (
      <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-md flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl max-w-md w-full">
          <div className="p-8 text-center">
            {/* ไอคอน */}
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
              ✓
            </div>

            {/* ข้อความหลัก */}
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {bookingResult.message || "จองสำเร็จ!"}
            </h2>

            {/* ราคา */}
            <p className="text-lg text-gray-700 mb-6">
              <strong>ราคารวม:{" "}</strong>
              <span className="font-bold text-gray-900">
                ฿{bookingResult.totalPrice.toLocaleString()}
              </span>
            </p>

            {/* ข้อมูลช่าง (ถ้ามี) */}
            {bookingResult.assignedTechnician && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left text-sm space-y-1">
                <h3 className="font-semibold text-blue-900 mb-2">
                  ช่างที่ได้รับมอบหมาย:
                </h3>
                <p className="text-blue-800">
                  <strong>ชื่อ:</strong> {bookingResult.assignedTechnician.name}
                </p>
                <p className="text-blue-800">
                  <strong>เบอร์โทร:</strong>{" "}
                  {bookingResult.assignedTechnician.phone}
                </p>
              </div>
            )}

            {/* ปุ่มปิด (เรียก onSuccess) */}
            <button
              onClick={() => onSuccess(selectedTechnician)}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              รับทราบ
            </button>
          </div>
        </div>
      </div>
    );
  }
  
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
    );
  }

  // 3. ส่วนที่เหลือคือ UI ของ "ขั้นตอนที่ 1" (หน้ากรอกข้อมูล)
  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">จองบริการ</h2>
              <p className="text-gray-600 mt-1">
                ระบบจะแมทช์ช่างในเขตของคุณให้อัตโนมัติ
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {fetchError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-800">
              ⚠️ {fetchError}
            </div>
          )}

          <form onSubmit={handleNextStep} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                บริการที่ต้องการ *
              </label>
              {formData.services.map((service, index) => {
                const selectedService = services.find(
                  (s) => s._id === service.serviceId
                );
                const hasBtuOptions =
                  selectedService &&
                  selectedService.options.some((opt) => opt.btuRange);

                return (
                  <div
                    key={index}
                    className="mb-3 p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <select
                          required
                          value={service.serviceId}
                          onChange={(e) =>
                            updateServiceItem(
                              index,
                              "serviceId",
                              e.target.value
                            )
                          }
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
                                onChange={(e) =>
                                  updateServiceItem(
                                    index,
                                    "btuRange",
                                    e.target.value
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              >
                                <option value="">เลือก BTU</option>
                                {selectedService.options
                                  .filter((opt) => opt.btuRange)
                                  .map((opt, i) => (
                                    <option key={i} value={opt.btuRange}>
                                      {opt.label || opt.btuRange} - ฿
                                      {opt.price.toLocaleString()}
                                    </option>
                                  ))}
                              </select>
                            </div>
                          ) : selectedService.options.length > 0 ? (
                            <div>
                              <select
                                required
                                value={service.btuRange || ""}
                                onChange={(e) =>
                                  updateServiceItem(
                                    index,
                                    "btuRange",
                                    e.target.value
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              >
                                {selectedService.options
                                  .filter((opt) => !opt.btuRange)
                                  .map((opt, i) => (
                                    <option key={i} value={opt.label}>
                                      {opt.label} - ฿
                                      {opt.price.toLocaleString()}
                                    </option>
                                  ))}
                              </select>
                            </div>
                          ) : (
                            <div className="col-span-2 text-red-500 text-sm">
                              ไม่มีตัวเลือกสำหรับบริการนี้
                            </div>
                          )}

                          <div className="flex gap-2">
                            <input
                              type="number"
                              min="1"
                              required
                              value={service.quantity}
                              onChange={(e) =>
                                updateServiceItem(
                                  index,
                                  "quantity",
                                  Number.parseInt(e.target.value) || 1
                                )
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
                );
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
                  <span className="text-sm font-medium text-green-800">
                    ราคาประมาณการ:
                  </span>
                  <span className="text-lg font-bold text-green-900">
                    ฿{estimatedPrice.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-green-700 mt-1">
                  *ราคาอาจมีการเปลี่ยนแปลงตามสภาพงานจริง
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                วันและเวลาที่ต้องการ *
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* ช่องเลือกวัน */}
                <div>
                  <input
                    type="date"
                    required
                    min={getMinDateTime().slice(0, 10)} // จำกัดวันให้ไม่น้อยกว่าวันนี้
                    value={
                      formData.requestedDateTime
                        ? formData.requestedDateTime.slice(0, 10)
                        : ""
                    }
                    onChange={async (e) => { // (ทำให้เป็น async)
                      const time = formData.requestedDateTime
                        ? formData.requestedDateTime.slice(11, 16)
                        : ""; // (เปลี่ยน "09:00" เป็น "" เพื่อบังคับให้เลือกเวลาใหม่)
                      
                      const newDateTime = `${e.target.value}T${time}`;
                      
                      setFormData({
                        ...formData,
                        requestedDateTime: newDateTime,
                      });

                      // (เรียกฟังก์ชันยิง API ที่เราสร้าง)
                      await checkDateTimeAvailability(newDateTime);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* ช่องเลือกเวลา */}
                <div>
                  <input
                    type="time"
                    required
                    value={
                      formData.requestedDateTime
                        ? formData.requestedDateTime.slice(11, 16)
                        : ""
                    }
                    onChange={async (e) => { //
                      const date = formData.requestedDateTime
                        ? formData.requestedDateTime.slice(0, 10)
                        : new Date().toISOString().slice(0, 10);
                      
                      const newDateTime = `${date}T${e.target.value}`; //
                      
                      setFormData({
                        ...formData,
                        requestedDateTime: newDateTime, //
                      });

                      // (เรียกฟังก์ชันยิง API ที่เราสร้าง แทนโค้ด try/catch เดิม)
                      await checkDateTimeAvailability(newDateTime);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              {availabilityMessage && (
                <p
                  className={`text-sm mt-2 ${
                    timeAvailable ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {availabilityMessage}
                </p>
              )}

              <p className="text-xs text-gray-500 mt-1">
                * กรุณาจองล่วงหน้าอย่างน้อย 1 ชั่วโมง
              </p>
            </div>

            {isAddressFromProfile ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ที่อยู่
                  </label>
                  <p className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 text-sm">
                    {formData.address}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    (หากต้องการแก้ไขที่อยู่ กรุณาไปที่หน้าโปรไฟล์)
                  </p>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ที่อยู่ *
                  </label>
                  <textarea
                    required
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    rows={3}
                    placeholder="กรอกที่อยู่สำหรับให้บริการ (บ้านเลขที่, ซอย, ถนน, แขวง/ตำบล, จังหวัด, รหัสไปรษณีย์)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    เขต/อำเภอ *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.district}
                    onChange={(e) =>
                      setFormData({ ...formData, district: e.target.value })
                    }
                    placeholder="กรอกเขต/อำเภอ"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                อธิบายปัญหา *
              </label>
              <textarea
                required
                value={formData.problemDescription}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    problemDescription: e.target.value,
                  })
                }
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
                disabled={loading || !timeAvailable}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                  timeAvailable
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-300 text-gray-600 cursor-not-allowed"
                }`}
              >
                {loading ? "กำลังค้นหาช่าง..." : "ถัดไป →"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
