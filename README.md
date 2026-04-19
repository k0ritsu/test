# README

## Module System (Mod)

This project uses a module management system implemented in `scripts/mod.ts`.
The system allows you to initialize, build, and manage application modules.

## Available Commands

### init

Initializes the module system with registry configuration.

**Usage:**

```bash
npm run mod -- init --registry <URL>
```

**Options:**

- `--registry <URL>` **(required)** - Module registry URL
- `--rootDir <path>` **(optional)** - Root directory for modules (default:
  `src`)

**Description:** Creates two configuration files in the `src/modules/` directory
(or specified via `--rootDir`):

- `.modrc.json` - Configuration with registry URL
- `.modlock.json` - Dependency lock file (initially empty)

**Examples:**

```bash
npm run mod -- init --registry http://localhost:8080
npm run mod -- init --registry http://registry.example.com --rootDir src
```

### build

Builds modules and converts TypeScript file paths to JavaScript.

**Usage:**

```bash
npm run mod -- build
```

**Options:**

- `--rootDir <path>` **(optional)** - Root directory for modules (default:
  `src`)
- `--outDir <path>` **(optional)** - Output directory for built files (default:
  `dist`)

**Description:**

- Scans all `module.json` files in the `src/modules/*/` directory
- For each `module.json` with a `main` field, replaces `.ts` extension with
  `.js`
- Copies processed files to the `dist` directory, preserving directory structure

**Examples:**

```bash
npm run mod -- build
npm run mod -- build --rootDir src --outDir dist
```

### publish

Publishes a module to the registry.

**Usage:**

```bash
npm run mod -- publish
```

**Status:** ⚠️ Not implemented

### install

Installs module dependencies.

**Usage:**

```bash
npm run mod -- install
```

**Status:** ⚠️ Not implemented

### remove

Removes installed modules.

**Usage:**

```bash
npm run mod -- remove
```

**Status:** ⚠️ Not implemented

## Module Structure

Each module should contain a `module.json` file with module description:

```json
{
  "name": "module-name",
  "version": "1.0.0",
  "main": "src/main.ts"
}
```

Modules are located in the `src/modules/` directory and follow this structure:

```
src/modules/
├── module-name-1/
│   ├── module.json
│   └── src/
│       └── main.ts
├── module-name-2/
│   ├── module.json
│   └── src/
│       └── main.ts
```

## Configuration Files

### .modrc.json

Contains registry configuration:

```json
{
  "registry": "http://localhost:8080"
}
```

### .modlock.json

Lock file containing information about installed module dependencies:

```json
{
  "module-name": {
    "name": "module-name",
    "version": "1.0.0",
    "dependencies": {}
  }
}
```
