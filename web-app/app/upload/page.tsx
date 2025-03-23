'use client';

import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, X, FileText, Loader2 } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter(file => {
      const isValid = file.type === "application/json" || file.type === "text/csv";
      if (!isValid) {
        toast.error(`Invalid file type: ${file.name}. Only JSON and CSV files are supported.`);
      }
      return isValid;
    });
    setFiles(prev => [...prev, ...validFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json'],
      'text/csv': ['.csv']
    },
    noClick: true // Disable click on the entire dropzone area
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error("Please select files to upload");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      toast.success("Files uploaded successfully!");
      setFiles([]); // Clear files after successful upload
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload files');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container py-12">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl">Upload Test Data</CardTitle>
          <CardDescription className="text-lg">
            Upload your existing test scenarios or generate new ones
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div 
            {...getRootProps()} 
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors
              ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-200'}
              ${files.length > 0 ? 'border-primary/50' : ''}
            `}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-primary/10 rounded-full">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  {isDragActive ? 'Drop files here' : 'Drop your files here'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  or click to browse your computer
                </p>
                <Button 
                  size="lg" 
                  type="button" 
                  onClick={(e) => {
                    e.stopPropagation();
                    open(); // This will open the file dialog
                  }}
                >
                  Choose Files
                </Button>
              </div>
            </div>
          </div>

          {files.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium">Selected Files:</h4>
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div 
                    key={`${file.name}-${index}`}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">{file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(index)}
                      className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex justify-end pt-4">
                <Button 
                  onClick={handleUpload} 
                  size="lg"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Upload Files'
                  )}
                </Button>
              </div>
            </div>
          )}

          <div className="text-sm text-muted-foreground text-center">
            Supported formats: .json, .csv
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 