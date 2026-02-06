# OpenAPI Schema Resolution

## Overview

The OpenAPI specification uses external schema references that are resolved at runtime when displaying the specification page. This approach keeps the public files accessible with proper URLs while providing a fully resolved schema for display.

## How It Works

### Runtime Resolution (Default)

The specification page automatically resolves all external schema references when loading:

1. **Public File**: `public/specifications/3.0/openapi.json` contains external references
   - Example: `"$ref": "https://openreferraluk.org/specifications/3.0/schemata/service.json"`
   - This file is publicly accessible and usable by external tools

2. **Runtime Resolution**: When the page loads, `SchemaResolver` utility:
   - Loads the main `openapi.json` file
   - Identifies all `$ref` references to external schema files
   - Loads each referenced schema from the local filesystem
   - Recursively resolves nested references
   - Handles circular references to prevent infinite loops
   - Returns a fully resolved schema for display

3. **Display**: The page shows the complete schema with all definitions inline

### Build-Time Bundling (Optional)

For cases where you need a pre-bundled file (e.g., for external distribution), you can generate a bundled version:

```bash
yarn bundle-openapi
```

This creates `public/specifications/3.0/openapi.bundled.json` with all schemas inline.

## Files

### Core Files

- **`src/utilities/SchemaResolver.ts`**: Runtime schema resolution utility
- **`src/utilities/getContentVersion.ts`**: Loads and resolves specifications at runtime
- **`src/scripts/bundle-openapi.ts`**: Optional build-time bundler

### Public Files

- **`public/specifications/3.0/openapi.json`**: Main specification with external references (638 lines)
- **`public/specifications/3.0/schemata/*.json`**: Individual schema files
- **`public/specifications/3.0/openapi.bundled.json`**: Optional pre-bundled version (6,478 lines)

## Benefits

### Runtime Resolution

- ✅ **Public accessibility**: External tools can fetch individual schema files
- ✅ **Proper URL references**: Schemas reference the canonical URLs
- ✅ **Maintainability**: Edit schemas in separate files
- ✅ **No build step**: Changes are reflected immediately
- ✅ **Smaller public files**: Original spec is only 638 lines

### Optional Bundling

- ✅ **Offline distribution**: Single file contains everything
- ✅ **External validators**: Some tools work better with bundled files
- ✅ **Performance**: No need to resolve at runtime (if using bundled version)

## Schema Resolution

The resolver handles multiple URL patterns:

- `https://openreferraluk.org/specifications/3.0/schemata/*.json`
- `http://localhost:3000/specifications/3.0/schemata/*.json`
- `./schemata/*.json`
- `*.json` (relative paths)

All schemas are loaded from `public/specifications/3.0/schemata/` directory.

## Usage

### For Website Display

No action needed - schemas are automatically resolved at runtime when viewing `/developers/specifications`.

### For External Distribution

If you need a bundled file for external use:

```bash
yarn bundle-openapi
```

Then distribute `public/specifications/3.0/openapi.bundled.json`.
