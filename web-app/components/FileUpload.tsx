'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { BaseExample } from '@/lib/types';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

export interface FileUploadProps {
  onUpload?: (data: BaseExample[]) => void;
  onError?: (error: string) => void;
}

export function FileUpload({ onUpload, onError }: FileUploadProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      onError?.("No file selected");
      return;
    }

    try {
      const fileContent = await file.text();
      let parsedData: BaseExample[];

      if (file.name.endsWith('.json')) {
        parsedData = JSON.parse(fileContent);
      } else if (file.name.endsWith('.csv')) {
        // Basic CSV parsing - you might want to use a library like Papa Parse for more robust parsing
        const rows = fileContent.split('\n').map(row => row.split(','));
        const headers = rows[0];
        parsedData = rows.slice(1).map(row => {
          const entry: any = {};
          headers.forEach((header, index) => {
            entry[header.trim()] = row[index]?.trim();
          });
          return entry;
        });
      } else {
        throw new Error('Unsupported file format');
      }

      // Validate the data structure
      if (!Array.isArray(parsedData)) {
        parsedData = [parsedData];
      }

      // Basic validation of required fields
      parsedData.forEach((item, index) => {
        if (!item.context || !item.question || !item.correctAnswer) {
          throw new Error(`Invalid data structure at index ${index}. Missing required fields (context, question, or correctAnswer).`);
        }
      });

      onUpload?.(parsedData);
    } catch (error) {
      console.error('Error parsing file:', error);
      onError?.(error instanceof Error ? error.message : 'Error parsing file');
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsLoading(true);
    try {
      const file = acceptedFiles[0];
      const fileContent = await file.text();
      let parsedData: BaseExample[];

      if (file.name.endsWith('.json')) {
        parsedData = JSON.parse(fileContent);
      } else if (file.name.endsWith('.csv')) {
        // Basic CSV parsing - you might want to use a library like Papa Parse for more robust parsing
        const rows = fileContent.split('\n').map(row => row.split(','));
        const headers = rows[0];
        parsedData = rows.slice(1).map(row => {
          const entry: any = {};
          headers.forEach((header, index) => {
            entry[header.trim()] = row[index]?.trim();
          });
          return entry;
        });
      } else {
        throw new Error('Unsupported file format');
      }

      if (!Array.isArray(parsedData)) {
        parsedData = [parsedData];
      }

      // Basic validation of required fields
      parsedData.forEach((item, index) => {
        if (!item.context || !item.question || !item.correctAnswer) {
          throw new Error(`Invalid data structure at index ${index}. Missing required fields.`);
        }
      });

      onUpload?.(parsedData);
    } catch (error) {
      console.error('Error processing file:', error);
      onError?.(error instanceof Error ? error.message : 'Error processing file');
    } finally {
      setIsLoading(false);
    }
  }, [onUpload, onError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json'],
      'text/csv': ['.csv']
    },
    multiple: false
  });

  return (
    <div
      {...getRootProps()}
      className={`relative border-2 border-dashed rounded-lg transition-colors
        ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-muted-foreground/50'}`}
    >
      <input {...getInputProps()} />
      <div className="p-8 text-center">
        {isLoading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" />
            <p className="text-muted-foreground">Processing file...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              <Button variant="outline" disabled className="cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                Select File
              </Button>
            </div>
            <Alert>
              <AlertDescription>
                Drop your JSON or CSV file here, or click to select. File should contain context, questions, and correct answers.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>
    </div>
  );
} 