import OpenAI from 'openai';
import { z } from 'zod';
import { config } from '../config.js';
import { retry } from '../utils/retry.js';
import { log } from '../utils/log.js';

const openai = new OpenAI({
  apiKey: config.openaiApiKey,
});

export async function generateText(
  systemPrompt: string,
  userPrompt: string,
  options: {
    maxTokens?: number;
    temperature?: number;
  } = {}
): Promise<string> {
  const { maxTokens = 4096, temperature = 0.7 } = options;

  return retry(async () => {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: maxTokens,
      temperature: temperature,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    const textContent = response.choices[0]?.message?.content;
    if (!textContent) {
      throw new Error('No text content in response');
    }

    return textContent;
  }, {
    maxAttempts: 3,
    onRetry: (error, attempt) => {
      log.warn(`API call failed (attempt ${attempt}):`, error.message);
    },
  });
}

export async function generateJSON<T>(
  schema: z.ZodSchema<T>,
  systemPrompt: string,
  userPrompt: string,
  options: {
    maxTokens?: number;
    temperature?: number;
  } = {}
): Promise<T> {
  const enhancedSystem = `${systemPrompt}\n\nIMPORTANT: You must respond with valid JSON only. No markdown, no comments, just pure JSON.`;

  log.info('Calling OpenAI API for JSON generation...');
  const response = await generateText(enhancedSystem, userPrompt, options);
  log.info(`OpenAI response length: ${response.length} characters`);

  try {
    let cleanedResponse = response
      .replace(/^```json\n?/, '')
      .replace(/\n?```$/, '')
      .trim();

    // Remove trailing commas in arrays and objects
    cleanedResponse = cleanedResponse
      .replace(/,(\s*[\]}])/g, '$1')  // Remove trailing commas before ] or }
      .replace(/,(\s*)$/, '$1');       // Remove trailing comma at end of string

    const parsed = JSON.parse(cleanedResponse);
    return schema.parse(parsed);
  } catch (error) {
    log.error('Failed to parse JSON response:', response);
    throw new Error(`Invalid JSON response: ${error}`);
  }
}

export async function* generateTextStream(
  systemPrompt: string,
  userPrompt: string,
  options: {
    maxTokens?: number;
    temperature?: number;
  } = {}
): AsyncGenerator<string, void, unknown> {
  const { maxTokens = 4096, temperature = 0.7 } = options;

  const stream = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: maxTokens,
    temperature: temperature,
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: userPrompt,
      },
    ],
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      yield content;
    }
  }
}