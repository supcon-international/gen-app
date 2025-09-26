export interface FilePatch {
  path: string;
  type: 'create' | 'modify' | 'delete';
  content?: string;
  patches?: Array<{
    oldText: string;
    newText: string;
  }>;
}

export function createPatch(oldContent: string, newContent: string): string {
  const oldLines = oldContent.split('\n');
  const newLines = newContent.split('\n');

  let patch = '';
  let lineNum = 0;

  for (let i = 0; i < Math.max(oldLines.length, newLines.length); i++) {
    const oldLine = oldLines[i] || '';
    const newLine = newLines[i] || '';

    if (oldLine !== newLine) {
      if (i < oldLines.length && i < newLines.length) {
        patch += `@@ -${i + 1},1 +${i + 1},1 @@\n`;
        patch += `-${oldLine}\n`;
        patch += `+${newLine}\n`;
      } else if (i >= oldLines.length) {
        patch += `@@ -${oldLines.length},0 +${i + 1},1 @@\n`;
        patch += `+${newLine}\n`;
      } else {
        patch += `@@ -${i + 1},1 +${newLines.length},0 @@\n`;
        patch += `-${oldLine}\n`;
      }
    }
  }

  return patch;
}

export function applyPatch(content: string, patches: Array<{ oldText: string; newText: string }>): string {
  let result = content;

  for (const patch of patches) {
    // Skip patches that look like placeholders
    const placeholderPatterns = [
      /^\/\/\s*(Existing|Add|Insert|Place|Your)\s+.*\.\.\./i,
      /^\/\*\s*(Existing|Add|Insert|Place|Your)\s+.*\.\.\.\s*\*\//i,
      /^#\s*(Existing|Add|Insert|Place|Your)\s+.*\.\.\./i,
      /^\.\.\.\s*(rest|other|more|existing)/i
    ];

    if (placeholderPatterns.some(pattern => pattern.test(patch.oldText.trim()))) {
      // If it's a placeholder, try to intelligently insert the new text
      if (patch.newText && patch.newText.trim()) {
        // Try to append at the end of imports section if it contains import statements
        if (patch.newText.includes('import ')) {
          const lastImportIndex = result.lastIndexOf('import ');
          if (lastImportIndex !== -1) {
            const lineEnd = result.indexOf('\n', lastImportIndex);
            if (lineEnd !== -1) {
              result = result.slice(0, lineEnd + 1) + patch.newText + '\n' + result.slice(lineEnd + 1);
              continue;
            }
          }
        }
        // Otherwise append at the end of file
        result = result + '\n\n' + patch.newText;
      }
      continue;
    }

    // Normal replacement
    if (!result.includes(patch.oldText)) {
      // Try fuzzy matching by removing extra whitespace
      const normalizedContent = result.replace(/\s+/g, ' ');
      const normalizedOldText = patch.oldText.replace(/\s+/g, ' ');

      if (normalizedContent.includes(normalizedOldText)) {
        // Find the actual text with original whitespace
        const startIndex = normalizedContent.indexOf(normalizedOldText);
        let actualStart = 0;
        let normalizedIndex = 0;

        for (let i = 0; i < result.length && normalizedIndex < startIndex; i++) {
          if (/\s/.test(result[i])) {
            if (!/\s/.test(normalizedContent[normalizedIndex])) {
              continue;
            }
          }
          actualStart = i;
          normalizedIndex++;
        }

        // Extract the actual text with original whitespace
        const actualText = result.substring(actualStart, actualStart + patch.oldText.length);
        result = result.replace(actualText, patch.newText);
      } else {
        console.warn(`Warning: Cannot find text to replace: ${patch.oldText.substring(0, 50)}...`);
        // Don't throw error, just skip this patch
      }
    } else {
      result = result.replace(patch.oldText, patch.newText);
    }
  }

  return result;
}