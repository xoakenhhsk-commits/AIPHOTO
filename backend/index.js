const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

/**
 * Phục hồi ảnh bằng cách gọi trực tiếp API của Hugging Face Space (CodeFormer)
 * Cách này không cần thư viện bên ngoài, cực kỳ ổn định và tương thích mọi bản Node.js
 */
app.post('/api/process', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    console.log("--- Bắt đầu xử lý ảnh (Direct API + CodeFormer) ---");
    
    // Chuyển ảnh sang Base64 để gửi API
    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    // Gọi trực tiếp vào endpoint của Hugging Face Space
    // Đây là cách ổn định nhất, không phụ thuộc vào thư viện gradio-client
    const response = await axios.post('https://sczhou-codeformer.hf.space/run/predict', {
      data: [
        base64Image, // Hình ảnh gốc
        0.5,         // Fidelity (Độ trung thực: 0 - 1)
        true,        // Phục hồi khuôn mặt (Face Restoration)
        true         // Phóng to (Upsampling)
      ]
    }, {
      timeout: 60000 // Chờ tối đa 60 giây vì AI xử lý khá lâu
    });

    if (!response.data || !response.data.data) {
      throw new Error("Không nhận được phản hồi từ AI Server.");
    }

    console.log("AI xử lý thành công!");

    // Link ảnh đã xử lý từ Hugging Face
    // Thêm prefix tên miền nếu cần, nhưng thường HF trả về URL đầy đủ hoặc tương đối
    let restoredUrl = response.data.data[0];
    
    // Nếu HF trả về đường dẫn tương đối, ta nối thêm tên miền Space
    if (restoredUrl && !restoredUrl.startsWith('http')) {
      restoredUrl = `https://sczhou-codeformer.hf.space/file=${restoredUrl}`;
    }

    res.json({ 
      original: base64Image,
      restored: restoredUrl,
      task: 'restore',
      provider: 'huggingface_direct'
    });

  } catch (error) {
    console.error("Lỗi AI Direct API:", error.message);
    
    let userMessage = "Máy chủ AI đang bận hoặc quá tải. Vui lòng đợi 10 giây rồi thử lại.";
    if (error.code === 'ECONNABORTED') {
      userMessage = "AI xử lý quá lâu (Timeout). Vui lòng thử lại với ảnh dung lượng nhỏ hơn.";
    }

    res.status(500).json({ 
      error: userMessage,
      details: error.message 
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', provider: 'huggingface_direct' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port} (Direct Mode)`);
});
