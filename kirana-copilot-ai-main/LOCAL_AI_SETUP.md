# 🚀 LOCAL AI BACKEND - QUICK START

## ✨ NEW: 100% FREE - No API Keys Needed!

Your app now uses **local AI models** that run on your computer. No billing, no API keys, completely free forever!

---

## 🎯 Two Simple Steps

### Step 1: Start Python Backend (First Terminal)

```powershell
# Go to backend folder
cd backend

# Install dependencies (first time only - takes 5-10 min)
pip install -r requirements.txt

# Start server
python app.py
```

**Wait for:** `✅ Models loaded successfully!`

### Step 2: Start React Frontend (Second Terminal)

```powershell
# Go to project folder
cd D:\newklh\kirana-copilot-ai-main

# Start development server
npm run dev
```

**Open:** http://localhost:8081

---

## 📋 Prerequisites

- **Python 3.8+** - Download: https://www.python.org/downloads/
- **Node.js** - Already installed ✅

---

## ❓ Troubleshooting

### "Python is not recognized"
Install Python from https://www.python.org/downloads/ (check "Add to PATH")

### "pip is not recognized"
```powershell
python -m ensurepip --upgrade
```

### "Backend not running" error in browser
Make sure Step 1 is running in a separate terminal

---

## 🎓 What's Different?

**Before:** Used cloud APIs (Groq, Gemini) - needed API keys  
**Now:** Uses local models (EasyOCR) - no API keys

**Advantages:**
- ✅ 100% FREE forever
- ✅ No API keys to manage
- ✅ Your data stays on your computer (privacy)
- ✅ No internet needed (after initial download)
- ✅ No rate limits

**Trade-offs:**
- First-time setup takes 10 minutes
- Downloads ~1.4GB of AI models
- Slightly slower than cloud APIs (3-5 sec vs 1-2 sec)

---

## 🔄 Want to Switch Back to Cloud APIs?

Edit `.env` file:

```env
# Use local backend (current - no API keys)
VITE_AI_PROVIDER=local

# Or use Groq cloud API (need API key)
VITE_AI_PROVIDER=groq
```

---

## 📖 Full Documentation

See `backend/README.md` for detailed setup instructions

---

## 🎉 Ready!

**Terminal 1:** `cd backend && python app.py`  
**Terminal 2:** `npm run dev`  
**Browser:** http://localhost:8081

Upload invoices and watch the local AI extract GST data! 🚀
