const express = require('express');
const cors = require('cors');
const multer = require('multer');
const dotenv = require('dotenv');
const { Client } = require('@gradio/client');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Setup Multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

/**
 * Phục hồi ảnh bằng Hugging Face Spaces (Hoàn toàn miễn phí)
 * Sử dụng mô hình GFPGAN nổi tiếng để làm nét khuôn mặt
 */
app.post('/api/process', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    console.log("--- Bắt đầu xử lý ảnh miễn phí qua Hugging Face ---");
    
    // Chuyển buffer ảnh thành Blob để gửi cho Gradio
    const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
    
    // Kết nối tới Hugging Face Space (Sử dụng tencentarc/GFPGAN)
    // Đây là server cộng đồng chạy GFPGAN miễn phí
    const client = await Client.connect("tencentarc/GFPGAN");
    
    console.log("Đã kết nối tới HF Space. Đang gửi ảnh...");

    // Gọi hàm predict của Space
    // Đối với tencentarc/GFPGAN, tham số thường là: image, version, scale
    const result = await client.predict("/predict", [
      blob, 	// Hình ảnh
      "v1.4", 	// Version
      2, 		// Scale (phóng to 2x)
    ]);

    console.log("Xử lý hoàn tất!");

    // Kết quả trả về của Gradio thường là mảng các file
    // result.data[0] là URL của ảnh đã được phục hồi
    const restoredUrl = result.data[0].url;

    // Ảnh gốc để trả về frontend so sánh
    const base64Original = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    res.json({ 
      original: base64Original,
      restored: restoredUrl,
      task: 'restore',
      provider: 'huggingface'
    });

  } catch (error) {
    console.error("Lỗi xử lý Hugging Face:", error);
    res.status(500).json({ 
      error: "Hệ thống AI miễn phí đang bận hoặc gặp lỗi. Vui lòng thử lại sau vài giây.",
      details: error.message 
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', provider: 'huggingface' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
