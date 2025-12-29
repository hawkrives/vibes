# Building a Complete CI Pipeline

Learn how to compose multiple components together to create a production-ready CI/CD pipeline.

## What You'll Build

A complete CI/CD pipeline for a Node.js application that:

- Installs dependencies
- Runs linters and tests
- Performs security scans
- Builds the application
- Deploys to staging

## Prerequisites

- Completion of [Your First Component](/tutorials/first-component)
- A Node.js project (or use the example below)
- Understanding of CI/CD stages

## Step 1: Set Up Sample Application

If you don't have a Node.js project, create a simple one:

```bash
mkdir my-app
cd my-app
npm init -y
```

Create a simple `index.js`:

```javascript
// index.js
export function greet(name) {
  return `Hello, ${name}!`;
}

console.log(greet('World'));
```

Create a test file `index.test.js`:

```javascript
// index.test.js
import { greet } from './index.js';

test('greet returns greeting', () => {
  expect(greet('Test')).toBe('Hello, Test!');
});
```

Update `package.json`:

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "test": "jest",
    "lint": "eslint .",
    "build": "echo 'Building application...'",
    "start": "node index.js"
  },
  "devDependencies": {
    "eslint": "^8.0.0",
    "jest": "^29.0.0"
  }
}
```

## Step 2: Plan Your Pipeline

A good pipeline has clear stages:

```mermaid
graph LR
    A[Install] --> B[Lint]
    B --> C[Test]
    C --> D[Security Scan]
    D --> E[Build]
    E --> F[Deploy]
```

## Step 3: Create the Pipeline Configuration

Create `.gitlab-ci.yml` with multiple components:

```yaml
# .gitlab-ci.yml

# Include reusable components
include:
  # Node.js setup component
  - component: gitlab.com/components/node/setup@2.0.0
    inputs:
      node-version: '20'

  # Testing component
  - component: gitlab.com/components/node/test@1.5.0
    inputs:
      coverage: true

  # Security scanning component (the one we built!)
  - component: gitlab.com/your-username/security-scan-component@1.0.0
    inputs:
      severity: HIGH

  # Build component
  - component: gitlab.com/components/node/build@1.0.0

# Define pipeline stages
stages:
  - install
  - quality
  - security
  - build
  - deploy

# Install dependencies
install-deps:
  stage: install
  extends: .node-setup
  script:
    - npm ci
  cache:
    key:
      files:
        - package-lock.json
    paths:
      - node_modules/
  artifacts:
    paths:
      - node_modules/
    expire_in: 1 day

# Run linter
lint:
  stage: quality
  extends: .node-setup
  needs: ['install-deps']
  script:
    - npm run lint
  dependencies:
    - install-deps

# Run tests
test:
  stage: quality
  extends: .node-test
  needs: ['install-deps']
  dependencies:
    - install-deps
  coverage: '/Lines\s*:\s*(\d+\.\d+)%/'
  artifacts:
    reports:
      junit: junit.xml
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml

# Security scan
security:
  stage: security
  extends: .security-scan
  needs: ['install-deps']

# Build application
build:
  stage: build
  extends: .node-build
  needs: ['lint', 'test', 'security']
  script:
    - npm run build
  artifacts:
    paths:
      - dist/
    expire_in: 1 week

# Deploy to staging
deploy-staging:
  stage: deploy
  image: alpine:latest
  needs: ['build']
  script:
    - echo "Deploying to staging environment..."
    - echo "Application version $(cat package.json | grep version)"
    # Add your deployment commands here
  environment:
    name: staging
    url: https://staging.example.com
  only:
    - main
```

## Step 4: Understand the Configuration

### Component Inclusion
Components are included at the top with customized inputs:

```yaml
include:
  - component: gitlab.com/components/node/setup@2.0.0
    inputs:
      node-version: '20'
```

### Job Dependencies
Jobs can depend on each other:

```yaml
test:
  needs: ['install-deps']  # Wait for install-deps to complete
  dependencies:
    - install-deps         # Download artifacts from install-deps
```

### Extending Components
Use `extends` to inherit from component templates:

```yaml
lint:
  extends: .node-setup  # Inherits configuration from component
```

## Step 5: Commit and Run

```bash
git add .
git commit -m "Add complete CI/CD pipeline"
git push origin main
```

Watch your pipeline execute in GitLab under **CI/CD > Pipelines**.

## Step 6: Optimize with Parallel Jobs

Speed up your pipeline by running independent jobs in parallel:

```yaml
# quality stage jobs run in parallel
lint:
  stage: quality
  needs: ['install-deps']

test:
  stage: quality
  needs: ['install-deps']

# Both can start at the same time!
```

## Step 7: Add Pipeline Visualization

GitLab automatically creates a visual representation. View it under:
**CI/CD > Pipelines > [Your Pipeline] > Graph**

## Advanced: Conditional Deployment

Only deploy on the main branch:

```yaml
deploy-production:
  stage: deploy
  extends: .deploy
  environment:
    name: production
    url: https://example.com
  only:
    - main
  when: manual  # Require manual approval
```

## What You've Learned

- ✅ Composed multiple components into a complete pipeline
- ✅ Organized jobs into logical stages
- ✅ Used job dependencies and artifacts
- ✅ Implemented caching for faster builds
- ✅ Configured environment deployments
- ✅ Set up parallel job execution

## Next Steps

- [Test Components](/how-to/test-components) - Ensure component quality
- [Best Practices](/explanation/best-practices) - Learn optimization techniques
- [Configuration Reference](/reference/configuration) - All configuration options

## Common Patterns

### Monorepo Pipelines
```yaml
test-frontend:
  extends: .node-test
  variables:
    WORKSPACE: frontend

test-backend:
  extends: .node-test
  variables:
    WORKSPACE: backend
```

### Multi-environment Deployment
```yaml
.deploy-template:
  script:
    - echo "Deploying to $CI_ENVIRONMENT_NAME"

deploy-staging:
  extends: .deploy-template
  environment:
    name: staging

deploy-production:
  extends: .deploy-template
  environment:
    name: production
  when: manual
```

## Troubleshooting

**Jobs not running in parallel?**
- Check that they're in the same stage
- Ensure they don't have `needs` dependencies on each other

**Artifacts not available?**
- Verify `dependencies` or `needs` is specified
- Check artifact expiration settings

**Pipeline too slow?**
- Use caching effectively
- Parallelize independent jobs
- Consider using `needs` to skip unnecessary waits
