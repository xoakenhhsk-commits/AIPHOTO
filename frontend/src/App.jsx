import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Upload, Image as ImageIcon, Download, RefreshCcw, Wand2, ArrowLeftRight, Palette, Maximize, History, Trash2, CheckCircle2, LogIn, LogOut, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, googleProvider } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const TRANSLATIONS = {
  vi: {
    appTitle: "AI Photo Restore",
    historyBtn: "Lịch sử",
    logoutBtn: "Đăng xuất",
    premiumBadge: "Premium AI Engine",
    loginTitle: "Đăng Nhập Để Sử Dụng",
    loginDesc: "Vui lòng đăng nhập bằng tài khoản Google để trải nghiệm tính năng phục hồi ảnh AI.",
    loginBtn: "Đăng nhập với Google",
    historyTitle: "Lịch sử phục hồi",
    clearAll: "Xóa hết",
    emptyHistory: "Chưa có lịch sử xử lý ảnh nào.",
    heroTitle1: "Hồi Sinh Ký Ức",
    heroTitle2: "Với Sức Mạnh AI",
    heroDesc: "Làm nét và khôi phục ảnh mờ, cũ của bạn chỉ trong vài giây.",
    uploadTitle: "Tải ảnh lên ngay",
    uploadDesc: "Hỗ trợ JPG, PNG, WebP (Tối đa 10MB)",
    resetBtn: "Làm lại",
    processBtn: "Bắt đầu xử lý",
    downloadBtn: "Tải về",
    originalLabel: "Ảnh gốc",
    processedLabel: "Đã xử lý",
    previewLabel: "Xem trước",
    loadingText: "Đang sử dụng AI để xử lý...",
    sliderHint: "Kéo thanh trượt để thấy sự khác biệt",
    footerCopyright: "© 2026 AI Photo Restoration Lab. Created by Chau Va Dut & Advanced AI Models.",
    privacy: "Chính sách bảo mật",
    terms: "Điều khoản sử dụng",
    taskBasic: "Cơ bản",
    taskBasicDesc: "Làm nét ảnh thông thường",
    taskRouter: "AI Router",
    taskRouterDesc: "Phân tích & Phục hồi phức tạp"
  },
  en: {
    appTitle: "AI Photo Restore",
    historyBtn: "History",
    logoutBtn: "Logout",
    premiumBadge: "Premium AI Engine",
    loginTitle: "Login to Continue",
    loginDesc: "Please login with your Google account to experience AI photo restoration.",
    loginBtn: "Login with Google",
    historyTitle: "Restoration History",
    clearAll: "Clear All",
    emptyHistory: "No photo processing history yet.",
    heroTitle1: "Revive Memories",
    heroTitle2: "With AI Power",
    heroDesc: "Sharpen and restore your blurry, old photos in seconds.",
    uploadTitle: "Upload Photo Now",
    uploadDesc: "Supports JPG, PNG, WebP (Max 10MB)",
    resetBtn: "Start Over",
    processBtn: "Process Now",
    downloadBtn: "Download",
    originalLabel: "Original",
    processedLabel: "Processed",
    previewLabel: "Preview",
    loadingText: "Using AI to process...",
    sliderHint: "Drag the slider to see the difference",
    footerCopyright: "© 2026 AI Photo Restoration Lab. Created by Chau Va Dut & Advanced AI Models.",
    privacy: "Privacy Policy",
    terms: "Terms of Use",
    taskBasic: "Basic",
    taskBasicDesc: "Standard image sharpening",
    taskRouter: "AI Router",
    taskRouterDesc: "Complex analysis & restore"
  },
  km: {
    appTitle: "ស្តាររូបថត AI",
    historyBtn: "ប្រវត្តិ",
    logoutBtn: "ចាកចេញ",
    premiumBadge: "ម៉ាស៊ីន AI ពិសេស",
    loginTitle: "ចូលដើម្បីបន្ត",
    loginDesc: "សូមចូលដោយប្រើគណនី Google របស់អ្នកដើម្បីប្រើប្រាស់កម្មវិធី។",
    loginBtn: "ចូលជាមួយ Google",
    historyTitle: "ប្រវត្តិនៃការស្តារឡើងវិញ",
    clearAll: "លុបទាំងអស់",
    emptyHistory: "មិនទាន់មានប្រវត្តិដំណើរការរូបថតទេ។",
    heroTitle1: "ស្តារការចងចាំ",
    heroTitle2: "ជាមួយនឹងថាមពល AI",
    heroDesc: "ធ្វើឱ្យរូបថតចាស់ៗរបស់អ្នកច្បាស់និងស្រស់ស្អាតក្នុងរយៈពេលប៉ុន្មានវិនាទី។",
    uploadTitle: "ផ្ទុករូបថតឡើងឥឡូវនេះ",
    uploadDesc: "គាំទ្រ JPG, PNG, WebP (អតិបរមា 10MB)",
    resetBtn: "ចាប់ផ្តើមម្តងទៀត",
    processBtn: "ចាប់ផ្តើមដំណើរការ",
    downloadBtn: "ទាញយក",
    originalLabel: "ដើម",
    processedLabel: "បានដំណើរការ",
    previewLabel: "មើលជាមុន",
    loadingText: "កំពុងប្រើប្រាស់ AI...",
    sliderHint: "អូសផ្ទាំងរំកិលដើម្បីឃើញភាពខុសគ្នា",
    footerCopyright: "© 2026 AI Photo Restoration Lab. បង្កើតដោយ Chau Va Dut & Advanced AI Models.",
    privacy: "គោលការណ៍ឯកជនភាព",
    terms: "លក្ខខណ្ឌប្រើប្រាស់",
    taskBasic: "មូលដ្ឋាន",
    taskBasicDesc: "ធ្វើអោយរូបភាពច្បាស់ធម្មតា",
    taskRouter: "AI រ៉ោតទ័រ",
    taskRouterDesc: "វិភាគ & ស្តាររូបភាពស្មុគស្មាញ"
  }
};

