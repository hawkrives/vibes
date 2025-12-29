# Configuration Options

Complete reference of all configuration options available in GitLab CI/CD components.

## Component Configuration

### Include Syntax

```yaml
include:
  - component: gitlab.com/namespace/component@version
    inputs:
      key: value
    rules:
      - if: $CI_COMMIT_BRANCH == "main"
```

### Include Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `component` | string | Yes | Component path with version |
| `inputs` | object | No | Input values for the component |
| `rules` | array | No | Conditions for including component |

## Input Configuration

### Input Properties

```yaml
spec:
  inputs:
    input_name:
      description: string      # Human-readable description
      type: string            # string, number, boolean, array
      default: any            # Default value
      required: boolean       # Whether input is required
      options: array          # Allowed values
      deprecated: boolean     # Mark as deprecated
      deprecation_message: string  # Custom deprecation message
```

### Type-Specific Configuration

#### String Inputs

```yaml
spec:
  inputs:
    message:
      description: 'Message to display'
      type: string
      default: 'Hello World'
      options:  # Optional: restrict to specific values
        - 'debug'
        - 'info'
        - 'warning'
        - 'error'
```

#### Number Inputs

```yaml
spec:
  inputs:
    timeout:
      description: 'Timeout in seconds'
      type: number
      default: 3600
      # Note: No min/max validation in spec, validate in script
```

#### Boolean Inputs

```yaml
spec:
  inputs:
    enabled:
      description: 'Enable feature'
      type: boolean
      default: true
```

#### Array Inputs

```yaml
spec:
  inputs:
    commands:
      description: 'Commands to execute'
      type: array
      default:
        - echo "Step 1"
        - echo "Step 2"
```

### Deprecated Inputs

```yaml
spec:
  inputs:
    old_name:
      description: 'Old parameter name'
      type: string
      deprecated: true
      deprecation_message: 'Use new_name instead. Will be removed in v2.0'
    new_name:
      description: 'New parameter name'
      type: string
      default: 'value'
```

## Job Template Configuration

### Basic Template

```yaml
.template-name:
  stage: string
  image: string
  services: array
  before_script: array
  script: array
  after_script: array
  cache: object
  artifacts: object
  variables: object
```

### Complete Template Example

```yaml
.comprehensive-template:
  # Stage configuration
  stage: $[[ inputs.stage ]]

  # Image and services
  image: $[[ inputs.image ]]
  services:
    - postgres:13

  # Script sections
  before_script:
    - echo "Preparing environment"
    - apt-get update

  script: $[[ inputs.script ]]

  after_script:
    - echo "Cleaning up"

  # Variables
  variables:
    CUSTOM_VAR: $[[ inputs.custom_value ]]
    ANOTHER_VAR: "static-value"

  # Cache configuration
  cache:
    key: $[[ inputs.cache_key ]]
    paths:
      - .cache/
      - node_modules/
    policy: pull-push
    when: on_success

  # Artifacts
  artifacts:
    paths:
      - build/
      - dist/
    reports:
      junit: report.xml
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml
    expire_in: 1 week
    when: always

  # Resource management
  timeout: 1h
  retry:
    max: 2
    when:
      - runner_system_failure
      - stuck_or_timeout_failure

  # Interruptible
  interruptible: true

  # Allow failure
  allow_failure: false

  # Tags and needs
  tags:
    - docker
  needs: []
```

## Cache Configuration

### Cache Options

```yaml
cache:
  # Cache key (unique identifier)
  key:
    files:  # Key based on file checksums
      - package-lock.json
      - yarn.lock
    prefix: $[[ inputs.cache_prefix ]]  # Optional prefix

  # Paths to cache
  paths:
    - node_modules/
    - .npm/
    - .cache/

  # Cache policy
  policy: pull-push  # pull-push, pull, push

  # When to cache
  when: on_success  # on_success, on_failure, always

  # Unprotect cache (allow branch access)
  unprotect: false

  # Untracked files
  untracked: false
```

### Cache Policy Examples

```yaml
# Download and update cache
.with-cache:
  cache:
    policy: pull-push

# Only download cache
.cache-reader:
  cache:
    policy: pull

# Only update cache
.cache-writer:
  cache:
    policy: push
```

## Artifacts Configuration

### Artifact Options

