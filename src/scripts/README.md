# OpenAPI Bundling Script

## Overview

The `bundle-openapi.ts` script resolves all external schema references in the OpenAPI specification and creates a fully bundled version with all schemas inline.

## Files

- **Input**: `public/specifications/3.0/openapi.json` (638 lines with external references)
- **Output**: `public/specifications/3.0/openapi.bundled.json` (6,478 lines fully resolved)

## Usage

### Manual Generation

```bash
yarn bundle-openapi
```

### Automatic Generation

The bundled version is automatically generated during the build process:

```bash
yarn build
```

## What It Does

1. Loads the main `openapi.json` file
2. Identifies all `$ref` references to external schema files (e.g., `http://localhost:3000/specifications/3.0/schemata/service.json`)
3. Loads each referenced schema file from the local filesystem
4. Recursively resolves nested references within each schema
5. Replaces all external references with inline schema definitions
6. Handles circular references to prevent infinite loops
7. Preserves internal references (like `#/components/parameters/search`)

## Benefits

- **Self-contained**: The bundled OpenAPI file contains all schema definitions inline
- **External compatibility**: Third-party tools and services can validate against the schema without needing to resolve external URLs
- **Better performance**: No need to fetch multiple schema files over the network
- **Offline support**: The bundled file works without internet connectivity

## Schema Resolution

The script handles multiple URL patterns:

- `https://openreferraluk.org/specifications/3.0/schemata/*.json`
- `http://localhost:3000/specifications/3.0/schemata/*.json`
- `./schemata/*.json`
- `*.json` (relative paths)

All resolved schemas are loaded from `public/specifications/3.0/schemata/` directory.

## Display

The bundled version is used on the specifications page at `/developers/specifications`, configured in:

- `src/utilities/getContentVersion.ts` (loads `openapi.bundled.json`)
- `src/app/developers/specifications/page.tsx` (displays the specification)
