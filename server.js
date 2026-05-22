const express = require('express');
const app = express();

// Cấu hình đọc dữ liệu từ Form và JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let latestText = "Chưa có câu thoại";
let latestAudioUrl = "";

// 1. Giao diện Web chính để bạn gõ câu thoại
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Điều Khiển Loa ESP32</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; text-align: center; margin-top: 50px; background-color: #f0f2f5; }
                .container { max-width: 500px; margin: auto; padding: 30px; background: white; border-radius: 12px; box-shadow: 0px 4px 15px rgba(0,0,0,0.1); }
                input[type="text"] { width: 85%; padding: 12px; margin-bottom: 20px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px; outline: none; }
                input[type="text"]:focus { border-color: #007bff; }
                button { padding: 12px 25px; background-color: #007bff; color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; font-weight: bold; }
                button:hover { background-color: #0056b3; }
                p { color: #333; font-size: 18px; margin-top: 20px; }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>🎙️ Loa Thông Minh ESP32</h2>
                <form action="/speak" method="POST">
                    <input type="text" name="text" placeholder="Nhập câu thoại muốn loa phát..." required>
                    <br>
                    <button type="submit">Gửi câu thoại</button>
                </form>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p>Trạng thái hiện tại: <br><span style="color: #28a745; font-weight: bold;">"${latestText}"</span></p>
            </div>
        </body>
        </html>
    `);
});

// 2. Xử lý dữ liệu khi bấm nút Gửi câu thoại từ Web
app.post('/speak', (req, res) => {
    const text = req.body.text;
    if (text) {
        latestText = text;
        // Sử dụng giao thức http chuẩn giúp giảm tải giải mã SSL cho mạch ESP32
        latestAudioUrl = `http://translate.google.com/translate_tts?ie=UTF-8&tl=vi&client=tw-ob&q=${encodeURIComponent(text)}`;
        console.log(`[Chị Google] Đã cập nhật câu thoại mới: "${text}"`);
    }
    res.redirect('/');
});

// 3. API để mạch ESP32 gọi và lấy link âm thanh về giải mã
app.get('/api/status', (req, res) => {
    res.json({
        status: "success",
        text: latestText,
        audioUrl: latestAudioUrl
    });
});

// 4. SỬA LỖI PORT: Ép lắng nghe IP ẩn '0.0.0.0' phối hợp với Render để không bị sập Server
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server chị Google đang chạy mượt mà tại port ${PORT}`);
});
