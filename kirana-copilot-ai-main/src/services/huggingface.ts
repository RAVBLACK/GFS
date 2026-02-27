// Hugging Face Vision API Integration (100% FREE!)
// Get free token: https://huggingface.co/settings/tokens
// Uses Llama 3.2 Vision model for invoice OCR

export interface InvoiceData {
  id: string;
  vendor: string;
  gstin: string;
  invoiceNo: string;
  date: string;
  taxableAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
  confidence: number;
}

export interface AnalysisResult {
  invoices: InvoiceData[];
  explanation: string;
}

export interface GSTR1Data {
  summary: {
    totalInvoices: number;
    totalTaxableAmount: number;
    totalCGST: number;
    totalSGST: number;
    totalIGST: number;
    totalTax: number;
    totalAmount: number;
  };
  csvData: string;
}

const HF_TOKEN = import.meta.env.VITE_HUGGINGFACE_TOKEN;

/**
 * Convert file to base64 (without data URL prefix)
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1]; // Remove data:image/...;base64, prefix
      resolve(base64);
    };
    reader.onerror = reject;
  });
};

/**
 * Query Hugging Face model - using image-to-text model
 */
async function queryHuggingFace(imageBase64: string) {
  console.log('Calling Hugging Face OCR API...');
  
  // Convert base64 to blob
  const binaryString = atob(imageBase64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  const response = await fetch(
    "https://api-inference.huggingface.co/models/microsoft/trocr-large-printed",
    {
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
      },
      method: "POST",
      body: bytes,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('HF API Error:', errorText);
    
    // Check if model is loading
    if (response.status === 503) {
      throw new Error("Model is warming up. Please wait 60 seconds and try again.");
    }
    
    throw new Error(`Hugging Face API error (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  console.log('HF API Response:', result);
  return result;
}

/**
 * Analyze invoices using Hugging Face (FREE!)
 */
export const analyzeInvoices = async (files: File[]): Promise<AnalysisResult> => {
  try {
    const allInvoices: InvoiceData[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(`Processing invoice ${i + 1}/${files.length}: ${file.name}`);
      
      const base64Image = await fileToBase64(file);
      
      const prompt = `Extract data from this Indian GST invoice. Return ONLY valid JSON format without any markdown or extra text:
{
  "vendor": "company name",
  "gstin": "GST number",
  "invoiceNo": "invoice number",
  "date": "DD-MM-YYYY",
  "taxableAmount": 0,
  "cgst": 0,
  "sgst": 0,
  "igst": 0,
  "total": 0,
  "confidence": 0.8
}`;

      try {
        const result = await queryHuggingFace(base64Image, prompt);
        console.log(`Invoice ${i + 1} raw result:`, result);
        
        // Parse response - HF returns array format
        let invoiceData = null;
        let responseText = '';
        
        if (Array.isArray(result) && result.length > 0) {
          responseText = result[0].generated_text || JSON.stringify(result[0]);
        } else if (typeof result === 'object') {
          responseText = result.generated_text || JSON.stringify(result);
        } else {
          responseText = String(result);
        }
        
        console.log('Response text:', responseText);
        
        // Try multiple JSON extraction strategies
        try {
          // Strategy 1: Direct JSON parse
          invoiceData = JSON.parse(responseText);
        } catch {
          // Strategy 2: Extract JSON from markdown code blocks
          const codeBlockMatch = responseText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
          if (codeBlockMatch) {
            invoiceData = JSON.parse(codeBlockMatch[1]);
          } else {
            // Strategy 3: Find first JSON object
            const jsonMatch = responseText.match(/\{[\s\S]*?\}/);
            if (jsonMatch) {
              invoiceData = JSON.parse(jsonMatch[0]);
            }
          }
        }
        
        if (invoiceData) {
          console.log('Parsed invoice data:', invoiceData);
          allInvoices.push({
            id: `inv_${Date.now()}_${i}`,
            vendor: invoiceData.vendor || 'N/A',
            gstin: invoiceData.gstin || 'N/A',
            invoiceNo: invoiceData.invoiceNo || `INV-${i + 1}`,
            date: invoiceData.date || new Date().toLocaleDateString('en-GB'),
            taxableAmount: Number(invoiceData.taxableAmount) || 0,
            cgst: Number(invoiceData.cgst) || 0,
            sgst: Number(invoiceData.sgst) || 0,
            igst: Number(invoiceData.igst) || 0,
            total: Number(invoiceData.total) || 0,
            confidence: Number(invoiceData.confidence) || 0.6
          });
        } else {
          console.warn('Could not extract JSON from response');
          throw new Error('Failed to parse model response');
        }
        
      } catch (modelError: any) {
        console.error(`Error processing invoice ${i + 1}:`, modelError);
        
        // Add placeholder with error info
        allInvoices.push({
          id: `inv_${Date.now()}_${i}`,
          vendor: modelError.message?.includes('warming') ? 'Model loading...' : 'Processing error',
          gstin: 'N/A',
          invoiceNo: `Invoice_${i + 1}`,
          date: new Date().toLocaleDateString('en-GB'),
          taxableAmount: 0,
          cgst: 0,
          sgst: 0,
          igst: 0,
          total: 0,
          confidence: 0.2
        });
        
        // Re-throw if it's a model loading error
        if (modelError.message?.includes('warming')) {
          throw modelError;
        }
      }
    }
    
    const highConf = allInvoices.filter(inv => inv.confidence >= 0.9).length;
    const medConf = allInvoices.filter(inv => inv.confidence >= 0.7 && inv.confidence < 0.9).length;
    const lowConf = allInvoices.filter(inv => inv.confidence < 0.7).length;
    
    const explanation = `Processed ${allInvoices.length} invoice(s) with Hugging Face. ${highConf} high confidence, ${medConf} medium confidence, ${lowConf} need review.`;
    
    return {
      invoices: allInvoices,
      explanation
    };
    
  } catch (error) {
    console.error("Error analyzing invoices:", error);
    throw new Error(
      error instanceof Error 
        ? error.message
        : "Failed to analyze invoices. Check console for details."
    );
  }
};

/**
 * Generate GSTR-1 report
 */
export const generateGSTR1 = async (invoices: InvoiceData[]): Promise<GSTR1Data> => {
  const summary = {
    totalInvoices: invoices.length,
    totalTaxableAmount: invoices.reduce((sum, inv) => sum + inv.taxableAmount, 0),
    totalCGST: invoices.reduce((sum, inv) => sum + inv.cgst, 0),
    totalSGST: invoices.reduce((sum, inv) => sum + inv.sgst, 0),
    totalIGST: invoices.reduce((sum, inv) => sum + inv.igst, 0),
    totalTax: 0,
    totalAmount: 0
  };

  summary.totalTax = summary.totalCGST + summary.totalSGST + summary.totalIGST;
  summary.totalAmount = summary.totalTaxableAmount + summary.totalTax;

  const csvHeader = "GSTIN,Invoice No,Date,Taxable Amount,CGST,SGST,IGST,Total\n";
  const csvRows = invoices.map(inv => 
    `${inv.gstin},${inv.invoiceNo},${inv.date},${inv.taxableAmount},${inv.cgst},${inv.sgst},${inv.igst},${inv.total}`
  ).join('\n');
  
  return {
    summary,
    csvData: csvHeader + csvRows
  };
};
