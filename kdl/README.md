# KDL REPL

A mobile-friendly, interactive KDL (KDL Document Language) REPL built with vanilla JavaScript.

## Features

- **Live Parsing**: Real-time KDL parsing as you type
- **Interactive AST Viewer**: Collapsible tree view of the document structure
- **JSON Representation**: View the parsed document as JSON
- **Mobile-Friendly**: Responsive design with dropdown selector for mobile devices
- **Modern Build**: Built with Vite for optimal performance

## Development

### Prerequisites

- Node.js 18+ and pnpm

### Setup

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Testing

```bash
# Run unit tests
pnpm test

# Run unit tests in watch mode
pnpm test:watch

# Run E2E tests (requires Playwright browsers)
pnpm test:e2e

# Run all tests
pnpm test:all
```

## Usage

The REPL includes:

1. **Input Area**: Enter your KDL document
2. **View Selector**: Choose between Interactive AST or JSON representation
3. **Output Area**: See the parsed result

## Technology

- Uses [@bgotink/kdl](https://github.com/bgotink/kdl) library
- Built with [Vite](https://vitejs.dev/)
- Tested with [Vitest](https://vitest.dev/) and [Playwright](https://playwright.dev/)
- No framework dependencies - pure vanilla JavaScript

## Example

The REPL comes pre-loaded with an example KDL document showing common patterns like nested nodes, properties, and arguments.
