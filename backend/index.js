import express from 'express';
import cors from 'cors';
import multer from 'multer';
import 'dotenv/config';
import { Client } from '@gradio/client';

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

/**
 * Phục hồi ảnh bằng Hugging Face Spaces (Sử dụng ESM để hỗ trợ thư viện mới nhất)
 */
app.post('/api/process', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    console.log("--- Bắt đầu xử lý ảnh (ESM + Hugging Face) ---");
    
    // Tạo Blob từ buffer ảnh
    const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
    
    // Sử dụng Space CodeFormer (Thường ổn định và chất lượng cao hơn GFPGAN)
    const client = await Client.connect("sczhou/CodeFormer");
    
    console.log("Kết nối Space thành công. Đang xử lý...");

    // Gọi API của CodeFormer
    // Tham số: [image, fidelity, has_face_restoration, has_upsampling]
    const result = await client.predict("/predict", [
      blob, 	// image
      0.5, 		// fidelity (0-1)
      true, 	// face_restoration
      true, 	// upsampling
    ]);

    console.log("Xử lý hoàn tất!");

    // Trích xuất URL ảnh kết quả
    const restoredUrl = result.data[0].url;

    const base64Original = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    res.json({ 
      original: base64Original,
      restored: restoredUrl,
      task: 'restore',
      provider: 'huggingface'
    });

  } catch (error) {
    console.error("Lỗi AI Hugging Face:", error);
    res.status(500).json({ 
      error: "Máy chủ AI đang bận hoặc quá tải. Vui lòng thử lại sau 10 giây.",
      details: error.message 
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', provider: 'huggingface', mode: 'esm' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port} (ESM Mode)`);
});
