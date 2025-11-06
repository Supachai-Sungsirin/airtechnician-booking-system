import { useState, useEffect } from "react";
import api from "../../services/api";

const Step3ProfessionalInfo = ({ formData, setFormData }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [availableServices, setAvailableServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await api.get("/auth/services");
        setAvailableServices(response.data.data);
      } catch (error) {
        console.error(
          "Error fetching services for technician registration:",
          error
        );
      } finally {
        setLoadingServices(false);
      }
    };
    fetchServices();
  }, []);

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

  const handleServiceAreaChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      const updatedAreas = checked
        ? [...prev.serviceArea, value]
        : prev.serviceArea.filter((area) => area !== value);
      return { ...prev, serviceArea: updatedAreas };
    });
  };

  const handleServiceTypeChange = (e) => {
    const { value, checked } = e.target; // value ตอนนี้คือ Service _id (ObjectId)
    setFormData((prev) => {
      // ตรวจสอบจาก _id ที่เป็น String
      const updatedServices = checked
        ? [...prev.services, value]
        : prev.services.filter((serviceId) => serviceId !== value);
      return { ...prev, services: updatedServices };
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
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
            setFormData((prev) => ({ ...prev, idCard: onlyNums }));
          }}
          required
          maxLength={13}
          className="text-black block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        <p className="text-xs text-gray-500 mt-1">กรอกเลข 13 หลัก</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          ประเภทบริการที่ให้ <span className="text-red-500">*</span>
        </label>
        {/* Loading State */}
        {loadingServices ? (
            <div className="flex items-center gap-3 p-3 text-sm text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                กำลังโหลดรายการบริการ...
            </div>
        ) : availableServices.length === 0 ? (
            <div className="text-sm text-red-500 p-3 border border-red-200 rounded-lg">
                ไม่พบงานบริการในระบบ กรุณาติดต่อแอดมิน
            </div>
        ) : (
            <div className="grid grid-cols-2 gap-3">
                {/* Map ข้อมูลจาก State ที่ดึงมาจาก API */}
                {availableServices.map((service) => (
                    <label
                        key={service._id}
                        className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-all"
                    >
                        <input
                            type="checkbox"
                            // ใช้ service._id เป็น value ที่จะส่งไป Backend
                            value={service._id} 
                            // ตรวจสอบว่า _id นี้อยู่ใน formData.services หรือไม่
                            checked={formData.services.includes(service._id)} 
                            onChange={handleServiceTypeChange}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        {/* แสดงชื่อบริการ (name) แทน label */}
                        <span className="text-sm text-gray-700">{service.name}</span>
                    </label>
                ))}
            </div>
        )}
        <p className="text-xs text-gray-500 mt-2">
          เลือกแล้ว {formData.services.length} บริการ
        </p>
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
                    value={area}
                    checked={formData.serviceArea.includes(area)}
                    onChange={handleServiceAreaChange}
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
};

export default Step3ProfessionalInfo;
