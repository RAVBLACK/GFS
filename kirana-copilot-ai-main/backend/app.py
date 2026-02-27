"""
Flask Backend for Invoice OCR Analysis
Uses Hugging Face models locally - 100% FREE, no API keys!
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import io
from datetime import datetime
from PIL import Image

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
        }
    )


@app.route("/analyze", methods=["POST"])
def analyze_invoices():
    """
    Analyze invoice images and extract GST data
    Expects: { "images": ["base64_string1", "base64_string2", ...] }
    Returns: { "invoices": [...], "explanation": "..." }
    """
    try:
        data = request.json
        images = data.get("images", [])

        if not images:
            return jsonify({"error": "No images provided"}), 400

        all_invoices = []

        for idx, base64_image in enumerate(images):
            print(f"\n📄 Processing invoice {idx + 1}/{len(images)}...")

            # Decode base64 image
            try:
                # Remove data URL prefix if present
                if "," in base64_image:
                    base64_image = base64_image.split(",")[1]

                image_data = base64.b64decode(base64_image)
                image = Image.open(io.BytesIO(image_data))

                # Convert to RGB if needed
                if image.mode != "RGB":
                    image = image.convert("RGB")

                print(f"   Image size: {image.size}")

            except Exception as e:
                print(f"   ❌ Error decoding image: {e}")
                all_invoices.append(
                    {
                        "id": f"inv_{datetime.now().timestamp()}_{idx}",
                        "vendor": "Image decode error",
                        "gstin": "N/A",
                        "invoiceNo": f"Invoice_{idx + 1}",
                        "date": datetime.now().strftime("%d-%m-%Y"),
                        "taxableAmount": 0,
                        "cgst": 0,
                        "sgst": 0,
                        "igst": 0,
                        "total": 0,
                        "confidence": 0.1,
                    }
                )
                continue

            # Analyze invoice
            try:
                invoice_data = analyzer.extract_invoice_data(image)
                invoice_data["id"] = f"inv_{datetime.now().timestamp()}_{idx}"
                all_invoices.append(invoice_data)

                print(f"   ✅ Extracted: {invoice_data['vendor']}")
                print(f"   Confidence: {invoice_data['confidence']:.2f}")

            except Exception as e:
                print(f"   ❌ Analysis error: {e}")
                all_invoices.append(
                    {
                        "id": f"inv_{datetime.now().timestamp()}_{idx}",
                        "vendor": "Analysis error",
                        "gstin": "N/A",
                        "invoiceNo": f"Invoice_{idx + 1}",
                        "date": datetime.now().strftime("%d-%m-%Y"),
                        "taxableAmount": 0,
                        "cgst": 0,
                        "sgst": 0,
                        "igst": 0,
                        "total": 0,
                        "confidence": 0.2,
                    }
                )

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
    print("✅ Models: EasyOCR + Hugging Face Transformers")
    print("=" * 50 + "\n")

    # Run server
    app.run(host="0.0.0.0", port=5000, debug=True)
