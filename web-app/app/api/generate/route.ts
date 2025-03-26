import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { BaseExample, HallucinationExample } from '@/lib/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const HALLUCINATION_PROMPT = `You are a helpful hallucinating assistant, who makes up fake answers to questions.

Answer the following question in 1 sentence. If you know the answer, then make up some fake
superfluous details that are not in the passage you have memorized.

Make sure to always answer it confidently, even if you don't know the answer. Do not use words
like "perhaps", "likely", "maybe", etc. or punctuation like "...". Do not admit that you cannot
or do not know the answer.

Context: {context}
Question: {question}`;

const JUDGE_PROMPT = `You are comparing a submitted answer to an expert answer on a given question. Here is the data:
[BEGIN DATA]
************
[Context]: {context}
************
[Question]: {question}
************
[Expert]: {correctAnswer}
************
[Submission]: {generatedAnswer}
************
[END DATA]

Compare the factual content of the submitted answer with the expert answer. Ignore any differences in style, grammar, or punctuation.
The submitted answer may either be a subset or superset of the expert answer, or it may conflict with it. Determine which case applies. Answer the question by selecting one of the following options:
(A) The submitted answer is a subset of the expert answer and is fully consistent with it.
(B) The submitted answer is a superset of the expert answer and is fully consistent with it.
(C) The submitted answer contains all the same details as the expert answer.
(D) There is a disagreement between the submitted answer and the expert answer.
(E) The answers differ, but these differences don't matter from the perspective of factuality.

Provide your reasoning in a step-by-step manner and then select a single choice from A, B, C, D, or E.
Format your response exactly as follows:

Reasoning: <your step by step reasoning>
Choice: <single letter A-E>`;

async function generateHallucinations(example: BaseExample): Promise<HallucinationExample[]> {
  const variations: HallucinationExample[] = [];

  // First, create an "original" type variation that matches exactly
  variations.push({
    ...example,
    generatedAnswer: example.correctAnswer,
    type: 'original'
  });

  // Generate a hallucinated answer
  const hallucinationResponse = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: HALLUCINATION_PROMPT
          .replace("{context}", example.context)
          .replace("{question}", example.question)
      }
    ],
    temperature: 1,
    max_tokens: 200
  });

  if (!hallucinationResponse.choices[0].message.content) {
    throw new Error('Failed to generate hallucinated answer');
  }

  const hallucinatedAnswer = hallucinationResponse.choices[0].message.content;
  
  // Add the hallucinated variation
  variations.push({
    ...example,
    generatedAnswer: hallucinatedAnswer,
    type: 'hallucination'
  });

  // Generate a partial answer
  const partialResponse = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "Create a partial but accurate answer to the question. Include only some of the correct information, but do not add any incorrect information."
      },
      {
        role: "user",
        content: `Context: ${example.context}\nQuestion: ${example.question}\nFull Answer: ${example.correctAnswer}`
      }
    ],
    temperature: 0.7,
    max_tokens: 200
  });

  if (!partialResponse.choices[0].message.content) {
    throw new Error('Failed to generate partial answer');
  }

  const partialAnswer = partialResponse.choices[0].message.content;
  
  // Add the partial answer variation
  variations.push({
    ...example,
    generatedAnswer: partialAnswer,
    type: 'partial'
  });

  // Score all variations
  const scoredVariations = await Promise.all(
    variations.map(async (variation) => {
      const score = await scoreAnswer(variation);
      return { ...variation, score };
    })
  );

  return scoredVariations;
}

async function scoreAnswer(example: HallucinationExample) {
  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: JUDGE_PROMPT
          .replace("{context}", example.context)
          .replace("{question}", example.question)
          .replace("{correctAnswer}", example.correctAnswer)
          .replace("{generatedAnswer}", example.generatedAnswer)
      }
    ],
    temperature: 0,
    max_tokens: 500
  });

  const result = response.choices[0].message.content;
  if (!result) {
    throw new Error('Failed to generate score');
  }

  const reasoning = result.match(/Reasoning: (.*?)(?=Choice:|$)/s)?.[1]?.trim() || "";
  const choice = result.match(/Choice: ([A-E])/)?.[1] || "D";

  return {
    choice: choice as "A" | "B" | "C" | "D" | "E",
    score: choice === "A" ? 0.5 :
           choice === "B" ? 0 :
           choice === "C" ? 1 :
           choice === "D" ? 0 : 1,
    reasoning
  };
}

export async function POST(request: Request) {
  try {
    const { scenarios, configuration } = await request.json();

    const prompt = `Given the following company context and example scenarios, generate challenging edge case scenarios for testing their customer service AI agent.

COMPANY INFORMATION:
Agent Name: ${configuration.agent_description.name}
Purpose: ${configuration.agent_description.purpose}

Key Features:
${configuration.features.map((f: { title: string; description: string }) => `- ${f.title}: ${f.description}`).join('\n')}

Existing Scenarios:
${JSON.stringify(scenarios, null, 2)}

Generate 3 challenging edge case scenarios that will test the limits and robustness of this specific customer service AI agent. Focus on:
1. Complex multi-part requests that test multiple features (${configuration.features.map((f: { title: string }) => f.title).join(', ')})
2. Emotionally charged situations aligned with the agent's purpose
3. Ambiguous or conflicting information specific to their use case
4. Time-sensitive or urgent matters within their domain
5. Edge cases in their specific policy interpretation
6. Cultural or language nuances relevant to their customer base
7. Technical system limitations of their features
8. Unusual or rare situations in their industry

For each scenario, ensure:
- The customer_message includes realistic complexity and challenges specific to their use case
- The context provides relevant background information about their business
- The expected_response includes specific success criteria aligned with their agent's capabilities
- The scenario tests multiple aspects of their agent's core features

Return the scenarios in the same JSON format as the examples, maintaining consistency with the schema while pushing the boundaries of what their specific agent should handle.`;

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
      console.error('Invalid generated content:', parsedContent);
      throw new Error('Generated content is not in the expected format');
    }

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