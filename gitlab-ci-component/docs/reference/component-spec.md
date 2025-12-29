# Component Specification

Complete technical specification for GitLab CI/CD components.

## Overview

A GitLab CI/CD component is a Git repository with a specific structure that exports reusable pipeline configurations.

**Minimum GitLab Version:** 16.0

## Repository Structure

```
my-component/
├── README.md                 # Component documentation (required)
├── templates/
│   └── template.yml          # Component template (required)
├── LICENSE                   # License file (recommended)
├── CHANGELOG.md             # Version history (recommended)
└── catalog-info.yml         # Catalog metadata (optional)
```

### Required Files

#### README.md

Must contain:
- Component description
- Usage examples
- Input parameter documentation
- Version information

#### templates/template.yml

Must contain:
- Spec section (if using inputs)
- At least one job template

## Template File Format

### Basic Structure

```yaml
# Spec section (optional but recommended)
spec:
  inputs:
    # Input definitions

---
# Template section (required)
.template-name:
  # Job configuration
```

### Spec Section

```yaml
spec:
  inputs:
    input_name:
      description: 'Human-readable description'
      type: string                    # string, number, boolean, array
      default: 'default-value'        # Optional default value
      required: false                 # true or false (default: false)
      options:                        # Optional: restrict to specific values
        - 'option1'
        - 'option2'
      deprecated: false               # Mark as deprecated
      deprecation_message: ''         # Custom deprecation message
```

### Template Section

Templates are job definitions that users can extend:

```yaml
.my-template:
  stage: $[[ inputs.stage ]]
  image: $[[ inputs.image ]]
  script:
    - echo "Running template"
  cache:
    key: $[[ inputs.cache_key ]]
    paths:
      - .cache/
  artifacts:
    paths:
      - output/
```

## Input Interpolation

Use `$[[ inputs.name ]]` to reference inputs:

```yaml
.template:
  image: $[[ inputs.image ]]          # Simple interpolation
  script: $[[ inputs.script ]]        # Can be string or array
  variables:
    VAR: $[[ inputs.value ]]          # In variables
  timeout: $[[ inputs.timeout ]]      # Numeric values
```

### Interpolation Rules

- **Syntax:** Must use `$[[` and `]]` (double brackets)
- **Scope:** Only works within template section
- **Type preservation:** Arrays remain arrays, strings remain strings
- **Undefined inputs:** Use defaults or fail if required

## Input Types

### string

```yaml
spec:
  inputs:
    message:
      type: string
      default: 'Hello World'
```

Usage:
```yaml
.template:
  script:
    - echo "$[[ inputs.message ]]"
```

### number

```yaml
spec:
  inputs:
    timeout:
      type: number
      default: 3600
```

Usage:
```yaml
.template:
  timeout: $[[ inputs.timeout ]]m
```

### boolean

```yaml
spec:
  inputs:
    cache_enabled:
      type: boolean
      default: true
```

Usage:
```yaml
.template:
  cache:
    key: cache
    paths:
      - node_modules/
    disabled: $[[ inputs.cache_enabled ]]
```

### array

```yaml
spec:
  inputs:
    script:
      type: array
      default:
        - echo "Step 1"
        - echo "Step 2"
```

Usage:
```yaml
.template:
  script: $[[ inputs.script ]]
```

## Template Naming

### Conventions

- Start with a dot: `.my-template`
- Use descriptive names: `.node-build`, `.security-scan`
- Follow kebab-case: `.my-multi-word-template`

### Multiple Templates

A component can export multiple templates:

```yaml
spec:
  inputs:
    # Shared inputs

---
.build:
  stage: build
  script:
    - npm run build

---
.test:
  stage: test
  script:
    - npm test

---
.deploy:
  stage: deploy
  script:
    - npm run deploy
```

## Component Versioning

### Git Tags

Components are versioned using Git tags:

```bash
git tag -a 1.0.0 -m "Release 1.0.0"
git push origin 1.0.0
```

### Version References

Users can reference specific versions:

```yaml
# Exact version
- component: gitlab.com/org/component@1.2.3

# Major version (gets latest 1.x.x)
- component: gitlab.com/org/component@1

# Minor version (gets latest 1.2.x)
- component: gitlab.com/org/component@1.2

# Branch
- component: gitlab.com/org/component@main

# Commit SHA
- component: gitlab.com/org/component@abc123
```

## Component Path Format

```
gitlab.com/namespace/project@version
```

- **gitlab.com:** GitLab instance (can be self-hosted domain)
- **namespace:** User or group namespace
- **project:** Repository name
- **version:** Tag, branch, or SHA

### Examples

```yaml
# GitLab.com project
- component: gitlab.com/my-org/component@1.0.0

# Self-hosted GitLab
- component: gitlab.example.com/team/component@2.0.0

# Nested group
- component: gitlab.com/org/subgroup/component@1.0.0
```

## Validation

### YAML Validation

Templates must be valid YAML:

```bash
# Install yamllint
pip install yamllint

# Validate template
yamllint templates/template.yml
```

### Spec Validation

GitLab validates the spec section:

- Input names must be valid identifiers
- Types must be: `string`, `number`, `boolean`, or `array`
- Options must match the declared type
- Required inputs cannot have defaults

### Common Validation Errors

```yaml
# ❌ Invalid input name (has spaces)
spec:
  inputs:
    my input:  # Error: invalid name

# ✅ Correct
spec:
  inputs:
    my_input:

# ❌ Invalid type
spec:
  inputs:
    value:
      type: integer  # Error: use 'number'

# ✅ Correct
spec:
  inputs:
    value:
      type: number

# ❌ Required with default
spec:
  inputs:
    value:
      required: true
      default: 'value'  # Error: required inputs can't have defaults

# ✅ Correct (choose one)
spec:
  inputs:
    value:
      required: true  # No default
    # OR
    value:
      default: 'value'  # Not required
```

## Size Limits

| Item | Limit |
|------|-------|
| Template file size | 1 MB |
| Number of inputs | 100 |
| Input name length | 255 characters |
| Number of templates per component | 50 |
| Repository size | GitLab instance limits |

## Compatibility

### GitLab Version Support

| Feature | Minimum Version |
|---------|----------------|
| Basic components | 16.0 |
| Input types | 16.0 |
| Input options | 16.1 |
| Input deprecation | 16.3 |
| Multiple templates | 16.0 |
| Array inputs | 16.2 |
| CI/CD Catalog | 16.7 |

### Runner Compatibility

Components work with all GitLab Runner versions that support the GitLab instance version.

## Security Considerations

### Access Control

- Component repository visibility controls who can use it
- Private components require access to the repository
- Public components are accessible to all

### Secret Handling

```yaml
# ❌ Don't hardcode secrets
.bad-template:
  script:
    - export API_KEY="hardcoded-secret"  # Never do this

# ✅ Use CI/CD variables
.good-template:
  script:
    - echo "Using $API_KEY from CI/CD variables"
```

### Input Validation

Always validate inputs in scripts:

```yaml
.template:
  script:
    - |
      if [ -z "$[[ inputs.required_value ]]" ]; then
        echo "Error: required_value is empty"
        exit 1
      fi
```

## See Also

- [Input Parameters](/reference/inputs) - Detailed input documentation
- [Configuration Options](/reference/configuration) - All config options
- [Best Practices](/explanation/best-practices) - Component design patterns
