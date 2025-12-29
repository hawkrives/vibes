# Component Architecture

Understanding how GitLab CI/CD components work internally.

## Overview

GitLab CI/CD components are a mechanism for packaging and distributing reusable pipeline configurations. Understanding their architecture helps you create better components and use them more effectively.

## Component Lifecycle

### 1. Component Creation

```
Developer writes → Git repository → templates/template.yml
                                 → README.md
                                 → Version tag
```

A component is just a Git repository with a specific structure. The key file is `templates/template.yml`, which contains the component's logic.

### 2. Component Resolution

When GitLab processes a pipeline with a component reference:

```yaml
include:
  - component: gitlab.com/org/component@1.0.0
    inputs:
      key: value
```

GitLab performs these steps:

1. **Parse the reference:**
   - Extract: `gitlab.com` (instance)
   - Extract: `org/component` (project path)
   - Extract: `1.0.0` (version/ref)

2. **Fetch the component:**
   - Clone/fetch the component repository
   - Checkout the specified version
   - Read `templates/template.yml`

3. **Validate the spec:**
   - Check input types
   - Verify required inputs are provided
   - Validate options constraints

4. **Process inputs:**
   - Apply default values
   - Type-check provided values
   - Prepare for interpolation

5. **Interpolate template:**
   - Replace `$[[ inputs.name ]]` with actual values
   - Preserve types (strings, numbers, booleans, arrays)
   - Generate final YAML

6. **Merge into pipeline:**
   - Add templates to the pipeline configuration
   - Make templates available for `extends`

### 3. Component Execution

```
Pipeline starts → Job extends template → Merged configuration → Runner executes
```

Jobs that `extend` component templates inherit all their configuration, which can be overridden.

## Input Processing

### Input Flow

```
User provides inputs → Validation → Default application → Type checking → Interpolation
```

### Type Handling

Components preserve input types:

```yaml
# Input definition
spec:
  inputs:
    count:
      type: number
      default: 5

# In template
.template:
  parallel: $[[ inputs.count ]]

# Result (number preserved)
.template:
  parallel: 5
```

### Interpolation Engine

The interpolation syntax `$[[ inputs.name ]]` is processed during pipeline generation:

**Before interpolation (template):**
```yaml
.template:
  image: $[[ inputs.image ]]
  script: $[[ inputs.commands ]]
```

**After interpolation (actual job):**
```yaml
.template:
  image: node:20
  script:
    - npm install
    - npm test
```

## Template Resolution

### Extends Mechanism

When a job extends a component template:

```yaml
include:
  - component: gitlab.com/org/component@1.0.0

my-job:
  extends: .component-template
  stage: test  # Override
```

GitLab merges configurations:

1. Start with the extended template
2. Override with job-specific settings
3. Apply any rules or conditions

**Template:**
```yaml
.component-template:
  image: alpine:latest
  script:
    - echo "default"
  timeout: 30m
```

**Job:**
```yaml
my-job:
  extends: .component-template
  script:
    - echo "custom"
```

**Merged result:**
```yaml
my-job:
  image: alpine:latest  # From template
  script:
    - echo "custom"     # From job (overridden)
  timeout: 30m          # From template
  stage: test           # From job
```

### Multiple Extends

Jobs can extend multiple templates (processed left to right):

```yaml
my-job:
  extends:
    - .base-template
    - .component-template  # Overrides .base-template
  script:
    - echo "custom"        # Overrides both
```

## Component Scoping

### Namespace Isolation

Components are isolated by Git repository:

```
gitlab.com/team-a/component → team-a's templates
gitlab.com/team-b/component → team-b's templates (separate namespace)
```

### Version Isolation

Different versions are completely separate:

```
component@1.0.0 → Git tag 1.0.0
component@2.0.0 → Git tag 2.0.0 (different code)
```

## Caching and Performance

### Component Caching

GitLab caches component repositories to improve performance:

- **First use:** Clone from Git
- **Subsequent uses:** Use cached copy (if version unchanged)
- **Cache invalidation:** When new commits/tags are pushed

### Pipeline Generation

Component resolution happens during pipeline creation:

```
Push code → Trigger pipeline → Parse .gitlab-ci.yml → Resolve components
→ Generate pipeline DAG → Execute jobs
```

