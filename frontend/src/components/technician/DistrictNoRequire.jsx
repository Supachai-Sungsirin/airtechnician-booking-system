// DistrictNoRequire.jsx

const districtsData = [
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

export default function DistrictNoRequire({ value, onChange, isRequired = false }) {
  
  const handleDistrictChange = (e) => {
    const districtName = (e.target.value || "").trim()
    const district = districtsData.find((d) => d.name === districtName)

    if (district) {
      onChange({ district: districtName, postalCode: district.postalCode })
    } else {
      onChange({ district: "", postalCode: "" })
    }
  }

  const cleanValue = (value || "").trim()

  return (
    <div>
      <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-2">
        เขต/อำเภอ *
      </label>
      <select
        id="district"
        value={cleanValue}
        onChange={handleDistrictChange}
        required={isRequired}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        {/* 5. แสดง "เลือกเขต" ต่อเมื่อค่าเป็นว่าง */}
        {cleanValue === "" && (
          <option value=""> กรุณาเลือกเขต </option>
        )}
        
        {districtsData.map((district) => (
          <option key={district.name} value={district.name}>
            {district.name}
          </option>
        ))}
      </select>
    </div>
  )
}