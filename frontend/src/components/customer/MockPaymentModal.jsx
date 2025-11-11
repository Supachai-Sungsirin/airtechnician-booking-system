import { useState, useEffect } from "react";
import api from "../../services/api";
import nextLogos from "../../assets/next.jpg";
import scbLogos from "../../assets/scb.jpg";
import bualuangLogos from "../../assets/bualuang.jpg";
import kmaLogos from "../../assets/KMA.jpg";
import kplusLogos from "../../assets/kplus.jpg";

const paymentOptions = [
  { id: 'next', name: 'NEXT', img: nextLogos },
  { id: 'scb', name: 'SCB EASY', img: scbLogos },
  { id: 'bualuang', name: 'BualuangM', img: bualuangLogos },
  { id: 'kma', name: 'KMA', img: kmaLogos },
  { id: 'kplus', name: 'K PLUS', img: kplusLogos },
];


export default function MockPaymentModal({ booking, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    setLoading(false);
    setError(null);
    setSelectedOption(null);
  }, [booking]);



  const handleMockPayment = async () => {
    if (!selectedOption) { // ป้องกันการกดยืนยันโดยไม่เลือก
      setError("กรุณาเลือกช่องทางการชำระเงิน");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // 1. เรียก API ที่เราเพิ่งสร้างใน Backend
      await api.patch(`/booking/${booking._id}/mock-pay`);
      
      // 2. แจ้ง Parent (CustomerDashboard) ว่าสำเร็จ
      onSuccess(); 
    } catch (err) {
      console.error("Mock payment failed:", err);
      const errorMsg = err.response?.data?.message || "การชำระเงินล้มเหลว";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">ชำระเงินค่าบริการ</h2>
              <p className="text-gray-600 mt-1">ช่าง: {booking.technicianId?.userId?.fullName || "ช่าง"}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl" disabled={loading}>
              ×
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700">ยอดรวมที่ต้องชำระ:</p>
              <p className="text-3xl font-bold text-blue-900">
                ฿ {booking.finalPrice?.toLocaleString() || 0}
              </p>
            </div>

            {/* ⭐️ 4. ส่วนของตัวเลือกการชำระเงิน */}
            <div className="space-y-2 pt-2">
              <p className="text-sm font-medium text-gray-700 mb-2">เลือกช่องทางการชำระเงิน</p>
              {paymentOptions.map((option) => (
                <label
                  key={option.id}
                  htmlFor={option.id}
                  className="flex items-center justify-between w-full p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <img src={option.img} alt={`${option.name} logo`} className="w-8 h-8 object-contain" />
                    <span className="font-medium text-gray-800">{option.name}</span>
                  </div>
                  <input
                    type="radio"
                    id={option.id}
                    name="paymentMethod"
                    value={option.id}
                    checked={selectedOption === option.id}
                    onChange={() => setSelectedOption(option.id)}
                    className="form-radio h-5 w-5 text-blue-600 focus:ring-blue-500"
                  />
                </label>
              ))}
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                ⚠️ {error}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleMockPayment}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "กำลังดำเนินการ..." : "ยืนยันการชำระเงิน"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}