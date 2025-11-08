import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const TechMyReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // สร้างฟังก์ชันเพื่อดึงรีวิว
        const fetchReviews = async () => {
            setIsLoading(true);
            try {
                // 1. นี่คือ API 'getMyReviews' ที่เราสร้างไว้ใน Backend
                const response = await api.get('/technicians/reviews');
                setReviews(response.data);
            } catch (err) {
                if (err.response?.status !== 401) {
                    setError(err.response?.data?.message || "เกิดข้อผิดพลาด");
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchReviews(); // เรียกใช้งาน
    }, []); // [] = ทำงานครั้งเดียว

    if (isLoading) return <p>กำลังโหลดรีวิว...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="reviews-container">
            <h2 className="text-2xl font-bold mb-4">รีวิวและคะแนนของคุณ</h2>
            
            {reviews.length === 0 ? (
                <p>คุณยังไม่มีรีวิว</p>
            ) : (
                <div className="space-y-4">
                    {/* 2. Loop รีวิวทั้งหมดที่ได้มา */}
                    {reviews.map(review => (
                        <div key={review._id} className="bg-white shadow rounded-lg p-4 border">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-semibold text-lg">
                                    {/* (แสดงดาว ⭐️) */}
                                    {'⭐️'.repeat(review.rating)}
                                </span>
                                <span className="text-sm text-gray-500">
                                    โดย: {review.customerId.fullName}
                                </span>
                            </div>
                            <p className="text-gray-700">{review.comment}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TechMyReviews;