function App() {
  const [lang, setLang] = useState('vi');
  const t = TRANSLATIONS[lang];

  const TASKS = [
    { id: 'restore', name: t.taskBasic, icon: <Wand2 size={20} />, description: t.taskBasicDesc },
    { id: 'router', name: t.taskRouter, icon: <Wand2 size={20} color="#f43f5e" />, description: t.taskRouterDesc }
  ];

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedTask, setSelectedTask] = useState('restore');
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [user, setUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const containerRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error(error);
      alert('Lỗi đăng nhập: ' + error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      reset();
      setShowHistory(false);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (user) {
      const savedHistory = localStorage.getItem(`photo_history_${user.uid}`);
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      } else {
        setHistory([]);
      }
    } else {
      setHistory([]);
    }
  }, [user]);

  const saveToHistory = (item) => {
    if (!user) return;
    const newHistory = [item, ...history].slice(0, 10);
    setHistory(newHistory);
    localStorage.setItem(`photo_history_${user.uid}`, JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    if (!user) return;
    setHistory([]);
    localStorage.removeItem(`photo_history_${user.uid}`);
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('task', selectedTask);

    try {
      const response = await axios.post(`${API_URL}/process`, formData);
      const restoredUrl = response.data.restored;
      setResult(restoredUrl);
      
      saveToHistory({
        id: Date.now(),
        task: selectedTask,
        original: preview,
        restored: restoredUrl,
        date: new Date().toLocaleString()
      });
    } catch (error) {
      console.error('Error processing image:', error);
      const errorMessage = error.response?.data?.error || 'Processing failed.';
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleMove = (e) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const position = (x / rect.width) * 100;
    setSliderPos(Math.min(Math.max(position, 0), 100));
  };

  const handleDownload = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(result);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `restored_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
      // Fallback
      window.open(result, '_blank');
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setSliderPos(50);
  };

  const loadFromHistory = (item) => {
    setPreview(item.original);
    setResult(item.restored);
    setSelectedTask(item.task);
    setShowHistory(false);
  };

  return (
    <div className="container">
      <header className="header">
        <div className="logo" onClick={() => window.location.reload()} style={{ cursor: 'pointer' }}>
          <img src="/logo.png" alt="Logo" style={{ height: '36px', borderRadius: '8px' }} />
          <span>{t.appTitle}</span>
        </div>
        <div className="header-actions">
          <div className="language-selector glass">
            <Globe size={16} />
            <select value={lang} onChange={(e) => setLang(e.target.value)}>
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
              <option value="km">ភាសាខ្មែរ</option>
            </select>
          </div>
          {user && (
            <>
              <button 
                className={`glass nav-btn ${showHistory ? 'active' : ''}`} 
                onClick={() => setShowHistory(!showHistory)}
              >
                <History size={18} /> {t.historyBtn}
              </button>
              <button onClick={handleLogout} className="glass nav-btn">
                <LogOut size={18} /> {t.logoutBtn}
              </button>
            </>
          )}
          <div className="glass premium-badge">
            {t.premiumBadge}
          </div>
        </div>
      </header>

      <main>
        {authChecking ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}>
            <div className="spinner"></div>
          </div>
        ) : !user ? (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="hero"
          >
            <h1 className="gradient-text">{t.loginTitle}</h1>
            <p>{t.loginDesc}</p>
            <button onClick={handleLogin} className="btn-primary" style={{ margin: '2rem auto' }}>
              <LogIn size={20} /> {t.loginBtn}
            </button>
          </motion.section>
        ) : (
        <AnimatePresence mode="wait">
          {showHistory ? (
            <motion.section 
              key="history"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="history-section"
            >
              <div className="section-header">
                <h2>{t.historyTitle}</h2>
                <button onClick={clearHistory} className="btn-icon text-red">
                  <Trash2 size={18} /> {t.clearAll}
                </button>
              </div>
              
              {history.length === 0 ? (
                <div className="empty-state glass">
                  <History size={48} opacity={0.2} />
                  <p>{t.emptyHistory}</p>
                </div>
              ) : (
                <div className="history-grid">
                  {history.map(item => (
                    <motion.div 
                      key={item.id} 
                      className="history-card glass"
                      whileHover={{ scale: 1.02 }}
                      onClick={() => loadFromHistory(item)}
                    >
                      <img src={item.restored} alt="History" />
                      <div className="history-info">
                        <span className="task-tag">{TASKS.find(t_task => t_task.id === item.task)?.name}</span>
                        <span className="date">{item.date}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.section>
          ) : !preview ? (
            <motion.section 
              key="hero"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="hero"
            >
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="gradient-text effect-glow"
              >
                {t.heroTitle1} <br /> {t.heroTitle2}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="hero-subtitle"
              >
                {t.heroDesc}
              </motion.p>

              <div className="task-selector">
                {TASKS.map(task => (
                  <div 
                    key={task.id}
                    className={`task-option glass ${selectedTask === task.id ? 'active' : ''}`}
                    onClick={() => setSelectedTask(task.id)}
                  >
                    <div className="task-icon">{task.icon}</div>
                    <div className="task-content">
                      <h3>{task.name}</h3>
                      <p>{task.description}</p>
                    </div>
                    {selectedTask === task.id && <CheckCircle2 className="check-icon" size={16} />}
                  </div>
                ))}
              </div>

              <div className="upload-section">
                <motion.div 
                  className="upload-card glass"
                  whileHover={{ scale: 1.02, borderColor: '#6366f1' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => document.getElementById('fileInput').click()}
                >
                  <input 
                    type="file" 
                    id="fileInput" 
                    hidden 
                    accept="image/*" 
                    onChange={handleFileChange} 
                  />
                  <Upload className="upload-icon" />
                  <h2>{t.uploadTitle}</h2>
                  <p>{t.uploadDesc}</p>
                </motion.div>
              </div>
            </motion.section>
          ) : (
            <motion.section 
              key="comparison"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="comparison-container"
            >
              <div className="action-bar">
                <button onClick={reset} className="glass btn-back">
                  <RefreshCcw size={16} /> {t.resetBtn}
                </button>
                
                <div className="task-tabs glass">
                  {TASKS.map(task => (
                    <button 
                      key={task.id}
                      className={selectedTask === task.id ? 'active' : ''}
                      onClick={() => setSelectedTask(task.id)}
                      disabled={loading || result}
                    >
                      {task.name}
                    </button>
                  ))}
                </div>

                {!result && !loading && (
                  <button onClick={handleUpload} className="btn-primary">
                    <Wand2 size={20} /> {t.processBtn}
                  </button>
                )}
                
                {result && (
                  <button onClick={handleDownload} className="btn-primary">
                    <Download size={20} /> {t.downloadBtn}
                  </button>
                )}
              </div>

              <div 
                className="comparison-wrapper glass" 
                ref={containerRef}
                onMouseMove={handleMove}
                onMouseDown={() => setIsDragging(true)}
                onMouseUp={() => setIsDragging(false)}
                onMouseLeave={() => setIsDragging(false)}
                onTouchMove={handleMove}
                onTouchStart={() => setIsDragging(true)}
                onTouchEnd={() => setIsDragging(false)}
              >
                {/* After Image */}
                <img 
                  src={result || preview} 
                  alt="Result" 
                  className="comparison-image" 
                  draggable="false"
                />

                {/* Before Image */}
                <div 
                  className="comparison-overlay"
                  style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
                >
                  <img 
                    src={preview} 
                    alt="Original" 
                    className="comparison-image" 
                    draggable="false"
                  />
                  <span className="label label-before">{t.originalLabel}</span>
                </div>

                <span className="label label-after">{result ? t.processedLabel : t.previewLabel}</span>

                <div 
                  className="comparison-slider"
                  style={{ left: `${sliderPos}%` }}
                >
                  <div className="slider-handle">
                    <ArrowLeftRight size={20} />
                  </div>
                </div>

                {loading && (
                  <div className="loading-overlay glass">
                    <div className="spinner"></div>
                    <p>{t.loadingText}</p>
                    <div className="progress-bar">
                      <motion.div 
                        className="progress-fill"
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 15, ease: "linear" }}
                      />
                    </div>
                  </div>
                )}
              </div>
              
              {result && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="hint-text"
                >
                  {t.sliderHint}
                </motion.div>
              )}
            </motion.section>
          )}
        </AnimatePresence>
        )}
      </main>

      <footer className="footer">
        <p>{t.footerCopyright}</p>
        <div className="footer-links">
          <span>{t.privacy}</span>
          <span>{t.terms}</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
