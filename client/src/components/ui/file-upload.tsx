import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { Button } from './button';

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  accept?: string;
  maxSize?: number;
  className?: string;
}

export function FileUpload({ onFileSelect, accept = '.pdf', maxSize = 5 * 1024 * 1024, className = '' }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    setError(null);
    
    if (file.size > maxSize) {
      setError(`File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`);
      return false;
    }
    
    if (accept && !accept.split(',').some(type => file.type.includes(type.trim().replace('.', '')))) {
      setError(`Please select a ${accept} file`);
      return false;
    }
    
    return true;
  };

  const handleFileSelect = (file: File | null) => {
    if (file && validateFile(file)) {
      setSelectedFile(file);
      onFileSelect(file);
    } else if (!file) {
      setSelectedFile(null);
      onFileSelect(null);
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setError(null);
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={className}>
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragOver
            ? 'border-primary bg-primary/5'
            : 'border-slate-300 hover:border-primary hover:bg-primary/5'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
        />
        
        {selectedFile ? (
          <div className="flex items-center justify-center space-x-2">
            <FileText className="h-8 w-8 text-primary" />
            <div className="text-left">
              <p className="text-sm font-medium text-slate-900">{selectedFile.name}</p>
              <p className="text-xs text-slate-500">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveFile();
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <>
            <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 mb-2">Drop PDF resume here or click to browse</p>
            <p className="text-sm text-slate-500">PDF files only, max {Math.round(maxSize / (1024 * 1024))}MB</p>
          </>
        )}
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
