'use client';

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { CompanyConfiguration, defaultConfiguration, Feature, Scenario, Persona, EvaluationCriterion } from "../types/config";
import { Plus, X, ArrowLeft, ArrowRight, ChevronUp, ChevronDown } from "lucide-react";
import { SectionHeader } from "./SectionHeader";
import { StepIndicator } from "./StepIndicator";

const SECTION_INFO = {
  features: {
    title: "Features",
    description: "Define the capabilities and functionalities of your AI agent",
    examples: [
      "Email Summarization - Condensing lengthy emails into key points",
      "Meeting Scheduler - Automating scheduling across time zones",
      "Order Tracking - Providing shipment status updates",
      "Language Translation - Translating text between languages"
    ],
    type: "features" as const
  },
  scenarios: {
    title: "Scenarios",
    description: "Define situations your AI needs to handle, independent of response outcomes",
    examples: [
      "Multiple Matches Found - User's request yields multiple results needing clarification",
      "No Matches Found - Request yields no results, requiring alternatives",
      "Ambiguous Request - Input lacks necessary specificity",
      "System Errors - Technical issues preventing normal operation"
    ],
    type: "scenarios" as const
  },
  personas: {
    title: "Personas",
    description: "Define different user types and their characteristics",
    examples: [
      "New User - Unfamiliar with system, requires guidance",
      "Expert User - Experienced, expects efficiency",
      "Non-Native Speaker - May have language barriers",
      "Busy Professional - Values quick, concise responses"
    ],
    type: "personas" as const
  },
  evaluation: {
    title: "Evaluation Criteria",
    description: "Define how responses will be evaluated and scored",
    examples: [
      "Response Accuracy - How well the response addresses the query",
      "Tool Usage - Appropriate use of available tools",
      "Communication Style - Clarity and appropriateness of language",
      "Task Completion - Whether the user's need was fully met"
    ],
    type: "evaluation" as const
  }
};

const STEPS = [
  {
    title: "Agent",
    description: "Basic Info",
    value: "agent"
  },
  {
    title: "Features",
    description: "Capabilities",
    value: "features"
  },
  {
    title: "Scenarios",
    description: "Use Cases",
    value: "scenarios"
  },
  {
    title: "Personas",
    description: "User Types",
    value: "personas"
  },
  {
    title: "Evaluation",
    description: "Criteria",
    value: "evaluation"
  }
];

interface ConfigurationFormProps {
  onComplete?: () => void;
}

type ConfigSection = keyof Pick<CompanyConfiguration, 'features' | 'scenarios' | 'personas' | 'evaluation_criteria'>;

