import { useCallback, useState } from "react";
import { Upload, X, FileText } from "lucide-react";

interface FileUploadProps {
  accept?: string;
  maxSizeMB?: number;
  label?: string;
  value?: string;
  onChange: (file: File | null) => void;
}

export default function FileUpload({ accept = "image/*", maxSizeMB = 5, label = "Upload file", value, onChange }: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const [error, setError] = useState("");

  const handleFile = useCallback((file: File) => {
    setError("");
    if (file.size > maxSizeMB * 1024 * 1024) { setError(`File too large (max ${maxSizeMB}MB)`); return; }
    if (file.type.startsWith("image/")) setPreview(URL.createObjectURL(file));
    else setPreview(null);
    onChange(file);
  }, [maxSizeMB, onChange]);

  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if(f) handleFile(f); };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if(f) handleFile(f); };
  const handleClear = () => { setPreview(null); setError(""); onChange(null); };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
          ${dragOver ? "border-primary-400 bg-primary-50" : "border-gray-300 hover:border-gray-400"}
          ${preview ? "p-2" : ""}`}
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById("file-upload-input")?.click()}
      >
        <input id="file-upload-input" type="file" className="hidden" accept={accept} onChange={handleChange} />
        {preview ? (
          <div className="relative">
            {accept.startsWith("image") ? <img src={preview} alt="Preview" className="max-h-40 mx-auto rounded" /> : <FileText size={48} className="mx-auto text-gray-400" />}
            <button type="button" onClick={e => { e.stopPropagation(); handleClear(); }} className="absolute top-1 right-1 p-1 bg-white rounded-full shadow hover:bg-red-50"><X size={14} className="text-red-500"/></button>
          </div>
        ) : (
          <div className="text-gray-400">
            <Upload size={28} className="mx-auto mb-2" />
            <p className="text-sm">Drag & drop or click to browse</p>
            <p className="text-xs mt-0.5">{accept.replace("/*","")} up to {maxSizeMB}MB</p>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
