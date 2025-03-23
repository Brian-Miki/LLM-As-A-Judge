'use client';

import { Check } from "lucide-react";

interface StepIndicatorProps {
  currentStep: number;
  steps: {
    title: string;
    description: string;
  }[];
}

export function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <p className="text-sm text-muted-foreground">
          Step {currentStep + 1} of {steps.length}
        </p>
        <h2 className="text-2xl font-semibold tracking-tight">
          {steps[currentStep].title}
        </h2>
        <p className="text-base text-muted-foreground">
          {steps[currentStep].description}
        </p>
      </div>

      <div className="w-full">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center flex-1 last:flex-none">
              <div className="relative flex items-center gap-2 flex-shrink-0">
                <div
                  className={`w-6 h-6 flex items-center justify-center rounded-full border-2 
                    ${
                      index < currentStep
                        ? "bg-primary border-primary text-primary-foreground"
                        : index === currentStep
                        ? "border-primary text-primary"
                        : "border-muted-foreground text-muted-foreground"
                    }`}
                >
                  {index < currentStep ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <span className="text-xs">{index + 1}</span>
                  )}
                </div>
                <div className="flex flex-col justify-center">
                  <p className={`text-[11px] font-medium leading-none ${
                    index <= currentStep ? "text-primary" : "text-muted-foreground"
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-[9px] text-muted-foreground leading-none hidden sm:block">
                    {step.description}
                  </p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 mx-2">
                  <div
                    className={`h-[1px] ${
                      index < currentStep ? "bg-primary" : "bg-muted-foreground/25"
                    }`}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 