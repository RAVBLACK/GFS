/**
 * Local Python Backend Service (100% FREE!)
 * Uses locally running models - no API keys needed!
 * Backend URL: http://localhost:5000
 */

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

const BACKEND_URL = 'http://localhost:5000';

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
 * Check if backend is running
 */
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${BACKEND_URL}/health`, {
      method: 'GET',
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};

/**
 * Analyze invoices using local Python backend
 */
export const analyzeInvoices = async (files: File[]): Promise<AnalysisResult> => {
  try {
    // Check if backend is running
    const isHealthy = await checkBackendHealth();
    if (!isHealthy) {
      throw new Error(
        'Python backend not running! Please start it first:\\n\\n' +
        '1. Open terminal in project folder\\n' +
        '2. cd backend\\n' +
        '3. pip install -r requirements.txt\\n' +
        '4. python app.py'
      );
    }

    // Convert all files to base64
    console.log(`Converting ${files.length} files to base64...`);
    const base64Images = await Promise.all(files.map(file => fileToBase64(file)));
    
    console.log('Sending to Python backend...');
    
    // Send to backend
    const response = await fetch(`${BACKEND_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        images: base64Images
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Backend analysis failed');
    }

    const result = await response.json();
    console.log('✅ Analysis complete:', result);
    
    return result;
    
  } catch (error) {
    console.error("Error analyzing invoices:", error);
    throw new Error(
      error instanceof Error 
        ? error.message
        : "Failed to analyze invoices. Check if Python backend is running."
    );
  }
};

/**
 * Generate GSTR-1 report using local backend
 */
export const generateGSTR1 = async (invoices: InvoiceData[]): Promise<GSTR1Data> => {
  try {
    const response = await fetch(`${BACKEND_URL}/generate-gstr1`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        invoices
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'GSTR-1 generation failed');
    }

    const result = await response.json();
    return result;
    
  } catch (error) {
    console.error("Error generating GSTR-1:", error);
    throw new Error(
      error instanceof Error 
        ? error.message
        : "Failed to generate GSTR-1"
    );
  }
};
