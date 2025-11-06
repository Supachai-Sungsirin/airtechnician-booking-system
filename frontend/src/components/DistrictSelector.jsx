import { useState } from "react"

// 1. ข้อมูลเขตและรหัสไปรษณีย์ (จากที่คุณให้มา)
// (วางไว้นอก Component เพื่อไม่ให้ถูกสร้างใหม่ทุกครั้งที่ re-render)
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

export default function DistrictSelector({ initialDistrict = "", onDataChange }) {
  // 2. State สำหรับเก็บเขตและรหัสไปรษณีย์ที่ถูกเลือก
  const [selectedDistrict, setSelectedDistrict] = useState(initialDistrict)
  const [postalCode, setPostalCode] = useState(
    districtsData.find((d) => d.name === initialDistrict)?.postalCode || ""
  )

  // 3. ฟังก์ชันที่ทำงานเมื่อมีการเปลี่ยน Dropdown
  const handleDistrictChange = (e) => {
    const districtName = e.target.value
    setSelectedDistrict(districtName)

    if (districtName) {
      // ค้นหาเขตที่ตรงกัน
      const district = districtsData.find((d) => d.name === districtName)
      if (district) {
        // อัปเดต state รหัสไปรษณีย์
        setPostalCode(district.postalCode)
        // ส่งข้อมูลกลับไปให้ Component แม่ (ถ้ามี)
        onDataChange({ district: districtName, postalCode: district.postalCode })
      }
    } else {
      // ถ้าเลือก "กรุณาเลือกเขต" ให้เคลียร์ค่า
      setPostalCode("")
      onDataChange({ district: "", postalCode: "" })
    }
  }

  // 4. JSX ที่จะ render
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Dropdown สำหรับเลือกเขต */}
      <div>
        <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-2">
          เขต/อำเภอ *
        </label>
        <select
          id="district"
          value={selectedDistrict}
          onChange={handleDistrictChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {/* จะแสดง "กรุณาเลือกเขต" ต่อเมื่อไม่มีเขตเริ่มต้นเท่านั้น */}
          {initialDistrict === "" && (
            <option value=""> กรุณาเลือกเขต </option>
          )}
          {/* ^^^ สิ้นสุดส่วนที่แก้ไข ^^^ */}

          {districtsData.map((district) => (
            <option key={district.name} value={district.name}>
              {district.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}