export function ConfigurationForm({ onComplete }: ConfigurationFormProps) {
  const [config, setConfig] = useState<CompanyConfiguration>(defaultConfiguration);
  const [currentStep, setCurrentStep] = useState(0);
  const [collapsedCards, setCollapsedCards] = useState<Record<string, boolean>>({});

  const toggleCard = (id: string) => {
    setCollapsedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Configuration submitted:", config);
    onComplete?.();
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Generic add function for any section
  const addItem = <T extends { title: string; description: string }>(
    section: T[],
    defaultValues: Partial<T> = {}
  ) => {
    return [...section, { title: "", description: "", ...defaultValues } as T];
  };

  // Generic remove function for any section
  const removeItem = <T,>(section: T[], index: number) => {
    return section.filter((_, i) => i !== index);
  };

  // Generic update function for any section
  const updateItem = <T,>(section: T[], index: number, field: keyof T, value: string) => {
    return section.map((item, i) => (i === index ? { ...item, [field]: value } : item));
  };

  const renderCard = (
    item: { title: string; description: string },
    index: number,
    section: ConfigSection,
    children: React.ReactNode
  ) => {
    const cardId = `${section}-${index}`;
    const isCollapsed = collapsedCards[cardId];
    const hasContent = item.title.trim() !== "";

    return (
      <Card key={index} className="relative">
        <div className="flex items-center justify-between p-4 pr-14">
          {hasContent ? (
            <div className="flex-1">
              <h4 className="font-medium truncate">{item.title}</h4>
              {isCollapsed && (
                <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                  {item.description}
                </p>
              )}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">New item</div>
          )}
          <div className="absolute right-2 top-2 flex gap-2">
            {hasContent && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => toggleCard(cardId)}
                className="hover:bg-muted"
              >
                {isCollapsed ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setConfig({
                ...config,
                [section]: removeItem(config[section], index)
              })}
              className="hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {!isCollapsed && (
          <CardContent className="pt-0 border-t">
            {children}
          </CardContent>
        )}
      </Card>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto space-y-6">
      <StepIndicator currentStep={currentStep} steps={STEPS} />
      
      <Card className="relative">
        <CardHeader className="pb-4">
          <CardTitle>Configure Your Agent</CardTitle>
          <CardDescription>
            Tell us about your customer service agent and evaluation criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs 
            value={STEPS[currentStep].value} 
            onValueChange={(value) => 
              setCurrentStep(STEPS.findIndex(step => step.value === value))
            }
          >
            <TabsList className="hidden">
              {STEPS.map((step) => (
                <TabsTrigger key={step.value} value={step.value}>
                  {step.title}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="max-h-[600px] overflow-y-auto pr-4 -mr-4 pb-20">
              <TabsContent value="agent" className="space-y-4 mt-0">
                <div className="grid gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="agent-name">Agent Name</Label>
                    <Input
                      id="agent-name"
                      value={config.agent_description.name}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          agent_description: {
                            ...config.agent_description,
                            name: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="agent-purpose">Purpose</Label>
                    <Textarea
                      id="agent-purpose"
                      value={config.agent_description.purpose}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          agent_description: {
                            ...config.agent_description,
                            purpose: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="features" className="space-y-4 mt-0">
                <SectionHeader {...SECTION_INFO.features} />
                <div className="grid gap-4">
                  {config.features.map((feature, index) => 
                    renderCard(feature, index, "features",
                      <div className="grid gap-6">
                        <div className="space-y-2">
                          <Label>Feature Title</Label>
                          <Input
                            value={feature.title}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                features: updateItem(config.features, index, "title", e.target.value)
                              })
                            }
                            placeholder="Enter feature title"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea
                            value={feature.description}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                features: updateItem(config.features, index, "description", e.target.value)
                              })
                            }
                            placeholder="Describe the feature"
                          />
                        </div>
                      </div>
                    )
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setConfig({
                      ...config,
                      features: addItem(config.features)
                    })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Feature
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="scenarios" className="space-y-4 mt-0">
                <SectionHeader {...SECTION_INFO.scenarios} />
                <div className="grid gap-4">
                  {config.scenarios.map((scenario, index) => 
                    renderCard(scenario, index, "scenarios",
                      <div className="grid gap-6">
                        <div className="space-y-2">
                          <Label>Scenario Title</Label>
                          <Input
                            value={scenario.title}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                scenarios: updateItem(config.scenarios, index, "title", e.target.value)
                              })
                            }
                            placeholder="Enter scenario title"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea
                            value={scenario.description}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                scenarios: updateItem(config.scenarios, index, "description", e.target.value)
                              })
                            }
                            placeholder="Describe the scenario"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Urgency Level</Label>
                            <Input
                              value={scenario.urgency}
                              onChange={(e) =>
                                setConfig({
                                  ...config,
                                  scenarios: updateItem(config.scenarios, index, "urgency", e.target.value)
                                })
                              }
                              placeholder="e.g., High, Medium, Low"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Complexity Level</Label>
                            <Input
                              value={scenario.complexity}
                              onChange={(e) =>
                                setConfig({
                                  ...config,
                                  scenarios: updateItem(config.scenarios, index, "complexity", e.target.value)
                                })
                              }
                              placeholder="e.g., Simple, Moderate, Complex"
                            />
                          </div>
                        </div>
                      </div>
                    )
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setConfig({
                      ...config,
                      scenarios: addItem(config.scenarios, { urgency: "", complexity: "" })
                    })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Scenario
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="personas" className="space-y-4 mt-0">
                <SectionHeader {...SECTION_INFO.personas} />
                <div className="grid gap-4">
                  {config.personas.map((persona, index) => 
                    renderCard(persona, index, "personas",
                      <div className="grid gap-6">
                        <div className="space-y-2">
                          <Label>Persona Title</Label>
                          <Input
                            value={persona.title}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                personas: updateItem(config.personas, index, "title", e.target.value)
                              })
                            }
                            placeholder="e.g., New User, Expert User"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea
                            value={persona.description}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                personas: updateItem(config.personas, index, "description", e.target.value)
                              })
                            }
                            placeholder="Brief overview of this user type"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Key Characteristics</Label>
                          <Textarea
                            value={persona.characteristics}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                personas: updateItem(config.personas, index, "characteristics", e.target.value)
                              })
                            }
                            placeholder="List key traits, behaviors, and needs (one per line)"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Communication Style</Label>
                          <Input
                            value={persona.communication_style}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                personas: updateItem(config.personas, index, "communication_style", e.target.value)
                              })
                            }
                            placeholder="e.g., Formal, Casual, Technical, Simple"
                          />
                        </div>
                      </div>
                    )
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setConfig({
                      ...config,
                      personas: addItem(config.personas, {
                        characteristics: "",
                        communication_style: ""
                      })
                    })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Persona
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="evaluation" className="space-y-4 mt-0">
                <SectionHeader {...SECTION_INFO.evaluation} />
                <div className="grid gap-4">
                  {config.evaluation_criteria.map((criterion, index) => 
                    renderCard(criterion, index, "evaluation_criteria",
                      <div className="grid gap-6">
                        <div className="space-y-2">
                          <Label>Criterion Title</Label>
                          <Input
                            value={criterion.title}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                evaluation_criteria: updateItem(config.evaluation_criteria, index, "title", e.target.value)
                              })
                            }
                            placeholder="e.g., Response Accuracy, Task Completion"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea
                            value={criterion.description}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                evaluation_criteria: updateItem(config.evaluation_criteria, index, "description", e.target.value)
                              })
                            }
                            placeholder="Detailed explanation of how this criterion should be evaluated"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Weight (0.0 - 1.0)</Label>
                          <Input
                            type="number"
                            min="0"
                            max="1"
                            step="0.1"
                            value={criterion.weight}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                evaluation_criteria: updateItem(config.evaluation_criteria, index, "weight", e.target.value)
                              })
                            }
                            placeholder="e.g., 0.5"
                          />
                        </div>
                      </div>
                    )
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setConfig({
                      ...config,
                      evaluation_criteria: addItem(config.evaluation_criteria, { weight: "0.5" })
                    })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Evaluation Criterion
                  </Button>
                </div>
              </TabsContent>
            </div>

            <div className="absolute bottom-0 left-0 right-0 bg-white border-t p-4">
              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={previousStep}
                  disabled={currentStep === 0}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="flex gap-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setConfig(defaultConfiguration)}
                  >
                    Reset to Default
                  </Button>
                  {currentStep === STEPS.length - 1 ? (
                    <Button type="submit" className="flex items-center gap-2">
                      Save Configuration
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="flex items-center gap-2"
                    >
                      Next
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </form>
  );
} 