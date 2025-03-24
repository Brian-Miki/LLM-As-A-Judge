'use client';

import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, X, FileText, Loader2, Wand2, ChevronDown, ChevronUp } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedScenarios, setUploadedScenarios] = useState<any>(null);
  const [generatedScenarios, setGeneratedScenarios] = useState<any[]>([]);
  const [expandedCards, setExpandedCards] = useState<Record<number, boolean>>({});

  const toggleCard = (index: number) => {
    setExpandedCards(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

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
      toast.success("File uploaded successfully!");
      setFiles([]); // Clear files after successful upload
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to parse JSON file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerate = async () => {
    if (!uploadedScenarios) {
      toast.error("Please upload a scenarios file first");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(uploadedScenarios),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Generation failed');
      }

      setGeneratedScenarios(data.scenarios);

      // Create a new file with combined scenarios
      const combinedScenarios = {
        scenarios: [...uploadedScenarios.scenarios, ...data.scenarios],
        metadata: {
          ...uploadedScenarios.metadata,
          scenario_count: uploadedScenarios.scenarios.length + data.scenarios.length,
          generated_at: new Date().toISOString()
        }
      };

      // Create and trigger download of the new file
      const blob = new Blob([JSON.stringify(combinedScenarios, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'generated-scenarios.json';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("New scenarios generated successfully!");
    } catch (error) {
      console.error('Generation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate scenarios');
    } finally {
      setIsGenerating(false);
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

          {uploadedScenarios && (
            <div className="pt-6 border-t">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h4 className="font-medium">Generate More Scenarios</h4>
                  <p className="text-sm text-muted-foreground">
                    {isGenerating 
                      ? "This may take 15-30 seconds as we use AI to generate high-quality scenarios..."
                      : "Create additional test scenarios based on your examples"
                    }
                  </p>
                </div>
                <Button
                  onClick={handleGenerate}
                  size="lg"
                  disabled={isGenerating}
                  className="gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      Generate More
                    </>
                  )}
                </Button>
              </div>

              {generatedScenarios.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-medium">Generated Scenarios:</h4>
                  <div className="space-y-4">
                    {generatedScenarios.map((scenario, index) => (
                      <Card key={index} className="p-4">
                        <div 
                          className="flex items-center justify-between cursor-pointer"
                          onClick={() => toggleCard(index)}
                        >
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <h5 className="font-medium text-lg">{scenario?.title}</h5>
                              <span className="text-sm text-muted-foreground">ID: {scenario?.id}</span>
                            </div>
                            {!expandedCards[index] && (
                              <p className="text-sm text-muted-foreground line-clamp-1">{scenario?.description}</p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="ml-4 h-8 w-8 hover:bg-muted"
                          >
                            {expandedCards[index] ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </div>

                        {expandedCards[index] && (
                          <div className="space-y-2 mt-4">
                            <p className="text-sm text-muted-foreground">{scenario?.description}</p>
                            <div className="mt-4 space-y-3">
                              <div>
                                <h6 className="text-sm font-medium mb-1">Customer Message:</h6>
                                <p className="text-sm bg-muted p-2 rounded-md">
                                  {scenario?.input?.customer_message}
                                </p>
                              </div>
                              <div>
                                <h6 className="text-sm font-medium mb-1">Expected Response:</h6>
                                <div className="text-sm space-y-2">
                                  <div>
                                    <span className="font-medium">Tone:</span> {scenario?.expected_response?.tone}
                                  </div>
                                  <div>
                                    <span className="font-medium">Key Points:</span>
                                    <ul className="list-disc list-inside pl-2">
                                      {scenario?.expected_response?.key_points?.map((point: string, i: number) => (
                                        <li key={i}>{point}</li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div>
                                    <span className="font-medium">Required Info:</span>
                                    <ul className="list-disc list-inside pl-2">
                                      {scenario?.expected_response?.required_info?.map((info: string, i: number) => (
                                        <li key={i}>{info}</li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                </div>
              )}
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