# CI/CD Keywords

GitLab CI/CD keywords available for use in component templates.

## Job Configuration

### stage

Pipeline stage where the job runs.

```yaml
.template:
  stage: test  # build, test, deploy, etc.
```

**Default stages:** `.pre`, `build`, `test`, `deploy`, `.post`

### image

Docker image to use for the job.

```yaml
.template:
  image: node:20
  # or
  image:
    name: node:20
    entrypoint: ["/bin/sh", "-c"]
```

### services

Additional Docker containers to run alongside the job.

```yaml
.template:
  services:
    - postgres:13
    - redis:latest
  # or with configuration
  services:
    - name: postgres:13
      alias: db
      variables:
        POSTGRES_PASSWORD: secret
```

## Script Keywords

### before_script

Commands to run before the main script.

```yaml
.template:
  before_script:
    - apt-get update
    - apt-get install -y dependencies
```

### script

Main commands to execute (required for jobs).

```yaml
.template:
  script:
    - npm install
    - npm test
    - npm run build
```

### after_script

Commands to run after the main script (always runs, even on failure).

```yaml
.template:
  after_script:
    - cleanup.sh
    - rm -rf temp/
```

## Artifacts

### artifacts

Files to save from the job.

```yaml
.template:
  artifacts:
    paths:
      - build/
      - dist/
    exclude:
      - "**/*.log"
    name: "$CI_JOB_NAME-$CI_COMMIT_REF_SLUG"
    expire_in: 1 week
    when: on_success  # on_success, on_failure, always
    reports:
      junit: report.xml
      dotenv: build.env
```

## Cache

### cache

Files to cache between pipeline runs.

```yaml
.template:
  cache:
    key:
      files:
        - package-lock.json
    paths:
      - node_modules/
    policy: pull-push  # pull-push, pull, push
    when: on_success
```

## Variables

### variables

Environment variables for the job.

```yaml
.template:
  variables:
    NODE_ENV: production
    DEBUG: "false"
    CUSTOM_VAR: $[[ inputs.custom_value ]]
```

## Dependencies

### needs

Jobs that must complete before this job.

```yaml
.template:
  needs:
    - build
    - test
  # or with artifacts
  needs:
    - job: build
      artifacts: true
    - job: test
      artifacts: false
```

### dependencies

Jobs to download artifacts from (deprecated, use `needs` instead).

```yaml
.template:
  dependencies:
    - build
```

## Rules

### rules

Conditions for when to run the job.

```yaml
.template:
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
      when: always
    - if: $CI_MERGE_REQUEST_ID
      when: manual
    - when: never
```

### only / except

Legacy conditional keywords (prefer `rules`).

```yaml
.template:
  only:
    - main
    - merge_requests
  except:
    - tags
```

## Execution Control

### when

When to run the job.

```yaml
.template:
  when: on_success  # on_success, on_failure, always, manual, delayed
```

### allow_failure

Allow job to fail without failing the pipeline.

```yaml
.template:
  allow_failure: true
  # or conditional
  allow_failure:
    exit_codes:
      - 137
      - 255
```

### timeout

Maximum execution time for the job.

```yaml
.template:
  timeout: 1h  # 30 mins, 1h, 2h, etc.
```

### retry

Retry configuration for failed jobs.

```yaml
.template:
  retry: 2
  # or with conditions
  retry:
    max: 2
    when:
      - runner_system_failure
      - stuck_or_timeout_failure
```

### interruptible

Whether the job can be cancelled when a new pipeline starts.

```yaml
.template:
  interruptible: true
```

## Parallelization

### parallel

Run multiple instances of the job.

```yaml
.template:
  parallel: 5
```

### parallel:matrix

Run job with different variable combinations.

```yaml
.template:
  parallel:
    matrix:
      - OS: [linux, macos, windows]
        NODE_VERSION: ['18', '20', '21']
```

## Environment

### environment

Deployment environment configuration.

```yaml
.template:
  environment:
    name: production
    url: https://example.com
    on_stop: stop_production
    auto_stop_in: 1 week
    action: start  # start, prepare, stop, verify, access
```

## Resource Management

### tags

Runner tags to select specific runners.

```yaml
.template:
  tags:
    - docker
    - linux
    - high-memory
```

### resource_group

Ensure only one job from the group runs at a time.

```yaml
.template:
  resource_group: production
```

## Includes

### include

Include external YAML files or templates.

