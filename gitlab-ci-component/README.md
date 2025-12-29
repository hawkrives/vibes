# GitLab CI/CD Component Documentation

Comprehensive documentation for GitLab CI/CD components, structured using the **Diátaxis framework**.

## About This Documentation

This documentation site provides complete guidance for creating, using, and understanding GitLab CI/CD components. It follows the [Diátaxis](https://diataxis.fr/) documentation framework, organizing content into four distinct categories:

### 📚 [Tutorials](docs/tutorials/)
**Learning-oriented lessons** - Step-by-step tutorials to help you learn by doing.

- [Getting Started](docs/tutorials/getting-started.md)
- [Your First Component](docs/tutorials/first-component.md)
- [Building a CI Pipeline](docs/tutorials/building-pipeline.md)

### 🛠️ [How-to Guides](docs/how-to/)
**Problem-solving recipes** - Practical guides for specific tasks.

- [Create a Component](docs/how-to/create-component.md)
- [Use Components in Pipelines](docs/how-to/use-components.md)
- [Share Components](docs/how-to/share-components.md)
- [Test Components](docs/how-to/test-components.md)
- [Version Components](docs/how-to/version-components.md)

### 📖 [Reference](docs/reference/)
**Technical specifications** - Detailed reference documentation.

- [Component Specification](docs/reference/component-spec.md)
- [Configuration Options](docs/reference/configuration.md)
- [Input Parameters](docs/reference/inputs.md)
- [Output Variables](docs/reference/outputs.md)
- [CI/CD Keywords](docs/reference/keywords.md)

### 💡 [Explanation](docs/explanation/)
**Understanding-oriented discussions** - Conceptual deep-dives.

- [Component Architecture](docs/explanation/architecture.md)
- [Component Catalog](docs/explanation/catalog.md)
- [Best Practices](docs/explanation/best-practices.md)
- [Security Considerations](docs/explanation/security.md)

## Quick Start

### Running the Documentation Site Locally

```bash
# Install dependencies
npm install

# Start development server
npm run docs:dev

# Build for production
npm run docs:build

# Preview production build
npm run docs:preview
```

The documentation will be available at `http://localhost:5173/gitlab-ci-component/`

### Installing VitePress Dependency

If you haven't installed dependencies yet:

```bash
cd gitlab-ci-component
npm install
```

## Project Structure

```
gitlab-ci-component/
├── docs/
│   ├── .vitepress/
│   │   └── config.js          # VitePress configuration
│   ├── index.md               # Homepage
│   ├── tutorials/             # Learning-oriented content
│   │   ├── index.md
│   │   ├── getting-started.md
│   │   ├── first-component.md
│   │   └── building-pipeline.md
│   ├── how-to/                # Task-oriented content
│   │   ├── index.md
│   │   ├── create-component.md
│   │   ├── use-components.md
│   │   ├── share-components.md
│   │   ├── test-components.md
│   │   └── version-components.md
│   ├── reference/             # Information-oriented content
│   │   ├── index.md
│   │   ├── component-spec.md
│   │   ├── configuration.md
│   │   ├── inputs.md
│   │   ├── outputs.md
│   │   └── keywords.md
│   └── explanation/           # Understanding-oriented content
│       ├── index.md
│       ├── architecture.md
│       ├── catalog.md
│       ├── best-practices.md
│       └── security.md
├── package.json
└── README.md
```

## The Diátaxis Framework

This documentation follows the [Diátaxis](https://diataxis.fr/) framework, which organizes documentation into four quadrants:

|                | Learning-oriented | Understanding-oriented |
|----------------|-------------------|------------------------|
| **Practical**  | Tutorials 📚      | How-to Guides 🛠️      |
| **Theoretical**| Explanation 💡    | Reference 📖           |

### When to Use Each Section

- **Learning how things work?** → Start with [Tutorials](docs/tutorials/)
- **Solving a specific problem?** → Check [How-to Guides](docs/how-to/)
- **Looking up technical details?** → See [Reference](docs/reference/)
- **Understanding concepts?** → Read [Explanation](docs/explanation/)

## Contributing

This documentation is part of the larger GitLab CI/CD components ecosystem. To contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Technology

- **Framework:** [VitePress](https://vitepress.dev/)
- **Documentation System:** [Diátaxis](https://diataxis.fr/)
- **Markdown:** GitHub Flavored Markdown

## License

This documentation is part of the Vibes project. See the main LICENSE file for details.

## Resources

- [GitLab CI/CD Components Documentation](https://docs.gitlab.com/ee/ci/components/)
- [GitLab CI/CD YAML Reference](https://docs.gitlab.com/ee/ci/yaml/)
- [Diátaxis Framework](https://diataxis.fr/)
- [VitePress Documentation](https://vitepress.dev/)
