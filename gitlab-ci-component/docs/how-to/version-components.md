# How to Version Components

Manage component versions using semantic versioning and Git tags.

## Problem

You need to release updates to your component while maintaining compatibility and allowing users to pin to specific versions.

## Prerequisites

- Existing component repository
- Git installed and configured
- Understanding of semantic versioning

## Semantic Versioning Basics

Version format: `MAJOR.MINOR.PATCH` (e.g., `2.3.1`)

- **MAJOR:** Breaking changes (incompatible with previous version)
- **MINOR:** New features (backwards compatible)
- **PATCH:** Bug fixes (backwards compatible)

## Steps

### 1. Determine Version Type

Ask yourself:

- **Breaking changes?** → Increment MAJOR (1.0.0 → 2.0.0)
  - Renamed inputs
  - Removed functionality
  - Changed default behavior

- **New features?** → Increment MINOR (1.0.0 → 1.1.0)
  - Added new inputs
  - New optional functionality
  - Enhanced existing features

- **Bug fixes only?** → Increment PATCH (1.0.0 → 1.0.1)
  - Fixed bugs
  - Documentation updates
  - Performance improvements

### 2. Update CHANGELOG

Maintain a `CHANGELOG.md`:

```markdown
# Changelog

## [2.0.0] - 2025-01-15

### Breaking Changes
- Renamed `timeout` input to `job_timeout`
- Removed deprecated `legacy_mode` option

### Added
- New `retry` input for automatic retries

## [1.1.0] - 2025-01-10

### Added
- Support for custom Docker images via `image` input
- New `cache_key` input for cache customization

### Fixed
- Artifact paths now handle spaces correctly

## [1.0.0] - 2025-01-01

- Initial release
```

### 3. Create Git Tag

```bash
# For new minor version
git tag -a 1.1.0 -m "Add custom image support"

# For new major version
git tag -a 2.0.0 -m "Breaking: Rename timeout input"

# For patch version
git tag -a 1.0.1 -m "Fix artifact path handling"
```

### 4. Push Tag

```bash
# Push specific tag
git push origin 1.1.0

# Push all tags
git push --tags
```

### 5. Create Release Notes (Optional)

In GitLab UI:
1. Go to **Deployments > Releases**
2. Click **New release**
3. Select your tag
4. Add release notes:

```markdown
## What's New in v1.1.0

### Features
- 🎉 Custom Docker image support
- ⚙️ Configurable cache keys

### Improvements
- 🐛 Fixed artifact path handling for paths with spaces
- 📚 Improved documentation with more examples

### Upgrade Guide
Update your include statement:
```yaml
include:
  - component: gitlab.com/you/component@1.1.0
```

No breaking changes - fully backwards compatible with 1.0.x
```

## Version Strategies

### Major Version Branches

For long-term support:

```bash
# Create v1 branch for maintenance
git checkout -b v1-stable v1.0.0
git push -u origin v1-stable

# Create v2 branch for new features
git checkout main
git tag -a 2.0.0 -m "Version 2.0.0"
```

Users can then use:
```yaml
# Stay on v1 (stable)
- component: gitlab.com/you/component@v1-stable

# Use latest v1.x
- component: gitlab.com/you/component@1

# Use exact version
- component: gitlab.com/you/component@1.2.3
```

### Pre-release Versions

Test versions before official release:

```bash
# Alpha version
git tag -a 2.0.0-alpha.1 -m "First alpha of v2"

# Beta version
git tag -a 2.0.0-beta.1 -m "First beta of v2"

# Release candidate
git tag -a 2.0.0-rc.1 -m "Release candidate 1"

git push --tags
```

Users can try pre-releases:
```yaml
- component: gitlab.com/you/component@2.0.0-beta.1
```

## Version Documentation

### In README

```markdown
## Versions

### Current Stable: 1.2.3

```yaml
include:
  - component: gitlab.com/you/component@1.2.3
```

### Previous Versions

- **v1.x** (Stable) - [Documentation](https://gitlab.com/you/component/-/tree/v1-stable)
- **v2.x** (Latest) - You're reading it!

### Version Support

| Version | Status | Support Until |
|---------|--------|---------------|
| 2.x | Active | Current |
| 1.x | Maintenance | 2025-12-31 |
| 0.x | Deprecated | 2025-06-30 |
```

### Migration Guides

For major versions, provide migration guides:

```markdown
## Migrating from v1 to v2

### Breaking Changes

#### Renamed Inputs
- `timeout` → `job_timeout`
- `cache` → `cache_enabled`

Before:
```yaml
include:
  - component: gitlab.com/you/component@1.0.0
    inputs:
      timeout: 30m
```

After:
```yaml
include:
  - component: gitlab.com/you/component@2.0.0
    inputs:
      job_timeout: 30m
```

### Removed Features
- `legacy_mode` - No longer needed, default behavior improved
```

## Verification

Check your tags:

```bash
# List all tags
git tag -l

# Show tag details
git show 1.1.0

# Verify tag is on remote
git ls-remote --tags origin
```

Test the tagged version:
```yaml
include:
  - component: gitlab.com/you/component@1.1.0  # Use your new tag
```

## Common Issues

### Tag already exists

**Problem:** `tag '1.0.0' already exists`

**Solution:**
```bash
# Delete local tag
git tag -d 1.0.0

# Delete remote tag (use with caution!)
git push origin :refs/tags/1.0.0

# Create new tag
git tag -a 1.0.0 -m "Release 1.0.0"
git push origin 1.0.0
```

**⚠️ Warning:** Never delete tags that users might be using!

### Wrong version number

**Problem:** Tagged wrong version (1.2.0 instead of 1.1.0)

**Solution:**
```bash
# If not yet pushed
git tag -d 1.2.0
git tag -a 1.1.0 -m "Correct version"

# If already pushed - create new correct version
git tag -a 1.1.0 -m "Correct version"
git push origin 1.1.0
```

### Users getting old version

**Problem:** Users include new version but get old behavior

**Solution:**
- Ensure tag is pushed: `git push --tags`
- Clear CI/CD cache in affected projects
- Verify tag points to correct commit: `git show <tag>`

## Best Practices

### Versioning Rules

1. **Never rewrite released versions**
   - Don't force-push tags
   - Don't modify released tags
   - If wrong, release a new version

2. **Document everything**
   - Maintain CHANGELOG.md
   - Write clear commit messages
   - Create detailed release notes

3. **Test before tagging**
   - Run all tests
   - Verify in test project
   - Review changes carefully

4. **Communicate changes**
   - Announce breaking changes early
   - Provide migration guides
   - Give deprecation warnings

### Automation

Automate versioning with CI/CD:

```yaml
# .gitlab-ci.yml
release:
  stage: release
  script:
    - npm version minor  # or major, patch
    - git push --follow-tags
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
      when: manual
  only:
    - main
```

## Next Steps

- [Share your versioned component](/how-to/share-components)
- [Test new versions thoroughly](/how-to/test-components)
- [Learn about configuration options](/reference/configuration)
- [Review best practices](/explanation/best-practices)