```yaml
include:
  # Local file
  - local: '/templates/build.yml'

  # File from another project
  - project: 'group/project'
    file: '/templates/ci.yml'

  # Template
  - template: Security/SAST.gitlab-ci.yml

  # Remote file
  - remote: 'https://example.com/ci-template.yml'

  # Component
  - component: gitlab.com/org/component@1.0.0
    inputs:
      key: value
```

## Job Templates

### extends

Inherit configuration from another job or template.

```yaml
.base-template:
  image: alpine:latest
  before_script:
    - apk add curl

.specific-template:
  extends: .base-template
  script:
    - curl https://example.com
```

## Coverage

### coverage

Regular expression to extract coverage percentage.

```yaml
.template:
  script:
    - npm test
  coverage: '/Lines\s*:\s*(\d+\.\d+)%/'
```

## Release

### release

Create a GitLab release.

```yaml
release:
  stage: deploy
  image: registry.gitlab.com/gitlab-org/release-cli:latest
  release:
    tag_name: $CI_COMMIT_TAG
    description: './CHANGELOG.md'
    assets:
      links:
        - name: 'Package'
          url: 'https://example.com/package.zip'
```

## Trigger

### trigger

Trigger a downstream pipeline.

```yaml
trigger_pipeline:
  trigger:
    project: group/project
    branch: main
    strategy: depend
```

## ID Tokens

### id_tokens

Generate JWT tokens for authentication.

```yaml
.template:
  id_tokens:
    ID_TOKEN:
      aud: https://example.com
  script:
    - echo $ID_TOKEN
```

## Pages

### pages

Deploy to GitLab Pages (special job name).

```yaml
pages:
  script:
    - npm run build
  artifacts:
    paths:
      - public
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
```

## Secrets

### secrets

Pull secrets from external providers.

```yaml
.template:
  secrets:
    API_KEY:
      vault:
        engine:
          name: kv-v2
          path: secret
        path: production/api
        field: key
  script:
    - echo $API_KEY
```

## Workflow

### workflow

Control pipeline behavior (not typically used in components).

```yaml
workflow:
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
    - if: $CI_MERGE_REQUEST_ID
```

## Inheritance

### default

Default values for all jobs (not typically used in components).

```yaml
default:
  image: node:20
  retry: 2
  timeout: 30m
```

### inherit

Control what to inherit from defaults.

```yaml
.template:
  inherit:
    default: false  # Don't inherit defaults
    variables: true  # Inherit variables
```

## Common Combinations

### Build Template

```yaml
.build-template:
  stage: build
  image: node:20
  before_script:
    - npm ci
  script:
    - npm run build
  artifacts:
    paths:
      - dist/
    expire_in: 1 week
  cache:
    key:
      files:
        - package-lock.json
    paths:
      - node_modules/
  rules:
    - if: $CI_COMMIT_BRANCH
```

### Test Template

```yaml
.test-template:
  stage: test
  image: node:20
  needs: ['build']
  script:
    - npm test
  artifacts:
    reports:
      junit: junit.xml
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml
  coverage: '/Lines\s*:\s*(\d+\.\d+)%/'
  retry:
    max: 2
    when: runner_system_failure
```

### Deploy Template

```yaml
.deploy-template:
  stage: deploy
  image: alpine:latest
  needs: ['build', 'test']
  script:
    - deploy.sh
  environment:
    name: $CI_COMMIT_REF_SLUG
    url: https://$CI_COMMIT_REF_SLUG.example.com
    on_stop: stop_deploy
    auto_stop_in: 1 day
  resource_group: $CI_COMMIT_REF_SLUG
  when: manual
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
```

## Keyword Precedence

When extending templates, later definitions override earlier ones:

```yaml
.base:
  image: alpine:3.18
  script:
    - echo "base"

.extended:
  extends: .base
  image: alpine:3.19  # Overrides base image
  script:
    - echo "extended"  # Overrides base script
```

## Not Allowed in Components

Some keywords cannot be used in component templates:

- `stages` - Defined by the using project
- `workflow` - Pipeline-level, not job-level
- `default` - Should be in main `.gitlab-ci.yml`
- `include` - Components use inputs, not includes

## See Also

- [GitLab CI/CD YAML Syntax Reference](https://docs.gitlab.com/ee/ci/yaml/)
- [Component Specification](/reference/component-spec)
- [Configuration Options](/reference/configuration)
- [Building a CI Pipeline](/tutorials/building-pipeline)
