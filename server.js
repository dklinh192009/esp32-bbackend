const express = require('express');
const app = express();
const PORT = process.env.PORT || 10000;

// Cấu hình để server đọc được dữ liệu từ ô nhập chữ (Form)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Biến lưu trữ nội dung chữ và link âm thanh hiện tại
let currentText = "Xin chào bạn";
let currentAudioUrl = "https://translate.google.com/translate_tts?ie=UTF-8&tl=vi&client=tw-ob&q=Xin%20ch%C3%A0o%20b%E1%BA%A1n";

// 1. Giao diện trang web chính (Hiện ô nhập chữ)
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Chị Google Nói Hộ ESP32</title>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f3f0ff; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                .container { background: white; padding: 30px; border-radius: 16px; box-shadow: 0 8px 24px rgba(111, 66, 193, 0.15); width: 100%; max-width: 400px; text-align: center; }
                h2 { color: #6f42c1; margin-bottom: 5px; }
                p { color: #666; font-size: 14px; margin-bottom: 20px; }
                textarea { width: 100%; height: 100px; padding: 12px; border: 2px solid #e2d9f3; border-radius: 10px; resize: none; box-sizing: border-box; font-size: 16px; outline: none; transition: 0.3s; }
                textarea:focus { border-color: #6f42c1; }
                button { width: 100%; background: #6f42c1; color: white; border: none; padding: 14px; border-radius: 10px; font-size: 16px; cursor: pointer; margin-top: 15px; font-weight: bold; transition: 0.2s; }
                button:hover { background: #5a32a3; }
                .status-box { margin-top: 20px; padding: 12px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #6f42c1; text-align: left; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>Chị Google Nói Hộ 🗣️</h2>
                <p>Nhập văn bản dưới đây để gửi xuống loa ESP32</p>
                
                <form action="/send-text" method="POST">
                    <textarea name="text" placeholder="Nhập câu bạn muốn chị Google đọc..."></textarea>
                    <button type="submit">Gửi văn bản đi 🚀</button>
                </form>

                <div class="status-box">
                    <strong>Nội dung hiện tại trên mạch:</strong> <br>
                    <span style="color: #6f42c1;">"${currentText}"</span>
                </div>
            </div>
        </body>
        </html>
    `);
});

// 2. Endpoint xử lý khi bạn bấm nút "Gửi văn bản đi"
app.post('/send-text', (req, res) => {
    const text = req.body.text;
    if (text && text.trim() !== "") {
        currentText = text.trim();
        // Phép thuật ở đây: Tự động mã hóa chữ thành link MP3 của chị Google dịch
        currentAudioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=vi&client=tw-ob&q=${encodeURIComponent(currentText)}`;
        console.log(`[Chị Google] Đã cập nhật câu thoại mới: "${currentText}"`);
    }
    res.redirect('/'); // Gửi xong thì tự load lại trang chính
});

// 3. API dành riêng cho ESP32 gọi lên lấy dữ liệu
app.get('/api/status', (req, res) => {
    res.json({
        status: "success",
        text: currentText,
        audioUrl: currentAudioUrl // Trả về link MP3 chị Google để ESP32 phát thẳng ra loa
    });
});

app.listen(PORT, () => {
    console.log(`Server chị Google đang chạy mượt mà tại port ${PORT}`);
});
