import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';

// Load env from parent directory
dotenv.config({ path: path.join(process.cwd(), '.env') });

async function testOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.error('❌ OPENAI_API_KEY not found in environment');
    return;
  }

  console.log('Testing OpenAI API key...');
  console.log(`API Key (first 10 chars): ${apiKey.substring(0, 10)}...`);

  const openai = new OpenAI({ apiKey });

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'Say hello' }],
      max_tokens: 10
    });

    console.log('✅ API Key is valid!');
    console.log('Response:', response.choices[0]?.message?.content);
  } catch (error: any) {
    console.error('❌ API Key test failed:', error.message);
    if (error.response) {
      console.error('Error details:', error.response.data);
    }
  }
}

testOpenAI();