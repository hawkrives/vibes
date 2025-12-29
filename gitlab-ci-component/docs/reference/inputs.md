# Input Parameters

Complete reference for component input parameters.

## Input Definition

Inputs are defined in the `spec` section of `templates/template.yml`:

```yaml
spec:
  inputs:
    input_name:
      description: 'Human-readable description'
      type: string
      default: 'default-value'
      required: false
```

## Input Properties

### description

**Type:** `string`
**Required:** Recommended

Human-readable description of what the input does.

```yaml
spec:
  inputs:
    timeout:
      description: 'Maximum time in seconds for job execution'
```

**Best practices:**
- Be clear and concise
- Explain what the input controls
- Include units for numeric values
- Mention default behavior

### type

**Type:** `string`
**Required:** No (defaults to `string`)
**Values:** `string`, `number`, `boolean`, `array`

Specifies the data type of the input.

```yaml
spec:
  inputs:
    message:
      type: string

    timeout:
      type: number

    enabled:
      type: boolean

    commands:
      type: array
```

### default

**Type:** Depends on input type
**Required:** No

Default value used when input is not provided.

```yaml
spec:
  inputs:
    stage:
      type: string
      default: 'test'

    retry_count:
      type: number
      default: 3

    cache_enabled:
      type: boolean
      default: true

    build_commands:
      type: array
      default:
        - npm install
        - npm run build
```

**Note:** Required inputs cannot have defaults.

### required

**Type:** `boolean`
**Required:** No (defaults to `false`)

Whether the input must be provided by the user.

```yaml
spec:
  inputs:
    api_key:
      type: string
      required: true  # User must provide this
      description: 'API key for authentication'

    optional_param:
      type: string
      required: false  # Optional, will use default if not provided
      default: 'default-value'
```

### options

**Type:** `array`
**Required:** No

Restricts input to specific allowed values.

```yaml
spec:
  inputs:
    log_level:
      type: string
      default: 'info'
      options:
        - 'debug'
        - 'info'
        - 'warning'
        - 'error'
      description: 'Logging level for the job'
```

**Type compatibility:**
- Works with `string`, `number`, and `boolean` types
- Array type doesn't support options

### deprecated

**Type:** `boolean`
**Required:** No (defaults to `false`)
**GitLab Version:** 16.3+

Marks an input as deprecated.

```yaml
spec:
  inputs:
    old_name:
      type: string
      deprecated: true
      deprecation_message: 'Use new_name instead. Will be removed in v2.0'
```

### deprecation_message

**Type:** `string`
**Required:** No (only with `deprecated: true`)
**GitLab Version:** 16.3+

Custom message shown when deprecated input is used.

```yaml
spec:
  inputs:
    legacy_option:
      type: boolean
      deprecated: true
      deprecation_message: 'This option is deprecated and will be removed in version 3.0. Use modern_option instead.'
```

## Input Types

### string

Text values.

**Definition:**
```yaml
spec:
  inputs:
    message:
      type: string
      default: 'Hello World'
```

**Usage:**
```yaml
include:
  - component: gitlab.com/org/component@1.0.0
    inputs:
      message: 'Custom message'
```

**In template:**
```yaml
.template:
  script:
    - echo "$[[ inputs.message ]]"
```

**Examples:**
```yaml
# Simple string
message: 'Hello'

# Multiline string
description: |
  This is a long
  multiline description

# String with variables (expanded by GitLab)
path: '$CI_PROJECT_DIR/build'
```

### number

Numeric values (integers or decimals).

**Definition:**
```yaml
spec:
  inputs:
    timeout:
      type: number
      default: 3600
      description: 'Timeout in seconds'
```

**Usage:**
```yaml
include:
  - component: gitlab.com/org/component@1.0.0
    inputs:
      timeout: 7200
```

**In template:**
```yaml
.template:
  timeout: $[[ inputs.timeout ]]s
  script:
    - sleep $[[ inputs.timeout ]]
```

**Examples:**
```yaml
# Integer
count: 42

# Decimal
percentage: 85.5

# With options
severity_level:
  type: number
  options: [1, 2, 3, 4, 5]
```

### boolean

True/false values.

**Definition:**
```yaml
spec:
  inputs:
    cache_enabled:
      type: boolean
      default: true
```

**Usage:**
```yaml
include:
  - component: gitlab.com/org/component@1.0.0
    inputs:
      cache_enabled: false
```

**In template:**
```yaml
.template:
  cache:
    key: cache
    paths:
      - node_modules/
    disabled: $[[ inputs.cache_enabled ]]
```

**Valid values:**
- `true`, `false`
- `yes`, `no`
- `on`, `off`

### array

List of values.

**Definition:**
```yaml
spec:
  inputs:
    build_commands:
      type: array
      default:
        - npm install
        - npm run build
```

**Usage:**
```yaml
include:
  - component: gitlab.com/org/component@1.0.0
    inputs:
      build_commands:
        - yarn install
        - yarn build
        - yarn test
```