```yaml
artifacts:
  # Files to upload
  paths:
    - build/
    - dist/**/*.js

  # Exclude patterns
  exclude:
    - build/**/*.log

  # Untracked files
  untracked: false

  # Expiration
  expire_in: 1 week  # 30 mins, 1 day, 1 week, 1 month

  # When to upload
  when: on_success  # on_success, on_failure, always

  # Artifact name
  name: "$CI_JOB_NAME-$CI_COMMIT_REF_SLUG"

  # Reports
  reports:
    junit: report.xml
    coverage_report:
      coverage_format: cobertura
      path: coverage/cobertura-coverage.xml
    dotenv: build.env
```

### Report Types

```yaml
artifacts:
  reports:
    # Test reports
    junit: junit.xml

    # Coverage
    coverage_report:
      coverage_format: cobertura  # cobertura, jacoco
      path: coverage/cobertura-coverage.xml

    # Code quality
    codequality: gl-code-quality-report.json

    # Security
    sast: gl-sast-report.json
    dependency_scanning: gl-dependency-scanning-report.json
    container_scanning: gl-container-scanning-report.json

    # Performance
    performance: performance.json
    load_performance: load-performance.json

    # Accessibility
    accessibility: gl-accessibility.json

    # Metrics
    metrics: metrics.txt

    # Dotenv
    dotenv: build.env
```

## Variables Configuration

### Variable Definitions

```yaml
variables:
  # Static variables
  STATIC_VAR: "value"

  # From inputs
  DYNAMIC_VAR: $[[ inputs.value ]]

  # CI/CD variables
  BRANCH: $CI_COMMIT_REF_NAME

  # Multiline
  SCRIPT: |
    multi
    line
    value

  # Expand variables
  EXPANDED: "$STATIC_VAR-suffix"
```

### Variable Options

```yaml
variables:
  MY_VAR:
    value: "content"
    description: "Variable description"
    expand: true  # Expand variable references
```

## Rules Configuration

### Rules for Include

```yaml
include:
  - component: gitlab.com/org/component@1.0.0
    rules:
      - if: $CI_COMMIT_BRANCH == "main"
      - if: $CI_COMMIT_TAG
```

### Rules in Templates

```yaml
.template:
  script:
    - echo "Running"
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
      when: always
    - if: $CI_MERGE_REQUEST_ID
      when: manual
    - when: never
```

### Rule Conditions

```yaml
rules:
  # Branch conditions
  - if: $CI_COMMIT_BRANCH == "main"
  - if: $CI_COMMIT_BRANCH =~ /^feature\/.*/

  # Tag conditions
  - if: $CI_COMMIT_TAG
  - if: $CI_COMMIT_TAG =~ /^v.*/

  # Merge request
  - if: $CI_MERGE_REQUEST_ID

  # Pipeline source
  - if: $CI_PIPELINE_SOURCE == "merge_request_event"
  - if: $CI_PIPELINE_SOURCE == "schedule"

  # File changes
  - changes:
      - src/**/*
      - package.json
```

## Service Configuration

### Service Definition

```yaml
.template:
  services:
    - name: postgres:13
      alias: db
      command: ["postgres", "-c", "log_statement=all"]
      entrypoint: ["/docker-entrypoint.sh"]
      variables:
        POSTGRES_DB: testdb
        POSTGRES_USER: user
        POSTGRES_PASSWORD: password
```

## Retry Configuration

```yaml
retry:
  max: 2  # Maximum retry attempts
  when:
    - runner_system_failure
    - stuck_or_timeout_failure
    - unknown_failure
    - script_failure
    - api_failure
    - scheduler_failure
    - data_integrity_failure
```

## Timeout Configuration

```yaml
# Global job timeout
timeout: 1h

# Per-template timeout
.template:
  timeout: 30m  # 30 mins, 1h, 2h, etc.
```

## Parallel Configuration

```yaml
# Simple parallel
.template:
  parallel: 5

# Matrix parallel
.template:
  parallel:
    matrix:
      - IMAGE: ['alpine:3.18', 'alpine:3.19']
        VERSION: ['1', '2', '3']
```

## Resource Group Configuration

```yaml
.template:
  resource_group: production
```

## Environment Configuration

```yaml
.deploy-template:
  environment:
    name: production
    url: https://example.com
    on_stop: stop-production
    auto_stop_in: 1 week
    kubernetes:
      namespace: production
```

## Coverage Configuration

```yaml
.test-template:
  script:
    - npm test
  coverage: '/Lines\s*:\s*(\d+\.\d+)%/'
```

## Interruptible Configuration

```yaml
.template:
  interruptible: true  # Can be cancelled when new pipeline starts
```

## See Also

- [Component Specification](/reference/component-spec)
- [Input Parameters](/reference/inputs)
- [CI/CD Keywords](/reference/keywords)
