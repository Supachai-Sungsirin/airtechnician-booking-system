// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import api from '../../services/api';

// const Login = () => {
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [error, setError] = useState(null);
//     const [isLoading, setIsLoading] = useState(false);
//     const navigate = useNavigate();

//     const handleLogin = async (e) => {
//         e.preventDefault();
//         setError(null);
//         setIsLoading(true);

//         try {
//             // 1. ยิง API Login (Backend ต้องคืน { token, user: { role, ... } })
//             const response = await api.post('/auth/login', {
//                 email,
//                 password,
//             });

//             // 2. ดึง Token และ ข้อมูลผู้ใช้ (ที่มี role)
//             const { token, user } = response.data;

//             // 3. (สำคัญมาก) เก็บข้อมูลลง localStorage
//             // เราเก็บ 3 อย่างนี้ ตามที่ Dashboard ของคุณเรียกใช้
//             localStorage.setItem('token', token);
//             localStorage.setItem('role', user.role); 
//             localStorage.setItem('user', JSON.stringify(user)); 

//             // 4. (นี่คือ Logic สลับ 3 Role)
//             // ตรวจสอบ role แล้วส่งไปหน้า Dashboard ที่ถูกต้อง
//             if (user.role === 'admin') {
//                 navigate('/AdminDashboard');
//             } else if (user.role === 'customer') {
//                 navigate('/CustomerDashboard');
//             } else if (user.role === 'technician') {
//                 navigate('/technician/dashboard'); // (ใช้ Path นี้ตามที่เราคุยกัน)
//             } else {
//                 // ถ้ามี Role แปลกๆ ให้ไปหน้าหลัก
//                 navigate('/');
//             }

//         } catch (err) {
//             const errorMessage = err.response?.data?.message || "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
//             setError(errorMessage);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     return (
//         <div className="flex items-center justify-center min-h-screen bg-gray-100">
//             <div className="p-8 bg-white rounded-lg shadow-lg w-full max-w-md">
//                 <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">
//                     CoolQ ❄️
//                 </h2>
                
//                 <form onSubmit={handleLogin}>
//                     <div className="mb-4">
//                         <label className="block text-sm font-medium text-gray-700">
//                             Email
//                         </label>
//                         <input
//                             type="email"
//                             value={email}
//                             onChange={(e) => setEmail(e.target.value)}
//                             required
//                             className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                         />
//                     </div>
                    
//                     <div className="mb-6">
//                         <label className="block text-sm font-medium text-gray-700">
//                             Password
//                         </label>
//                         <input
//                             type="password"
//                             value={password}
//                             onChange={(e) => setPassword(e.target.value)}
//                             required
//                             className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//                         />
//                     </div>

//                     {error && (
//                         <p className="mb-4 text-sm text-center text-red-600">
//                             {error}
//                         </p>
//                     )}

//                     <div>
//                         <button
//                             type="submit"
//                             disabled={isLoading}
//                             className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
//                         >
//                             {isLoading ? "กำลังล็อกอิน..." : "เข้าสู่ระบบ"}
//                         </button>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     );
// };

// export default Login;