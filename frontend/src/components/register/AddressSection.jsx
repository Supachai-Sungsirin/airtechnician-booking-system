const BANGKOK_DISTRICTS = [
  { name: "เขตบางกอกน้อย", postalCode: "10700" },
  { name: "เขตบางกอกใหญ่", postalCode: "10600" },
  { name: "เขตบางกะปิ", postalCode: "10240" },
  { name: "เขตบางขุนเทียน", postalCode: "10150" },
  { name: "เขตบางแค", postalCode: "10160" },
  { name: "เขตบางเขน", postalCode: "10220" },
  { name: "เขตบางคอแหลม", postalCode: "10120" },
  { name: "เขตบางซื่อ", postalCode: "10800" },
  { name: "เขตบางนา", postalCode: "10260" },
  { name: "เขตบางบอน", postalCode: "10150" },
  { name: "เขตบางพลัด", postalCode: "10700" },
  { name: "เขตบางรัก", postalCode: "10500" },
  { name: "เขตบึงกุ่ม", postalCode: "10230" },
  { name: "เขตจตุจักร", postalCode: "10900" },
  { name: "เขตจอมทอง", postalCode: "10150" },
  { name: "เขตดอนเมือง", postalCode: "10210" },
  { name: "เขตดินแดง", postalCode: "10400" },
  { name: "เขตดุสิต", postalCode: "10300" },
  { name: "เขตห้วยขวาง", postalCode: "10310" },
  { name: "เขตคลองเตย", postalCode: "10110" },
  { name: "เขตคลองสาน", postalCode: "10600" },
  { name: "เขตคลองสามวา", postalCode: "10510" },
  { name: "เขตคันนายาว", postalCode: "10230" },
  { name: "เขตลาดกระบัง", postalCode: "10520" },
  { name: "เขตลาดพร้าว", postalCode: "10230" },
  { name: "เขตหลักสี่", postalCode: "10210" },
  { name: "เขตมีนบุรี", postalCode: "10510" },
  { name: "เขตหนองแขม", postalCode: "10160" },
  { name: "เขตหนองจอก", postalCode: "10530" },
  { name: "เขตปทุมวัน", postalCode: "10330" },
  { name: "เขตป้อมปราบศัตรูพ่าย", postalCode: "10100" },
  { name: "เขตพญาไท", postalCode: "10400" },
  { name: "เขตพระโขนง", postalCode: "10260" },
  { name: "เขตพระนคร", postalCode: "10200" },
  { name: "เขตภาษีเจริญ", postalCode: "10160" },
  { name: "เขตประเวศ", postalCode: "10250" },
  { name: "เขตราชเทวี", postalCode: "10400" },
  { name: "เขตราษฎร์บูรณะ", postalCode: "10140" },
  { name: "เขตสะพานสูง", postalCode: "10240" },
  { name: "เขตสัมพันธวงศ์", postalCode: "10100" },
  { name: "เขตสาทร", postalCode: "10120" },
  { name: "เขตสวนหลวง", postalCode: "10250" },
  { name: "เขตสายไหม", postalCode: "10220" },
  { name: "เขตสามเสนใน", postalCode: "10400" },
  { name: "เขตทวีวัฒนา", postalCode: "10170" },
  { name: "เขตถนนนครไชยศรี", postalCode: "10600" },
  { name: "เขตทุ่งครุ", postalCode: "10140" },
  { name: "เขตธนบุรี", postalCode: "10600" },
  { name: "เขตวังทองหลาง", postalCode: "10310" },
  { name: "เขตวัฒนา", postalCode: "10110" },
  { name: "เขตยานนาวา", postalCode: "10120" },
]

const AddressSection = ({ formData, setFormData }) => {
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleDistrictChange = (e) => {
    const selectedDistrict = e.target.value
    const districtData = BANGKOK_DISTRICTS.find((d) => d.name === selectedDistrict)

    setFormData({
      ...formData,
      district: selectedDistrict,
      postalCode: districtData ? districtData.postalCode : "",
    })
  }

  const handlePostalCodeChange = (e) => {
    const onlyNums = e.target.value.replace(/[^0-9]/g, "")
    setFormData({ ...formData, postalCode: onlyNums })
  }

  return (
    <div className="pt-4 border-t border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">ที่อยู่สำหรับติดต่อ</h3>

      <div className="space-y-5">
        {/* Address */}
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
            ที่อยู่
          </label>
          <textarea
            id="address"
            name="address"
            placeholder="บ้านเลขที่ ซอย ถนน"
            value={formData.address}
            onChange={handleChange}
            required
            rows={2}
            className="text-black block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
          />
        </div>

        {/* District Dropdown */}
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
            className="text-black block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
          >
            <option value="">เลือกเขต</option>
            {BANGKOK_DISTRICTS.map((district) => (
              <option key={district.name} value={district.name}>
                {district.name}
              </option>
            ))}
          </select>
        </div>

        {/* Province (Fixed to Bangkok) */}
        <div>
          <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-2">
            จังหวัด
          </label>
          <input
            id="province"
            name="province"
            type="text"
            value={formData.province}
            readOnly
            className="text-black block w-full px-3 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
          />
        </div>

        {/* Postal Code (Auto-filled but editable) */}
        <div>
          <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">
            รหัสไปรษณีย์
          </label>
          <input
            id="postalCode"
            name="postalCode"
            type="text"
            placeholder="10XXX"
            value={formData.postalCode}
            onChange={handlePostalCodeChange}
            required
            maxLength={5}
            className="text-black block w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>
    </div>
  )
}

export default AddressSection
