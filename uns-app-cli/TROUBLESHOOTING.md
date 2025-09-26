# Troubleshooting Guide

## Issues Found and Fixed

### Problem 1: Generated code not being applied to template
**Root Cause**: Invalid OpenAI API key preventing code generation

**Solution**:
1. The API key in `.env` was invalid
2. Added proper error handling in `applyCodePlan` to catch API failures
3. Added validation in `validateConfig` to check for valid API key format

**Action Required**:
- Replace `YOUR_OPENAI_API_KEY_HERE` in `.env` with a valid OpenAI API key
- Get one at: https://platform.openai.com/api-keys
- The key should start with `sk-`

### Problem 2: Template path misconfiguration
**Root Cause**: Template path was pointing to wrong directory

**Solution**:
- Fixed template path from `templates/webapp-template` to `template` in `config.ts`

### Problem 3: "Extra" dashboard folder
**Not a bug**: This is intentional behavior

The system creates:
1. A timestamped directory (e.g., `dashboard-20241125-143025`)
2. A symlink called `dashboard` pointing to the latest version

This allows for versioning while maintaining a convenient "latest" reference.

## How the Generation Works

1. **Artifacts Generation**: Creates timestamped artifact directories with:
   - `intent.json` - User's application intent
   - `uns_overview.md` - MQTT/UNS topic analysis
   - `project_spec.md` - Project specification
   - `UI_spec.md` - UI specification

2. **Code Generation**:
   - Copies template to new timestamped app directory
   - Calls OpenAI API to generate code modifications
   - Applies patches to customize the template
   - Creates symlink to latest version

## Testing the Fix

1. Set valid OpenAI API key in `.env`:
```bash
OPENAI_API_KEY=sk-your-actual-key-here
```

2. Run the init command:
```bash
npm run cli init
```

3. Follow the prompts to describe your application

4. Check the generated app:
```bash
cd apps/dashboard
npm install
npm run dev
```

## Debug Information

When generation runs, it will:
- Save the code plan to `artifacts/last_code_plan.json` (if API succeeds)
- Log detailed information about what files are being modified
- Show error messages if API fails

## Common Issues

1. **"Invalid OPENAI_API_KEY detected"**
   - You need to replace the placeholder in `.env` with your actual API key

2. **No modifications applied to template**
   - Check if `artifacts/last_code_plan.json` was created
   - If not, the API call failed (likely invalid key)

3. **TypeScript/Build errors in generated app**
   - The AI-generated code may have issues
   - Check `artifacts/test_report.md` for auto-fix attempts
   - Manual fixes may be needed