// frontend/src/pages/AuthCallback.jsx
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api'; 
import toast from 'react-hot-toast';

const AuthCallback = () => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const token = query.get('token');
        const role = query.get('role');

        const error = query.get('error');

        if (error) { 
            // กรณีมี Error (เช่น ช่างยังไม่ผ่านอนุมัติ หรือไม่พบผู้ใช้)
            const errorMessage = decodeURIComponent(error); 
            toast.error(`เข้าสู่ระบบไม่สำเร็จ: ${errorMessage}`); 
            
            navigate('/login', { replace: true }); 
            return;
        }
        if (token && role) {
            // 1. บันทึก Token ลงใน Local Storage
            localStorage.setItem('token', token);
            localStorage.setItem('role', role);
            
            // 2. กำหนด Token ให้กับ Axios/API instance
            // (เพื่อให้ Request ถัดไปมีการแนบ Authorization Header)
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            // 3. กำหนด Path Dashboard ตาม Role
            let dashboardPath = '/';
            if (role === 'admin') {
                dashboardPath = '/AdminDashboard';
            } else if (role === 'technician') {
                dashboardPath = '/technician/dashboard';
            } else if (role === 'customer') {
                dashboardPath = '/CustomerDashboard';
            } else {
                dashboardPath = '/';
            }

            // 4. Redirect ไปยัง Dashboard ที่ถูกต้อง
            navigate(dashboardPath, { replace: true });
        } else {
            // ถ้า Token/Role หายไป (ไม่ควรเกิดขึ้น)
            console.error('Google Callback: Missing token or role.');
            navigate('/login', { replace: true });
        }
    }, [location, navigate]);

    return (
        <div className="flex justify-center items-center h-screen">
            <p className="text-xl text-gray-700">กำลังเข้าสู่ระบบ...</p>
        </div>
    );
};

export default AuthCallback;