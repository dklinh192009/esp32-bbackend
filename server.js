const express = require('express');
const cors = require('cors');
const app = express();

// --- CẤU HÌNH MIDDLEWARE ---
app.use(cors()); // Cho phép tất cả các nguồn (Web/ESP32) truy cập API không bị lỗi bảo mật
app.use(express.json()); // Cho phép server đọc được dữ liệu JSON gửi lên
app.use(express.urlencoded({ extended: true })); // Hỗ trợ đọc dữ liệu dạng form-urlencoded nếu cần

// --- BIẾN TOÀN CỤC LƯU TRẠNG THÁI ÂM THANH ---
// Biến này đóng vai trò "cầu nối" - Web gõ gì sẽ lưu vào đây, ESP32 sẽ lên đây để lấy về
let currentAudioState = {
    status: "success",
    text: "Xin chào",
    audioUrl: "https://translate.google.com/translate_tts?ie=UTF-8&tl=vi&client=tw-ob&q=Xin%20chào"
};

// --- 1. ENDPOINT GIAO DIỆN WEB (Khi bạn truy cập thẳng vào link Render) ---
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Chị Google điều khiển ESP32</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; text-align: center; margin-top: 50px; background-color: #f4f6f9; color: #333; }
                .container { max-width: 50px0px; margin: auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
                h2 { color: #007bff; margin-bottom: 20px; }
                input[type="text"] { width: 80%; padding: 12px; font-size: 16px; border: 2px solid #ddd; border-radius: 8px; outline: none; transition: 0.3s; }
                input[type="text"]:focus { border-color: #007bff; }
                button { padding: 12px 24px; font-size: 16px; background-color: #007bff; color: white; border: none; border-radius: 8px; cursor: pointer; margin-top: 15px; font-weight: bold; transition: 0.2s; }
                button:hover { background-color: #0056b3; }
                .status-box { margin-top: 25px; padding: 10px; background: #e8f4fd; border-radius: 6px; color: #0056b3; font-weight: 500; min-height: 20px; }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>🎙️ NHẬP CHỮ ĐỂ PHÁT LOA ESP32 🎙️</h2>
                <input type="text" id="textInput" placeholder="Nhập câu muốn loa phát tại đây...">
                <br>
                <button onclick="sendText()">Gửi câu thoại</button>
                <div id="statusMessage" class="status-box">Hệ thống sẵn sàng...</div>
            </div>

            <script>
                async function sendText() {
                    const textValue = document.getElementById('textInput').value.trim();
                    if (!textValue) {
                        alert('Bạn ơi, vui lòng nhập nội dung chữ đã nhé!');
                        return;
                    }
                    
                    const statusDiv = document.getElementById('statusMessage');
                    statusDiv.innerText = '⏳ Đang gửi lên Server Render...';
                    
                    try {
                        const response = await fetch('/api/send-text', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ text: textValue })
                        });
                        const result = await response.json();
                        if (result.status === 'success') {
                            statusDiv.innerText = '✅ Đã gửi thành công! ESP32 sẽ phát loa sau vài giây.';
                            document.getElementById('textInput').value = ''; // Xóa chữ cũ sau khi gửi xong
                        } else {
                            statusDiv.innerText = '❌ Lỗi: ' + result.message;
                        }
                    } catch (err) {
                        statusDiv.innerText = '❌ Không thể kết nối tới Server Backend!';
                    }
                }
            </script>
        </body>
        </html>
    `);
});

// --- 2. API TIẾP NHẬN DỮ LIỆU TỪ WEB (POST /api/send-text) ---
app.post('/api/send-text', (req, res) => {
    const { text } = req.body;
    if (!text) {
        return res.status(400).json({ status: "error", message: "Không tìm thấy nội dung chữ hợp lệ." });
    }

    // Tiến hành mã hóa các ký tự tiếng Việt (ví dụ: "xin chào" -> "xin%20chào") để làm mượt link Google
    const encodedText = encodeURIComponent(text);
    const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=vi&client=tw-ob&q=${encodedText}`;

    // Ghi đè trạng thái mới nhất vào biến toàn cục
    currentAudioState = {
        status: "success",
        text: text,
        audioUrl: googleTtsUrl
    };

    console.log(`[Chị Google] Đã cập nhật câu thoại mới: "${text}"`);
    res.json({ status: "success", message: "Đã cập nhật lên server thành công!", data: currentAudioState });
});

// --- 3. API ĐỂ ESP32 GỌI XUỐNG LẤY LINK ÂM THANH (GET /api/status) ---
app.get('/api/status', (req, res) => {
    // Trả về trực tiếp Object chứa audioUrl động thay vì chuỗi text kiểm tra cố định như trước
    res.json(currentAudioState); 
});

// --- KHỞI CHẠY SERVER Chuẩn CẤU HÌNH RENDER ---
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server chị Google đang chạy mượt mà tại port ${PORT}`);
});
