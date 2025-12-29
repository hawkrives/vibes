# Reference Documentation

**Technical specifications and detailed information**

Reference documentation provides precise, technical descriptions of how GitLab CI/CD components work. This is where you look up specific details, syntax, and technical specifications.

## What's in the Reference

This section contains:

- Complete component specifications
- Configuration options and syntax
- Input and output parameters
- CI/CD keywords reference
- API and schema definitions

## Reference Sections

### [Component Specification](/reference/component-spec)
Detailed specification of component structure, file requirements, and technical constraints.

### [Configuration Options](/reference/configuration)
All available configuration options for components, with syntax and examples.

### [Input Parameters](/reference/inputs)
Complete reference of input parameter types, validation, and defaults.

### [Output Variables](/reference/outputs)
How components expose outputs and variables for downstream jobs.

### [CI/CD Keywords](/reference/keywords)
GitLab CI/CD keywords that can be used within components.

## Quick Lookup

| Need to find... | See... |
|----------------|--------|
| Input types | [Input Parameters](/reference/inputs) |
| Component file structure | [Component Specification](/reference/component-spec) |
| Available CI/CD keywords | [CI/CD Keywords](/reference/keywords) |
| Configuration syntax | [Configuration Options](/reference/configuration) |
| Output usage | [Output Variables](/reference/outputs) |

## Reference vs Other Docs

- **Learning?** → Use [Tutorials](/tutorials/)
- **Solving a problem?** → Check [How-to Guides](/how-to/)
- **Understanding concepts?** → Read [Explanation](/explanation/)
- **Looking up syntax?** → You're in the right place!

## Conventions

### Code Examples

All code examples are complete and copy-paste ready:

```yaml
# This will actually work
include:
  - component: gitlab.com/example/component@1.0.0
    inputs:
      key: value
```

### Parameter Notation

- **Required parameters:** Marked with `(required)`
- **Optional parameters:** Show default values
- **Type information:** Specified as `string`, `boolean`, `array`, etc.

### Version Information

Features are marked with minimum GitLab version:

> **GitLab 16.0+** - Feature requires GitLab 16.0 or higher
