"""
Invoice Analyzer - Uses EasyOCR + Smart Parsing
No API keys needed - runs completely locally!
"""

import re
from datetime import datetime
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
        self.reader = easyocr.Reader(["en", "hi"], gpu=False)
        print("   ✅ OCR model loaded!")

    def extract_text(self, image):
        """Extract text from image using EasyOCR"""
        # Convert PIL Image to numpy array
        img_array = np.array(image)

        # Perform OCR
        results = self.reader.readtext(img_array, detail=1)

        # Extract text and positions
        extracted = {
            "full_text": " ".join([text for (bbox, text, conf) in results]),
            "lines": [(text, conf) for (bbox, text, conf) in results],
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
        full_text = ocr_result["full_text"]
        lines = ocr_result["lines"]

        print(f"      Extracted {len(lines)} text lines")
        print("      === EXTRACTED TEXT DEBUG (First 300 chars) ===")
        print(full_text[:300] if len(full_text) > 300 else full_text)
        print("      === EXTRACTED TEXT DEBUG (Last 1000 chars - where totals are) ===")
        print(full_text[-1000:] if len(full_text) > 1000 else full_text)
        print("      === END DEBUG ===")

        # Step 2: Parse invoice data using patterns
        # First get the total amount (most reliable)
        total = self._extract_amount(full_text, "total")

        # Try to extract total tax from TOTAL row (usually shows: TOTAL [disc] [tax] [amount])
        total_tax_from_row = self._extract_total_tax_from_row(full_text)

        # Try individual tax extractions
        cgst = self._extract_amount(full_text, "cgst")
        sgst = self._extract_amount(full_text, "sgst")
        igst = self._extract_amount(full_text, "igst")

        # Calculate total tax
        total_tax = cgst + sgst + igst

        # If individual taxes not found but we have total tax from TOTAL row, split it
        if total_tax == 0 and total_tax_from_row > 0:
            # Assume CGST = SGST when IGST is 0 (intra-state transaction)
            total_tax = total_tax_from_row
            cgst = total_tax / 2
            sgst = total_tax / 2
            print(
                f"      Using TOTAL row tax: {total_tax_from_row}, split into CGST={cgst}, SGST={sgst}"
            )

        # Calculate taxable amount
        if total > 0 and total_tax > 0:
            taxable = total - total_tax
        else:
            taxable = self._extract_amount(full_text, "taxable")

        print(
            f"      Extracted amounts - Taxable: {taxable}, CGST: {cgst}, SGST: {sgst}, IGST: {igst}, Total: {total}, Total Tax: {total_tax}"
        )

        invoice_data = {
            "vendor": self._extract_vendor(full_text, lines),
            "gstin": self._extract_gstin(full_text),
            "invoiceNo": self._extract_invoice_number(full_text),
            "date": self._extract_date(full_text),
            "taxableAmount": round(taxable, 2),
            "cgst": round(cgst, 2),
            "sgst": round(sgst, 2),
            "igst": round(igst, 2),
            "total": round(total, 2),
            "confidence": 0.5,  # Will be updated below
        }

        # Step 4: Calculate confidence
        invoice_data["confidence"] = self._calculate_confidence(
            full_text, lines, invoice_data
        )

        print(f"      Final result: {invoice_data}")

        return invoice_data

    def _extract_total_tax_from_row(self, text):
        """Extract total tax from TOTAL row pattern: TOTAL [disc] [tax] [amount]"""
        # Search in original text (not uppercase) to preserve Devanagari characters
        # Look in last 1500 chars where TOTAL row usually is
        search_text = text[-1500:] if len(text) > 1500 else text

        print("      DEBUG: Searching for TOTAL row in last part of text...")

        # Look for pattern: TOTAL followed by 2-3 numbers (disc, tax, amount)
        # Handle multiple separators: र (Devanagari), ₹, RS, or just spaces
        patterns = [
            # Pattern 1: TOTAL separator num separator num num (with Devanagari र)
            r"TOTAL[\s]+[^\d\s]*[\s]*([\d,]+\.?\d*)[\s]+[^\d\s]*[\s]*([\d,]+\.?\d*)[\s]+([\d,]+\.?\d*)",
            # Pattern 2: TOTAL num num num (just spaces)
            r"TOTAL[\s]+([\d,]+\.?\d*)[\s]+([\d,]+\.?\d*)[\s]+([\d,]+\.?\d*)",
            # Pattern 3: More flexible - any 3 numbers after TOTAL within 100 chars
            r"TOTAL[^0-9]{0,30}([\d,]+\.?\d*)[^0-9]{1,20}([\d,]+\.?\d*)[^0-9]{1,20}([\d,]+\.?\d*)",
        ]

        for i, pattern in enumerate(patterns):
            match = re.search(pattern, search_text, re.IGNORECASE)
            if match:
                numbers = [match.group(j) for j in range(1, len(match.groups()) + 1)]
                print(f"      DEBUG: Pattern {i + 1} matched! Found numbers: {numbers}")
                # Convert to floats
                try:
                    amounts = [float(n.replace(",", "")) for n in numbers if n]
                    print(f"      DEBUG: Parsed amounts: {amounts}")
                    # The largest number is usually the total amount
                    # The smallest is usually discount
                    # The middle one is tax
                    amounts_sorted = sorted(amounts)
                    if len(amounts) >= 3:
                        # Middle value is likely the tax (should be smallest or middle)
                        # Tax should be much smaller than total
                        total_amount = amounts_sorted[-1]  # Largest
                        discount = amounts_sorted[0]  # Smallest
                        tax = amounts_sorted[1]  # Middle

                        print(
                            f"      DEBUG: Sorted - Discount:{discount}, Tax:{tax}, Total:{total_amount}"
                        )

                        # Sanity check: tax should be less than 50% of total and more than discount
                        if tax < total_amount * 0.5 and tax > 0:
                            print(f"      DEBUG: Found tax from TOTAL row: {tax}")
                            return tax
                    elif len(amounts) == 2:
                        # First is likely tax, second is amount
                        return amounts[0] if amounts[0] < amounts[1] else 0
                except (ValueError, IndexError) as e:
                    print(f"      DEBUG: Error parsing amounts: {e}")
                    continue

        print("      DEBUG: No tax found in TOTAL row")
        return 0.0

    def _extract_vendor(self, text, lines):
        """Extract vendor/supplier name (usually at top)"""
        # Take first high-confidence line that's not too short
        for line_text, conf in lines[:5]:  # Check first 5 lines
            if len(line_text) > 3 and conf > 0.5:
                # Skip if it looks like invoice number or date
                if not re.search(r"\d{4,}|invoice|bill|date", line_text, re.I):
                    return line_text.strip()
        return "N/A"

    def _extract_gstin(self, text):
        """Extract GSTIN number (format: 22AAAAA0000A1Z5)"""
        # GSTIN pattern: 2 digits + 10 alphanumeric + 3 alphanumeric
        pattern = r"\b\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}\b"
        match = re.search(pattern, text.upper())
        if match:
            return match.group(0)

        # Alternative: look for text near "GSTIN" keyword
        gstin_pattern = r"GSTIN[:\s]*([A-Z0-9]{15})"
        match = re.search(gstin_pattern, text.upper())
        if match:
            return match.group(1)

        return "N/A"

    def _extract_invoice_number(self, text):
        """Extract invoice number"""
        # Look for patterns like "Invoice No: 123", "Bill No: 456"
        patterns = [
            r"invoice\s*(?:no\.?|number|#)[:\s]*([A-Z0-9/-]+)",
            r"bill\s*(?:no\.?|number|#)[:\s]*([A-Z0-9/-]+)",
            r"voucher\s*(?:no\.?|number)[:\s]*([A-Z0-9/-]+)",
        ]

        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1).strip()

        # Fallback: find any invoice-like number
        match = re.search(r"\b[A-Z]{2,4}[/-]?\d{4,}\b", text)
        if match:
            return match.group(0)

        return f"INV{datetime.now().strftime('%Y%m%d%H%M%S')}"

    def _extract_date(self, text):
        """Extract invoice date"""
        # Common date formats in India
        date_patterns = [
            r"\b(\d{1,2})[/-](\d{1,2})[/-](\d{4})\b",  # DD/MM/YYYY or DD-MM-YYYY
            r"\b(\d{1,2})[/-](\d{1,2})[/-](\d{2})\b",  # DD/MM/YY
            r"\b(\d{4})[/-](\d{1,2})[/-](\d{1,2})\b",  # YYYY/MM/DD
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
        return datetime.now().strftime("%d-%m-%Y")

    def _extract_amount(self, text, field_type):
        """Extract monetary amounts (taxable, CGST, SGST, IGST, total)"""
        # Keep original text for flexible matching
        upper_text = text.upper()

        # For totals, search in the LAST 2000 chars (where summary section is)
        # For other fields, search in the last 3000 chars
        if field_type == "total":
            search_text = upper_text[-2000:] if len(upper_text) > 2000 else upper_text
        elif field_type in ["cgst", "sgst", "igst", "taxable"]:
            search_text = upper_text[-3000:] if len(upper_text) > 3000 else upper_text
        else:
            search_text = upper_text

        # Patterns for different fields (more specific for invoice formats)
        patterns = {
            "taxable": [
                r"TAXABLE\s*VALUE[:\s]*(?:RS\.?|₹|INR)?\s*([\d,]+\.?\d*)",
                r"(?:SUB|GROSS)\s*TOTAL[:\s]*(?:RS\.?|₹|INR)?\s*([\d,]+\.?\d*)",
                r"BASIC\s*(?:AMOUNT|VALUE)[:\s]*(?:RS\.?|₹|INR)?\s*([\d,]+\.?\d*)",
            ],
            "cgst": [
                r"CGST[\s]*AMOUNT[:\s]*(?:RS\.?|₹|INR)?\s*([\d,]+\.?\d*)",
                r"CGST[:\s]*(?:RS\.?|₹|INR)?\s*([\d,]+\.?\d*)",
                r"C\.?G\.?S\.?T[:\s]*(?:RS\.?|₹|INR)?\s*([\d,]+\.?\d*)",
            ],
            "sgst": [
                r"SGST[\s]*AMOUNT[:\s]*(?:RS\.?|₹|INR)?\s*([\d,]+\.?\d*)",
                r"SGST[:\s]*(?:RS\.?|₹|INR)?\s*([\d,]+\.?\d*)",
                r"S\.?G\.?S\.?T[:\s]*(?:RS\.?|₹|INR)?\s*([\d,]+\.?\d*)",
            ],
            "igst": [
                r"IGST[\s]*AMOUNT[:\s]*(?:RS\.?|₹|INR)?\s*([\d,]+\.?\d*)",
                r"IGST[:\s]*(?:RS\.?|₹|INR)?\s*([\d,]+\.?\d*)",
                r"I\.?G\.?S\.?T[:\s]*(?:RS\.?|₹|INR)?\s*([\d,]+\.?\d*)",
            ],
            "total": [
                r"BALANCE\s*AMOUNT[:\s]*(?:RS\.?|₹|INR)?\s*([\d,]+\.?\d*)",
                r"(?:GRAND|FINAL|NET)\s*TOTAL[:\s]*(?:RS\.?|₹|INR)?\s*([\d,]+\.?\d*)",
                r"TOTAL\s*(?:AMOUNT|PAYABLE)[:\s]*(?:RS\.?|₹|INR)?\s*([\d,]+\.?\d*)",
                r"AMOUNT\s*PAYABLE[:\s]*(?:RS\.?|₹|INR)?\s*([\d,]+\.?\d*)",
            ],
        }

        # Try each pattern in the search_text (last part of invoice)
        for pattern in patterns.get(field_type, []):
            # Search with DOTALL to handle line breaks
            matches = list(re.finditer(pattern, search_text, re.DOTALL))

            # Take the last match (usually the final calculated value)
            if matches:
                match = matches[-1]
                amount_str = match.group(1).replace(",", "").replace(" ", "").strip()
                try:
                    amount = float(amount_str)
                    # Sanity check: amounts should be reasonable (0.01 to 10 crore)
                    if 0.01 <= amount < 100000000:
                        return amount
                except (ValueError, IndexError):
                    continue

        # Fallback: Look for any number after the keyword in search_text
        keyword_map = {
            "taxable": ["TAXABLE VALUE", "TAXABLE", "SUB TOTAL", "SUBTOTAL"],
            "cgst": ["CGST", "C.G.S.T", "C G S T"],
            "sgst": ["SGST", "S.G.S.T", "S G S T"],
            "igst": ["IGST", "I.G.S.T", "I G S T"],
            "total": ["BALANCE AMOUNT", "GRAND TOTAL", "TOTAL", "AMOUNT PAYABLE"],
        }

        for keyword in keyword_map.get(field_type, []):
            idx = search_text.find(keyword)
            if idx != -1:
                # Search in next 100 characters
                search_zone = search_text[idx : idx + 100]
                # Find all numbers in this zone
                numbers = re.findall(r"([\d,]+\.?\d+)", search_zone)
                for num_str in numbers:
                    try:
                        amount = float(num_str.replace(",", ""))
                        if 0.01 <= amount < 100000000:
                            return amount
                    except ValueError:
                        continue

        return 0.0

    def _calculate_confidence(self, text, lines, invoice_data):
        """Calculate confidence score based on extracted data quality"""
        score = 0.5  # Base score

        # Check for key invoice elements
        if re.search(r"\bGSTIN\b", text, re.IGNORECASE):
            score += 0.15

        if re.search(r"\binvoice|bill\b", text, re.IGNORECASE):
            score += 0.1

        if re.search(r"\d{2}[/-]\d{2}[/-]\d{2,4}", text):  # Date found
            score += 0.1

        if re.search(r"CGST|SGST|IGST", text, re.IGNORECASE):
            score += 0.1

        # Boost score if we extracted actual amounts
        if invoice_data.get("total", 0) > 0:
            score += 0.1

        if invoice_data.get("taxableAmount", 0) > 0:
            score += 0.1

        if invoice_data.get("gstin", "N/A") != "N/A":
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
if __name__ == "__main__":
    print("Testing InvoiceAnalyzer...")
    analyzer = InvoiceAnalyzer()
    print("✅ Analyzer initialized successfully!")
