# Output Variables

How components expose outputs and variables for downstream jobs.

## Overview

Components can generate outputs that other jobs in the pipeline can use. This is achieved through:

1. **Artifacts** - Files and reports
2. **Environment variables** - Via dotenv artifacts
3. **Job outputs** - Using dotenv reports

## Dotenv Artifacts

The primary mechanism for components to expose variables to other jobs.

### Creating Outputs

**In component template:**

```yaml
.build-component:
  script:
    - npm run build
    - echo "BUILD_VERSION=1.2.3" >> build.env
    - echo "BUILD_DATE=$(date +%Y-%m-%d)" >> build.env
    - echo "ARTIFACT_PATH=dist/app.js" >> build.env
  artifacts:
    reports:
      dotenv: build.env
```

### Using Outputs

**In downstream job:**

```yaml
include:
  - component: gitlab.com/org/build-component@1.0.0

build:
  extends: .build-component

deploy:
  stage: deploy
  needs:
    - job: build
      artifacts: true
  script:
    - echo "Deploying version $BUILD_VERSION"
    - echo "Built on $BUILD_DATE"
    - cp $ARTIFACT_PATH /deployment/
```

## Dotenv Format

### File Format

Dotenv files use `KEY=value` format:

```bash
# build.env
VERSION=1.2.3
BUILD_NUMBER=42
ENVIRONMENT=production
PATH_TO_DIST=dist/bundle.js
```

### Rules

- One variable per line
- Format: `KEY=value`
- No spaces around `=`
- Values can contain spaces
- Comments start with `#`
- No quotes needed (but allowed)

**Valid:**
```bash
SIMPLE=value
WITH_SPACES=value with spaces
WITH_QUOTES="quoted value"
NUMBER=123
BOOL=true
# Comment line
```

**Invalid:**
```bash
KEY = value  # Spaces around =
MULTILINE=line1
line2  # Multiline not supported
```

## Component Output Patterns

### Version Information

Export build version and metadata:

```yaml
spec:
  inputs:
    version_file:
      type: string
      default: 'version.txt'

---
.version-component:
  script:
    - VERSION=$(cat $[[ inputs.version_file ]])
    - GIT_SHA=${CI_COMMIT_SHORT_SHA}
    - BUILD_TIME=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    - |
      cat > build.env << EOF
      APP_VERSION=${VERSION}
      GIT_SHA=${GIT_SHA}
      BUILD_TIME=${BUILD_TIME}
      EOF
  artifacts:
    reports:
      dotenv: build.env
```

### Build Paths

Export paths to built artifacts:

```yaml
.build-component:
  script:
    - npm run build
    - |
      cat > paths.env << EOF
      DIST_PATH=${CI_PROJECT_DIR}/dist
      BUNDLE_PATH=${CI_PROJECT_DIR}/dist/bundle.js
      SOURCE_MAP=${CI_PROJECT_DIR}/dist/bundle.js.map
      EOF
  artifacts:
    paths:
      - dist/
    reports:
      dotenv: paths.env
```

### Test Results

Export test metrics:

```yaml
.test-component:
  script:
    - npm test -- --coverage
    - COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
    - TEST_COUNT=$(cat test-results.json | jq '.numTotalTests')
    - |
      cat > test.env << EOF
      COVERAGE_PERCENT=${COVERAGE}
      TOTAL_TESTS=${TEST_COUNT}
      TESTS_PASSED=true
      EOF
  artifacts:
    reports:
      dotenv: test.env
      junit: junit.xml
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml
```

### Deployment Information

Export deployment URLs and credentials:

```yaml
.deploy-component:
  script:
    - deploy.sh
    - |
      cat > deploy.env << EOF
      DEPLOYMENT_URL=https://app-${CI_COMMIT_SHORT_SHA}.example.com
      DEPLOYMENT_ID=${DEPLOYMENT_ID}
      DEPLOYMENT_TIME=$(date -u +%Y-%m-%dT%H:%M:%SZ)
      EOF
  artifacts:
    reports:
      dotenv: deploy.env
  environment:
    name: staging
    url: $DEPLOYMENT_URL
```

## Regular Artifacts

Components can also produce file artifacts that downstream jobs can use.

### File Artifacts

```yaml
.build-artifacts:
  script:
    - npm run build
  artifacts:
    name: "build-${CI_COMMIT_REF_SLUG}"
    paths:
      - dist/
      - build/
    expire_in: 1 week
```

### Report Artifacts

```yaml
.test-with-reports:
  script:
    - npm test
  artifacts:
    reports:
      # Test reports
      junit: junit.xml

      # Coverage
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml

      # Code quality
      codequality: gl-code-quality-report.json

      # Dotenv for variables
      dotenv: test.env

    paths:
      - coverage/
      - test-results/
    expire_in: 30 days
```

