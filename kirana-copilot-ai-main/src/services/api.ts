// API service functions with AI integration
import * as geminiService from './openai';
import * as huggingfaceService from './huggingface';
import * as togetherService from './together';
import * as groqService from './groq';
import * as localService from './local';
import type { InvoiceData } from './openai';

// Store invoice data in memory (in production, use proper state management or backend)
let currentInvoicesData: InvoiceData[] = [];

// Determine which AI provider to use
const AI_PROVIDER = import.meta.env.VITE_AI_PROVIDER || 'local';

// Select the appropriate service based on provider
const getAIService = () => {
  switch (AI_PROVIDER) {
    case 'local':
      return localService;  // Local Python backend (RECOMMENDED - 100% free, no API keys!)
    case 'groq':
      return groqService;
    case 'huggingface':
      return huggingfaceService;
    case 'gemini':
      return geminiService;
    case 'together':
      return togetherService;
    default:
      return localService; // Default to local Python backend
  }
};

const aiService = getAIService();

export const loginWithPhone = async (phone: string, otp: string) => {
  await new Promise((r) => setTimeout(r, 1200));
  return { uid: "user_001", phone, displayName: "Ramesh" };
};

export const createShop = async (data: { name: string; customerName: string; type: string }) => {
  await new Promise((r) => setTimeout(r, 800));
  return { id: `shop_${Date.now()}`, ...data, createdAt: new Date().toISOString() };
};

export const createMonth = async (shopId: string, label: string) => {
  await new Promise((r) => setTimeout(r, 600));
  return { id: `month_${Date.now()}`, shopId, label, invoiceCount: 0, status: "pending" as const };
};

export const uploadInvoice = async (_file: File) => {
  await new Promise((r) => setTimeout(r, 500));
  return { id: `inv_${Date.now()}`, fileName: _file.name, uploadedAt: new Date().toISOString() };
};

/**
 * Process invoice images using AI (Gemini or Hugging Face)
 */
export const processInvoices = async (files: File[]) => {
  try {
    console.log(`Using AI provider: ${AI_PROVIDER}`);
    
    // Analyze invoices using selected AI service
    const result = await aiService.analyzeInvoices(files);
    
    // Store the invoice data for later use
    currentInvoicesData = result.invoices;
    
    return result;
  } catch (error) {
    console.error("Error processing invoices:", error);
    throw error;
  }
};

/**
 * Fetch GSTR-1 report data
 */
export const fetchGSTR1 = async (_monthId: string) => {
  try {
    // Generate GSTR-1 from the stored invoice data
    if (currentInvoicesData.length === 0) {
      throw new Error("No invoice data available. Please process invoices first.");
    }
    
    const gstr1Data = await aiService.generateGSTR1(currentInvoicesData);
    return gstr1Data;
  } catch (error) {
    console.error("Error fetching GSTR-1:", error);
    throw error;
  }
};

/**
 * Get current invoice data
 */
export const getCurrentInvoices = () => {
  return currentInvoicesData;
};

/**
 * Clear current invoice data
 */
export const clearInvoiceData = () => {
  currentInvoicesData = [];
};
