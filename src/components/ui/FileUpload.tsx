import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Film } from 'lucide-react';
import { Button } from './button';
import { toast } from 'sonner';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  accept?: string;
  maxSize?: number; // em bytes
  label?: string;
  fileType?: 'image' | 'video' | 'any';
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileUpload,
  accept = 'image/*,video/*',
  maxSize = 5 * 1024 * 1024, // 5MB por padrão
  label = 'Arraste e solte um arquivo ou clique para selecionar',
  fileType = 'any',
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const validateFile = (file: File): boolean => {
    // Verificar tamanho
    if (file.size > maxSize) {
      toast.error(`O arquivo é muito grande. Tamanho máximo: ${maxSize / (1024 * 1024)}MB`);
      return false;
    }

    // Verificar tipo
    if (fileType === 'image' && !file.type.startsWith('image/')) {
      toast.error('Por favor, selecione um arquivo de imagem válido');
      return false;
    }

    if (fileType === 'video' && !file.type.startsWith('video/')) {
      toast.error('Por favor, selecione um arquivo de vídeo válido');
      return false;
    }

    return true;
  };

  const processFile = (file: File) => {
    if (!validateFile(file)) return;

    setSelectedFile(file);
    onFileUpload(file);

    // Criar preview
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else if (file.type.startsWith('video/')) {
      setPreview('video');
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        className="hidden"
      />

      {!selectedFile ? (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragging ? 'border-primary bg-primary/10' : 'border-muted-foreground/20 hover:border-primary/50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground mb-1">{label}</p>
          <p className="text-xs text-muted-foreground/70">
            Tamanho máximo: {maxSize / (1024 * 1024)}MB
          </p>
        </div>
      ) : (
        <div className="border rounded-lg p-4 relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 rounded-full bg-background/80 hover:bg-destructive/90 hover:text-white"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>

          {preview ? (
            preview === 'video' ? (
              <div className="flex items-center justify-center p-4 bg-muted rounded-md">
                <Film className="h-8 w-8 mr-2 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{selectedFile.name}</span>
              </div>
            ) : (
              <div className="relative aspect-video w-full overflow-hidden rounded-md">
                <img
                  src={preview}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
              </div>
            )
          ) : (
            <div className="flex items-center justify-center p-4 bg-muted rounded-md">
              <ImageIcon className="h-8 w-8 mr-2 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{selectedFile.name}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 