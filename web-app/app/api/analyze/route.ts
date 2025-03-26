import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { CompanyConfiguration } from '@/types/config';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { scenarios } = await request.json();

    const prompt = `Analyze these customer support scenarios and extract key information to help configure an AI customer service agent.

Input Scenarios:
${JSON.stringify(scenarios, null, 2)}

Based on these scenarios, create a detailed configuration that includes:

1. Agent Description:
- Suggest an appropriate name for the agent based on its role
- Write a clear purpose statement based on the types of support scenarios seen

2. Features (extract from scenarios):
- Identify all capabilities needed to handle the scenarios
- For each feature found in the scenarios, provide:
  * A clear title
  * A detailed description of what the feature does
  * How it relates to the specific scenarios

3. Scenarios (categorize and summarize patterns):
- Group similar scenarios into categories
- For each category:
  * Create a descriptive title
  * Write a summary of the pattern
  * Assign appropriate urgency and complexity levels

4. Personas (identify from scenarios):
- Analyze customer types and behaviors in the scenarios
- For each distinct persona found:
  * Create a descriptive title
  * Write a detailed description
  * List key characteristics seen in the scenarios
  * Specify their preferred communication style

5. Evaluation Criteria:
- Based on the expected responses in the scenarios
- Include criteria for:
  * Response accuracy
  * Task completion
  * Communication effectiveness
  * Domain-specific requirements

Return the configuration in this exact JSON format:
{
  "agent_description": {
    "name": "string",
    "purpose": "string"
  },
  "features": [
    {
      "title": "string",
      "description": "string"
    }
  ],
  "scenarios": [
    {
      "title": "string",
      "description": "string",
      "urgency": "string",
      "complexity": "string"
    }
  ],
  "personas": [
    {
      "title": "string",
      "description": "string",
      "characteristics": "string",
      "communication_style": "string"
    }
  ],
  "evaluation_criteria": [
    {
      "title": "string",
      "description": "string",
      "weight": "string"
    }
  ]
}

Requirements:
1. All arrays must have at least one item
2. All text fields must be non-empty strings
3. All weight values must be strings between "0.0" and "1.0"
4. The configuration must match the exact structure shown above
5. Extract as much information as possible from the actual scenarios
6. Make the configuration specific to the provided scenarios`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4-turbo-preview",
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const generatedContent = completion.choices[0].message.content;
    if (!generatedContent) {
      throw new Error('No content generated');
    }

    const parsedContent = JSON.parse(generatedContent);
    
    // Validate the configuration structure
    if (!parsedContent.agent_description?.name || !parsedContent.agent_description?.purpose ||
        !Array.isArray(parsedContent.features) || parsedContent.features.length === 0 ||
        !Array.isArray(parsedContent.scenarios) || parsedContent.scenarios.length === 0 ||
        !Array.isArray(parsedContent.personas) || parsedContent.personas.length === 0 ||
        !Array.isArray(parsedContent.evaluation_criteria) || parsedContent.evaluation_criteria.length === 0) {
      throw new Error('Generated configuration is missing required fields');
    }

    // Additional validation for content quality
    const validateSection = (section: any[], name: string) => {
      section.forEach((item, index) => {
        if (!item.title?.trim() || !item.description?.trim()) {
          throw new Error(`${name} item ${index + 1} is missing required content`);
        }
      });
    };

    validateSection(parsedContent.features, 'Feature');
    validateSection(parsedContent.scenarios, 'Scenario');
    validateSection(parsedContent.personas, 'Persona');
    validateSection(parsedContent.evaluation_criteria, 'Evaluation criterion');

    return NextResponse.json({
      success: true,
      configuration: parsedContent as CompanyConfiguration
    });

  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to analyze scenarios' },
      { status: 500 }
    );
  }
} 