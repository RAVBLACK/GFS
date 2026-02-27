import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Google Gemini client (FREE - No billing required!)
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

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

/**
 * Convert file to base64 string
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Extract base64 data and mime type
      resolve(result);
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Convert file to Gemini's expected format
 */
const fileToGeminiPart = async (file: File) => {
  const base64Data = await fileToBase64(file);
  const [metadata, data] = base64Data.split(',');
  const mimeType = metadata.match(/:(.*?);/)?.[1] || 'image/jpeg';
  
  return {
    inlineData: {
      data,
      mimeType
    }
  };
};

/**
 * Analyze invoice images using Google Gemini Vision API (FREE!)
 */
export const analyzeInvoices = async (files: File[]): Promise<AnalysisResult> => {
  try {
    // Use Gemini 1.5 Flash (free tier) - correct model name for current API
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    // Convert all files to Gemini format
    const imageParts = await Promise.all(files.map(file => fileToGeminiPart(file)));

    const prompt = `You are an expert Indian GST invoice analyzer. Analyze these invoice images and extract the following information for each invoice:

1. Vendor/Supplier Name
2. GSTIN (GST Identification Number)
3. Invoice Number
4. Invoice Date (format: DD-MM-YYYY)
5. Taxable Amount
6. CGST (Central GST)
7. SGST (State GST)
8. IGST (Integrated GST)
9. Total Amount
10. Confidence level (0.0 to 1.0) based on image quality and data clarity

Return the data in the following JSON format ONLY (no markdown, no extra text):
{
  "invoices": [
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
  ],
  "explanation": "A brief summary of the analysis, including any observations about data quality or issues found"
}

Important notes:
- All monetary values should be in Indian Rupees (₹)
- CGST and SGST are used for intra-state transactions
- IGST is used for inter-state transactions
- If any field is not clearly visible, use 0 or "N/A" and reduce confidence score
- Confidence score: 0.9-1.0 (High), 0.7-0.89 (Medium), Below 0.7 (Low/Review needed)
- Return ONLY valid JSON, no markdown code blocks`;

    // Call Gemini Vision API
    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = response.text();

    // Parse the response
    if (!text) {
      throw new Error("No response from Gemini");
    }

    // Extract JSON from the response (remove markdown code blocks if present)
    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }

    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid response format from Gemini");
    }

    const parsedData = JSON.parse(jsonMatch[0]);

    // Add unique IDs to invoices
    const invoicesWithIds: InvoiceData[] = parsedData.invoices.map((inv: Omit<InvoiceData, 'id'>, index: number) => ({
      id: `inv_${Date.now()}_${index}`,
      ...inv
    }));

    return {
      invoices: invoicesWithIds,
      explanation: parsedData.explanation || "Analysis completed successfully."
    };

  } catch (error) {
    console.error("Error analyzing invoices:", error);
    throw new Error(
      error instanceof Error 
        ? `Invoice analysis failed: ${error.message}` 
        : "Failed to analyze invoices. Please check your API key and try again."
    );
  }
};

/**
 * Generate GSTR-1 report from analyzed invoices
 */
export const generateGSTR1 = async (invoices: InvoiceData[]): Promise<GSTR1Data> => {
  try {
    // Calculate summary
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

    // Generate CSV data
    const csvHeader = "GSTIN,Invoice No,Date,Taxable Amount,CGST,SGST,IGST,Total\n";
    const csvRows = invoices.map(inv => 
      `${inv.gstin},${inv.invoiceNo},${inv.date},${inv.taxableAmount},${inv.cgst},${inv.sgst},${inv.igst},${inv.total}`
    ).join('\n');
    const csvData = csvHeader + csvRows;

    // Use Gemini to validate and provide insights about the GSTR-1 data
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
      const prompt = `As a GST expert, review this GSTR-1 summary and provide any important insights or warnings:

Summary:
- Total Invoices: ${summary.totalInvoices}
- Total Taxable Amount: ₹${summary.totalTaxableAmount.toLocaleString()}
- Total CGST: ₹${summary.totalCGST.toLocaleString()}
- Total SGST: ₹${summary.totalSGST.toLocaleString()}
- Total IGST: ₹${summary.totalIGST.toLocaleString()}
- Total Tax: ₹${summary.totalTax.toLocaleString()}
- Total Amount: ₹${summary.totalAmount.toLocaleString()}

Provide a brief validation report (2-3 sentences) about the data consistency and any red flags.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      console.log("GSTR-1 Validation:", response.text());
    } catch (error) {
      console.warn("GSTR-1 validation skipped:", error);
    }

    return {
      summary,
      csvData
    };

  } catch (error) {
    console.error("Error generating GSTR-1:", error);
    throw new Error(
      error instanceof Error 
        ? `GSTR-1 generation failed: ${error.message}` 
        : "Failed to generate GSTR-1. Please try again."
    );
  }
};
