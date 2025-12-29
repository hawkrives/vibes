# Component Catalog

Understanding GitLab's CI/CD Catalog and component discovery.

## What is the CI/CD Catalog?

The GitLab CI/CD Catalog is a centralized registry of reusable CI/CD components. Think of it as a marketplace or package repository for pipeline configurations.

**Introduced:** GitLab 16.7

## Purpose

The catalog serves several purposes:

1. **Discovery:** Find components created by others
2. **Sharing:** Publish your components for others to use
3. **Standardization:** Promote common patterns across teams
4. **Governance:** Organization-wide component management

## How It Works

### Component Publication

```
Create component → Add catalog metadata → Make public/internal → Appears in catalog
```

### Component Discovery

```
Browse catalog → Search/filter → View details → Copy usage example → Use in pipeline
```

## Catalog Metadata

### catalog-info.yml

To list a component in the catalog, add this file to your repository root:

```yaml
# catalog-info.yml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: my-component
  description: Brief description of what your component does
  tags:
    - nodejs
    - testing
    - ci-cd
  links:
    - url: https://gitlab.com/your-username/my-component
      title: Repository
      icon: gitlab
    - url: https://your-docs.example.com
      title: Documentation
      icon: docs
  annotations:
    gitlab.com/project-slug: your-username/my-component
spec:
  type: service
  lifecycle: production  # experimental, production, deprecated
  owner: team-name
  system: build-system
```

### Metadata Fields

| Field | Required | Description |
|-------|----------|-------------|
| `metadata.name` | Yes | Component identifier (slug) |
| `metadata.description` | Yes | Short description (1-2 sentences) |
| `metadata.tags` | No | Searchable tags |
| `metadata.links` | No | Related URLs |
| `spec.type` | Yes | Component type (usually `service`) |
| `spec.lifecycle` | Yes | Lifecycle stage |
| `spec.owner` | Yes | Team or individual owner |

## Lifecycle Stages

### experimental

Component is in early development:

```yaml
spec:
  lifecycle: experimental
```

**Implications:**
- May have breaking changes without notice
- Not recommended for production
- Actively seeking feedback

### production

Component is stable and ready for use:

```yaml
spec:
  lifecycle: production
```

**Implications:**
- Stable API
- Breaking changes only in major versions
- Supported and maintained

### deprecated

Component is being phased out:

```yaml
spec:
  lifecycle: deprecated
  annotations:
    deprecated: "true"
    deprecation-reason: "Replaced by new-component"
    replacement: "gitlab.com/org/new-component"
```

**Implications:**
- Still works but not recommended
- Will be removed in the future
- Migration path provided

## Visibility and Access

### Public Components

```yaml
# Repository visibility: Public
# catalog-info.yml → Appears in public catalog
```

**Who can see:** Everyone
**Who can use:** Everyone

### Internal Components

```yaml
# Repository visibility: Internal
# catalog-info.yml → Appears in internal catalog
```

**Who can see:** Users on your GitLab instance
**Who can use:** Users on your GitLab instance

### Private Components

Private repositories don't appear in the catalog, but can still be used as components if users have access.

## Browsing the Catalog

### Via GitLab UI

1. Navigate to any project
2. Go to **Settings > CI/CD**
3. Expand **CI/CD Catalog**
4. Browse or search for components

### Search and Filters

**Search by:**
- Component name
- Description keywords
- Tags

**Filter by:**
- Lifecycle stage
- Owner
- Type
- Namespace/group

### Component Details

Each catalog entry shows:
- Name and description
- Version information
- Usage example
- Tags
- Owner
- Links (docs, repository)
- Latest version
- Number of usages (if tracked)

## Using Catalog Components

### Copy Usage Example

The catalog provides a ready-to-use snippet:

```yaml
include:
  - component: gitlab.com/org/component@1.2.3
    inputs:
      key: value
```

### Version Selection

Catalog shows:
- Latest version (recommended)
- All available versions
- Release notes (if provided)

## Publishing to the Catalog

### Step-by-Step

1. **Create your component:**
   ```bash
   # See "How to Create a Component"
   ```

2. **Add catalog metadata:**
   ```yaml
   # catalog-info.yml
   apiVersion: backstage.io/v1alpha1
   kind: Component
   metadata:
     name: my-component
     description: Does something useful
     tags:
       - nodejs
       - build
   spec:
     type: service
     lifecycle: production
     owner: my-team
   ```

3. **Set repository visibility:**
   - Public or Internal (not Private)

4. **Tag a release:**
   ```bash
   git tag -a 1.0.0 -m "First release"
   git push origin 1.0.0
   ```

5. **Wait for indexing:**
   - GitLab indexes catalog entries periodically
   - Usually appears within a few minutes

### Verification

