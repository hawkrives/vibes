# How to Create a Component

Create a reusable GitLab CI/CD component from scratch.

## Problem

You have repetitive CI/CD configuration that you want to reuse across multiple projects.

## Prerequisites

- GitLab account (GitLab.com or self-hosted 16.0+)
- Git installed locally
- Text editor

## Steps

### 1. Create Repository

Create a new GitLab project for your component:

```bash
# Using GitLab CLI (if installed)
glab repo create my-component --public

# Or via web UI, then clone
git clone https://gitlab.com/your-username/my-component.git
cd my-component
```

### 2. Create Directory Structure

```bash
mkdir -p templates
touch README.md
touch templates/template.yml
```

Your structure should look like:
```
my-component/
├── README.md
└── templates/
    └── template.yml
```

### 3. Define Component Spec

Edit `templates/template.yml` and add the spec section:

```yaml
spec:
  inputs:
    stage:
      description: 'Pipeline stage for this job'
      default: 'test'
    image:
      description: 'Docker image to use'
      default: 'alpine:latest'
    script:
      description: 'Commands to execute'
      type: array
      required: true
```

### 4. Write Component Template

Add the job template to `templates/template.yml`:

```yaml
---
.my-component:
  stage: $[[ inputs.stage ]]
  image: $[[ inputs.image ]]
  script: $[[ inputs.script ]]
```

### 5. Document Your Component

Edit `README.md`:

```markdown
# My Component

Brief description of what your component does.

## Usage

```yaml
include:
  - component: gitlab.com/your-username/my-component@1.0.0
    inputs:
      script:
        - echo "Hello"
        - echo "World"
```

## Inputs

| Name | Description | Default | Required |
|------|-------------|---------|----------|
| stage | Pipeline stage | test | No |
| image | Docker image | alpine:latest | No |
| script | Commands to run | - | Yes |
```

### 6. Commit and Tag

```bash
git add .
git commit -m "Initial component implementation"
git push origin main

# Create version tag
git tag -a 1.0.0 -m "First release"
git push origin 1.0.0
```

## Verification

Test your component in a separate project:

```yaml
# .gitlab-ci.yml
include:
  - component: gitlab.com/your-username/my-component@1.0.0
    inputs:
      script:
        - echo "Testing component"

test-job:
  extends: .my-component
```

Run the pipeline and verify it executes successfully.

## Common Issues

### Component not found

**Problem:** `Component 'gitlab.com/...' not found`

**Solution:**
- Ensure tag exists: `git tag -l`
- Check repository is public or you have access
- Verify path matches your GitLab namespace

### Inputs not working

**Problem:** Input values not being used

**Solution:**
- Use `$[[ inputs.name ]]` syntax (double brackets)
- Ensure input names match between spec and template
- Check YAML indentation

### Template not extending

**Problem:** `Job 'my-job' does not extend .my-component`

**Solution:**
- Template name must start with a dot (`.my-component`)
- Use `extends: .my-component` in your job
- Check template name matches in both places

## Next Steps

- [Share your component](/how-to/share-components)
- [Add tests](/how-to/test-components)
- [Version properly](/how-to/version-components)
- [Review best practices](/explanation/best-practices)
