"use client"

export default function TechnicianModal({ technician, onClose, onBook }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-gray-900">โปรไฟล์ช่าง</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
              ×
            </button>
          </div>

          <div className="flex items-start gap-6 mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-4xl flex-shrink-0">
              {technician.profileImage ? (
                <img
                  src={technician.profileImage || "/placeholder.svg"}
                  alt={technician.userId?.fullName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                "👨‍🔧"
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900">{technician.userId?.fullName || "ช่าง"}</h3>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-yellow-500 text-xl">⭐</span>
                <span className="font-semibold text-gray-900">{technician.rating?.toFixed(1) || "N/A"}</span>
                <span className="text-gray-400">({technician.totalReviews || 0} รีวิว)</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">เกี่ยวกับช่าง</h4>
              <p className="text-gray-600">{technician.bio || "ช่างมืออาชีพ พร้อมให้บริการ"}</p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">พื้นที่ให้บริการ</h4>
              <div className="flex flex-wrap gap-2">
                {technician.serviceArea?.map((area, idx) => (
                  <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full">
                    {area}
                  </span>
                ))}
              </div>
            </div>

            {technician.reviews && technician.reviews.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">รีวิวจากลูกค้า</h4>
                <div className="space-y-3">
                  {technician.reviews.slice(0, 3).map((review, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-yellow-500">⭐</span>
                        <span className="font-medium">{review.rating}</span>
                        <span className="text-gray-400 text-sm">• {review.customerId?.fullName || "ลูกค้า"}</span>
                      </div>
                      <p className="text-gray-600 text-sm">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={onBook}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            จองช่างคนนี้
          </button>
        </div>
      </div>
    </div>
  )
}
