# 🐍 Local Python Backend Setup - 100% FREE!

## 🎉 No API Keys Needed - Everything Runs Locally!

This setup uses:
- **EasyOCR** - Open-source OCR (Text extraction)
- **Hugging Face Transformers** - AI models for document understanding
- **Flask** - Python web server
- **100% FREE** - No billing, no API keys, no internet (after initial setup)

---

## 📋 Prerequisites

1. **Python 3.8+** installed
   - Check: `python --version` or `python3 --version`
   - Download: https://www.python.org/downloads/

2. **pip** (Python package manager)
   - Usually comes with Python

---

## 🚀 Quick Start (5 minutes)

### Step 1: Open Terminal in Backend Folder

```powershell
cd backend
```

### Step 2: Create Virtual Environment (Recommended)

```powershell
# Create virtual environment
python -m venv venv

# Activate it
.\venv\Scripts\activate

# You should see (venv) in your terminal prompt
```

### Step 3: Install Dependencies

```powershell
pip install -r requirements.txt
```

**Note:** First-time installation takes 5-10 minutes (downloads AI models ~500MB)

### Step 4: Start the Backend Server

```powershell
python app.py
```

You should see:
```
🚀 Invoice OCR Backend Server
✅ Using LOCAL AI models (no API keys needed!)
✅ Models loaded successfully!
 * Running on http://0.0.0.0:5000
```

### Step 5: Start Your React Frontend (New Terminal)

Open a **NEW terminal** (keep backend running):

```powershell
cd D:\newklh\kirana-copilot-ai-main
npm run dev
```

Open browser: **http://localhost:8081**

---

## 📦 What Gets Installed?

| Package | Size | Purpose |
|---------|------|---------|
| **EasyOCR** | ~500MB | Text extraction from images |
| **Transformers** | ~100MB | AI model infrastructure |
| **PyTorch** | ~700MB | Neural network framework |
| **Flask** | ~5MB | Web server |
| **OpenCV** | ~50MB | Image processing |

**Total:** ~1.4GB (one-time download)

---

## 🎯 How It Works

1. **Frontend** (React) → Sends invoice images as base64
2. **Backend** (Flask) → Receives images at `http://localhost:5000/analyze`
3. **EasyOCR** → Extracts text from images (supports English + Hindi)
4. **Smart Parser** → Uses regex patterns to find:
   - Vendor name
   - GSTIN number
   - Invoice number
   - Date
   - Amounts (taxable, CGST, SGST, IGST, total)
5. **Backend** → Returns structured JSON
6. **Frontend** → Displays results

---

## 🔍 Test Backend Separately

### Test 1: Health Check

```powershell
curl http://localhost:5000/health
```

Should return:
```json
{
  "status": "ok",
  "message": "Invoice OCR Backend Running",
  "model": "EasyOCR + Transformers"
}
```

### Test 2: Analyze Test Image (Python script)

Create `test_backend.py`:

```python
import requests
import base64

# Read test image
with open('test_invoice.jpg', 'rb') as f:
    img_base64 = base64.b64encode(f.read()).decode()

# Send to backend
response = requests.post('http://localhost:5000/analyze', json={
    'images': [f'data:image/jpeg;base64,{img_base64}']
})

print(response.json())
```

---

## 🛠️ Troubleshooting

### ❌ "Python not found"

**Fix:**
1. Install Python from https://www.python.org/downloads/
2. During installation, check "Add Python to PATH"
3. Restart terminal

### ❌ "pip not found"

**Fix:**
```powershell
python -m ensurepip --upgrade
```

### ❌ "No module named 'flask'"

**Fix:**
```powershell
# Make sure you're in backend folder
cd backend

# Install requirements again
pip install -r requirements.txt
```

### ❌ "Connection refused" or "Backend not running"

**Fix:**
1. Make sure Python backend is running:
   ```powershell
   cd backend
   python app.py
   ```
2. Check if you see "Running on http://0.0.0.0:5000"
3. Keep this terminal open

### ❌ "Slow OCR / Taking too long"

**Explanation:** First run downloads models (~500MB). Subsequent runs are fast.

**Speed up:**
- Use smaller images (resize to 800x600 before upload)
- Process fewer invoices at once
- Use GPU if available (requires CUDA setup)

### ❌ "Low accuracy / Wrong data extracted"

