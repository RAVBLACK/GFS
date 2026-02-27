"""
Invoice Analyzer - Uses EasyOCR + Smart Parsing
No API keys needed - runs completely locally!
"""

import re
from datetime import datetime
from PIL import Image
import numpy as np
import easyocr

class InvoiceAnalyzer:
    """
    Analyzes Indian GST invoices using OCR and pattern matching
    """
    
    def __init__(self):
        """Initialize EasyOCR reader"""
        print("   Loading EasyOCR model (English + Hindi)...")
        # Initialize with English and Hindi support
        self.reader = easyocr.Reader(['en', 'hi'], gpu=False)
        print("   ✅ OCR model loaded!")
    
    def extract_text(self, image):
        """Extract text from image using EasyOCR"""
        # Convert PIL Image to numpy array
        img_array = np.array(image)
        
        # Perform OCR
        results = self.reader.readtext(img_array, detail=1)
        
        # Extract text and positions
        extracted = {
            'full_text': ' '.join([text for (bbox, text, conf) in results]),
            'lines': [(text, conf) for (bbox, text, conf) in results]
        }
        
        return extracted
    
    def extract_invoice_data(self, image):
        """
        Extract structured invoice data from image
        Returns dict with all invoice fields
        """
        # Step 1: Extract text using OCR
        print("      Running OCR...")
        ocr_result = self.extract_text(image)
        full_text = ocr_result['full_text']
        lines = ocr_result['lines']
        
        print(f"      Extracted {len(lines)} text lines")
        
        # Step 2: Parse invoice data using patterns
        invoice_data = {
            'vendor': self._extract_vendor(full_text, lines),
            'gstin': self._extract_gstin(full_text),
            'invoiceNo': self._extract_invoice_number(full_text),
            'date': self._extract_date(full_text),
            'taxableAmount': self._extract_amount(full_text, 'taxable'),
            'cgst': self._extract_amount(full_text, 'cgst'),
            'sgst': self._extract_amount(full_text, 'sgst'),
            'igst': self._extract_amount(full_text, 'igst'),
            'total': self._extract_amount(full_text, 'total'),
            'confidence': 0.5  # Will be updated below
        }
        
        # Step 3: Smart fallback calculations
        # If tax amounts are 0 but total exists, try to estimate
        if invoice_data['total'] > 0:
            if invoice_data['taxableAmount'] == 0:
                # Estimate taxable amount (assuming ~18% GST)
                invoice_data['taxableAmount'] = round(invoice_data['total'] / 1.18, 2)
            
            if invoice_data['cgst'] == 0 and invoice_data['sgst'] == 0 and invoice_data['igst'] == 0:
                # Calculate tax as difference
                tax_amount = invoice_data['total'] - invoice_data['taxableAmount']
                
                # Check if it's intra-state (CGST+SGST) or inter-state (IGST)
                if 'IGST' in full_text.upper():
                    invoice_data['igst'] = round(tax_amount, 2)
                else:
                    # Assume intra-state: split equally between CGST and SGST
                    invoice_data['cgst'] = round(tax_amount / 2, 2)
                    invoice_data['sgst'] = round(tax_amount / 2, 2)
        
        # If taxable amount exists but total is 0, calculate total
        if invoice_data['taxableAmount'] > 0 and invoice_data['total'] == 0:
            invoice_data['total'] = (
                invoice_data['taxableAmount'] + 
                invoice_data['cgst'] + 
                invoice_data['sgst'] + 
                invoice_data['igst']
            )
        
        # Step 4: Calculate confidence
        invoice_data['confidence'] = self._calculate_confidence(full_text, lines, invoice_data)
        
        return invoice_data
    
    def _extract_vendor(self, text, lines):
        """Extract vendor/supplier name (usually at top)"""
        # Take first high-confidence line that's not too short
        for line_text, conf in lines[:5]:  # Check first 5 lines
            if len(line_text) > 3 and conf > 0.5:
                # Skip if it looks like invoice number or date
                if not re.search(r'\d{4,}|invoice|bill|date', line_text, re.I):
                    return line_text.strip()
        return 'N/A'
    
    def _extract_gstin(self, text):
        """Extract GSTIN number (format: 22AAAAA0000A1Z5)"""
        # GSTIN pattern: 2 digits + 10 alphanumeric + 3 alphanumeric
        pattern = r'\b\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}\b'
        match = re.search(pattern, text.upper())
        if match:
            return match.group(0)
        
        # Alternative: look for text near "GSTIN" keyword
        gstin_pattern = r'GSTIN[:\s]*([A-Z0-9]{15})'
        match = re.search(gstin_pattern, text.upper())
        if match:
            return match.group(1)
        
        return 'N/A'
    
    def _extract_invoice_number(self, text):
        """Extract invoice number"""
        # Look for patterns like "Invoice No: 123", "Bill No: 456"
        patterns = [
            r'invoice\s*(?:no\.?|number|#)[:\s]*([A-Z0-9/-]+)',
            r'bill\s*(?:no\.?|number|#)[:\s]*([A-Z0-9/-]+)',
            r'voucher\s*(?:no\.?|number)[:\s]*([A-Z0-9/-]+)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1).strip()
        
        # Fallback: find any invoice-like number
        match = re.search(r'\b[A-Z]{2,4}[/-]?\d{4,}\b', text)
        if match:
            return match.group(0)
        
        return f'INV{datetime.now().strftime("%Y%m%d%H%M%S")}'
    
    def _extract_date(self, text):
        """Extract invoice date"""
        # Common date formats in India
        date_patterns = [
            r'\b(\d{1,2})[/-](\d{1,2})[/-](\d{4})\b',  # DD/MM/YYYY or DD-MM-YYYY
            r'\b(\d{1,2})[/-](\d{1,2})[/-](\d{2})\b',   # DD/MM/YY
            r'\b(\d{4})[/-](\d{1,2})[/-](\d{1,2})\b',   # YYYY/MM/DD
        ]
        
        for pattern in date_patterns:
            match = re.search(pattern, text)
            if match:
                groups = match.groups()
                try:
                    if len(groups[0]) == 4:  # YYYY-MM-DD
                        return f"{groups[2].zfill(2)}-{groups[1].zfill(2)}-{groups[0]}"
                    else:  # DD-MM-YYYY or DD-MM-YY
                        year = groups[2] if len(groups[2]) == 4 else f"20{groups[2]}"
                        return f"{groups[0].zfill(2)}-{groups[1].zfill(2)}-{year}"
                except:
                    pass
        
        # Default to today's date
        return datetime.now().strftime('%d-%m-%Y')
    
    def _extract_amount(self, text, field_type):
        """Extract monetary amounts (taxable, CGST, SGST, IGST, total)"""
        # Keep original text for flexible matching
        upper_text = text.upper()
        
        # Patterns for different fields (more flexible)
        patterns = {
            'taxable': [
                r'TAXABLE.*?(?:RS\.?|₹|INR)?\s*([\d,]+\.?\d*)',
                r'SUB[\s-]*TOTAL.*?(?:RS\.?|₹|INR)?\s*([\d,]+\.?\d*)',
                r'BASE.*?(?:AMOUNT)?.*?(?:RS\.?|₹|INR)?\s*([\d,]+\.?\d*)',
                r'AMOUNT.*?TAXABLE.*?([\d,]+\.?\d*)',
            ],
            'cgst': [
                r'CGST.*?(?:RS\.?|₹|INR|@)?\s*([\d,]+\.?\d*)',
                r'C\.G\.S\.T.*?(?:RS\.?|₹|INR)?\s*([\d,]+\.?\d*)',
                r'CENTRAL.*?GST.*?([\d,]+\.?\d*)',
            ],
            'sgst': [
                r'SGST.*?(?:RS\.?|₹|INR|@)?\s*([\d,]+\.?\d*)',
                r'S\.G\.S\.T.*?(?:RS\.?|₹|INR)?\s*([\d,]+\.?\d*)',
                r'STATE.*?GST.*?([\d,]+\.?\d*)',
            ],
            'igst': [
                r'IGST.*?(?:RS\.?|₹|INR|@)?\s*([\d,]+\.?\d*)',
                r'I\.G\.S\.T.*?(?:RS\.?|₹|INR)?\s*([\d,]+\.?\d*)',
                r'INTEGRATED.*?GST.*?([\d,]+\.?\d*)',
            ],
            'total': [
                r'(?:GRAND|TOTAL|FINAL).*?TOTAL.*?(?:RS\.?|₹|INR)?\s*([\d,]+\.?\d*)',
                r'TOTAL.*?(?:AMOUNT|PAYABLE)?.*?(?:RS\.?|₹|INR)?\s*([\d,]+\.?\d*)',
                r'NET.*?(?:AMOUNT|PAYABLE).*?(?:RS\.?|₹|INR)?\s*([\d,]+\.?\d*)',
                r'AMOUNT.*?PAYABLE.*?([\d,]+\.?\d*)',
            ]
        }
        
        # Try each pattern
        for pattern in patterns.get(field_type, []):
            # Search in chunks to handle line breaks
            matches = re.finditer(pattern, upper_text, re.DOTALL)
            for match in matches:
                amount_str = match.group(1).replace(',', '').replace(' ', '')
                try:
                    amount = float(amount_str)
                    # Sanity check: amounts should be reasonable
                    if 0 < amount < 100000000:  # Less than 10 crore
                        return amount
                except:
                    continue
        
        # Fallback: try to find any number near the keyword
        keyword_map = {
            'taxable': ['TAXABLE', 'SUBTOTAL', 'SUB TOTAL'],
            'cgst': ['CGST', 'C.G.S.T', 'CENTRAL GST'],
            'sgst': ['SGST', 'S.G.S.T', 'STATE GST'],
            'igst': ['IGST', 'I.G.S.T', 'INTEGRATED GST'],
            'total': ['TOTAL', 'GRAND TOTAL', 'NET AMOUNT']
        }
        
        for keyword in keyword_map.get(field_type, []):
            if keyword in upper_text:
                # Find position of keyword
                pos = upper_text.find(keyword)
                # Look for numbers within 100 characters after keyword
                search_text = upper_text[pos:pos+100]
                amount_matches = re.findall(r'[\d,]+\.?\d*', search_text)
                for amt_str in amount_matches:
                    try:
                        amount = float(amt_str.replace(',', ''))
                        if 0 < amount < 100000000:
                            return amount
                    except:
                        continue
        
        return 0.0
    
    def _calculate_confidence(self, text, lines, invoice_data):
        """Calculate confidence score based on extracted data quality"""
        score = 0.5  # Base score
        
        # Check for key invoice elements
        if re.search(r'\bGSTIN\b', text, re.IGNORECASE):
            score += 0.15
        
        if re.search(r'\binvoice|bill\b', text, re.IGNORECASE):
            score += 0.1
        
        if re.search(r'\d{2}[/-]\d{2}[/-]\d{2,4}', text):  # Date found
            score += 0.1
        
        if re.search(r'CGST|SGST|IGST', text, re.IGNORECASE):
            score += 0.1
        
        # Boost score if we extracted actual amounts
        if invoice_data.get('total', 0) > 0:
            score += 0.1
        
        if invoice_data.get('taxableAmount', 0) > 0:
            score += 0.1
        
        if invoice_data.get('gstin', 'N/A') != 'N/A':
            score += 0.1
        
        # Penalize if too few lines (poor OCR)
        if len(lines) < 5:
            score -= 0.2
        
        # Average OCR confidence
        if lines:
            avg_conf = sum(conf for _, conf in lines) / len(lines)
            score = (score + avg_conf) / 2
        
        return max(0.0, min(1.0, score))  # Clamp between 0 and 1


# For testing
if __name__ == '__main__':
    print("Testing InvoiceAnalyzer...")
    analyzer = InvoiceAnalyzer()
    print("✅ Analyzer initialized successfully!")
