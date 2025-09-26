# Test Report

Generated: 2025-09-25T06:50:57.377Z

## Summary

- Status: ❌ FAILED
- Errors: 5
- Fixes Applied: 2

## Errors

1. Build failed: Command failed with exit code 127: npm run build

sh: vite: command not found


> mes-single-screen-app@0.1.0 build
> vite build
2. Type check failed: Command failed with exit code 2: npx tsc --noEmit

error TS2688: Cannot find type definition file for 'vite/client'.
  The file is in the program because:
    Entry point of type library 'vite/client' specified in compilerOptions
3. Build failed: Command failed with exit code 1: npm run build

failed to load config from /Users/yqliang/Documents/Projects/gen-app/uns-app-cli/apps/dashboard-20250925-144939/vite.config.ts
error during build:
Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'vite' imported from /Users/yqliang/Documents/Projects/gen-app/uns-app-cli/apps/dashboard-20250925-144939/node_modules/.vite-temp/vite.config.ts.timestamp-1758783052621-465882e4c1217.mjs
    at Object.getPackageJSONURL (node:internal/modules/package_json_reader:268:9)
    at packageResolve (node:internal/modules/esm/resolve:768:81)
    at moduleResolve (node:internal/modules/esm/resolve:854:18)
    at defaultResolve (node:internal/modules/esm/resolve:984:11)
    at ModuleLoader.defaultResolve (node:internal/modules/esm/loader:685:12)
    at #cachedDefaultResolve (node:internal/modules/esm/loader:634:25)
    at ModuleLoader.resolve (node:internal/modules/esm/loader:617:38)
    at ModuleLoader.getModuleJobForImport (node:internal/modules/esm/loader:273:38)
    at ModuleJob._link (node:internal/modules/esm/module_job:135:49)


> mes-single-screen-app@0.1.0 build
> npx vite build
4. Type check failed: Command failed with exit code 2: npx tsc --noEmit

error TS2688: Cannot find type definition file for 'vite/client'.
  The file is in the program because:
    Entry point of type library 'vite/client' specified in compilerOptions
5. Build failed: Command failed with exit code 1: npm run build

failed to load config from /Users/yqliang/Documents/Projects/gen-app/uns-app-cli/apps/dashboard-20250925-144939/vite.config.ts
error during build:
Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'vite' imported from /Users/yqliang/Documents/Projects/gen-app/uns-app-cli/apps/dashboard-20250925-144939/node_modules/.vite-temp/vite.config.ts.timestamp-1758783057362-10fb071367315.mjs
    at Object.getPackageJSONURL (node:internal/modules/package_json_reader:268:9)
    at packageResolve (node:internal/modules/esm/resolve:768:81)
    at moduleResolve (node:internal/modules/esm/resolve:854:18)
    at defaultResolve (node:internal/modules/esm/resolve:984:11)
    at ModuleLoader.defaultResolve (node:internal/modules/esm/loader:685:12)
    at #cachedDefaultResolve (node:internal/modules/esm/loader:634:25)
    at ModuleLoader.resolve (node:internal/modules/esm/loader:617:38)
    at ModuleLoader.getModuleJobForImport (node:internal/modules/esm/loader:273:38)
    at ModuleJob._link (node:internal/modules/esm/module_job:135:49)


> mes-single-screen-app@0.1.0 build
> npx vite build

## Fixes Applied

1. Fix attempt 1 completed
2. Fix attempt 2 completed

## Logs (last 50 lines)

```

```
