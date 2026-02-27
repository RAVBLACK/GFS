# 🚀 Quick Setup Guide

## Step 1: Get Your OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the API key (it starts with `sk-`)

## Step 2: Configure the Application

1. Open the `.env` file in the root directory
2. Replace `your_openai_api_key_here` with your actual API key:
   ```
   VITE_OPENAI_API_KEY=sk-your-actual-key-here
   ```
3. Save the file

## Step 3: Run the Application

```bash
npm run dev
```

The app will open at: http://localhost:5173

## 📝 Usage Flow

1. **Start**: Navigate through Login → Setup → Create Shop → Add Month
2. **Upload**: Click "Upload Invoices" and add invoice photos
3. **Analyze**: Click "Give Analysis" to process with AI
4. **Review**: Check extracted data and confidence scores
5. **Export**: View GSTR-1 summary and download CSV

## ⚠️ Important Notes

- **API Costs**: Each image analysis costs approximately $0.01-0.05 depending on image size
- **Best Results**: Use clear, well-lit photos with readable text
- **Data Storage**: Invoice data is stored in browser memory (lost on refresh)
- **Production**: Never commit your `.env` file to version control

## 🆘 Troubleshooting

### Error: "Failed to analyze invoices"
- ✅ Check your API key is correct in `.env`
- ✅ Ensure you have GPT-4 Vision API access
- ✅ Verify you have sufficient API credits

### Low Confidence Scores
- ✅ Take photos in good lighting
- ✅ Ensure text is clear and not blurry
- ✅ Keep invoice straight (not tilted)

### "No invoice data available"
- ✅ Upload and analyze invoices first
- ✅ Don't refresh the page after analysis

## 📚 Learn More

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [GPT-4 Vision Guide](https://platform.openai.com/docs/guides/vision)
- [GST India Portal](https://www.gst.gov.in/)

---

Need help? Check the detailed README_INTEGRATION.md file for more information.
