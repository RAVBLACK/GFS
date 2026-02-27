import type { InvoiceData, AnalysisResult, GSTR1Data } from './openai';

/**
 * Together AI Integration (FREE $25 credits, no credit card!)
 * Best for invoice OCR - uses Llama Vision or other vision models
 * Get free API key: https://api.together.xyz/signup
 */

const TOGETHER_API_KEY = import.meta.env.VITE_TOGETHER_API_KEY;
const TOGETHER_API_URL = 'https://api.together.xyz/v1/chat/completions';

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
 * Analyze invoices using Together AI (FREE!)
 * Uses Llama 3.2 Vision or other vision models
 */
export const analyzeInvoices = async (files: File[]): Promise<AnalysisResult> => {
  try {
    const allInvoices: InvoiceData[] = [];
    
    // Process each invoice image
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const base64Image = await fileToBase64(file);
      
      const response = await fetch(TOGETHER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${TOGETHER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'meta-llama/Llama-3.2-11B-Vision-Instruct-Turbo',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Analyze this Indian GST invoice image and extract the following information:

1. Vendor/Supplier Name
2. GSTIN (GST Identification Number)
3. Invoice Number
4. Invoice Date (format: DD-MM-YYYY)
5. Taxable Amount (numbers only, no currency symbols)
6. CGST amount
7. SGST amount
8. IGST amount
9. Total Amount
10. Confidence level (0.0 to 1.0)

Return ONLY a valid JSON object in this exact format (no markdown, no extra text):
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

If you cannot read a field clearly, use 0 for numbers or "N/A" for strings, and lower the confidence score.`
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
        const errorText = await response.text();
        throw new Error(`Together AI API error: ${errorText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No response from Together AI');
      }

      // Parse JSON from response
      let jsonText = content.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```\n?/, '').replace(/\n?```$/, '');
      }

      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const invoiceData = JSON.parse(jsonMatch[0]);
        allInvoices.push({
          id: `inv_${Date.now()}_${i}`,
          ...invoiceData
        });
      }
    }

    // Generate explanation
    const highConf = allInvoices.filter(inv => inv.confidence >= 0.9).length;
    const medConf = allInvoices.filter(inv => inv.confidence >= 0.7 && inv.confidence < 0.9).length;
    const lowConf = allInvoices.filter(inv => inv.confidence < 0.7).length;
    
    let explanation = `Processed ${allInvoices.length} invoice(s). `;
    if (highConf > 0) explanation += `${highConf} high confidence`;
    if (medConf > 0) explanation += `${highConf > 0 ? ', ' : ''}${medConf} medium confidence`;
    if (lowConf > 0) explanation += `${highConf > 0 || medConf > 0 ? ', ' : ''}${lowConf} need review`;
    explanation += '.';

    return {
      invoices: allInvoices,
      explanation
    };

  } catch (error) {
    console.error('Error analyzing invoices:', error);
    throw new Error(
      error instanceof Error 
        ? `Invoice analysis failed: ${error.message}` 
        : 'Failed to analyze invoices. Please check your API key.'
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