**Tips for better accuracy:**
- Take clear, well-lit photos
- Keep invoice straight (not tilted)
- Ensure text is readable
- Higher resolution images = better results
- Remove shadows and glare

---

## 🔧 Advanced Configuration

### Use GPU for Faster Processing

If you have NVIDIA GPU:

```powershell
# Uninstall CPU version
pip uninstall torch

# Install GPU version
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
```

Edit `invoice_analyzer.py`:
```python
# Change this line:
self.reader = easyocr.Reader(['en', 'hi'], gpu=False)

# To:
self.reader = easyocr.Reader(['en', 'hi'], gpu=True)
```

### Add More Language Support

Edit `invoice_analyzer.py`:
```python
# Current:
self.reader = easyocr.Reader(['en', 'hi'], gpu=False)

# Add more languages (e.g., Tamil, Telugu):
self.reader = easyocr.Reader(['en', 'hi', 'ta', 'te'], gpu=False)
```

Available languages: https://www.jaided.ai/easyocr/

---

## 🎓 Model Details

### EasyOCR

- **Type:** Optical Character Recognition
- **Languages:** English + Hindi (default)
- **Accuracy:** ~90-95% on clear images
- **Speed:** ~2-5 seconds per invoice (CPU)
- **GPU:** 5-10x faster with GPU
- **License:** Apache 2.0 (100% free)

### Why EasyOCR?

✅ Easy to use (3 lines of code)  
✅ Supports 80+ languages  
✅ Good accuracy for Indian invoices  
✅ No API keys needed  
✅ Works offline  
✅ Free forever

### Alternative Models (Future Enhancement)

You can replace EasyOCR with:

1. **Tesseract OCR** - Faster but less accurate
2. **PaddleOCR** - Better for Chinese/Asian text
3. **TrOCR (Hugging Face)** - Transformer-based OCR
4. **Donut** - Document understanding without OCR

---

## 📊 Comparison: Local vs Cloud APIs

| Feature | Local Backend | Cloud APIs (Groq/Gemini) |
|---------|--------------|--------------------------|
| **Cost** | 100% FREE | FREE (with limits) |
| **API Keys** | ❌ None needed | ✅ Required |
| **Internet** | ❌ Not needed* | ✅ Required |
| **Speed** | ~3-5 sec/invoice | ~1-2 sec/invoice |
| **Accuracy** | ~85-90% | ~90-95% |
| **Privacy** | ✅ Data stays local | ⚠️ Sent to cloud |
| **Setup** | ~10 min + 1.4GB | ~2 min |
| **Customization** | ✅ Full control | ❌ Limited |

*Internet needed only for first-time model download

---

## 🎯 Best Use Cases

### Use Local Backend When:

✅ Privacy is critical (sensitive invoice data)  
✅ Processing large volumes (no rate limits)  
✅ Need offline capability  
✅ Want to customize extraction logic  
✅ Have decent computer (4GB+ RAM)

### Use Cloud APIs When:

✅ Need quick setup (no Python installation)  
✅ Processing occasional invoices  
✅ Want best accuracy immediately  
✅ Don't mind data going to cloud

---

## 🔄 Switching Between Modes

In `.env` file:

```env
# Use local backend (Python)
VITE_AI_PROVIDER=local

# Or use cloud APIs (no Python needed)
VITE_AI_PROVIDER=groq    # FREE cloud API
VITE_AI_PROVIDER=gemini  # FREE cloud API
```

---

## 📝 Next Steps

1. ✅ Backend running on port 5000
2. ✅ Frontend running on port 8081
3. 📸 Upload test invoice
4. 🎉 See extracted data!

---

## 🤝 Need Help?

**Common issues:**
- Backend not starting → Check Python installation
- Low accuracy → Use better quality images
- Slow processing → Use GPU or cloud APIs

**Improve accuracy:**
1. Use clear, high-resolution images
2. Good lighting (no shadows)
3. Invoice flat (not crumpled)
4. All text readable

---

## 🎓 Learn More

- **EasyOCR:** https://github.com/JaidedAI/EasyOCR
- **Flask:** https://flask.palletsprojects.com/
- **Hugging Face:** https://huggingface.co/models
- **PyTorch:** https://pytorch.org/

---

## 🚀 Ready?

**Terminal 1 (Backend):**
```powershell
cd backend
python app.py
```

**Terminal 2 (Frontend):**
```powershell
npm run dev
```

**Browser:**
http://localhost:8081

**🎉 You're all set! Start uploading invoices!**