Check if your component is listed:
1. Go to CI/CD Catalog
2. Search for your component name
3. Verify all metadata appears correctly

## Catalog Best Practices

### Naming

Choose clear, descriptive names:

```yaml
# Good
metadata:
  name: node-build-test
  name: security-scan-trivy
  name: deploy-kubernetes

# Less clear
metadata:
  name: component-1
  name: my-thing
  name: utils
```

### Descriptions

Write concise, informative descriptions:

```yaml
# Good
description: Builds and tests Node.js applications with configurable Node version and test framework

# Too vague
description: Node component

# Too long
description: This is a comprehensive component that handles all aspects of...
```

### Tags

Use relevant, searchable tags:

```yaml
tags:
  - nodejs          # Technology
  - testing         # Purpose
  - jest            # Tool
  - coverage        # Feature
  - ci-cd          # Category
```

**Avoid:**
- Too many tags (keep under 10)
- Generic tags only (`component`, `gitlab`)
- Redundant tags

### Ownership

Specify clear ownership:

```yaml
spec:
  owner: platform-team
  # or
  owner: john-doe
  # or
  owner: engineering/devops
```

**Purpose:**
- Users know who to contact
- Indicates maintenance responsibility
- Helps with governance

## Catalog Organization

### Group-Level Catalogs

Organizations can create group-level component catalogs:

```
gitlab.com/my-org/
├── components/
│   ├── node-build/
│   ├── python-test/
│   └── docker-deploy/
└── internal-components/
    ├── proprietary-scan/
    └── company-deploy/
```

### Component Collections

Related components can reference each other:

```yaml
metadata:
  links:
    - url: https://gitlab.com/org/related-component
      title: Related Build Component
      icon: gitlab
```

## Governance

### Component Approval

Organizations may require approval before publishing:

1. Review component code
2. Security scan
3. Documentation check
4. Approval from component governance team
5. Publish to catalog

### Component Standards

Organizations can enforce standards:

```yaml
# Required in all components
spec:
  owner: [required]
  lifecycle: [required]
metadata:
  tags: [minimum 3]
  links:
    - [documentation required]
```

### Deprecation Policy

Example deprecation workflow:

1. **Mark as deprecated:**
   ```yaml
   spec:
     lifecycle: deprecated
   ```

2. **Provide migration guide:**
   - README section
   - Link to replacement component

3. **Sunset period:**
   - 3 months notice
   - Continue fixing critical bugs
   - No new features

4. **Archive:**
   - Archive repository
   - Remove from catalog (optional)

## Component Statistics

### Usage Tracking

GitLab may track (depending on version):
- Number of projects using component
- Most popular versions
- Usage trends over time

### Metrics

Useful metrics for component authors:

```yaml
# In component repository
docs/metrics.md:
  - Total users: 150 projects
  - Active versions: 1.2.3 (90%), 1.2.2 (10%)
  - Issues: 3 open, 45 closed
  - Average response time: 24 hours
```

## Search Optimization

### Making Components Discoverable

1. **Use clear names:**
   - Include technology/purpose in name
   - Use common terminology

2. **Write searchable descriptions:**
   - Include keywords users might search
   - Mention specific tools/frameworks

3. **Add comprehensive tags:**
   - Technology stack
   - Use cases
   - Tools used

4. **Provide good README:**
   - Catalog may index README content
   - Include examples and use cases

### Example: Well-Optimized Component

```yaml
# catalog-info.yml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: node-jest-coverage
  description: Test Node.js applications using Jest with coverage reporting and configurable thresholds
  tags:
    - nodejs
    - javascript
    - typescript
    - jest
    - testing
    - coverage
    - unit-test
  links:
    - url: https://gitlab.com/components/node-jest-coverage
      title: Repository
      icon: gitlab
    - url: https://components.example.com/node-jest-coverage
      title: Documentation
      icon: docs
spec:
  type: service
  lifecycle: production
  owner: platform-engineering
  system: ci-cd-components
```

## Catalog vs Direct References

### When to Use Catalog

- Discovering new components
- Finding components for common tasks
- Browsing organization's components
- Learning from examples

### When to Use Direct References

- You know the exact component path
- Using private components
- Automating component inclusion
- Version control

Both methods use the same component syntax:

```yaml
include:
  - component: gitlab.com/org/component@1.0.0
```

## Future of the Catalog

The CI/CD Catalog is evolving. Future features may include:

- Enhanced search capabilities
- Component ratings and reviews
- Dependency tracking
- Automated security scanning
- Component analytics dashboard
- Certified/verified components
- Component templates/scaffolding

## See Also

- [Share Components](/how-to/share-components)
- [Best Practices](/explanation/best-practices)
- [Component Architecture](/explanation/architecture)
- [GitLab CI/CD Catalog Documentation](https://docs.gitlab.com/ee/ci/components/)
