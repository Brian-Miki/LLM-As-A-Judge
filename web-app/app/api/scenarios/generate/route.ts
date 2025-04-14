import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { CompanyConfiguration } from '@/types/config';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { configuration } = await request.json();

    const prompt = `Generate diverse test scenarios for a customer service AI agent based on the following configuration:

AGENT CONFIGURATION
==================
Name: ${configuration.agent_description.name}
Purpose: ${configuration.agent_description.purpose}

Features:
${configuration.features.map((f: any) => `- ${f.title}: ${f.description}`).join('\n')}

Existing Personas:
${configuration.personas.map((p: any) => `- ${p.title}: ${p.description}
  * Characteristics: ${p.characteristics}
  * Communication Style: ${p.communication_style}`).join('\n')}

Evaluation Criteria:
${configuration.evaluation_criteria.map((e: any) => `- ${e.title}: ${e.description} (Weight: ${e.weight})`).join('\n')}

TASK
====
Generate 5 diverse test scenarios that will challenge the AI agent. Each scenario should:
1. Test multiple features simultaneously
2. Include edge cases and complex situations
3. Represent different personas and communication styles
4. Vary in urgency and complexity
5. Test specific evaluation criteria

For each scenario, provide:
- A clear title and description
- Detailed context about the situation
- The actual customer message
- Expected response details including:
  * Key points to address
  * Required information to provide
  * Appropriate tone
  * Specific success criteria
- Metadata about complexity, urgency, persona, and features being tested

Return the scenarios in this exact JSON format:
{
  "scenarios": [
    {
      "title": "string",
      "description": "string",
      "context": "string",
      "customer_message": "string",
      "expected_response": {
        "key_points": ["string"],
        "required_info": ["string"],
        "tone": "string",
        "success_criteria": ["string"]
      },
      "metadata": {
        "complexity": "Simple|Moderate|Complex",
        "urgency": "Low|Medium|High",
        "persona": "string",
        "features_tested": ["string"]
      }
    }
  ]
}

Requirements:
1. Make scenarios highly specific to the agent's purpose and features
2. Include challenging edge cases that test multiple features
3. Vary the complexity and urgency levels
4. Use different personas with their specific communication styles
5. Ensure success criteria align with the evaluation criteria
6. Make scenarios realistic and detailed`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      temperature: 0.8,
    });

    const generatedContent = completion.choices[0].message.content;
    if (!generatedContent) {
      throw new Error('No content generated');
    }

    const parsedContent = JSON.parse(generatedContent);
    
    if (!parsedContent.scenarios || !Array.isArray(parsedContent.scenarios)) {
      throw new Error('Generated content is not in the expected format');
    }

    // Validate each scenario
    parsedContent.scenarios.forEach((scenario: any, index: number) => {
      if (!scenario.title || !scenario.description || !scenario.context || !scenario.customer_message) {
        throw new Error(`Scenario ${index + 1} is missing required fields`);
      }
      
      if (!scenario.expected_response || !Array.isArray(scenario.expected_response.key_points) ||
          !Array.isArray(scenario.expected_response.required_info) || !scenario.expected_response.tone ||
          !Array.isArray(scenario.expected_response.success_criteria)) {
        throw new Error(`Scenario ${index + 1} has invalid expected_response format`);
      }
      
      if (!scenario.metadata || !scenario.metadata.complexity || !scenario.metadata.urgency ||
          !scenario.metadata.persona || !Array.isArray(scenario.metadata.features_tested)) {
        throw new Error(`Scenario ${index + 1} has invalid metadata format`);
      }
    });

    return NextResponse.json({
      success: true,
      scenarios: parsedContent.scenarios
    });

  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Failed to generate scenarios' },
      { status: 500 }
    );
  }
} 