import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadProps {
  onUpload: (file: File) => void;
  maxSize?: number; // em MB
  accept?: string;
}

export function ImageUpload({
  onUpload,
  maxSize = 5,
  accept = "image/*",
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    // Validar tipo
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem válida");
      return;
    }

    // Validar tamanho
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      toast.error(`Arquivo muito grande. Máximo: ${maxSize}MB`);
      return;
    }

    // Criar preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
      setFileName(file.name);
      onUpload(file);
      toast.success("Imagem carregada com sucesso!");
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleClear = () => {
    setPreview(null);
    setFileName(null);
  };

  return (
    <div className="space-y-4">
      {preview ? (
        <div className="space-y-2">
          <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={handleClear}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">{fileName}</p>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
        >
          <ImageIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm font-medium mb-2">
            Arraste a imagem aqui ou clique para selecionar
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            Máximo {maxSize}MB
          </p>
          <input
            type="file"
            accept={accept}
            onChange={handleInputChange}
            className="hidden"
            id="image-upload"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => document.getElementById("image-upload")?.click()}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            Selecionar Imagem
          </Button>
        </div>
      )}

      <Alert>
        <AlertDescription className="text-xs">
          Formatos aceitos: JPG, PNG, GIF. Máximo {maxSize}MB.
        </AlertDescription>
      </Alert>
    </div>
  );
}
