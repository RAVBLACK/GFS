import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Camera, ImagePlus, X, ArrowLeft, Sparkles, File } from "lucide-react";
import LoadingScreen from "@/components/LoadingScreen";
import { processInvoices } from "@/services/api";
import { toast } from "sonner";

interface UploadedFile {
  id: string;
  name: string;
  preview: string;
  file: File;
  type: 'image' | 'pdf';
}

const UploadInvoice = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [processing, setProcessing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'image' | 'pdf' = 'image') => {
    const selected = e.target.files;
    if (!selected) return;
    const newFiles = Array.from(selected).map((f) => ({
      id: `file_${Date.now()}_${Math.random()}`,
      name: f.name,
      preview: fileType === 'pdf' ? 'pdf' : URL.createObjectURL(f),
      file: f,
      type: fileType,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleAnalyze = async () => {
    if (files.length === 0) {
      toast.error("Please upload at least one invoice");
      return;
    }

    setProcessing(true);
    try {
      // Extract File objects from uploaded files
      const fileObjects = files.map(f => f.file);
      
      // Call OpenAI API to analyze invoices
      const result = await processInvoices(fileObjects);
      
      toast.success(`Successfully analyzed ${result.invoices.length} invoice(s)!`);
      
      // Navigate to results page with the analysis data
      navigate("/results", { state: result });
    } catch (error) {
      console.error("Error analyzing invoices:", error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : "Failed to analyze invoices. Please check your API key and try again."
      );
      setProcessing(false);
    }
  };

  if (processing) return <LoadingScreen message="🔍 AI is reading your invoices..." />;

  return (
    <div className="min-h-screen flex flex-col px-6 pt-8 pb-24 max-w-lg mx-auto animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-primary font-semibold text-sm mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-foreground">Upload Invoices</h1>
        <p className="text-sm text-muted-foreground">Take photos or select from gallery</p>
      </div>

      {/* Upload buttons */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => handleFileChange(e, 'image')}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFileChange(e, 'image')}
        />
        <input
          ref={pdfInputRef}
          type="file"
          accept=".pdf,application/pdf"
          multiple
          className="hidden"
          onChange={(e) => handleFileChange(e, 'pdf')}
        />
        <button
          onClick={() => cameraInputRef.current?.click()}
          className="flex flex-col items-center gap-2 p-6 bg-card border-2 border-dashed border-primary/30 rounded-xl hover:border-primary transition-colors"
        >
          <Camera className="w-8 h-8 text-primary" />
          <span className="text-sm font-semibold text-foreground">Camera</span>
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center gap-2 p-6 bg-card border-2 border-dashed border-secondary/30 rounded-xl hover:border-secondary transition-colors"
        >
          <ImagePlus className="w-8 h-8 text-secondary" />
          <span className="text-sm font-semibold text-foreground">Gallery</span>
        </button>
        <button
          onClick={() => pdfInputRef.current?.click()}
          className="flex flex-col items-center gap-2 p-6 bg-card border-2 border-dashed border-blue-500/30 rounded-xl hover:border-blue-500 transition-colors"
        >
          <File className="w-8 h-8 text-blue-500" />
          <span className="text-sm font-semibold text-foreground">PDF</span>
        </button>
      </div>

      {/* Uploaded files */}
      {files.length > 0 && (
        <div className="space-y-3 mb-6">
          <p className="text-sm font-bold text-foreground">{files.length} file(s) added</p>
          <div className="grid grid-cols-3 gap-2">
            {files.map((f) => (
              <div key={f.id} className="relative rounded-xl overflow-hidden aspect-square border border-border bg-card flex items-center justify-center">
                {f.type === 'pdf' ? (
                  <div className="flex flex-col items-center gap-1">
                    <File className="w-6 h-6 text-blue-500" />
                    <span className="text-xs text-center text-muted-foreground px-1 line-clamp-2">{f.name}</span>
                  </div>
                ) : (
                  <img src={f.preview} alt={f.name} className="w-full h-full object-cover" />
                )}
                <button
                  onClick={() => removeFile(f.id)}
                  className="absolute top-1 right-1 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analyze button */}
      {files.length > 0 && (
        <Button
          onClick={handleAnalyze}
          size="lg"
          className="w-full h-14 text-lg font-bold rounded-xl gap-2"
        >
          <Sparkles className="w-5 h-5" /> Give Analysis
        </Button>
      )}

      {files.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground text-center text-sm">
            📸 Take a photo or select from gallery.<br />
            📄 Or upload a PDF file.<br />
            We'll read the GST details for you!
          </p>
        </div>
      )}
    </div>
  );
};

export default UploadInvoice;
