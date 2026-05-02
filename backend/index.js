const express = require('express');
const cors = require('cors');
const multer = require('multer');
const Replicate = require('replicate');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Setup Replicate
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// Setup Multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const MODELS = {
  restore: "tencentarc/gfpgan:0fbacf7afc6c144e5be9767cff80f25aff23e52b0708f17e20f9879b2f21516c",
  router: "tencentarc/gfpgan:0fbacf7afc6c144e5be9767cff80f25aff23e52b0708f17e20f9879b2f21516c" // AI Router Pipeline Fallback
};

app.post('/api/process', upload.single('image'), async (req, res) => {
  const { task = 'restore' } = req.body || {};
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    if (!MODELS[task]) {
      return res.status(400).json({ error: 'Invalid task' });
    }

    // Convert image buffer to base64 data URI
    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    if (!process.env.REPLICATE_API_TOKEN || process.env.REPLICATE_API_TOKEN.includes('your_')) {
      console.log(`Mock mode: ${task}. No API token found. Simulating processing...`);
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      return res.json({ 
        original: base64Image,
        restored: base64Image, 
        task: task,
        mock: true
      });
    }

    console.log(`Starting ${task} process...`);

    let input = {};
    if (task === 'restore') {
      input = { img: base64Image, version: "v1.4", scale: 2 };
    } else if (task === 'router') {
      console.log("AI Router: Phân tích độ phức tạp của ảnh qua OpenRouter...");
      let isComplex = true;
      
      if (process.env.OPENROUTER_API_KEY) {
        try {
          const axios = require('axios');
          const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
            model: "google/gemini-flash-1.5",
            messages: [{
              role: "user",
              content: [
                { type: "text", text: "Phân tích ảnh này. Chỉ trả lời 1 từ duy nhất: 'complex' nếu ảnh mờ nặng, nhiễu, rách, cực kỳ cũ. Trả lời 'basic' nếu ảnh chỉ hơi mờ hoặc ảnh chân dung rõ nét." },
                { type: "image_url", image_url: { url: base64Image } }
              ]
            }]
          }, {
            headers: { 
              "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
              "Content-Type": "application/json"
            }
          });
          
          const analysis = response.data.choices[0].message.content.toLowerCase();
          console.log("OpenRouter kết quả:", analysis);
          if (analysis.includes('basic')) isComplex = false;
        } catch (e) {
          console.log("OpenRouter gọi thất bại (sẽ dùng mặc định complex):", e.response?.data?.error?.message || e.message);
        }
      } else {
        console.log("Chưa cấu hình OPENROUTER_API_KEY trong .env, sử dụng mặc định complex.");
      }

      if (isComplex) {
        console.log("AI Router: Ảnh phức tạp. Định tuyến qua Pipeline Phục hồi Đa tầng (Scale: 4)...");
        input = { img: base64Image, version: "v1.4", scale: 4 };
      } else {
        console.log("AI Router: Ảnh cơ bản. Định tuyến qua Pipeline Nhanh (Scale: 2)...");
        input = { img: base64Image, version: "v1.4", scale: 2 };
      }
    }

    // Run the model on Replicate
    const output = await replicate.run(MODELS[task], { input });

    console.log(`${task} complete:`, output);

    res.json({ 
      original: base64Image,
      restored: output,
      task: task
    });
  } catch (error) {
    console.error(`${task} error:`, error);
    
    let errorMessage = error.message;
    if (error.message && error.message.includes('402')) {
      errorMessage = "Tài khoản Replicate đã hết lượt sử dụng/tín dụng (Lỗi 402 Payment Required). Vui lòng nạp thêm tiền hoặc đổi API Token mới.";
    } else if (error.message && error.message.includes('422')) {
      errorMessage = "Model AI hiện không khả dụng hoặc phiên bản đã bị xoá (Lỗi 422). Vui lòng kiểm tra lại cấu hình.";
    }
    
    res.status(500).json({ error: errorMessage });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', models: Object.keys(MODELS) });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
