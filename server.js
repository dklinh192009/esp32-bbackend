const express = require('express');
const app = express();
// Render sẽ tự cấp cổng (PORT) ngẫu nhiên, nếu chạy local thì mặc định là 3000
const PORT = process.env.PORT || 3000;

// Cấu hình để server đọc được dữ liệu JSON gửi lên
app.use(express.json());

// 1. TRANG WEB CHÍNH: Đây chính là trang web mà lát nữa ESP32 kết nối xong sẽ dẫn bạn tới
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Hệ Thống IoT Cloud</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 50px; margin: 0; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; }
                .card { background: white; color: #333; padding: 30px; border-radius: 15px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); max-width: 400px; width: 90%; }
                h1 { color: #4a5568; margin-top: 0; }
                p { color: #718096; font-size: 16px; line-height: 1.5; }
                .status { display: inline-block; padding: 8px 16px; background-color: #48bb78; color: white; border-radius: 20px; font-weight: bold; font-size: 14px; margin-top: 15px; }
            </style>
        </head>
        <body>
            <div class="card">
                <h1>Kết Nối Thành Công! 🎉</h1>
                <p>Chào mừng bạn! ESP32 của bạn đã kết nối WiFi và dẫn bạn tới trang chủ chạy trên server đám mây Render thành công.</p>
                <div class="status">Hệ thống: Sẵn sàng</div>
            </div>
        </body>
        </html>
    `);
});

// 2. API TEST: Đường dẫn này để sau này ESP32 của bạn gọi ngầm lấy dữ liệu nếu cần
app.get('/api/status', (req, res) => {
    res.json({ 
        status: "success", 
        message: "Xin chào! Kết nối giữa ESP32 và Render hoạt động hoàn hảo." 
    });
});

// Khởi chạy server
app.listen(PORT, () => {
    console.log(`Server đang chạy mượt mà tại port ${PORT}`);
});