**In template:**
```yaml
.template:
  script: $[[ inputs.build_commands ]]
```

**Array of strings:**
```yaml
tags:
  type: array
  default:
    - docker
    - linux
```

**Array of commands:**
```yaml
before_script:
  type: array
  default:
    - apt-get update
    - apt-get install -y curl
```

## Input Interpolation

### Syntax

Use `$[[` and `]]` (double brackets) to reference inputs in templates:

```yaml
.template:
  image: $[[ inputs.image ]]
  script: $[[ inputs.script ]]
```

### Interpolation Locations

Inputs can be interpolated in most YAML values:

```yaml
.template:
  # In simple values
  stage: $[[ inputs.stage ]]
  image: $[[ inputs.image ]]

  # In arrays
  script: $[[ inputs.script ]]

  # In object values
  cache:
    key: $[[ inputs.cache_key ]]
    paths: $[[ inputs.cache_paths ]]

  # In variables
  variables:
    CUSTOM: $[[ inputs.custom_value ]]

  # In timeout
  timeout: $[[ inputs.timeout ]]m
```

### Type Preservation

Input types are preserved during interpolation:

```yaml
# String input
.template:
  image: $[[ inputs.image ]]  # Results in: "alpine:latest"

# Number input
.template:
  timeout: $[[ inputs.timeout ]]m  # Results in: 30m

# Boolean input
.template:
  allow_failure: $[[ inputs.allow_failure ]]  # Results in: true

# Array input
.template:
  script: $[[ inputs.commands ]]
  # Results in:
  # script:
  #   - echo "Step 1"
  #   - echo "Step 2"
```

## Input Validation

### Automatic Validation

GitLab validates:
- Type matching
- Required inputs are provided
- Values match options (if specified)
- Input names exist in spec

### Custom Validation

Add validation in your template scripts:

```yaml
.template:
  script:
    - |
      # Validate number range
      if [ $[[ inputs.timeout ]] -gt 7200 ]; then
        echo "Error: timeout cannot exceed 7200 seconds"
        exit 1
      fi

    - |
      # Validate string format
      if ! echo "$[[ inputs.version ]]" | grep -qE '^[0-9]+\.[0-9]+\.[0-9]+$'; then
        echo "Error: version must be in format X.Y.Z"
        exit 1
      fi

    - |
      # Validate array not empty
      if [ ${#$[[ inputs.commands ]][@]} -eq 0 ]; then
        echo "Error: commands array cannot be empty"
        exit 1
      fi
```

## Input Examples

### Complete Example

```yaml
spec:
  inputs:
    # String inputs
    stage:
      description: 'Pipeline stage for this job'
      type: string
      default: 'test'
      options: ['build', 'test', 'deploy']

    image:
      description: 'Docker image to use'
      type: string
      default: 'alpine:latest'

    # Number inputs
    timeout:
      description: 'Job timeout in minutes'
      type: number
      default: 30

    retry_count:
      description: 'Number of retry attempts'
      type: number
      default: 2
      options: [0, 1, 2, 3]

    # Boolean inputs
    cache_enabled:
      description: 'Enable caching'
      type: boolean
      default: true

    allow_failure:
      description: 'Allow job to fail without stopping pipeline'
      type: boolean
      default: false

    # Array inputs
    before_commands:
      description: 'Commands to run before main script'
      type: array
      default:
        - echo "Preparing"

    main_script:
      description: 'Main commands to execute'
      type: array
      required: true

    # Required input
    api_endpoint:
      description: 'API endpoint URL'
      type: string
      required: true

    # Deprecated input
    old_param:
      description: 'Legacy parameter'
      type: string
      deprecated: true
      deprecation_message: 'Use new_param instead'

---
.component-template:
  stage: $[[ inputs.stage ]]
  image: $[[ inputs.image ]]
  timeout: $[[ inputs.timeout ]]m
  retry: $[[ inputs.retry_count ]]
  allow_failure: $[[ inputs.allow_failure ]]

  before_script: $[[ inputs.before_commands ]]
  script: $[[ inputs.main_script ]]

  cache:
    key: build-cache
    paths:
      - .cache/
    disabled: $[[ inputs.cache_enabled ]]

  variables:
    API_URL: $[[ inputs.api_endpoint ]]
```

## Common Patterns

### Optional Override

```yaml
spec:
  inputs:
    custom_script:
      type: array
      default: []  # Empty by default

---
.template:
  script:
    - echo "Default step"
    - $[[ inputs.custom_script ]]  # User can add more
```

### Version Selection

```yaml
spec:
  inputs:
    node_version:
      type: string
      default: '20'
      options: ['18', '20', '21']

---
.template:
  image: node:$[[ inputs.node_version ]]
```

### Feature Flags

```yaml
spec:
  inputs:
    enable_coverage:
      type: boolean
      default: false
    enable_linting:
      type: boolean
      default: true
```

## See Also

- [Component Specification](/reference/component-spec)
- [Configuration Options](/reference/configuration)
- [How to Create a Component](/how-to/create-component)
