import React from "react"

export default function SearchTechnicians({
  onClose,
  formData,
  estimatedPrice,
  availableTechnicians,
  selectedTechnician,
  setSelectedTechnician,
  setCurrentStep,
  handleConfirmBooking,
  loading,
}) {
  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">เลือกช่างที่ต้องการ</h2>
              <p className="text-gray-600 mt-1">ช่างที่มีเขตและบริการตรงกับความต้องการของคุณ</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
              ×
            </button>
          </div>

          {/* Booking Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">สรุปการจอง</h3>
            <div className="text-sm text-blue-800 space-y-1">
              <p>
                <span className="font-medium">เขต/อำเภอ:</span> {formData.district}
              </p>
              <p>
                <span className="font-medium">วันเวลา:</span>{" "}
                {new Date(formData.requestedDateTime).toLocaleString("th-TH")}
              </p>
              <p>
                <span className="font-medium">ราคาประมาณการ:</span> ฿{estimatedPrice.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Technicians List */}
          <div className="space-y-4 mb-6">
            {availableTechnicians.length > 0 ? (
              <>
                <h3 className="font-semibold text-gray-900">ช่างที่พร้อมให้บริการ ({availableTechnicians.length} คน)</h3>
                {availableTechnicians.map((tech) => (
                  <div
                    key={tech._id}
                    onClick={() => setSelectedTechnician(tech)}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedTechnician?._id === tech._id
                        ? "border-blue-500 bg-blue-50 shadow-md"
                        : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900">{tech.name}</h4>
                          {selectedTechnician?._id === tech._id && (
                            <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">เลือกแล้ว</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>📞 {tech.phone}</p>
                          {tech.email && <p>✉️ {tech.email}</p>}
                          {tech.serviceAreas && tech.serviceAreas.length > 0 && (
                            <p>📍 พื้นที่ให้บริการ: {tech.serviceAreas.join(", ")}</p>
                          )}
                          {tech.specializations && tech.specializations.length > 0 && (
                            <p>🔧 ความเชี่ยวชาญ: {tech.specializations.join(", ")}</p>
                          )}
                          {tech.rating && (
                            <p>
                              ⭐ คะแนน: {tech.rating.toFixed(1)} ({tech.completedJobs || 0} งาน)
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 text-5xl mb-4">🔍</div>
                <h3 className="font-semibold text-gray-900 mb-2">ไม่พบช่างในเขตของคุณ</h3>
                <p className="text-gray-600 text-sm">ระบบจะดำเนินการค้นหาช่างและแจ้งกลับให้คุณทราบในภายหลัง</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              ← ย้อนกลับ
            </button>
            <button
              type="button"
              onClick={handleConfirmBooking}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "กำลังจอง..." : selectedTechnician ? "ยืนยันการจองกับช่างที่เลือก" : "ยืนยันการจอง"}
            </button>
          </div>

          {!selectedTechnician && availableTechnicians.length > 0 && (
            <p className="text-xs text-gray-500 text-center mt-3">*หากไม่เลือกช่าง ระบบจะมอบหมายช่างที่เหมาะสมให้อัตโนมัติ</p>
          )}
        </div>
      </div>
    </div>
  )
}