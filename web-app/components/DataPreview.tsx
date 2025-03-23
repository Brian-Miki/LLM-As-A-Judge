'use client';

import { BaseExample, HallucinationExample } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wand2 } from "lucide-react";

interface DataPreviewProps {
  data: BaseExample[];
  onGenerateHallucination?: (example: BaseExample) => void;
  hallucinations?: HallucinationExample[];
}

export function DataPreview({ data, onGenerateHallucination, hallucinations = [] }: DataPreviewProps) {
  if (!data.length) {
    return null;
  }

  // Group hallucinations by original example
  const hallucinationsByQuestion = hallucinations.reduce((acc, h) => {
    const key = `${h.question}-${h.context}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(h);
    return acc;
  }, {} as Record<string, HallucinationExample[]>);

  return (
    <div className="mt-8 space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-4">Base Examples</h2>
        <div className="space-y-6">
          {data.map((item, index) => {
            const key = `${item.question}-${item.context}`;
            const variations = hallucinationsByQuestion[key] || [];
            
            return (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>Example {index + 1}</CardTitle>
                      <CardDescription className="mt-2">Context</CardDescription>
                      <p className="text-muted-foreground mt-1">{item.context}</p>
                    </div>
                    {onGenerateHallucination && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onGenerateHallucination(item)}
                      >
                        <Wand2 className="h-4 w-4 mr-2" />
                        Generate Variations
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Question</h4>
                    <p className="text-muted-foreground">{item.question}</p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Correct Answer</h4>
                    <p className="text-muted-foreground">{item.correctAnswer}</p>
                  </div>

                  {variations.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">Generated Variations</h4>
                      <div className="space-y-3">
                        {variations.map((variation, vIndex) => (
                          <Card key={vIndex} className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <Badge variant={
                                variation.type === 'original' ? 'default' :
                                variation.type === 'hallucination' ? 'destructive' : 'secondary'
                              }>
                                {variation.type}
                              </Badge>
                              {variation.score && (
                                <Badge variant={variation.score.score > 0.5 ? 'default' : 'destructive'}>
                                  Score: {variation.score.score}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{variation.generatedAnswer}</p>
                            {variation.score?.reasoning && (
                              <p className="text-xs text-muted-foreground mt-2 border-t pt-2">
                                {variation.score.reasoning}
                              </p>
                            )}
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {item.tools && item.tools.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Available Tools</h4>
                      <div className="space-y-2">
                        {item.tools.map((tool, toolIndex) => (
                          <Card key={toolIndex} className="p-4">
                            <h5 className="font-medium">{tool.name}</h5>
                            <p className="text-sm text-muted-foreground">{tool.description}</p>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {item.metadata && (
                    <div>
                      <h4 className="font-medium mb-2">Metadata</h4>
                      <pre className="text-sm text-muted-foreground bg-muted p-4 rounded-lg overflow-x-auto">
                        {JSON.stringify(item.metadata, null, 2)}
                      </pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
} 