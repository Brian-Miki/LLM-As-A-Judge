'use client';

import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, X, FileText, Loader2, Wand2, ChevronDown, ChevronUp } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { CompanyConfiguration } from "@/types/config";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedScenarios, setUploadedScenarios] = useState<any>(null);
  const router = useRouter();

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
    noClick: true
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
    try {
      const file = files[0]; // For now, just handle the first file
      const content = await file.text();
      const jsonData = JSON.parse(content);
      setUploadedScenarios(jsonData);

      // Analyze the scenarios
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jsonData),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze scenarios');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Analysis failed');
      }

      // Store both the scenarios and the suggested configuration
      localStorage.setItem('uploadedScenarios', JSON.stringify(jsonData));
      localStorage.setItem('suggestedConfiguration', JSON.stringify(data.configuration));
      
      toast.success("Scenarios analyzed successfully! Redirecting to configuration...");
      
      // Use window.location for a full page reload
      window.location.href = '/configuration';
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process file');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Upload Test Scenarios</CardTitle>
          <CardDescription className="text-lg">
            Start by uploading your existing scenarios to help us understand your needs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-sm text-muted-foreground text-center mb-6">
            We'll analyze your scenarios to suggest an optimal configuration for your AI agent
          </div>
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
                    open();
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
              <div className="flex justify-end gap-3 pt-4">
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