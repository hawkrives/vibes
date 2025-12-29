# Best Practices

Proven patterns and recommendations for creating effective GitLab CI/CD components.

## Design Principles

### Single Responsibility

Each component should do one thing well:

```yaml
# Good: Focused component
# node-test-component: Just runs tests

# Less good: Component doing too much
# node-everything: Installs, lints, tests, builds, deploys
```

**Benefits:**
- Easier to understand
- More reusable
- Simpler to maintain
- Composable with other components

### Composition Over Complexity

Build complex pipelines by composing simple components:

```yaml
# Good: Compose focused components
include:
  - component: gitlab.com/org/node-install@1.0.0
  - component: gitlab.com/org/eslint@1.0.0
  - component: gitlab.com/org/jest@1.0.0

# Less good: One complex component
include:
  - component: gitlab.com/org/node-everything@1.0.0
```

### Sensible Defaults

Provide defaults that work for 80% of use cases:

```yaml
spec:
  inputs:
    node_version:
      type: string
      default: '20'  # Current LTS

    cache_enabled:
      type: boolean
      default: true  # Most want caching

    timeout:
      type: number
      default: 30  # Reasonable default
```

Users can override when needed:

```yaml
include:
  - component: gitlab.com/org/node-build@1.0.0
    inputs:
      node_version: '21'  # Override for specific case
```

## Input Design

### Required vs Optional

Make inputs required only when necessary:

```yaml
spec:
  inputs:
    # Required: Must be specified
    api_endpoint:
      type: string
      required: true
      description: 'API endpoint URL (no default exists)'

    # Optional: Has sensible default
    timeout:
      type: number
      default: 30
      description: 'Request timeout in seconds'
```

### Input Naming

Use clear, consistent names:

```yaml
# Good
spec:
  inputs:
    node_version:      # Clear what it is
    cache_enabled:     # Boolean is obvious
    retry_count:       # Specific and clear
    image_name:        # Descriptive

# Less clear
spec:
  inputs:
    version:           # Version of what?
    cache:             # Boolean or string?
    retries:           # Count or config object?
    image:             # Ambiguous
```

**Conventions:**
- Use snake_case
- Booleans: `enabled`, `use_*`, `allow_*`
- Numbers: `*_count`, `*_timeout`, `max_*`
- Strings: Be specific about what

### Input Validation

Validate inputs in scripts when spec validation isn't enough:

```yaml
.template:
  script:
    - |
      # Validate numeric range
      if [ $[[ inputs.timeout ]] -lt 1 ] || [ $[[ inputs.timeout ]] -gt 3600 ]; then
        echo "Error: timeout must be between 1 and 3600 seconds"
        exit 1
      fi

    - |
      # Validate URL format
      if ! echo "$[[ inputs.api_url ]]" | grep -qE '^https?://'; then
        echo "Error: api_url must start with http:// or https://"
        exit 1
      fi

    - |
      # Validate file exists
      if [ ! -f "$[[ inputs.config_file ]]" ]; then
        echo "Error: config_file not found: $[[ inputs.config_file ]]"
        exit 1
      fi
```

## Documentation

### README Structure

Every component should have a comprehensive README:

```markdown
# Component Name

One-sentence description of what it does.

## Quick Start

```yaml
include:
  - component: gitlab.com/org/component@1.0.0
    inputs:
      key: value
```

## Description
What this component does and why you'd use it.

## Inputs
Complete table of all inputs.

## Outputs
Variables and artifacts produced (if any).

## Examples
Multiple real-world examples.

## Requirements
- GitLab version
- Runner requirements
- External dependencies

## Changelog
Link to CHANGELOG.md or inline recent changes.

## Support
How to get help or report issues.

## License
License information.
```

### Input Documentation

Document every input thoroughly:

```yaml
spec:
  inputs:
    node_version:
      description: 'Node.js version to use (LTS versions recommended)'
      type: string
      default: '20'
      # In README:
      # - Supports versions 18, 20, 21
      # - Use exact version (e.g., '20.10.0') or major version ('20')
      # - See https://nodejs.org/en/about/releases/
```

