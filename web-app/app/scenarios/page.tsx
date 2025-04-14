'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronDown, ChevronUp, RefreshCw, BarChart, Users, Zap, AlertTriangle } from "lucide-react";
import { CompanyConfiguration } from "@/types/config";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Scenario {
  title: string;
  description: string;
  customer_message: string;
  context: string;
  expected_response: {
    key_points: string[];
    required_info: string[];
    tone: string;
    success_criteria: string[];
  };
  metadata: {
    complexity: string;
    urgency: string;
    persona: string;
    features_tested: string[];
  };
}

export default function ScenariosPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [expandedCards, setExpandedCards] = useState<Record<number, boolean>>({});
  const [configuration, setConfiguration] = useState<CompanyConfiguration | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Load configuration and generate initial scenarios
    const loadConfig = async () => {
      const savedConfig = localStorage.getItem('agentConfiguration');
      if (!savedConfig) {
        toast.error("No configuration found. Please complete the setup first.");
        return;
      }

      const config = JSON.parse(savedConfig);
      setConfiguration(config);
      await generateScenarios(config);
      setIsLoading(false);
    };

    loadConfig();
  }, []);

  const generateScenarios = async (config: CompanyConfiguration) => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/scenarios/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ configuration: config }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate scenarios');
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Generation failed');
      }

      setScenarios(data.scenarios);
      toast.success("Generated new test scenarios!");
    } catch (error) {
      console.error('Generation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate scenarios');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleCard = (index: number) => {
    setExpandedCards(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Calculate insights
  const getInsights = () => {
    if (!scenarios.length) return null;

    const complexityCount = scenarios.reduce((acc, scenario) => {
      acc[scenario.metadata.complexity] = (acc[scenario.metadata.complexity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const urgencyCount = scenarios.reduce((acc, scenario) => {
      acc[scenario.metadata.urgency] = (acc[scenario.metadata.urgency] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const personaCount = scenarios.reduce((acc, scenario) => {
      acc[scenario.metadata.persona] = (acc[scenario.metadata.persona] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const featuresCovered = new Set(
      scenarios.flatMap(s => s.metadata.features_tested)
    );

    return {
      complexityCount,
      urgencyCount,
      personaCount,
      featuresCoverage: featuresCovered.size,
      totalFeatures: configuration?.features.length || 0
    };
  };

  const insights = getInsights();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading scenarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Test Scenarios</h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive testing scenarios for your AI agent
          </p>
        </div>
        <Button
          onClick={() => configuration && generateScenarios(configuration)}
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
              <RefreshCw className="w-4 h-4" />
              Regenerate
            </>
          )}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList>
          <TabsTrigger value="overview">Overview & Insights</TabsTrigger>
          <TabsTrigger value="scenarios">All Scenarios</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Insights Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Feature Coverage</CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {insights?.featuresCoverage}/{insights?.totalFeatures}
                </div>
                <p className="text-xs text-muted-foreground">
                  Features tested across scenarios
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Persona Distribution</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Object.keys(insights?.personaCount || {}).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Different user types covered
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Complexity Mix</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {insights?.complexityCount?.Complex || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Complex scenarios to test limits
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">High Priority</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {insights?.urgencyCount?.High || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  High urgency scenarios
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Key Focus Areas */}
          <Card>
            <CardHeader>
              <CardTitle>Key Focus Areas</CardTitle>
              <CardDescription>
                Areas that require special attention during testing
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <h4 className="font-medium mb-2">Complex Interactions</h4>
                <ul className="space-y-2">
                  {scenarios
                    .filter(s => s.metadata.complexity === 'Complex')
                    .map((s, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{s.title}</span>
                      </li>
                    ))
                  }
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">High Priority Cases</h4>
                <ul className="space-y-2">
                  {scenarios
                    .filter(s => s.metadata.urgency === 'High')
                    .map((s, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{s.title}</span>
                      </li>
                    ))
                  }
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Feature Coverage</h4>
                <ul className="space-y-2">
                  {Array.from(new Set(scenarios.flatMap(s => s.metadata.features_tested)))
                    .map((feature, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{feature}</span>
                      </li>
                    ))
                  }
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scenarios">
          <div className="space-y-4">
            {scenarios.map((scenario, index) => (
              <Card key={index} className="overflow-hidden transition-all duration-200 hover:shadow-md">
                <div 
                  className="p-6 cursor-pointer select-none"
                  onClick={() => toggleCard(index)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-lg">{scenario.title}</h3>
                        <div className="flex gap-2">
                          <Badge variant={
                            scenario.metadata.urgency === 'High' ? 'destructive' :
                            scenario.metadata.urgency === 'Medium' ? 'secondary' : 'default'
                          }>
                            {scenario.metadata.urgency}
                          </Badge>
                          <Badge variant={
                            scenario.metadata.complexity === 'Complex' ? 'destructive' :
                            scenario.metadata.complexity === 'Moderate' ? 'secondary' : 'default'
                          }>
                            {scenario.metadata.complexity}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="font-medium">Persona:</span> {scenario.metadata.persona}
                      </div>
                      {!expandedCards[index] && (
                        <p className="text-muted-foreground line-clamp-2 mt-2">
                          {scenario.description}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0"
                    >
                      {expandedCards[index] ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {expandedCards[index] && (
                  <CardContent className="border-t space-y-6 px-6 py-4">
                    {/* Overview Section */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Overview</h4>
                        <p className="text-muted-foreground">{scenario.description}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {scenario.metadata.features_tested.map((feature, i) => (
                          <Badge key={i} variant="outline">{feature}</Badge>
                        ))}
                      </div>
                    </div>

                    {/* Context & Message Section */}
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Context</h4>
                        <div className="bg-muted/50 rounded-lg p-4">
                          <p className="text-sm">{scenario.context}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Customer Message</h4>
                        <div className="bg-muted rounded-lg p-4">
                          <p className="text-sm">{scenario.customer_message}</p>
                        </div>
                      </div>
                    </div>

                    {/* Response Guidelines Section */}
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Response Guidelines</h4>
                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-4">
                          <div>
                            <h5 className="font-medium mb-2">Tone & Approach</h5>
                            <p className="text-sm text-muted-foreground">{scenario.expected_response.tone}</p>
                          </div>
                          <div>
                            <h5 className="font-medium mb-2">Key Points</h5>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {scenario.expected_response.key_points.map((point, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-primary mt-1">•</span>
                                  <span>{point}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <h5 className="font-medium mb-2">Required Information</h5>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {scenario.expected_response.required_info.map((info, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-primary mt-1">•</span>
                                  <span>{info}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h5 className="font-medium mb-2">Success Criteria</h5>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {scenario.expected_response.success_criteria.map((criterion, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-primary mt-1">•</span>
                                  <span>{criterion}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 