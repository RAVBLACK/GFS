# 🚀 Quick Setup Guide - Groq AI (100% FREE!)

## Why Groq?

✅ **100% FREE FOREVER** - No billing, no credit card, ever!  
✅ **Best for invoice OCR** - Uses Llama 3.2 Vision (90B parameters)  
✅ **Lightning Fast** - Fastest inference in the world  
✅ **Generous Limits** - 30 requests/min free tier  
✅ **No Catches** - Completely free, no strings attached

---

## Step-by-Step Setup (2 minutes)

### Step 1: Get Your FREE API Key

1. Go to: **https://console.groq.com/keys**
2. Sign up with Google/GitHub (or email)
3. Click "Create API Key"
4. Give it a name (e.g., "Invoice App")
5. Copy your API key (starts with `gsk_...`)

### Step 2: Add API Key to Your Project

1. Open the file: `.env` (in your project root - already open!)
2. Find this line:
   ```env
   VITE_GROQ_API_KEY=your_groq_api_key_here
   ```
3. Replace with your actual API key:
   ```env
   VITE_GROQ_API_KEY=gsk_abc123xyz...
   ```
4. Save the file (Ctrl+S)

### Step 3: Make Sure Groq is Selected

In the same `.env` file, check this line:
```env
VITE_AI_PROVIDER=groq
```

It should say `groq` (this is the default)

### Step 4: Restart Your Dev Server

1. In terminal, run:
   ```bash
   npm run dev
   ```

### Step 5: Test It!

1. Open browser: http://localhost:8081/
2. Upload an invoice image
3. Click "Give Analysis"
4. Watch the AI extract all GST details! ✨

---

## What Model is Being Used?

**Groq**: `llama-3.2-90b-vision-preview`
- 90 billion parameters - one of the most powerful vision models
- Specifically excellent for document understanding
- Lightning fast inference (fastest in the industry!)
- 100% FREE with no billing required

---

## Free Tier Limits

- **30 requests per minute** - more than enough for normal use
- **Unlimited daily usage** - no daily caps!
- **No credit card** required
- **No expiration** - free forever!

---

## Alternative FREE Options (if Groq doesn't work)

### Option A: Google Gemini
Already configured in your `.env`! Just change:
```env
VITE_AI_PROVIDER=gemini
```

### Option B: Together AI
1. Get $25 free credits: https://api.together.xyz/signup
2. Update `.env`:
   ```env
   VITE_TOGETHER_API_KEY=your_key_here
   VITE_AI_PROVIDER=together
   ```

### Option C: Hugging Face
1. Get free token: https://huggingface.co/settings/tokens
2. Update `.env`:
   ```env
   VITE_HUGGINGFACE_TOKEN=your_token_here
   VITE_AI_PROVIDER=huggingface
   ```

---

## Troubleshooting

### "API key not found" error
- Make sure `.env` file is in project root
- No extra spaces in API key
- Restart dev server after changing `.env`

### "Rate limit exceeded"
- Free tier: 30 requests/minute
- Wait 60 seconds and try again
- Or switch to Gemini (unlimited free)

### "Model not available"
- Check internet connection
- Groq status: https://status.groq.com/
- Switch to alternative provider

---

## Comparison Table

| Provider | Cost | Billing Required? | Best For | Speed |
|----------|------|-------------------|----------|-------|
| **Groq** ⭐ | FREE | ❌ No | Invoice OCR | ⚡ Fastest |
| Google Gemini | FREE | ❌ No | General use | Fast |
| Together AI | $25 credit | ❌ No | Advanced | Medium |
| Hugging Face | FREE | ❌ No | Experimental | Slow |

---

**Recommendation: Use Groq!** It's the fastest, completely free, and perfect for invoice OCR. 🚀

**You're ready to go! Just get your Groq API key and start analyzing invoices!** ✨