### Example Variety

Provide multiple examples:

```markdown
## Examples

### Basic Usage
```yaml
test:
  extends: .node-test
```

### With Custom Node Version
```yaml
test:
  extends: .node-test
  inputs:
    node_version: '18'
```

### With Coverage Threshold
```yaml
test:
  extends: .node-test
  inputs:
    coverage_threshold: 80
```

### Complete Example
```yaml
include:
  - component: gitlab.com/org/node-test@1.0.0
    inputs:
      node_version: '20'
      coverage_threshold: 80
      timeout: 15

test:
  extends: .node-test
  stage: test
```
```

## Versioning

### Semantic Versioning

Follow semantic versioning strictly:

- **Major (X.0.0):** Breaking changes
- **Minor (1.X.0):** New features, backward compatible
- **Patch (1.0.X):** Bug fixes

### What Constitutes Breaking Changes

**Breaking changes:**
- Renaming inputs
- Removing inputs
- Changing input types
- Changing default behavior
- Removing template names
- Requiring previously optional inputs

**Not breaking:**
- Adding new optional inputs
- Adding new templates
- Fixing bugs
- Improving documentation
- Internal refactoring (if behavior unchanged)

### Version Support

Document support policy:

```markdown
## Version Support

| Version | Status | Support Until |
|---------|--------|---------------|
| 3.x | Active development | Current |
| 2.x | Maintenance | 2025-12-31 |
| 1.x | Deprecated | 2025-06-30 |

- **Active development:** New features and bug fixes
- **Maintenance:** Critical bug fixes only
- **Deprecated:** No updates, migrate to newer version
```

## Security

### Never Hardcode Secrets

```yaml
# ❌ Never do this
.bad-component:
  script:
    - export API_KEY="sk-1234567890"
    - curl -H "Authorization: Bearer $API_KEY" api.example.com

# ✅ Use CI/CD variables
.good-component:
  script:
    - |
      if [ -z "$API_KEY" ]; then
        echo "Error: API_KEY environment variable required"
        exit 1
      fi
    - curl -H "Authorization: Bearer $API_KEY" api.example.com
```

### Input Sanitization

Sanitize inputs used in shell commands:

```yaml
.template:
  script:
    - |
      # Sanitize input to prevent command injection
      SAFE_INPUT=$(printf '%s' "$[[ inputs.user_input ]]" | sed 's/[^a-zA-Z0-9._-]//g')
      command --arg="$SAFE_INPUT"

    - |
      # Or validate format strictly
      if ! echo "$[[ inputs.version ]]" | grep -qE '^[0-9]+\.[0-9]+\.[0-9]+$'; then
        echo "Invalid version format"
        exit 1
      fi
```

### Least Privilege

Request minimum permissions necessary:

```yaml
# Document required permissions
# README.md:
## Required Permissions
- **Repository:** Read access
- **CI/CD variables:** Read API_KEY
- **Container registry:** Write access (for deployment)
```

## Performance

### Caching Strategy

Use caching effectively:

```yaml
.optimized-component:
  cache:
    # Cache key based on dependencies
    key:
      files:
        - package-lock.json
      prefix: $CI_COMMIT_REF_SLUG

    # Cache dependencies
    paths:
      - node_modules/
      - .npm/

    # Pull-push for most jobs
    policy: pull-push

  script:
    - npm ci --cache .npm
    - npm test
```

### Artifact Management

Be selective with artifacts:

```yaml
.template:
  artifacts:
    # Only necessary files
    paths:
      - dist/*.js  # Specific patterns, not entire directories
      - coverage/summary.json  # Summary, not full reports

    # Reasonable expiration
    expire_in: 1 week  # Not forever

    # Conditional upload
    when: on_success  # Don't upload on failure if not needed
```

### Parallel Execution

Design for parallelization:

