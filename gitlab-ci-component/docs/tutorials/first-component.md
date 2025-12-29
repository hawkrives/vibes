# Your First Component

In this tutorial, you'll create your first GitLab CI/CD component from scratch. You'll learn the component structure and how to publish it.

## What You'll Build

A simple but functional component that runs security scans using a popular tool. This component will:

- Accept configurable inputs
- Run a security scan
- Output results
- Be reusable across projects

## Prerequisites

- Completion of [Getting Started](/tutorials/getting-started)
- A GitLab account with ability to create projects
- Basic YAML knowledge

## Step 1: Create Component Repository

Components live in their own Git repositories with a specific structure.

1. Create a new GitLab project named `security-scan-component`
2. Clone it locally:

```bash
git clone https://gitlab.com/your-username/security-scan-component.git
cd security-scan-component
```

## Step 2: Create Component Structure

Create the required directory structure:

```bash
mkdir -p templates
```

Your component needs these files:
- `README.md` - Component documentation
- `templates/template.yml` - The actual component logic

## Step 3: Write the Component Template

Create `templates/template.yml`:

```yaml
# templates/template.yml
spec:
  inputs:
    image:
      description: 'Docker image to use for scanning'
      default: 'aquasec/trivy:latest'
    severity:
      description: 'Minimum severity level to report'
      default: 'MEDIUM'
      options:
        - 'LOW'
        - 'MEDIUM'
        - 'HIGH'
        - 'CRITICAL'
    target:
      description: 'Target to scan (filesystem path or image)'
      default: '.'

---
.security-scan:
  image: $[[ inputs.image ]]
  script:
    - echo "Running security scan with severity $[[ inputs.severity ]]"
    - trivy fs --severity $[[ inputs.severity ]] $[[ inputs.target ]]
  artifacts:
    reports:
      sast: gl-sast-report.json
    when: always
  allow_failure: true
```

## Step 4: Write Component Documentation

Create `README.md`:

```markdown
# Security Scan Component

A reusable GitLab CI/CD component for running security scans.

## Usage

```yaml
include:
  - component: gitlab.com/your-username/security-scan-component@1.0.0
    inputs:
      severity: HIGH

security-check:
  extends: .security-scan
```

## Inputs

| Name | Description | Default | Required |
|------|-------------|---------|----------|
| `image` | Docker image for scanning | `aquasec/trivy:latest` | No |
| `severity` | Minimum severity level | `MEDIUM` | No |
| `target` | Target to scan | `.` | No |

## Example

```yaml
include:
  - component: gitlab.com/your-username/security-scan-component@1.0.0
    inputs:
      severity: CRITICAL
      target: /path/to/code

security:
  extends: .security-scan
  stage: test
```
```

## Step 5: Commit and Push

```bash
git add .
git commit -m "Add security scan component"
git push origin main
```

## Step 6: Tag a Release

Create a version tag for your component:

```bash
git tag -a 1.0.0 -m "First release"
git push origin 1.0.0
```

## Step 7: Test Your Component

Create a test project or use an existing one. Add to `.gitlab-ci.yml`:

```yaml
include:
  - component: gitlab.com/your-username/security-scan-component@1.0.0
    inputs:
      severity: HIGH

stages:
  - security

scan:
  extends: .security-scan
  stage: security
```

Commit and watch your component in action!

## Understanding the Structure

### Spec Section
The `spec` defines inputs that users can customize:

```yaml
spec:
  inputs:
    image:
      description: 'What this input does'
      default: 'default-value'
```

### Template Section
The actual job definition that users will extend:

```yaml
.security-scan:
  image: $[[ inputs.image ]]  # Uses the input value
  script:
    - # Your commands here
```

### Input Interpolation
Use `$[[ inputs.name ]]` to reference input values in your template.

## What You've Learned

- ✅ Created a component repository structure
- ✅ Defined component inputs with specs
- ✅ Wrote reusable job templates
- ✅ Tagged and versioned your component
- ✅ Used your component in a pipeline

## Next Steps

- [Building a CI Pipeline](/tutorials/building-pipeline) - Combine multiple components
- [Version Components](/how-to/version-components) - Learn versioning strategies
- [Component Specification](/reference/component-spec) - Deep dive into specs

## Troubleshooting

**Component not found when including?**
- Check the component path matches your GitLab namespace
- Ensure the tag exists: `git tag -l`
- Verify the `templates/template.yml` file exists

**Inputs not being interpolated?**
- Use `$[[ inputs.name ]]` syntax (double brackets)
- Check input names match between spec and usage

**Pipeline fails with component errors?**
- Validate YAML syntax
- Check that required inputs are provided
- Review the component's job logs
