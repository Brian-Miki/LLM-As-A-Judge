'use client';

import { HelpCircle, Lightbulb, Target, Users, CheckSquare } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface SectionHeaderProps {
  title: string;
  description: string;
  examples: string[];
  type?: 'features' | 'scenarios' | 'personas' | 'evaluation';
}

const SECTION_ICONS = {
  features: Lightbulb,
  scenarios: Target,
  personas: Users,
  evaluation: CheckSquare,
};

const SECTION_COLORS = {
  features: "from-blue-500/10 to-blue-500/5 hover:to-blue-500/10",
  scenarios: "from-green-500/10 to-green-500/5 hover:to-green-500/10",
  personas: "from-purple-500/10 to-purple-500/5 hover:to-purple-500/10",
  evaluation: "from-orange-500/10 to-orange-500/5 hover:to-orange-500/10",
};

export function SectionHeader({ title, description, examples, type }: SectionHeaderProps) {
  const Icon = type ? SECTION_ICONS[type] : HelpCircle;
  const gradientClass = type ? SECTION_COLORS[type] : "from-gray-500/10 to-gray-500/5 hover:to-gray-500/10";

  return (
    <div className={`mb-6 rounded-lg p-6 border bg-gradient-to-br transition-all duration-300 ${gradientClass}`}>
      <div className="flex items-start justify-between">
        <div className="flex gap-4">
          <div className="mt-1 p-2 bg-background rounded-full border shadow-sm">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold flex items-center gap-2">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md">
              {description}
            </p>
          </div>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="p-2 hover:bg-background/80 rounded-full transition-colors">
                <HelpCircle className="h-5 w-5 text-muted-foreground" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-sm">
              <div className="space-y-2">
                <p className="font-semibold">Examples:</p>
                <ul className="list-disc list-inside space-y-1.5">
                  {examples.map((example, index) => (
                    <li key={index} className="text-sm leading-relaxed">{example}</li>
                  ))}
                </ul>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
} 