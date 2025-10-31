export default function SearchTechnicians({
  technicians,
  searchFilters,
  setSearchFilters,
  handleSearch,
  searchLoading,
  handleViewTechnician,
  handleBookNow,
  serviceTypes,
  bangkokDistricts,
}) {
  return (
    <div className="space-y-6">
      {/* Search Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">ค้นหาช่างแอร์</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ประเภทบริการ</label>
            <select
              value={searchFilters.service}
              onChange={(e) => setSearchFilters({ ...searchFilters, service: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">ทั้งหมด</option>
              {serviceTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">พื้นที่</label>
            <select
              value={searchFilters.area}
              onChange={(e) => setSearchFilters({ ...searchFilters, area: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">ทั้งหมด</option>
              {bangkokDistricts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">คะแนนขั้นต่ำ</label>
            <select
              value={searchFilters.rating}
              onChange={(e) => setSearchFilters({ ...searchFilters, rating: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">ทั้งหมด</option>
              <option value="4.5">⭐ 4.5+</option>
              <option value="4.0">⭐ 4.0+</option>
              <option value="3.5">⭐ 3.5+</option>
              <option value="3.0">⭐ 3.0+</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleSearch}
          disabled={searchLoading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {searchLoading ? "กำลังค้นหา..." : "🔍 ค้นหา"}
        </button>
      </div>

      {/* Technicians Grid */}
      {searchLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">กำลังโหลดข้อมูลช่าง...</p>
        </div>
      ) : technicians.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500 text-lg">ไม่พบช่างที่ตรงกับเงื่อนไขการค้นหา</p>
          <p className="text-gray-400 text-sm mt-2">ลองปรับเปลี่ยนตัวกรองและค้นหาใหม่อีกครั้ง</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {technicians.map((technician) => (
            <div
              key={technician.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl flex-shrink-0">
                    {technician.profileImage ? (
                      <img
                        src={technician.profileImage || "/placeholder.svg"}
                        alt={technician.displayName}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      "👨‍🔧"
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{technician.displayName}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-yellow-500">⭐</span>
                      <span className="font-medium text-gray-900">{technician.rating?.toFixed(1) || "N/A"}</span>
                      <span className="text-gray-400 text-sm">({technician.reviewCount || 0})</span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{technician.bio || "ช่างมืออาชีพ พร้อมให้บริการ"}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {technician.services?.slice(0, 3).map((service, idx) => (
                    <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                      {service}
                    </span>
                  ))}
                  {technician.services?.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{technician.services.length - 3}
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewTechnician(technician.id)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    ดูโปรไฟล์
                  </button>
                  <button
                    onClick={() => handleBookNow(technician)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    จองเลย
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