## Using Component Outputs

### Basic Usage

```yaml
include:
  - component: gitlab.com/org/build@1.0.0

build:
  extends: .build-component

test:
  stage: test
  needs:
    - job: build
      artifacts: true
  script:
    - echo "Testing version $APP_VERSION"
    - test $DIST_PATH/bundle.js
```

### Multiple Component Outputs

```yaml
include:
  - component: gitlab.com/org/build@1.0.0
  - component: gitlab.com/org/version@1.0.0

version:
  extends: .version-component

build:
  extends: .build-component
  needs:
    - job: version
      artifacts: true
  script:
    - echo "Building version $APP_VERSION"
    - npm run build

deploy:
  stage: deploy
  needs:
    - job: version
      artifacts: true
    - job: build
      artifacts: true
  script:
    - echo "Deploying $APP_VERSION from $DIST_PATH"
```

### Conditional Logic

```yaml
verify:
  needs:
    - job: test
      artifacts: true
  script:
    - |
      if [ "$COVERAGE_PERCENT" -lt "80" ]; then
        echo "Coverage ${COVERAGE_PERCENT}% is below 80%"
        exit 1
      fi
    - |
      if [ "$TESTS_PASSED" != "true" ]; then
        echo "Tests did not pass"
        exit 1
      fi
```

## Output Documentation

Document outputs in component README:

```markdown
## Outputs

This component exports the following variables via dotenv:

| Variable | Description | Example |
|----------|-------------|---------|
| `APP_VERSION` | Application version | `1.2.3` |
| `GIT_SHA` | Git commit SHA | `a1b2c3d` |
| `BUILD_TIME` | Build timestamp (ISO 8601) | `2025-01-15T10:30:00Z` |
| `DIST_PATH` | Path to built files | `/builds/project/dist` |

### Usage Example

```yaml
build:
  extends: .build-component

deploy:
  needs:
    - job: build
      artifacts: true
  script:
    - echo "Deploying ${APP_VERSION}"
```
```

## Advanced Patterns

### Dynamic Outputs

Generate outputs based on inputs:

```yaml
spec:
  inputs:
    output_prefix:
      type: string
      default: 'APP'

---
.dynamic-outputs:
  script:
    - PREFIX=$[[ inputs.output_prefix ]]
    - |
      cat > output.env << EOF
      ${PREFIX}_VERSION=1.0.0
      ${PREFIX}_BUILD_ID=${CI_PIPELINE_ID}
      ${PREFIX}_STATUS=success
      EOF
  artifacts:
    reports:
      dotenv: output.env
```

### Merged Outputs

Combine outputs from multiple sources:

```yaml
.merged-outputs:
  script:
    - run_build.sh > build_vars.env
    - run_tests.sh > test_vars.env
    - cat build_vars.env test_vars.env > combined.env
  artifacts:
    reports:
      dotenv: combined.env
```

### JSON to Dotenv

Convert JSON to dotenv format:

```yaml
.json-to-dotenv:
  script:
    - npm run build --json > build.json
    - |
      jq -r 'to_entries|map("\(.key)=\(.value|tostring)")|.[]' build.json > build.env
  artifacts:
    reports:
      dotenv: build.env
```

## Limitations

### Variable Naming

- Only `A-Z`, `a-z`, `0-9`, and `_` characters
- Cannot start with a number
- Case-sensitive

**Valid:**
```bash
MY_VAR=value
my_var=value
MY_VAR_123=value
_private=value
```

**Invalid:**
```bash
123VAR=value  # Starts with number
MY-VAR=value  # Contains hyphen
MY.VAR=value  # Contains dot
```

### Size Limits

- Maximum dotenv file size: 5 KB
- Maximum number of variables: No hard limit, but keep reasonable
- Variable value length: No hard limit

### Scope

- Dotenv variables are only available to jobs that declare `needs`
- Variables don't persist across pipeline boundaries
- Each job gets a fresh copy of the variables

## Troubleshooting

### Variables not available

**Problem:** Downstream job doesn't see exported variables

**Solution:**
```yaml
# Ensure needs declares artifacts: true
downstream:
  needs:
    - job: upstream
      artifacts: true  # Required!
```

### Invalid dotenv format

**Problem:** `Failed to parse dotenv artifact`

**Solution:**
- Check for spaces around `=`
- Ensure one variable per line
- Remove any multiline values
- Validate with: `cat build.env | grep -v '^#' | grep -v '^$'`

### Variable override

**Problem:** Expected variable value doesn't match

**Solution:**
- Check job execution order
- Verify `needs` dependencies
- Later dotenv files override earlier ones
- CI/CD variables override dotenv

## See Also

- [Configuration Options](/reference/configuration)
- [Component Specification](/reference/component-spec)
- [Building a CI Pipeline](/tutorials/building-pipeline)
