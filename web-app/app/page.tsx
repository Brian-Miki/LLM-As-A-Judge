'use client';

import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { DataPreview } from '@/components/DataPreview';
import { BaseExample, HallucinationExample } from '@/lib/types';
import { toast } from 'sonner';

export default function Home() {
  const [examples, setExamples] = useState<BaseExample[]>([]);
  const [hallucinations, setHallucinations] = useState<HallucinationExample[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleUpload = (uploadedData: BaseExample[]) => {
    setExamples(uploadedData);
    setHallucinations([]); // Reset hallucinations when new data is uploaded
    toast.success(`Successfully loaded ${uploadedData.length} examples`);
  };

  const handleError = (error: string) => {
    toast.error(error);
  };

  const handleGenerateHallucination = async (example: BaseExample) => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(example),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate variations');
      }

      const data = await response.json();
      setHallucinations(prev => [...prev, ...data.variations]);
      toast.success('Successfully generated variations');
    } catch (error) {
      toast.error('Failed to generate variations: ' + (error as Error).message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-2 mb-8">
          <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">
            LLM Judge Data Creator
          </h1>
          <p className="text-muted-foreground">
            Upload your examples and generate hallucination variations to test LLM judge evaluation.
          </p>
        </div>

        <FileUpload onUpload={handleUpload} onError={handleError} />
        <DataPreview 
          data={examples} 
          hallucinations={hallucinations}
          onGenerateHallucination={!isGenerating ? handleGenerateHallucination : undefined}
        />
      </div>
    </main>
  );
}