This means:
- Component changes don't affect running pipelines
- Component resolution failures prevent pipeline creation
- All jobs see the same component version

## Variable Scope

### Component-Level Variables

Variables in component templates:

```yaml
.template:
  variables:
    COMPONENT_VAR: "value"
```

### Job-Level Variables

Variables in jobs that extend templates:

```yaml
my-job:
  extends: .template
  variables:
    JOB_VAR: "value"
```

### Merging Behavior

Variables are merged (job variables override component variables):

```yaml
# Component
.template:
  variables:
    SHARED: "from-component"
    COMPONENT_ONLY: "value"

# Job
my-job:
  extends: .template
  variables:
    SHARED: "from-job"  # Overrides
    JOB_ONLY: "value"

# Result
my-job:
  variables:
    SHARED: "from-job"        # From job
    COMPONENT_ONLY: "value"   # From component
    JOB_ONLY: "value"         # From job
```

## Security Architecture

### Access Control

Component access follows Git repository permissions:

```
Public repository → Anyone can use component
Private repository → Only users with access can use component
```

### Input Validation

Validation happens at pipeline creation:

```
User inputs → Type check → Options check → Required check → Pass/Fail
```

Failed validation prevents pipeline creation (fail-fast).

### Secret Isolation

Components cannot access:
- Other jobs' secrets
- Pipeline-level secrets not exposed via variables
- Secrets from other projects

Components can use:
- CI/CD variables (if passed)
- Variables from extended jobs
- Public GitLab CI variables

## Artifact Flow

### Component-Generated Artifacts

```
Component job runs → Produces artifacts → Stored by GitLab → Available to downstream
```

### Dotenv Artifacts

Special flow for variables:

```
Component writes file.env → Artifact upload → GitLab parses → Variables available
```

## Design Principles

### Declarative Configuration

Components use declarative YAML, not imperative scripts:

```yaml
# Good: Declarative
.template:
  image: node:20
  script:
    - npm test

# Not supported: Imperative template generation
.template:
  image: |
    {% if condition %}node:20{% else %}node:18{% endif %}
```

### Static Resolution

Components are resolved once at pipeline creation:

- No dynamic component loading during execution
- Version is locked for the entire pipeline
- Predictable, reproducible pipelines

### Composition Over Inheritance

Components favor composition:

```yaml
include:
  - component: gitlab.com/org/build@1.0.0
  - component: gitlab.com/org/test@1.0.0
  - component: gitlab.com/org/deploy@1.0.0

# Compose components
build:
  extends: .build-component

test:
  extends: .test-component
  needs: [build]
```

## Limitations and Constraints

### What Components Can't Do

1. **Dynamic includes:** Can't include other components conditionally
2. **Code generation:** Can't generate arbitrary YAML
3. **Cross-project access:** Can't read files from other projects
4. **Runtime modification:** Can't change behavior during execution

### What Components Can Do

1. **Template reuse:** Share job configurations
2. **Input customization:** Accept parameters
3. **Generate outputs:** Create artifacts and variables
4. **Compose:** Work with other components
5. **Version:** Support multiple versions

## Internal Structure

### Component Repository

```
component/
├── .git/                  # Git repository
├── README.md              # Documentation
├── LICENSE                # License file
├── CHANGELOG.md           # Version history
├── templates/
│   └── template.yml       # Main template file
├── catalog-info.yml       # Catalog metadata
└── examples/              # Example usage (optional)
    └── .gitlab-ci.yml
```

### Template File Structure

```yaml
# Section 1: Specification (optional)
spec:
  inputs:
    # Input definitions

# Section 2: Templates (required)
---
.template-1:
  # Job configuration

---
.template-2:
  # Another template
```

## Evolution and Compatibility

### Forward Compatibility

Newer GitLab versions can use older components:

```
GitLab 17.0 → Can use components made for GitLab 16.0
```

### Backward Compatibility

Older GitLab versions cannot use newer features:

```
GitLab 16.0 → Cannot use features added in GitLab 16.5
```

### Feature Detection

No built-in feature detection - document minimum GitLab version:

```yaml
# In README.md
**Minimum GitLab Version:** 16.3
```

## See Also

- [Component Specification](/reference/component-spec)
- [Best Practices](/explanation/best-practices)
- [Input Parameters](/reference/inputs)
- [Building a CI Pipeline](/tutorials/building-pipeline)
