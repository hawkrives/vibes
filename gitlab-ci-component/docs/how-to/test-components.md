# How to Test Components

Ensure your CI/CD components work correctly before sharing them.

## Problem

You want to verify that your component works as expected and handles various scenarios correctly.

## Prerequisites

- An existing component
- A test project or ability to create one
- Access to GitLab CI/CD runners

## Steps

### 1. Create Test Project

Create a dedicated project for testing your component:

```bash
mkdir component-tests
cd component-tests
git init
```

### 2. Write Test Cases

Create `.gitlab-ci.yml` with different test scenarios:

```yaml
# Test 1: Basic usage with defaults
include:
  - component: gitlab.com/your-username/my-component@main
    inputs:
      script:
        - echo "Test with defaults"

stages:
  - test

test-defaults:
  extends: .my-component
  stage: test

# Test 2: Custom inputs
test-custom-inputs:
  extends: .my-component
  stage: test
  variables:
    CUSTOM_VAR: "custom-value"

# Test 3: Override script
test-override:
  extends: .my-component
  stage: test
  script:
    - echo "Overridden script"
    - echo "Multiple commands"

# Test 4: Different stage
test-different-stage:
  extends: .my-component
  stage: test
  needs: []
```

### 3. Test Edge Cases

Add tests for edge cases and error conditions:

```yaml
# Test empty inputs
test-empty-input:
  extends: .my-component
  stage: test
  allow_failure: true  # Expect this might fail

# Test with special characters
test-special-chars:
  extends: .my-component
  stage: test
  variables:
    TEST_VAR: "value with spaces and 'quotes'"

# Test array inputs
test-array-input:
  extends: .my-component
  stage: test
```

### 4. Set Up Automated Testing

Create a test suite in your component repository:

```yaml
# In your component repo: .gitlab-ci.yml
include:
  - local: templates/template.yml

stages:
  - test
  - validate

# Test the component works
self-test:
  extends: .my-component
  stage: test
  script:
    - echo "Self-test passed"

# Validate YAML syntax
validate-yaml:
  stage: validate
  image: alpine:latest
  script:
    - apk add --no-cache yamllint
    - yamllint templates/template.yml
  allow_failure: false

# Check documentation
validate-docs:
  stage: validate
  image: node:20
  script:
    - npm install -g markdownlint-cli
    - markdownlint README.md
```

### 5. Test Version Compatibility

Test with different GitLab versions:

```yaml
# Test on different GitLab runner versions
test-old-runner:
  extends: .my-component
  tags:
    - gitlab-runner-15

test-new-runner:
  extends: .my-component
  tags:
    - gitlab-runner-16
```

### 6. Manual Verification Checklist

Create a checklist for manual testing:

```markdown
## Pre-Release Checklist

- [ ] Component runs successfully with default inputs
- [ ] All documented inputs work as expected
- [ ] Component handles missing optional inputs
- [ ] Error messages are clear and helpful
- [ ] Documentation examples are accurate
- [ ] Component works in different stages
- [ ] Artifacts are produced correctly (if applicable)
- [ ] Component can be extended and overridden
- [ ] Works with both tags and branches
- [ ] No security issues (secrets, permissions)
```

## Verification

Run your test pipeline:

```bash
git add .gitlab-ci.yml
git commit -m "Add component tests"
git push origin main
```

Check results:
1. All test jobs should pass (or fail as expected)
2. Review job logs for any warnings
3. Verify artifacts if component produces them
4. Check execution time is reasonable

## Common Testing Patterns

### Matrix Testing

Test multiple configurations:

```yaml
.test-template:
  extends: .my-component
  parallel:
    matrix:
      - IMAGE: ['alpine:3.18', 'alpine:3.19', 'alpine:latest']
        OPTION: ['a', 'b', 'c']
```

### Integration Tests

Test with real-world scenarios:

```yaml
integration-test:
  extends: .my-component
  script:
    - npm install
    - npm test
    - npm run build
  artifacts:
    paths:
      - dist/
```

### Performance Tests

Monitor component execution time:

```yaml
performance-test:
  extends: .my-component
  script:
    - start_time=$(date +%s)
    - # Your component actions
    - end_time=$(date +%s)
    - echo "Execution time: $((end_time - start_time))s"
  artifacts:
    reports:
      metrics: metrics.txt
```

## Common Issues

### Tests pass locally but fail in CI

**Problem:** Component works when you test it but fails for others

**Solution:**
- Check for hardcoded paths or assumptions
- Verify all dependencies are declared
- Test in a clean environment
- Use component from tag, not local file

### Intermittent failures

**Problem:** Tests sometimes pass, sometimes fail

**Solution:**
- Look for timing issues or race conditions
- Check for external dependency failures
- Review runner capacity and resource limits
- Add retry logic for flaky operations

### Component too slow

**Problem:** Component takes too long to execute

**Solution:**
- Profile which steps are slow
- Optimize Docker image size
- Use caching effectively
- Consider parallel execution

## Testing Automation

Set up automated testing for every change:

```yaml
# .gitlab-ci.yml in component repo
workflow:
  rules:
    - if: $CI_MERGE_REQUEST_ID
    - if: $CI_COMMIT_TAG
    - if: $CI_COMMIT_BRANCH == "main"

stages:
  - validate
  - test
  - release

# Validate on every commit
validate:
  stage: validate
  script:
    - yamllint templates/
    - markdownlint README.md

# Test before merging
test:
  stage: test
  include:
    - local: templates/template.yml
  extends: .my-component

# Only release if tests pass
release:
  stage: release
  script:
    - echo "All tests passed, ready to tag"
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
      when: manual
```

## Test Documentation

Document your test coverage:

```markdown
## Testing

This component is tested with:

- ✅ Default configuration
- ✅ All input combinations
- ✅ Different GitLab versions (15.x, 16.x)
- ✅ Various Docker images
- ✅ Edge cases and error conditions

To run tests:
```bash
# Clone test project
git clone https://gitlab.com/your-username/component-tests
cd component-tests
git push  # Triggers test pipeline
```

See [test results](https://gitlab.com/your-username/component-tests/-/pipelines).
```

## Next Steps

- [Version your component](/how-to/version-components)
- [Share your tested component](/how-to/share-components)
- [Review best practices](/explanation/best-practices)
- [Learn about CI/CD keywords](/reference/keywords)
