import { useState, useEffect } from "react"
import api from "../../services/api"

export default function ManageTechnicians() {
  const [pendingTechnicians, setPendingTechnicians] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTechnician, setSelectedTechnician] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [technicianToReject, setTechnicianToReject] = useState(null)

  useEffect(() => {
    fetchPendingTechnicians()
  }, [])

  const fetchPendingTechnicians = async () => {
    try {
      setLoading(true)
      const response = await api.get("/admin/technicians/pending")
      setPendingTechnicians(response.data)
      // console.log("Pending technicians:", response.data)
    } catch (error) {
      console.error("Error fetching pending technicians:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (technicianId) => {
    if (!window.confirm("คุณต้องการอนุมัติช่างท่านนี้ใช่หรือไม่?")) return

    try {
      setActionLoading(true)
      await api.put(`/admin/technicians/${technicianId}`, { status: "approved" })
      alert("อนุมัติช่างสำเร็จ")
      fetchPendingTechnicians()
      setSelectedTechnician(null)
    } catch (error) {
      console.error("Error approving technician:", error)
      alert("เกิดข้อผิดพลาดในการอนุมัติ")
    } finally {
      setActionLoading(false)
    }
  }

  const openRejectModal = (technician) => {
    setTechnicianToReject(technician)
    setRejectReason("")
    setShowRejectModal(true)
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert("กรุณาระบุเหตุผลในการปฏิเสธ")
      return
    }

    try {
      setActionLoading(true)
      await api.put(`/admin/technicians/${technicianToReject.id}`, {
        status: "rejected",
        rejectReason: rejectReason,
      })
      alert("ปฏิเสธช่างสำเร็จ")
      fetchPendingTechnicians()
      setSelectedTechnician(null)
      setShowRejectModal(false)
      setTechnicianToReject(null)
      setRejectReason("")
    } catch (error) {
      console.error("Error rejecting technician:", error)
      alert("เกิดข้อผิดพลาดในการปฏิเสธ")
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Stats */}
      <div className="mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-blue-900 font-medium">มีช่างรออนุมัติทั้งหมด {pendingTechnicians.length} คน</span>
          </div>
        </div>
      </div>

      {/* Technicians List */}
      {pendingTechnicians.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่มีช่างรออนุมัติ</h3>
          <p className="text-gray-600">ขณะนี้ไม่มีช่างที่รอการอนุมัติในระบบ</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {pendingTechnicians.map((technician) => (
            <div key={technician.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Technician Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">{technician.name}</h3>
                        <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                              />
                            </svg>
                            {technician.email}
                          </span>
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                              />
                            </svg>
                            {technician.phone}
                          </span>
                        </div>
                      </div>
                      <span className="px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                        รออนุมัติ
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">เลขบัตรประชาชน</p>
                        <p className="text-sm text-gray-900">{technician.idCard}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">งานบริการ</p>
                        <p className="text-sm text-gray-900">{technician.service?.map((area, index) => (
                          <span key={index} className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded">
                            {area}
                          </span>
                        ))}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">พื้นที่ให้บริการ</p>
                      <div className="flex flex-wrap gap-2">
                        {technician.serviceArea?.map((area, index) => (
                          <span key={index} className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded">
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>

                    {technician.bio && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">ข้อมูลเพิ่มเติม</p>
                        <p className="text-sm text-gray-600">{technician.bio}</p>
                      </div>
                    )}
                  </div>

                  {/* ID Card Image */}
                  <div className="lg:w-80">
                    <p className="text-sm font-medium text-gray-700 mb-2">รูปถ่ายคู่บัตรประชาชน</p>
                    <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden border">
                      {technician.selfieWithIdCard ? (
                        <img
                          src={technician.selfieWithIdCard || "/placeholder.svg"}
                          alt="Selfie with ID Card"
                          className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => setSelectedTechnician(technician)}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-center">คลิกเพื่อดูขนาดใหญ่</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6 pt-6 border-t">
                  <button
                    onClick={() => handleApprove(technician.id)}
                    disabled={actionLoading}
                    className="flex-1 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    อนุมัติ
                  </button>
                  <button
                    onClick={() => openRejectModal(technician)}
                    disabled={actionLoading}
                    className="flex-1 px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    ปฏิเสธ
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Modal */}
      {selectedTechnician && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedTechnician(null)}
        >
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setSelectedTechnician(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={selectedTechnician.selfieWithIdCard || "/placeholder.svg"}
              alt="Selfie with ID Card"
              className="w-full h-auto rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="mt-4 text-white text-center">
              <p className="font-medium">{selectedTechnician.name}</p>
              <p className="text-sm text-gray-300">เลขบัตรประชาชน: {selectedTechnician.idCard}</p>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">ปฏิเสธช่าง</h3>
            <p className="text-sm text-gray-600 mb-4">
              คุณกำลังจะปฏิเสธ <span className="font-medium">{technicianToReject?.name}</span>
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">เหตุผลในการปฏิเสธ *</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="กรุณาระบุเหตุผล..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false)
                  setTechnicianToReject(null)
                  setRejectReason("")
                }}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading || !rejectReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading ? "กำลังดำเนินการ..." : "ยืนยันปฏิเสธ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
