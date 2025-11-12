import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// สำหรับใช้ __dirname ใน ES module environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const swaggerOptions = {
  // 1. ข้อมูลพื้นฐานของ API
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CoolQ Air Technician Booking System API',
      version: '1.0.0',
      description: 'เอกสารสำหรับ API ระบบจองช่างแอร์ CoolQ',
      contact: {
        name: 'CoolQ Support',
        email: 'coolq@gmail.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000', // 
        description: 'Development server (Local)',
      },
      // สามารถเพิ่ม Production server ที่นี่
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          BearerFormat: 'JWT',
          description: 'ใส่ JWT Access Token ในรูปแบบ: Bearer <token>',
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },

  // 2. ระบุตำแหน่งของไฟล์ route ที่จะสแกนหา Swagger comments
  apis: [
    join(__dirname, '../routes/*.js'),
    join(__dirname, '../routes/adminRoutes.js'),
    join(__dirname, '../routes/authRoutes.js'),
    join(__dirname, '../routes/bookingRoutes.js'),
    join(__dirname, '../routes/technicianRoutes.js'),
    join(__dirname, '../routes/reviewRoutes.js'),
    join(__dirname, '../routes/searchRoutes.js'),
    join(__dirname, '../routes/serviceRoutes.js'),
  ],
};

export default swaggerOptions;
