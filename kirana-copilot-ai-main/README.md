# 🛒 Kirana Copilot AI - GST Invoice Analyzer

<div align="center">

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/Python-3.13+-green.svg)
![React](https://img.shields.io/badge/React-18-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)

**AI-powered GST invoice analysis for Indian businesses - 100% FREE & runs locally!**

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [Tech Stack](#-tech-stack) • [Screenshots](#-screenshots)

</div>

---

## 📋 Overview

Kirana Copilot AI is a smart invoice analysis tool designed specifically for Indian Kirana stores and small businesses. It uses **local AI models** (EasyOCR + Python Flask) to extract GST invoice data and generate GSTR-1 reports - completely **FREE** with no API costs!

### Why Kirana Copilot AI?

- ✅ **100% FREE** - No API keys, no billing, no subscriptions
- 🔒 **Privacy First** - All processing happens locally on your machine
- 🇮🇳 **India-Specific** - Built for Indian GST invoices (CGST, SGST, IGST)
- 📊 **GSTR-1 Ready** - Auto-generates GSTR-1 reports with CSV export
- 📱 **Mobile Friendly** - Responsive design for easy photo upload
- 🚀 **Fast** - Local processing without internet dependency

---

## ✨ Features

### Invoice Analysis
- 📸 **Multi-image upload** - Process multiple invoices at once
- 🔍 **OCR Extraction** - Automatically extracts:
  - Vendor/Supplier name
  - GSTIN (GST Identification Number)
  - Invoice number and date
  - Base/Taxable amount
  - CGST, SGST, IGST amounts
  - Total amount to be paid
- 🎯 **Confidence Scoring** - Quality assessment for each extraction
- 🔧 **Smart Calculation** - Auto-calculates missing values

### GSTR-1 Report Generation
- 📊 **Summary Dashboard** - View totals across all invoices
- 📥 **CSV Export** - Download GSTR-1 draft for filing
- 📈 **Analytics** - Track tax breakdowns by month
- ⚠️ **Validation** - Built-in data consistency checks

### User Experience
- 🎨 **Modern UI** - Clean, intuitive interface with shadcn/ui
- 🌓 **Dark Mode Ready** - Easy on the eyes
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- ⚡ **Real-time Processing** - See results instantly

---

## 🚀 Installation

### Prerequisites

- **Node.js** 18+ and npm ([Install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- **Python** 3.13+ ([Download here](https://www.python.org/downloads/))
- **Git** ([Download here](https://git-scm.com/downloads))

### Step 1: Clone the Repository

```bash
git clone <YOUR_GIT_URL>
cd kirana-copilot-ai-main
```

### Step 2: Install Frontend Dependencies

```bash
npm install
```

### Step 3: Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
```

**Note:** First run will download ~1.4GB of AI models (EasyOCR).

### Step 4: Configure Environment

Create a `.env` file in the root directory:

```env
VITE_AI_PROVIDER=local
```

---

## 🎮 Usage

### Starting the Application

**Option 1: Using Batch Scripts (Windows)**

```bash
# Start backend (Terminal 1)
cd backend
start_backend.bat

# Start frontend (Terminal 2)
npm run dev
```

**Option 2: Manual Start**

```bash
# Terminal 1 - Backend
cd backend
python app.py

# Terminal 2 - Frontend
npm run dev
```

### Accessing the App

1. **Frontend**: Open http://localhost:8080 in your browser
2. **Backend API**: Running at http://localhost:5000

### Analyzing Invoices

1. Click **"Upload Invoice"** on the home page
2. Select one or more invoice images (JPG, PNG, PDF)
3. Click **"Analyze Invoices"**
4. View extracted data on the results page
5. Click **"View GST Summary"** to see GSTR-1 report
6. Download CSV for filing

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **shadcn/ui** - Beautiful component library
- **Tailwind CSS** - Utility-first styling
- **React Router** - Navigation
- **Sonner** - Toast notifications

### Backend
- **Python 3.13** - Backend runtime
- **Flask 3.0** - Lightweight web framework
- **EasyOCR 1.7** - Text extraction (English + Hindi)
- **PyTorch** - Deep learning backend
- **OpenCV** - Image preprocessing
- **Pillow** - Image handling

### AI & ML
- **EasyOCR** - Optical Character Recognition
  - English language support
  - Hindi/Devanagari support
  - ~500MB model download
- **Custom NLP** - Regex-based pattern matching for invoice fields

---

## 📁 Project Structure

```
kirana-copilot-ai-main/
├── backend/                    # Python Flask backend
│   ├── app.py                 # Flask server
│   ├── invoice_analyzer.py    # OCR + extraction logic
│   ├── requirements.txt       # Python dependencies
│   ├── start_backend.bat      # Windows startup script
│   └── test_backend.py        # Health check script
├── src/                       # React frontend
│   ├── components/           # Reusable UI components
│   ├── contexts/             # React contexts (Auth, Shop, Month)
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility functions
│   ├── pages/                # Page components
│   │   ├── Home.tsx
│   │   ├── UploadInvoice.tsx
│   │   ├── InvoiceResult.tsx
│   │   └── GSTR1Preview.tsx
│   └── services/             # API service layer
│       ├── api.ts           # Main API orchestrator
│       ├── local.ts         # Local backend connector
│       ├── openai.ts        # Gemini integration (optional)
│       └── huggingface.ts   # HuggingFace integration (optional)
├── .env                      # Environment variables
├── package.json              # Frontend dependencies
└── README.md                 # This file
```

---

## 🧪 Testing

### Sample Invoices

Create test invoices using:
- [BillBook Invoice Generator](https://billbook.in/bill-generator/)
- [MyGSTInvoices](https://invoice-generator.mygstinvoices.com/)
- [Vyapar Invoice Generator](https://vyaparapp.in/invoice-generator/)

### Expected Extraction Format

```json
{
  "vendor": "Kirana Store Mumbai",
  "gstin": "27AAAAA1234A1Z5",
  "invoiceNo": "1001",
  "date": "28-02-2026",
  "taxableAmount": 3450.00,
  "cgst": 310.50,
  "sgst": 310.50,
  "igst": 0.00,
  "total": 4071.00,
  "confidence": 0.85
}
```

---

## 🔧 Troubleshooting

### Backend not starting?
```bash
# Check Python version
python --version  # Should be 3.13+

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

### OCR extraction errors?
- Ensure invoice image is clear and well-lit
- Check debug output in backend terminal
- Look for "=== EXTRACTED TEXT DEBUG ===" messages

### Frontend not connecting to backend?
```bash
# Check backend health
curl http://localhost:5000/health

# Or in PowerShell
Invoke-WebRequest -Uri "http://localhost:5000/health"
```

---

## 📸 Screenshots

### Home Dashboard
Clean, modern interface with quick access to all features.

### Invoice Upload
Drag-and-drop or click to upload multiple invoices.

### Analysis Results
Extracted data with confidence scores and validation.

### GSTR-1 Report
Comprehensive summary with CSV export for filing.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

Created with ❤️ for Indian small businesses

---

## 🙏 Acknowledgments

- [EasyOCR](https://github.com/JaidedAI/EasyOCR) - Excellent OCR library
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful component library
- [Flask](https://flask.palletsprojects.com/) - Lightweight Python web framework

---

## 📞 Support

If you encounter any issues or have questions:
1. Check the [Troubleshooting](#-troubleshooting) section
2. Look at backend terminal debug output
3. Open an issue on GitHub

---

**⭐ If you find this project helpful, please give it a star!**

