const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { Blob } = require('buffer'); // Đảm bảo Blob hoạt động trên mọi bản Node.js
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

/**
 * Phục hồi ảnh bằng Hugging Face (CodeFormer - Bản ổn định nhất)
 * Sử dụng hàng đợi để tránh lỗi 503 khi server bận.
 */
app.post('/api/process', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    console.log("--- Bắt đầu xử lý (CodeFormer + Stable Queue) ---");
    
    const { Client } = await import('@gradio/client');
    
    // Tạo Blob từ ảnh
    const imageBlob = new Blob([req.file.buffer], { type: req.file.mimetype });

    // Kết nối tới Space CodeFormer (Thường ổn định hơn GFPGAN)
    const client = await Client.connect("sczhou/CodeFormer");
    
    console.log("Đã vào hàng đợi. Đang xử lý...");

    // Gọi API của CodeFormer
    const result = await client.predict("/predict", [
      imageBlob, // image
      0.5,       // fidelity (0.5 là mức cân bằng nhất)
      true,      // face restoration
      true       // upsampling
    ]);

    console.log("Xử lý thành công!");

    // Trích xuất URL ảnh
    const restoredUrl = result.data[0].url;
    const base64Original = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    res.json({ 
      original: base64Original,
      restored: restoredUrl,
      task: 'restore',
      provider: 'huggingface_stable'
    });

  } catch (error) {
    console.error("Lỗi AI chi tiết:", error);
    
    // Phản hồi lỗi thân thiện hơn
    res.status(500).json({ 
      error: "Máy chủ AI đang quá tải. Đây là dịch vụ miễn phí nên đôi khi bạn cần bấm lại 1-2 lần để được ưu tiên xử lý.",
      details: error.message 
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mode: 'stable_queue' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port} (Stable Mode)`);
});
