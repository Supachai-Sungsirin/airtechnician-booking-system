import { useState, useEffect, useCallback } from "react";
import api from "../../services/api";
import { Star, User } from "lucide-react";
import DistrictSelector from "../DistrictSelector";

export default function ManageUsers() {
  const [activeUserTab, setActiveUserTab] = useState("customers");
  const [customers, setCustomers] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [admins, setAdmins] = useState([]);

  // loading: ใช้สำหรับการโหลดข้อมูลครั้งแรก
  const [loading, setLoading] = useState(true);
  // tabLoading: ใช้เมื่อมีการสลับ Tab หลังจากโหลดครั้งแรก
  const [tabLoading, setTabLoading] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [saving, setSaving] = useState(false);

  const [alert, setAlert] = useState({ show: false, message: "", type: "" });

  const [deleteUserId, setDeleteUserId] = useState(null); // เก็บ id ที่จะลบ
  const [showDeleteModal, setShowDeleteModal] = useState(false); // เปิด/ปิด modal

  const showCustomAlert = (message, type) => {
    setAlert({ show: true, message, type });
  };

  const confirmDeleteUser = (userId) => {
    setDeleteUserId(userId);
    setShowDeleteModal(true);
  };

  useEffect(() => {
    if (alert.show) {
      const timer = setTimeout(() => {
        setAlert({ show: false, message: "", type: "" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [alert.show]);

  const fetchCustomers = useCallback(async () => {
    try {
      const response = await api.get("/admin/customers");
      setCustomers(response.data.data || []);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  }, []);

  const fetchTechnicians = useCallback(async () => {
    try {
      const response = await api.get("/admin/technicians");
      setTechnicians(response.data.data || []);
    } catch (error) {
      console.error("Error fetching technicians:", error);
    }
  }, []);

  const fetchAdmins = useCallback(async () => {
    try {
      const response = await api.get("/admin/admins");
      setAdmins(response.data.data || []);
    } catch (error) {
      console.error("Error fetching admins:", error);
    }
  }, []);

  useEffect(() => {
    const initialLoad = async () => {
      setLoading(true);
      await Promise.all([fetchCustomers(), fetchTechnicians(), fetchAdmins()]);
      setLoading(false);
    };
    initialLoad();
  }, [fetchCustomers, fetchTechnicians, fetchAdmins]);

  useEffect(() => {
    if (loading) return;

    const fetchUsersOnTabChange = async () => {
      setTabLoading(true);
      try {
        if (activeUserTab === "customers") {
          await fetchCustomers();
        } else if (activeUserTab === "technicians") {
          await fetchTechnicians();
        } else if (activeUserTab === "admins") {
          await fetchAdmins();
        }
      } catch (error) {
        console.error("Error fetching users on tab change:", error);
      } finally {
        setTabLoading(false);
      }
    };

    fetchUsersOnTabChange();
  }, [activeUserTab, loading, fetchCustomers, fetchTechnicians, fetchAdmins]);

  const handleViewDetail = async (userId) => {
    try {
      const response = await api.get(`/admin/user/${userId}`);
      setSelectedUser(response.data.data);
      setEditFormData({
        fullName: response.data.data.user.fullName || "",
        phone: response.data.data.user.phone || "",
        address: response.data.data.user.address || "",
        district: response.data.data.user.district || "",
        province: response.data.data.user.province || "",
        postalCode: response.data.data.user.postalCode || "",
        serviceArea: response.data.data.technician?.serviceArea || [],
        services: response.data.data.technician?.services || [],
        bio: response.data.data.technician?.bio || "",
      });
      setShowEditModal(true);
    } catch (error) {
      console.error("Error fetching user detail:", error);
      showCustomAlert("เกิดข้อผิดพลาดในการดึงข้อมูล", "error");
    }
  };

  const handleSaveUser = async () => {
    try {
      setSaving(true);
      await api.patch(`/admin/user/${selectedUser.user._id}`, {
        fullName: editFormData.fullName,
        phone: editFormData.phone,
        address: editFormData.address,
        district: editFormData.district,
        province: editFormData.province,
        postalCode: editFormData.postalCode,
      });

      if (selectedUser.technician) {
        await api.patch(`/admin/technician/${selectedUser.technician._id}`, {
          serviceArea: editFormData.serviceArea,
          services: editFormData.services,
          bio: editFormData.bio,
        });
      }

      showCustomAlert("บันทึกข้อมูลสำเร็จ", "success");
      setShowEditModal(false);
      if (activeUserTab === "customers") await fetchCustomers();
      else if (activeUserTab === "technicians") await fetchTechnicians();
      else if (activeUserTab === "admins") await fetchAdmins();
    } catch (error) {
      console.error("Error saving user:", error);
      showCustomAlert("เกิดข้อผิดพลาดในการบันทึก", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    try {
      await api.delete(`/admin/user/${deleteUserId}`);
      showCustomAlert("ลบผู้ใช้สำเร็จ", "success");

      // โหลดข้อมูลใหม่ตามแท็บปัจจุบัน
      if (activeUserTab === "customers") await fetchCustomers();
      else if (activeUserTab === "technicians") await fetchTechnicians();
      else if (activeUserTab === "admins") await fetchAdmins();

      setShowDeleteModal(false);
      setDeleteUserId(null);
    } catch (error) {
      console.error("Error deleting user:", error);
      showCustomAlert("เกิดข้อผิดพลาดในการลบผู้ใช้", "error");
    }
  };

  const renderUserList = (users, userType) => {
    if (loading || tabLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (users.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <svg
            className="w-16 h-16 text-gray-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            ไม่มีข้อมูล
          </h3>
          <p className="text-gray-600">ยังไม่มี{userType}ในระบบ</p>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ชื่อ-นามสกุล
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  อีเมล
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  เบอร์โทร
                </th>
                {userType === "ช่าง" && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    สถานะ
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  วันที่สมัคร
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => {
                const userData = userType === "ช่าง" ? user.userId : user;
                const technicianData = userType === "ช่าง" ? user : null;

                return (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {userData?.fullName || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {userData?.email || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {userData?.phone || "-"}
                      </div>
                    </td>
                    {userType === "ช่าง" && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            technicianData?.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : technicianData?.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {technicianData?.status === "approved"
                            ? "อนุมัติแล้ว"
                            : technicianData?.status === "pending"
                            ? "รออนุมัติ"
                            : "ปฏิเสธ"}
                        </span>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {userData?.createdAt
                          ? new Date(userData.createdAt).toLocaleDateString(
                              "th-TH"
                            )
                          : "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewDetail(userData?._id)}
                        className="text-blue-600 hover:text-blue-900 font-medium mr-4"
                      >
                        ดูรายละเอียด
                      </button>
                      <button
                        onClick={() => confirmDeleteUser(userData._id)}
                        className="text-red-600 hover:text-red-900 font-medium"
                      >
                        ลบ
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveUserTab("customers")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeUserTab === "customers"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
              }`}
            >
              ลูกค้า ({loading ? "..." : customers.length}){" "}
            </button>
            <button
              onClick={() => setActiveUserTab("technicians")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeUserTab === "technicians"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
              }`}
            >
              ช่าง ({loading ? "..." : technicians.length})
            </button>
            <button
              onClick={() => setActiveUserTab("admins")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeUserTab === "admins"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
              }`}
            >
              แอดมิน ({loading ? "..." : admins.length})
            </button>
          </nav>
        </div>
      </div>

      {activeUserTab === "customers" && renderUserList(customers, "ลูกค้า")}
      {activeUserTab === "technicians" && renderUserList(technicians, "ช่าง")}
      {activeUserTab === "admins" && renderUserList(admins, "แอดมิน")}

      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-2xl w-full my-8">
            <div className="p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-900">
                แก้ไขข้อมูลผู้ใช้
              </h3>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {/* Basic Info */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-4">
                  ข้อมูลพื้นฐาน
                </h4>

                {/* Profile Section */}
                <div className="flex items-center gap-6 mb-6 pb-4 border-b border-gray-100">
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden shrink-0">
                    {selectedUser.user.profileImageUrl ? (
                      <img
                        src={selectedUser.user.profileImageUrl}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10 text-gray-400" />
                    )}
                  </div>

                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {selectedUser.user.fullName}
                      </p>
                      <p className="text-xs text-gray-600">
                        {selectedUser.user.email}
                      </p>
                    </div>

                    {selectedUser.technician && (
                      <div className="flex flex-col md:items-end">
                        <label className="block text-sm font-medium text-gray-700 md:mr-2">
                          เลขบัตรประชาชน
                        </label>
                        <p className="text-base font-semibold text-gray-900 ">
                          {selectedUser.technician.idCard || "N/A"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Editable Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  {/* ชื่อ-นามสกุล */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      ชื่อ-นามสกุล
                    </label>
                    <input
                      type="text"
                      value={editFormData.fullName}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          fullName: e.target.value,
                        })
                      }
                      placeholder="กรอกชื่อ-นามสกุล"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150"
                    />
                  </div>

                  {/* เบอร์โทร */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      เบอร์โทร
                    </label>
                    <input
                      type="text"
                      value={editFormData.phone}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          phone: e.target.value,
                        })
                      }
                      placeholder="เช่น 0812345678"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150"
                    />
                  </div>

                  {/* ที่อยู่ */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      ที่อยู่
                    </label>
                    <input
                      type="text"
                      value={editFormData.address}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          address: e.target.value,
                        })
                      }
                      placeholder="กรอกที่อยู่ปัจจุบัน"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150"
                    />
                  </div>

                  {/* จังหวัด */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      จังหวัด
                    </label>
                    <input
                      type="text"
                      value={editFormData.province}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          province: e.target.value,
                        })
                      }
                      placeholder="กรอกจังหวัด"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150"
                    />
                  </div>

                  {/* เขต / อำเภอ */}
                  <div>
                    <DistrictSelector
                      value={editFormData.district}
                      onChange={({ district, postalCode }) =>
                        setEditFormData((prev) => ({
                          ...prev,
                          district: district,
                          postalCode: postalCode,
                        }))
                      }
                      province={editFormData.province}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150"
                    />
                  </div>

                  {/* รหัสไปรษณีย์ */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      รหัสไปรษณีย์
                    </label>
                    <input
                      type="text"
                      value={editFormData.postalCode}
                      readOnly
                      className="w-full px-4 py-2.5 border border-gray-200 bg-gray-100 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
              {/* Technician Info */}
              {selectedUser.technician && (
                <div className="mb-6 pt-6 border-t">
                  <h4 className="text-sm font-semibold text-gray-900 mb-4">
                    ข้อมูลช่าง
                  </h4>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-100">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          คะแนนเฉลี่ย
                        </label>
                        <Star />
                        <p className="text-xl font-bold text-yellow-600 flex items-center">
                          <Star className="w-5 h-5 mr-1" />
                          {selectedUser.technician.rating?.toFixed(2) || "0.00"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          จำนวนรีวิว
                        </label>
                        <p className="text-xl font-bold text-gray-900">
                          {selectedUser.technician.totalReviews?.toLocaleString() ||
                            0}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedUser.technician.services &&
                        selectedUser.technician.services.length > 0 && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              งานบริการที่เชี่ยวชาญ
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {selectedUser.technician.services.map(
                                (service, index) => (
                                  <span
                                    key={index}
                                    className="px-3 py-1 text-xs bg-indigo-100 text-indigo-700 rounded-full"
                                  >
                                    {service.name || "N/A"}                     
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          พื้นที่ให้บริการ
                        </label>
                        {/* Note: โค้ดเดิมที่ดึง serviceArea */}               
                        <div className="flex flex-wrap gap-2">
                          {editFormData.serviceArea?.map((area, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-full"
                            >
                              {area}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ข้อมูลเพิ่มเติม
                      </label>
                      <textarea
                        value={editFormData.bio}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            bio: e.target.value,
                          })
                        }
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        สถานะ
                      </label>
                      <span
                        className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                          selectedUser.technician.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : selectedUser.technician.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {selectedUser.technician.status === "approved"
                          ? "อนุมัติแล้ว"
                          : selectedUser.technician.status === "pending"
                          ? "รออนุมัติ"
                          : "ปฏิเสธ"}
                      </span>
                    </div>
                    <div>
                      {selectedUser.technician.status === "rejected" &&
                        (selectedUser.technician.rejectReason ||
                          selectedUser.technician.reason) && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-sm font-medium text-red-800 mb-1">
                              เหตุผลในการปฏิเสธ:
                            </p>
                            <p className="text-sm text-red-700">
                              {selectedUser.technician.reason}
                            </p>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t flex gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                disabled={saving}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSaveUser}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? "กำลังบันทึก..." : "บันทึก"}
              </button>
            </div>
          </div>
        </div>
      )}
      {alert.show && (
        <div
          className={`fixed bottom-5 right-5 z-50 max-w-sm w-full shadow-xl rounded-2xl pointer-events-auto transition-all duration-300 ease-out transform ${
            alert.show
              ? "translate-y-0 opacity-100"
              : "translate-y-10 opacity-0"
          } ${
            alert.type === "success"
              ? "bg-linear-to-r from-green-50 to-green-100 border-l-4 border-green-500"
              : "bg-linear-to-r from-red-50 to-red-100 border-l-4 border-red-500"
          }`}
          role="alert"
        >
          <div className="p-4">
            <div className="flex items-start">
              <div className="shrink-0 mt-0.5">
                {alert.type === "success" && (
                  <svg
                    className="h-6 w-6 text-green-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
                {alert.type === "error" && (
                  <svg
                    className="h-6 w-6 text-red-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
              </div>
              <div className="ml-3 flex-1">
                <p
                  className={`text-sm font-semibold ${
                    alert.type === "success" ? "text-green-800" : "text-red-800"
                  }`}
                >
                  {alert.type === "success" ? "สำเร็จ!" : "เกิดข้อผิดพลาด"}
                </p>
                <p className="mt-1 text-sm text-gray-700">{alert.message}</p>
              </div>
              <button
                onClick={() => setAlert({ show: false, message: "", type: "" })}
                className="ml-3 text-gray-400 hover:text-gray-600 transition-colors text-lg leading-none"
              >
                &times;
              </button>
            </div>
          </div>
        </div>
      )}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6 text-center">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">
              ยืนยันการลบผู้ใช้
            </h2>
            <p className="text-gray-600 mb-6">
              คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้นี้? <br />
              การกระทำนี้ไม่สามารถย้อนกลับได้
            </p>

            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleDeleteUser}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
              >
                ลบผู้ใช้
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