```yaml
spec:
  inputs:
    parallel_count:
      type: number
      default: 1

---
.parallelizable-template:
  parallel: $[[ inputs.parallel_count ]]
  script:
    - run_tests.sh --node-index $CI_NODE_INDEX --node-total $CI_NODE_TOTAL
```

## Maintainability

### Keep It Simple

Resist over-engineering:

```yaml
# Good: Simple and clear
.template:
  image: node:$[[ inputs.version ]]
  script:
    - npm install
    - npm test

# Over-engineered
.template:
  before_script:
    - source ./lib/utils.sh
    - load_config $[[ inputs.config ]]
    - setup_environment
  script:
    - run_with_retry npm install
    - check_prerequisites
    - execute_tests_with_reporting
```

### Avoid Deep Dependencies

Don't create component hierarchies:

```yaml
# ❌ Avoid: Component including another component
# templates/template.yml
include:
  - component: gitlab.com/org/base-component@1.0.0

# ✅ Better: Users compose components
# User's .gitlab-ci.yml
include:
  - component: gitlab.com/org/base-component@1.0.0
  - component: gitlab.com/org/your-component@1.0.0
```

### Changelog Maintenance

Keep CHANGELOG.md updated:

```markdown
# Changelog

All notable changes to this component will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added
- New `retry_count` input for configurable retries

## [1.1.0] - 2025-01-15

### Added
- Support for Node.js 21
- New `coverage_threshold` input

### Fixed
- Artifact paths now handle spaces correctly

### Changed
- Default timeout increased from 15m to 30m

## [1.0.0] - 2025-01-01

- Initial release
```

## Testing

### Test Before Release

Test components thoroughly:

```yaml
# In component repo: .gitlab-ci.yml
include:
  - local: templates/template.yml

test-default:
  extends: .component-template
  script:
    - echo "Testing with defaults"

test-custom:
  extends: .component-template
  variables:
    CUSTOM: "value"
```

### Version Testing

Test with multiple GitLab versions if possible:

```markdown
## Tested With
- ✅ GitLab 16.7
- ✅ GitLab 16.5
- ✅ GitLab 16.0
- ❌ GitLab 15.x (not supported)
```

## Common Patterns

### Feature Flags

Allow users to enable/disable features:

```yaml
spec:
  inputs:
    enable_cache:
      type: boolean
      default: true
    enable_coverage:
      type: boolean
      default: false

---
.template:
  cache:
    disabled: $[[ inputs.enable_cache ]]
    # ... cache configuration
```

### Matrix Support

Design for matrix builds:

```yaml
.template:
  parallel:
    matrix:
      - NODE_VERSION: ['18', '20', '21']
  image: node:${NODE_VERSION}
  script:
    - npm test
```

### Conditional Steps

Allow optional script steps:

```yaml
spec:
  inputs:
    before_commands:
      type: array
      default: []
    after_commands:
      type: array
      default: []

---
.template:
  script:
    - $[[ inputs.before_commands ]]
    - npm test  # Main command
    - $[[ inputs.after_commands ]]
```

## Anti-Patterns to Avoid

### ❌ Too Many Inputs

```yaml
# Overwhelming users with 20+ inputs
spec:
  inputs:
    input_1: ...
    input_2: ...
    # ... 18 more
```

**Instead:** Keep inputs focused, use sensible defaults.

### ❌ Overly Generic

```yaml
# Component that tries to do everything
.generic-template:
  image: $[[ inputs.image ]]
  script: $[[ inputs.script ]]
  # Basically just re-implementing GitLab CI
```

**Instead:** Provide value through sensible defaults and composition.

### ❌ Breaking Changes in Minor Versions

```yaml
# Version 1.1.0
spec:
  inputs:
    cache_key:  # Renamed from 'cache' (breaking!)
```

**Instead:** Save breaking changes for major versions.

### ❌ Undocumented Outputs

Component produces outputs but doesn't document them.

**Instead:** Document all outputs in README.

## See Also

- [Component Architecture](/explanation/architecture)
- [How to Create a Component](/how-to/create-component)
- [Security Considerations](/explanation/security)
- [Component Specification](/reference/component-spec)
