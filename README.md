# Kirana Copilot AI - Invoice Analyzer with OpenAI Integration

An intelligent GST invoice analyzer that uses OpenAI's Vision API to automatically extract data from invoice images and generate GSTR-1 reports.

## Features

- 📸 **Image Upload**: Capture invoice photos via camera or upload from gallery
- 🤖 **AI-Powered Analysis**: Uses OpenAI GPT-4 Vision to extract invoice details
- 📊 **Automatic GST Calculation**: Calculates CGST, SGST, and IGST automatically
- 🧾 **GSTR-1 Generation**: Creates GST return drafts with summary and CSV export
- ✅ **Confidence Scoring**: AI provides confidence levels for data accuracy
- 📱 **Mobile-First Design**: Optimized for mobile devices with responsive UI

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Components**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **AI Integration**: OpenAI GPT-4 Vision API
- **Routing**: React Router v6
- **State Management**: React Context API
- **Icons**: Lucide React
- **Notifications**: Sonner (Toast)

## Prerequisites

- Node.js 18+ or Bun
- OpenAI API Key (Get one from [OpenAI Platform](https://platform.openai.com/api-keys))

## Installation

1. **Clone the repository**
   ```bash
   cd kirana-copilot-ai-main
   ```

2. **Install dependencies**
   
   Using npm:
   ```bash
   npm install
   ```
   
   Or using bun:
   ```bash
   bun install
   ```

3. **Configure Environment Variables**
   
   Create a `.env` file in the root directory (or edit the existing one):
   ```env
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   ```
   
   Replace `your_openai_api_key_here` with your actual OpenAI API key.

## Running the Application

### Development Mode

Using npm:
```bash
npm run dev
```

Using bun:
```bash
bun run dev
```

The app will be available at `http://localhost:5173`

### Production Build

Using npm:
```bash
npm run build
npm run preview
```

Using bun:
```bash
bun run build
bun run preview
```

## How It Works

### 1. Upload Invoices
- Navigate to the upload page
- Take photos of invoices or select from gallery
- Upload multiple invoices at once

### 2. AI Analysis
- Images are sent to OpenAI's GPT-4 Vision API
- AI extracts:
  - Vendor/Supplier Name
  - GSTIN (GST Identification Number)
  - Invoice Number and Date
  - Taxable Amount
  - CGST, SGST, and IGST values
  - Total Amount
- Each invoice receives a confidence score (0.0-1.0)

### 3. Review Results
- View analyzed invoices with confidence levels
- High confidence (0.9+): Data is reliable
- Medium confidence (0.7-0.89): Review recommended
- Low confidence (<0.7): Manual verification needed

### 4. Generate GSTR-1
- Automatically generates GST return summary
- Calculates totals for all invoices
- Exports data in CSV format for GST portal

## Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── ui/           # shadcn/ui components
│   └── ...           # Custom components
├── contexts/         # React Context providers
├── hooks/           # Custom React hooks
├── lib/             # Utility functions
├── pages/           # Application pages/routes
│   ├── UploadInvoice.tsx    # Invoice upload interface
│   ├── InvoiceResult.tsx    # Analysis results display
│   └── GSTR1Preview.tsx     # GSTR-1 report viewer
├── services/        # API and external services
│   ├── api.ts       # Main API functions
│   └── openai.ts    # OpenAI integration
└── test/           # Test files
```

## API Integration Details

### OpenAI Service (`src/services/openai.ts`)

- **analyzeInvoices()**: Sends images to GPT-4 Vision for analysis
- **generateGSTR1()**: Creates GSTR-1 report from invoice data
- Uses structured prompts for consistent data extraction
- Handles errors gracefully with detailed messages

### API Functions (`src/services/api.ts`)

- **processInvoices()**: Orchestrates invoice analysis
- **fetchGSTR1()**: Retrieves GSTR-1 data
- **getCurrentInvoices()**: Gets current invoice data
- **clearInvoiceData()**: Clears stored data

## Important Notes

⚠️ **Security Notice**: The current implementation uses `dangerouslyAllowBrowser: true` for OpenAI API calls, which is suitable for development/demo purposes only. In production:
- Move API calls to a backend server
- Never expose API keys in the frontend
- Implement proper authentication and authorization

⚠️ **API Costs**: OpenAI GPT-4 Vision API usage incurs costs based on:
- Number of images analyzed
- Image resolution
- Token usage for responses
- Monitor usage at [OpenAI Usage Dashboard](https://platform.openai.com/usage)

⚠️ **GSTR-1 Disclaimer**: This tool generates DRAFT reports only. Always:
- Verify all extracted data manually
- Cross-check with original invoices
- Use official GST portal for final submission

## Troubleshooting

### Common Issues

1. **"Failed to analyze invoices"**
   - Check if OpenAI API key is correctly set in `.env`
   - Verify API key has GPT-4 Vision access
   - Check internet connectivity

2. **"No invoice data available"**
   - Make sure you've analyzed invoices before viewing GSTR-1
   - Data is stored in memory, refresh will clear it

3. **Low confidence scores**
   - Ensure invoice images are clear and well-lit
   - Images should be straight and not blurry
   - All text should be readable

## Development

### Run Tests
```bash
npm run test
# or
bun test
```

### Linting
```bash
npm run lint
# or
bun run lint
```

### Type Checking
TypeScript is configured with strict mode. Check types with:
```bash
tsc --noEmit
```

## Contributing

This is a demonstration project. Feel free to fork and modify for your needs.

## License

This project is for educational purposes.

## Support

For OpenAI API issues, visit [OpenAI Documentation](https://platform.openai.com/docs)

---

Built with ❤️ using React, TypeScript, and OpenAI GPT-4 Vision
