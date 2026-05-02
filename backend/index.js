const express = require('express');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

/**
 * Phục hồi ảnh bằng Hugging Face Spaces (Sử dụng Gradio Client với Dynamic Import)
 * Cách này hỗ trợ Queue (hàng đợi) nên sẽ không bị lỗi "máy chủ bận" như gọi trực tiếp.
 */
app.post('/api/process', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    console.log("--- Bắt đầu xử lý ảnh (Gradio Client + Queue Support) ---");
    
    // Import động thư viện @gradio/client (vì nó là chuẩn ESM)
    const { Client } = await import('@gradio/client');
    
    // Chuyển buffer sang Blob
    const imageBlob = new Blob([req.file.buffer], { type: req.file.mimetype });

    // Kết nối tới Space GFPGAN (Hỗ trợ xử lý hàng đợi)
    const client = await Client.connect("tencentarc/GFPGAN");
    
    console.log("Đã kết nối tới Space. Đang xếp hàng xử lý...");

    // Gọi hàm predict
    const result = await client.predict("/predict", [
      imageBlob, // image
      "v1.4",    // version
      2          // scale
    ]);

    console.log("Xử lý hoàn tất!");

    const restoredUrl = result.data[0].url;
    const base64Original = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    res.json({ 
      original: base64Original,
      restored: restoredUrl,
      task: 'restore',
      provider: 'huggingface_gradio_client'
    });

  } catch (error) {
    console.error("Lỗi AI Gradio Client:", error.message);
    res.status(500).json({ 
      error: "Hệ thống AI đang quá tải hoặc gặp sự cố. Vui lòng thử lại sau giây lát.",
      details: error.message 
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', provider: 'huggingface_gradio_client' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port} (Queue Mode)`);
});
