export interface Feature {
  title: string;
  description: string;
}

export interface Scenario {
  title: string;
  description: string;
  urgency: string;
  complexity: string;
}

export interface Persona {
  title: string;
  description: string;
  characteristics: string;
  communication_style: string;
}

export interface EvaluationCriterion {
  title: string;
  description: string;
  weight: string;
}

export interface AgentDescription {
  name: string;
  purpose: string;
}

export interface FeatureCapability {
  capabilities: string[];
  tools_available: string[];
  success_metrics: string[];
}

export interface FeaturesTaxonomy {
  [key: string]: FeatureCapability;
}

export interface UrgencyLevel {
  timeframe: string;
  description: string;
}

export interface ComplexityLevel {
  description: string;
  tool_count: string;
}

export interface ImpactLevel {
  description: string;
  business_effect: string;
}

export interface ScenariosTaxonomy {
  urgency_levels: {
    [key: string]: string;
  };
  complexity_levels: {
    [key: string]: string;
  };
  impact_levels: {
    [key: string]: string;
  };
}

export interface CustomerType {
  characteristics: string[];
  communication_style: string;
}

export interface EmotionalState {
  characteristics: string[];
  approach: string;
}

export interface PersonasTaxonomy {
  customer_types: {
    [key: string]: CustomerType;
  };
  emotional_states: {
    [key: string]: EmotionalState;
  };
}

export interface EvaluationCriteria {
  [key: string]: string;
}

export interface EvaluationFramework {
  pass_criteria: EvaluationCriteria;
  fail_criteria: EvaluationCriteria;
  scoring_weights: {
    [key: string]: number;
  };
}

export interface CompanyConfiguration {
  agent_description: AgentDescription;
  features: Feature[];
  scenarios: Scenario[];
  personas: Persona[];
  evaluation_criteria: EvaluationCriterion[];
}

// Example default configuration
export const defaultConfiguration: CompanyConfiguration = {
  agent_description: {
    name: "",
    purpose: "",
  },
  features: [],
  scenarios: [],
  personas: [],
  evaluation_criteria: [],
}; 