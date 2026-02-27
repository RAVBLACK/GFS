import type { InvoiceData, AnalysisResult, GSTR1Data } from './openai';

/**
 * Groq AI Integration (100% FREE - No Billing Ever!)
 * Get free API key: https://console.groq.com/keys
 * Uses Llama 3.2 Vision (90B) - excellent for document OCR
 * Free tier: Generous rate limits, no credit card required
 */

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

/**
 * Convert file to base64
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });
};

/**
 * Analyze invoices using Groq AI (100% FREE!)
 * Uses Llama 3.2 Vision models
 */
export const analyzeInvoices = async (files: File[]): Promise<AnalysisResult> => {
  try {
    const allInvoices: InvoiceData[] = [];
    
    // Process each invoice image
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const base64Image = await fileToBase64(file);
      
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.2-11b-vision-preview',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `You are an expert at reading Indian GST invoices. Analyze this invoice image and extract the following information:

1. Vendor/Supplier Name
2. GSTIN (GST Identification Number)
3. Invoice Number
4. Invoice Date (format: DD-MM-YYYY)
5. Taxable Amount (numbers only, no currency symbols)
6. CGST amount
7. SGST amount
8. IGST amount
9. Total Amount
10. Confidence level (0.0 to 1.0) - how clear is the image?

Return ONLY a valid JSON object in this exact format (no markdown, no code blocks, no extra text):
{
  "vendor": "string",
  "gstin": "string",
  "invoiceNo": "string",
  "date": "DD-MM-YYYY",
  "taxableAmount": number,
  "cgst": number,
  "sgst": number,
  "igst": number,
  "total": number,
  "confidence": number
}

Important:
- If you cannot read a field clearly, use 0 for numbers or "N/A" for strings
- Lower the confidence score if the image is unclear
- CGST+SGST are for intra-state, IGST is for inter-state transactions`
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: base64Image
                  }
                }
              ]
            }
          ],
          max_tokens: 1000,
          temperature: 0.1
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Groq API error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No response from Groq AI');
      }

      // Parse JSON from response
      let jsonText = content.trim();
      
      // Remove markdown code blocks if present
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```\n?/, '').replace(/\n?```$/, '');
      }

      // Extract JSON object
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const invoiceData = JSON.parse(jsonMatch[0]);
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
            confidence: Number(invoiceData.confidence) || 0.5
          });
        } catch (parseError) {
          console.warn(`Failed to parse invoice ${i + 1}:`, parseError);
          // Add placeholder data
          allInvoices.push({
            id: `inv_${Date.now()}_${i}`,
            vendor: 'Unable to extract',
            gstin: 'N/A',
            invoiceNo: `Invoice_${i + 1}`,
            date: new Date().toLocaleDateString('en-GB'),
            taxableAmount: 0,
            cgst: 0,
            sgst: 0,
            igst: 0,
            total: 0,
            confidence: 0.3
          });
        }
      }
    }

    // Generate explanation
    const highConf = allInvoices.filter(inv => inv.confidence >= 0.9).length;
    const medConf = allInvoices.filter(inv => inv.confidence >= 0.7 && inv.confidence < 0.9).length;
    const lowConf = allInvoices.filter(inv => inv.confidence < 0.7).length;
    
    let explanation = `Processed ${allInvoices.length} invoice(s) using Groq AI. `;
    const parts = [];
    if (highConf > 0) parts.push(`${highConf} high confidence`);
    if (medConf > 0) parts.push(`${medConf} medium confidence`);
    if (lowConf > 0) parts.push(`${lowConf} need review`);
    explanation += parts.join(', ') + '.';

    return {
      invoices: allInvoices,
      explanation
    };

  } catch (error) {
    console.error('Error analyzing invoices with Groq:', error);
    throw new Error(
      error instanceof Error 
        ? `Invoice analysis failed: ${error.message}` 
        : 'Failed to analyze invoices. Please check your Groq API key at https://console.groq.com/keys'
    );
  }
};

/**
 * Generate GSTR-1 report from analyzed invoices
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
