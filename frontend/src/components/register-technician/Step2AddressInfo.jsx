const Step2AddressInfo = ({ formData, setFormData }) => {
  // ข้อมูลเขตกรุงเทพและรหัสไปรษณีย์
  const bangkokDistricts = [
    { name: "พระนคร", postalCode: "10200" },
    { name: "ดุสิต", postalCode: "10300" },
    { name: "หนองจอก", postalCode: "10240" },
    { name: "บางรัก", postalCode: "10500" },
    { name: "บางเขน", postalCode: "10220" },
    { name: "บางกะปิ", postalCode: "10240" },
    { name: "ปทุมวัน", postalCode: "10330" },
    { name: "ป้อมปราบศัตรูพ่าย", postalCode: "10100" },
    { name: "พระโขนง", postalCode: "10260" },
    { name: "มีนบุรี", postalCode: "10510" },
    { name: "ลาดกระบัง", postalCode: "10520" },
    { name: "ยานนาวา", postalCode: "10120" },
    { name: "สัมพันธวงศ์", postalCode: "10100" },
    { name: "พญาไท", postalCode: "10400" },
    { name: "ธนบุรี", postalCode: "10600" },
    { name: "บางกอกใหญ่", postalCode: "10600" },
    { name: "ห้วยขวาง", postalCode: "10310" },
    { name: "คลองสาน", postalCode: "10600" },
    { name: "ตลิ่งชัน", postalCode: "10170" },
    { name: "บางกอกน้อย", postalCode: "10700" },
    { name: "บางขุนเทียน", postalCode: "10150" },
    { name: "ภาษีเจริญ", postalCode: "10160" },
    { name: "หนองแขม", postalCode: "10160" },
    { name: "ราษฎร์บูรณะ", postalCode: "10140" },
    { name: "บางพลัด", postalCode: "10700" },
    { name: "ดินแดง", postalCode: "10400" },
    { name: "บึงกุ่ม", postalCode: "10230" },
    { name: "สาทร", postalCode: "10120" },
    { name: "บางซื่อ", postalCode: "10800" },
    { name: "จตุจักร", postalCode: "10900" },
    { name: "บางคอแหลม", postalCode: "10120" },
    { name: "ประเวศ", postalCode: "10250" },
    { name: "คลองเตย", postalCode: "10110" },
    { name: "สวนหลวง", postalCode: "10250" },
    { name: "จอมทอง", postalCode: "10150" },
    { name: "ดอนเมือง", postalCode: "10210" },
    { name: "ราชเทวี", postalCode: "10400" },
    { name: "ลาดพร้าว", postalCode: "10230" },
    { name: "วัฒนา", postalCode: "10110" },
    { name: "บางแค", postalCode: "10160" },
    { name: "หลักสี่", postalCode: "10210" },
    { name: "สายไหม", postalCode: "10220" },
    { name: "คันนายาว", postalCode: "10230" },
    { name: "สะพานสูง", postalCode: "10240" },
    { name: "วังทองหลาง", postalCode: "10310" },
    { name: "คลองสามวา", postalCode: "10510" },
    { name: "บางนา", postalCode: "10260" },
    { name: "ทวีวัฒนา", postalCode: "10170" },
    { name: "ทุ่งครุ", postalCode: "10140" },
    { name: "บางบอน", postalCode: "10150" },
  ]

  const handleDistrictChange = (e) => {
    const selectedDistrict = e.target.value
    const districtData = bangkokDistricts.find((d) => d.name === selectedDistrict)

    setFormData((prev) => ({
      ...prev,
      district: selectedDistrict,
      postalCode: districtData ? districtData.postalCode : "",
    }))
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">ที่อยู่สำหรับติดต่อ</h2>
        <p className="text-sm text-gray-600">กรอกที่อยู่ของคุณ</p>
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
          ที่อยู่ <span className="text-red-500">*</span>
        </label>
        <textarea
          id="address"
          name="address"
          rows={3}
          placeholder="บ้านเลขที่ ซอย ถนน"
          value={formData.address}
          onChange={handleChange}
          required
          className="text-black block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
        />
      </div>

      <div>
        <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-2">
          เขต <span className="text-red-500">*</span>
        </label>
        <select
          id="district"
          name="district"
          value={formData.district}
          onChange={handleDistrictChange}
          required
          className="text-black block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        >
          <option value="">เลือกเขต</option>
          {bangkokDistricts.map((district) => (
            <option key={district.name} value={district.name}>
              {district.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-2">
          จังหวัด <span className="text-red-500">*</span>
        </label>
        <input
          id="province"
          name="province"
          type="text"
          value="กรุงเทพมหานคร"
          readOnly
          className="text-black block w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
        />
      </div>

      <div>
        <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">
          รหัสไปรษณีย์ <span className="text-red-500">*</span>
        </label>
        <input
          id="postalCode"
          name="postalCode"
          type="text"
          placeholder="10XXX"
          value={formData.postalCode}
          onChange={(e) => {
            const value = e.target.value
            if (/^[0-9]*$/.test(value) && value.length <= 5) {
              setFormData((prev) => ({ ...prev, postalCode: value }))
            }
          }}
          maxLength={5}
          required
          className="text-black block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        <p className="text-xs text-gray-500 mt-1">รหัสไปรษณีย์จะถูกกรอกอัตโนมัติเมื่อเลือกเขต แต่สามารถแก้ไขได้</p>
      </div>
    </div>
  )
}

export default Step2AddressInfo
