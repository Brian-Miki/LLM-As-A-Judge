'use client';

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { ConfigurationForm } from "./ConfigurationForm";
import { FileUpload } from "./FileUpload";

type Step = {
  title: string;
  description: string;
  component: React.ReactNode;
};

export function OnboardingWizard() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const steps: Step[] = [
    {
      title: "Configure Your Agent",
      description: "Tell us about your customer service agent and evaluation criteria",
      component: <ConfigurationForm onComplete={() => setCurrentStepIndex(1)} />,
    },
    {
      title: "Upload Test Scenarios",
      description: "Upload your JSON or CSV file containing test scenarios",
      component: <FileUpload />,
    },
  ];

  const currentStep = steps[currentStepIndex];

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Step {currentStepIndex + 1} of {steps.length}
            </p>
            <h2 className="text-2xl font-bold">{currentStep.title}</h2>
            <p className="text-muted-foreground">{currentStep.description}</p>
          </div>
          <div className="flex gap-2">
            {currentStepIndex > 0 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStepIndex(currentStepIndex - 1)}
              >
                Previous
              </Button>
            )}
          </div>
        </div>
        <div className="mt-4 h-2 w-full bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{
              width: `${((currentStepIndex + 1) / steps.length) * 100}%`,
            }}
          />
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          {currentStep.component}
        </CardContent>
      </Card>
    </div>
  );
} 