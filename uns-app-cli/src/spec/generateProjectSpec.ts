import { generateText } from '../ai/openai.js';
import { prompts } from '../ai/prompts.js';
import { writeFile } from '../utils/fsx.js';
import { config } from '../config.js';
import path from 'path';
import type { UNSData } from '../mqtt/inspect.js';
import fs from 'fs-extra';

export async function generateProjectSpec(intent: any, unsData: UNSData, artifactDir?: string): Promise<string> {
  const baseArtifactDir = artifactDir || config.paths.artifacts;
  const unsOverviewPath = path.join(baseArtifactDir, 'uns_overview.md');

  // Try to read from the current artifact dir first, fallback to base
  let unsOverview: string;
  if (await fs.pathExists(unsOverviewPath)) {
    unsOverview = await fs.readFile(unsOverviewPath, 'utf-8');
  } else {
    // Fallback to base artifacts dir
    const fallbackPath = path.join(config.paths.artifacts, 'uns_overview.md');
    unsOverview = await fs.readFile(fallbackPath, 'utf-8');
  }

  const projectSpec = await generateText(
    prompts.projectSpec.system,
    prompts.projectSpec.user(intent, unsOverview),
    { maxTokens: 8192, temperature: 0.7 }
  );

  const specPath = path.join(baseArtifactDir, 'project_spec.md');
  await writeFile(specPath, projectSpec);

  return projectSpec;
}