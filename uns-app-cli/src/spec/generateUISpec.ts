import { generateText } from '../ai/openai.js';
import { prompts } from '../ai/prompts.js';
import { writeFile } from '../utils/fsx.js';
import { config } from '../config.js';
import path from 'path';

export async function generateUISpec(projectSpec: string, artifactDir?: string): Promise<string> {
  const uiSpec = await generateText(
    prompts.uiSpec.system,
    prompts.uiSpec.user(projectSpec),
    { maxTokens: 8192, temperature: 0.7 }
  );

  const baseArtifactDir = artifactDir || config.paths.artifacts;
  const specPath = path.join(baseArtifactDir, 'UI_spec.md');
  await writeFile(specPath, uiSpec);

  return uiSpec;
}