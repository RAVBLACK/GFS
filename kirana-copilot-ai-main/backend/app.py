"""
Flask Backend for Invoice OCR Analysis
Uses local models - 100% FREE, no API keys!
Supports both image and PDF invoice analysis
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import io
from datetime import datetime
from PIL import Image
from pdf2image import convert_from_bytes

# Import OCR engine
from invoice_analyzer import InvoiceAnalyzer

app = Flask(__name__)
CORS(app)  # Allow requests from React frontend

# Initialize analyzer (loads model on startup)
print("🚀 Loading AI models... (this may take 1-2 minutes first time)")
analyzer = InvoiceAnalyzer()
print("✅ Models loaded successfully!")


@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify(
        {
            "status": "ok",
            "message": "Invoice OCR Backend Running",
            "model": "EasyOCR + Transformers",
            "formats": "Images (JPG, PNG) and PDFs"
        }
    )


def convert_pdf_to_images(pdf_base64):
    """
    Convert PDF base64 to list of PIL Images
    Handles multi-page PDFs by converting each page to an image
    """
    try:
        # Remove data URL prefix if present
        if "," in pdf_base64:
            pdf_base64 = pdf_base64.split(",")[1]

        # Decode base64 PDF
        pdf_data = base64.b64decode(pdf_base64)
        
        # Convert PDF pages to images
        images = convert_from_bytes(pdf_data, dpi=200)  # 200 DPI for better OCR
        
        print(f"   Converted PDF to {len(images)} page(s)")
        
        return images
    except Exception as e:
        print(f"   ❌ Error converting PDF: {e}")
        raise


@app.route("/analyze", methods=["POST"])
def analyze_invoices():
    """
    Analyze invoice images and PDFs and extract GST data
    Expects: { "images": ["base64_string1", "base64_string2", ...] }
    Returns: { "invoices": [...], "explanation": "..." }
    Supports both images and PDFs
    """
    try:
        data = request.json
        files = data.get("images", [])

        if not files:
            return jsonify({"error": "No files provided"}), 400

        all_invoices = []
        total_files = len(files)
        current_invoice_idx = 0

        for file_idx, base64_file in enumerate(files):
            print(f"\n📄 Processing file {file_idx + 1}/{total_files}...")
            
            try:
                # Prepare base64 data
                file_base64 = base64_file
                if "," in file_base64:
                    file_base64 = file_base64.split(",")[1]

                # Decode to check file type
                file_data = base64.b64decode(file_base64)
                
                # Check if it's a PDF by looking for PDF signature
                is_pdf = file_data[:4] == b'%PDF'
                
                if is_pdf:
                    print(f"   📄 Type: PDF - Converting to images...")
                    
                    try:
                        # Convert PDF pages to images
                        pdf_images = convert_pdf_to_images(file_base64)
                        
                        # Process each page as a separate invoice
                        for page_num, page_image in enumerate(pdf_images):
                            current_invoice_idx += 1
                            print(f"      Processing page {page_num + 1}/{len(pdf_images)}...")
                            
                            # Convert to RGB if needed
                            if page_image.mode != "RGB":
                                page_image = page_image.convert("RGB")
                            
                            # Analyze invoice
                            try:
                                invoice_data = analyzer.extract_invoice_data(page_image)
                                invoice_data["id"] = f"inv_{datetime.now().timestamp()}_{current_invoice_idx}"
                                all_invoices.append(invoice_data)
                                
                                print(f"      ✅ Extracted: {invoice_data['vendor']}")
                                print(f"         Confidence: {invoice_data['confidence']:.2f}")
                            except Exception as e:
                                print(f"      ❌ Analysis error: {e}")
                                all_invoices.append({
                                    "id": f"inv_{datetime.now().timestamp()}_{current_invoice_idx}",
                                    "vendor": "Analysis error",
                                    "gstin": "N/A",
                                    "invoiceNo": f"Page_{page_num + 1}",
                                    "date": datetime.now().strftime("%d-%m-%Y"),
                                    "taxableAmount": 0,
                                    "cgst": 0,
                                    "sgst": 0,
                                    "igst": 0,
                                    "total": 0,
                                    "confidence": 0.2,
                                })
                    except Exception as e:
                        print(f"   ❌ PDF conversion error: {e}")
                        current_invoice_idx += 1
                        all_invoices.append({
                            "id": f"inv_{datetime.now().timestamp()}_{current_invoice_idx}",
                            "vendor": "PDF conversion error",
                            "gstin": "N/A",
                            "invoiceNo": f"PDF_{file_idx + 1}",
                            "date": datetime.now().strftime("%d-%m-%Y"),
                            "taxableAmount": 0,
                            "cgst": 0,
                            "sgst": 0,
                            "igst": 0,
                            "total": 0,
                            "confidence": 0.1,
                        })
                
                else:
                    # Process as image
                    print(f"   🖼️  Type: Image - Processing...")
                    current_invoice_idx += 1
                    
                    try:
                        image_data = base64.b64decode(file_base64)
                        image = Image.open(io.BytesIO(image_data))

                        # Convert to RGB if needed
                        if image.mode != "RGB":
                            image = image.convert("RGB")

                        print(f"      Image size: {image.size}")
                        
                        # Analyze invoice
                        try:
                            invoice_data = analyzer.extract_invoice_data(image)
                            invoice_data["id"] = f"inv_{datetime.now().timestamp()}_{current_invoice_idx}"
                            all_invoices.append(invoice_data)

                            print(f"      ✅ Extracted: {invoice_data['vendor']}")
                            print(f"         Confidence: {invoice_data['confidence']:.2f}")

                        except Exception as e:
                            print(f"      ❌ Analysis error: {e}")
                            all_invoices.append({
                                "id": f"inv_{datetime.now().timestamp()}_{current_invoice_idx}",
                                "vendor": "Analysis error",
                                "gstin": "N/A",
                                "invoiceNo": f"Image_{file_idx + 1}",
                                "date": datetime.now().strftime("%d-%m-%Y"),
                                "taxableAmount": 0,
                                "cgst": 0,
                                "sgst": 0,
                                "igst": 0,
                                "total": 0,
                                "confidence": 0.2,
                            })
                    
                    except Exception as e:
                        print(f"   ❌ Error decoding image: {e}")
                        all_invoices.append({
                            "id": f"inv_{datetime.now().timestamp()}_{current_invoice_idx}",
                            "vendor": "Image decode error",
                            "gstin": "N/A",
                            "invoiceNo": f"Image_{file_idx + 1}",
                            "date": datetime.now().strftime("%d-%m-%Y"),
                            "taxableAmount": 0,
                            "cgst": 0,
                            "sgst": 0,
                            "igst": 0,
                            "total": 0,
                            "confidence": 0.1,
                        })
                        
            except Exception as e:
                print(f"   ❌ Error processing file: {e}")
                current_invoice_idx += 1
                all_invoices.append({
                    "id": f"inv_{datetime.now().timestamp()}_{current_invoice_idx}",
                    "vendor": "File processing error",
                    "gstin": "N/A",
                    "invoiceNo": f"File_{file_idx + 1}",
                    "date": datetime.now().strftime("%d-%m-%Y"),
                    "taxableAmount": 0,
                    "cgst": 0,
                    "sgst": 0,
                    "igst": 0,
                    "total": 0,
                    "confidence": 0.1,
                })

        # Generate summary
        high_conf = len([inv for inv in all_invoices if inv["confidence"] >= 0.9])
        med_conf = len([inv for inv in all_invoices if 0.7 <= inv["confidence"] < 0.9])
        low_conf = len([inv for inv in all_invoices if inv["confidence"] < 0.7])

        explanation = (
            f"Processed {len(all_invoices)} invoice(s) with local AI models. "
            f"{high_conf} high confidence, {med_conf} medium confidence, "
            f"{low_conf} need review."
        )

        return jsonify({"invoices": all_invoices, "explanation": explanation})

    except Exception as e:
        print(f"❌ Server error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route("/generate-gstr1", methods=["POST"])
def generate_gstr1():
    """
    Generate GSTR-1 report from invoice data
    Expects: { "invoices": [...] }
    Returns: { "summary": {...}, "csvData": "..." }
    """
    try:
        data = request.json
        invoices = data.get("invoices", [])

        if not invoices:
            return jsonify({"error": "No invoices provided"}), 400

        # Calculate summary
        summary = {
            "totalInvoices": len(invoices),
            "totalTaxableAmount": sum(inv["taxableAmount"] for inv in invoices),
            "totalCGST": sum(inv["cgst"] for inv in invoices),
            "totalSGST": sum(inv["sgst"] for inv in invoices),
            "totalIGST": sum(inv["igst"] for inv in invoices),
            "totalTax": 0,
            "totalAmount": 0,
        }

        summary["totalTax"] = (
            summary["totalCGST"] + summary["totalSGST"] + summary["totalIGST"]
        )
        summary["totalAmount"] = summary["totalTaxableAmount"] + summary["totalTax"]

        # Generate CSV
        csv_header = "GSTIN,Invoice No,Date,Taxable Amount,CGST,SGST,IGST,Total\n"
        csv_rows = []
        for inv in invoices:
            row = (
                f"{inv['gstin']},{inv['invoiceNo']},{inv['date']},"
                f"{inv['taxableAmount']},{inv['cgst']},{inv['sgst']},"
                f"{inv['igst']},{inv['total']}"
            )
            csv_rows.append(row)

        csv_data = csv_header + "\n".join(csv_rows)

        return jsonify({"summary": summary, "csvData": csv_data})

    except Exception as e:
        print(f"❌ GSTR-1 generation error: {e}")
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    print("\n" + "=" * 50)
    print("🚀 Invoice OCR Backend Server")
    print("=" * 50)
    print("✅ Using LOCAL AI models (no API keys needed!)")
    print("✅ 100% FREE - no billing ever")
    print("✅ Models: EasyOCR + Transformers")
    print("✅ Supports: Images (JPG, PNG) and PDFs")
    print("=" * 50 + "\n")

    # Run server
    app.run(host="0.0.0.0", port=5000, debug=True)
