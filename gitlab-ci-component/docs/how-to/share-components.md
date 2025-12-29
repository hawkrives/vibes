# How to Share Components

Make your components available to other teams and projects.

## Problem

You've created a useful component and want to share it with your team, organization, or the public.

## Prerequisites

- An existing component repository
- Component tested and working
- GitLab account with appropriate permissions

## Steps

### 1. Choose Sharing Scope

Decide who should access your component:

| Scope | Visibility | Use Case |
|-------|------------|----------|
| **Public** | Everyone | Open source, public tools |
| **Internal** | Your GitLab instance | Company-wide sharing |
| **Private** | Specific users/groups | Team or project-specific |

### 2. Set Repository Visibility

#### Via Web UI:
1. Go to your component repository
2. Navigate to **Settings > General**
3. Expand **Visibility, project features, permissions**
4. Select visibility level
5. Click **Save changes**

#### Via CLI:
```bash
# Set to public
glab repo edit --visibility public

# Set to internal (for GitLab self-hosted)
glab repo edit --visibility internal
```

### 3. Add to CI/CD Catalog (Optional)

For GitLab 16.7+, add your component to the CI/CD Catalog:

Create `catalog-info.yml` in repository root:

```yaml
# catalog-info.yml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: my-component
  description: Brief description of what your component does
  tags:
    - ci-cd
    - nodejs
    - testing
  links:
    - url: https://gitlab.com/your-username/my-component
      title: Repository
      icon: gitlab
spec:
  type: service
  lifecycle: production
  owner: your-team
```

Commit and push:
```bash
git add catalog-info.yml
git commit -m "Add CI/CD catalog metadata"
git push origin main
```

### 4. Document for Users

Ensure your `README.md` includes:

```markdown
# Component Name

## Quick Start

```yaml
include:
  - component: gitlab.com/your-username/component-name@1.0.0
    inputs:
      key: value
```

## Description
What this component does and why someone would use it.

## Inputs
Complete list of all inputs with defaults and descriptions.

## Examples
Multiple real-world usage examples.

## Support
How to get help or report issues.

## License
Your chosen license (e.g., MIT, Apache 2.0).
```

### 5. Create Clear Versions

Use semantic versioning:

```bash
# Major release (breaking changes)
git tag -a 2.0.0 -m "Breaking: Changed input names"

# Minor release (new features)
git tag -a 1.1.0 -m "Add support for custom timeout"

# Patch release (bug fixes)
git tag -a 1.0.1 -m "Fix artifact path handling"

git push --tags
```

### 6. Share the Component

#### With Your Team
- Add to team documentation
- Share in team chat: "New component available: `gitlab.com/team/component-name@1.0.0`"
- Present in team meeting

#### With Your Organization
- Post in internal GitLab groups
- Add to organization's component registry
- Include in engineering newsletter

#### With the Public
- Share on GitLab.com community forums
- Post to social media with hashtag `#GitLabCI`
- Submit to awesome lists or curated collections

## Verification

Test that others can use your component:

1. Create a test project (or ask a colleague to)
2. Add your component to `.gitlab-ci.yml`:
   ```yaml
   include:
     - component: gitlab.com/your-username/component-name@1.0.0
   ```
3. Verify the pipeline runs successfully

## Common Issues

### Component not accessible

**Problem:** Users get "Component not accessible" error

**Solution:**
- Check repository visibility settings
- For private repos, ensure users have at least Reporter role
- Verify component path is correct

### Old version being used

**Problem:** Users see outdated component version

**Solution:**
- Ensure new version tag is pushed: `git push --tags`
- Users may need to specify exact version: `@1.2.3`
- Clear CI/CD cache in affected projects

### Catalog not showing component

**Problem:** Component doesn't appear in CI/CD Catalog

**Solution:**
- Verify `catalog-info.yml` syntax
- Check GitLab version supports catalog (16.7+)
- Repository must be public or internal
- Wait a few minutes for indexing

## Best Practices

### Documentation
- Include multiple usage examples
- Document all inputs thoroughly
- Provide troubleshooting section
- Keep changelog updated

### Versioning
- Never force-push tags
- Follow semantic versioning strictly
- Maintain compatibility within major versions
- Document breaking changes clearly

### Support
- Enable issues in repository
- Respond to issues promptly
- Consider adding CONTRIBUTING.md
- Set up discussions for questions

### Maintenance
- Keep dependencies updated
- Test with latest GitLab versions
- Archive if no longer maintained
- Communicate deprecation plans

## Sharing Template

Use this template when announcing components:

```markdown
📢 New CI/CD Component: [Component Name]

**What it does:** Brief description

**Install:**
```yaml
include:
  - component: gitlab.com/path/to/component@1.0.0
```

**Features:**
- Feature 1
- Feature 2
- Feature 3

**Docs:** [Link to README]
**Feedback:** [Link to issues]
```

## Next Steps

- [Version your component](/how-to/version-components)
- [Test component thoroughly](/how-to/test-components)
- [Review best practices](/explanation/best-practices)
- [Learn about component catalog](/explanation/catalog)
