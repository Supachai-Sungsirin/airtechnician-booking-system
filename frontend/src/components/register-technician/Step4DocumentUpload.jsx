import { useState } from "react";
import api from "../../services/api";

const Step4DocumentUpload = ({ formData, setFormData }) => {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append("file", file);

    try {
      setUploading(true);
      const res = await api.post("/upload/image", formDataUpload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setFormData((prev) => ({
        ...prev,
        selfieWithIdCard: res.data.imageUrl, // ✅ เก็บ URL จาก Cloudinary
        imagePreview: res.data.imageUrl, // preview จาก URL เดียวกัน
      }));
    } catch (err) {
      console.error(err);
      alert("อัปโหลดไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">เอกสารยืนยันตัวตน</h2>
        <p className="text-sm text-gray-600">อัพโหลดรูปถ่ายคู่บัตรประชาชนเพื่อยืนยันตัวตน</p>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-all relative">
        <input type="file" id="selfieWithIdCard" accept="image/*" onChange={handleFileChange} className="hidden" />
        <label htmlFor="selfieWithIdCard" className="cursor-pointer">
          {formData.imagePreview ? (
            <div className="space-y-3">
              <img
                src={formData.imagePreview}
                alt="Preview"
                className="max-h-64 mx-auto rounded-lg border"
              />
              <p className="text-sm font-medium text-gray-900">
                {uploading ? "กำลังอัปโหลด..." : "คลิกเพื่อเปลี่ยนรูปภาพ"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="w-20 h-20 mx-auto bg-blue-50 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-900">
                {uploading ? "กำลังอัปโหลด..." : "คลิกเพื่ออัพโหลดรูปภาพ"}
              </p>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG หรือ JPEG (สูงสุด 5MB)</p>
            </div>
          )}
        </label>
      </div>
    </div>
  );
};

export default Step4DocumentUpload;
