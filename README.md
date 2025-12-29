# Vibes

A collection of experimental projects and tools.

## Projects

### [KDL REPL](./kdl)

A mobile-friendly, interactive KDL (KDL Document Language) REPL built with vanilla JavaScript, Vite, and comprehensive testing.

**Features:**
- Real-time KDL parsing
- Interactive AST viewer with collapsible nodes
- JSON representation output
- Mobile-responsive design
- Comprehensive unit and E2E tests

See the [KDL REPL README](./kdl/README.md) for more details.

### [GitLab CI/CD Component Documentation](./gitlab-ci-component)

Comprehensive documentation for GitLab CI/CD components, structured using the Diátaxis framework.

**Features:**
- 📚 Tutorials - Learning-oriented lessons
- 🛠️ How-to Guides - Practical, task-oriented guides
- 📖 Reference - Technical specifications
- 💡 Explanation - Understanding-oriented discussions
- Built with VitePress
- Full navigation and search

See the [GitLab CI/CD Component README](./gitlab-ci-component/README.md) for more details.

## Development

### Prerequisites

- Node.js 18+
- pnpm

### Setup

```bash
# Install dependencies
pnpm install

# Start development server (for KDL REPL)
cd kdl && pnpm dev

# Start documentation site (for GitLab CI/CD Component docs)
cd gitlab-ci-component && pnpm docs:dev

# Build all projects
pnpm build

# Run tests
pnpm test:all
```

## License

ISC
