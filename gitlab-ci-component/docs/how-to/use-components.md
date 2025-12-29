# How to Use Components in Pipelines

Integrate existing CI/CD components into your GitLab pipelines.

## Problem

You want to use a component from the GitLab catalog or a custom component in your project's CI/CD pipeline.

## Prerequisites

- Existing GitLab project
- Component path and version you want to use
- Basic `.gitlab-ci.yml` knowledge

## Steps

### 1. Find a Component

Browse available components:
- **GitLab CI/CD Catalog:** Settings > CI/CD > CI/CD Catalog
- **Public components:** Search GitLab for component repositories
- **Team components:** Check your organization's GitLab groups

Note the component path (e.g., `gitlab.com/org/component-name`)

### 2. Add Component to Pipeline

Edit your `.gitlab-ci.yml`:

```yaml
include:
  - component: gitlab.com/org/component-name@1.0.0
```

### 3. Configure Component Inputs

Most components accept inputs for customization:

```yaml
include:
  - component: gitlab.com/components/node/test@1.5.0
    inputs:
      node-version: '20'
      coverage: true
```

### 4. Use Component in Jobs

Extend the component's template in your jobs:

```yaml
include:
  - component: gitlab.com/components/node/test@1.5.0
    inputs:
      node-version: '20'

stages:
  - test

my-test-job:
  stage: test
  extends: .node-test  # Template from component
```

### 5. Override Component Defaults

You can override any component settings:

```yaml
my-test-job:
  extends: .node-test
  script:
    - npm install
    - npm test
    - npm run custom-command  # Additional command
  timeout: 30m  # Override timeout
```

## Common Patterns

### Multiple Components

Include and use multiple components:

```yaml
include:
  - component: gitlab.com/components/node/test@1.5.0
    inputs:
      node-version: '20'

  - component: gitlab.com/components/security/scan@2.0.0
    inputs:
      severity: HIGH

test:
  extends: .node-test

security:
  extends: .security-scan
```

### Conditional Inclusion

Use components only for specific branches:

```yaml
include:
  - component: gitlab.com/components/deploy/production@1.0.0
    rules:
      - if: $CI_COMMIT_BRANCH == "main"
```

### Version Pinning Strategies

```yaml
# Exact version (recommended for production)
- component: gitlab.com/org/component@1.2.3

# Major version (gets latest 1.x.x)
- component: gitlab.com/org/component@1

# Branch or tag
- component: gitlab.com/org/component@main
- component: gitlab.com/org/component@develop
```

## Verification

After adding components:

1. Commit and push your changes:
   ```bash
   git add .gitlab-ci.yml
   git commit -m "Add CI components"
   git push
   ```

2. Check pipeline in GitLab UI:
   - Navigate to **CI/CD > Pipelines**
   - Click on the latest pipeline
   - Verify jobs using components are running

3. Review job configuration:
   - Click on a job
   - Check **Complete Raw** view to see merged configuration

## Common Issues

### Component version not found

**Problem:** `Component version '1.0.0' not found`

**Solution:**
- Check available versions in component repository
- Verify tag exists: visit component repo and check tags
- Try using `@main` or latest stable version

### Authentication errors

**Problem:** `Component 'gitlab.com/...' not accessible`

**Solution:**
- For private components, ensure you have access to the repository
- Check project settings > CI/CD > Token permissions
- Verify component repository visibility settings

### Input validation errors

**Problem:** `Invalid input 'xyz' for component`

**Solution:**
- Check component README for valid inputs
- Verify input names (they're case-sensitive)
- Ensure required inputs are provided

### Job doesn't use component

**Problem:** Job runs but doesn't use component configuration

**Solution:**
- Ensure you're using `extends: .template-name`
- Check template name matches component's exported template
- Verify include statement is before job definition

## Tips

- **Pin versions:** Always use specific versions in production (`@1.2.3`)
- **Test first:** Try new components in a feature branch
- **Read docs:** Check component README for usage examples
- **Check compatibility:** Ensure component supports your GitLab version

## Next Steps

- [Create your own component](/how-to/create-component)
- [Test components](/how-to/test-components)
- [Learn about component inputs](/reference/inputs)
