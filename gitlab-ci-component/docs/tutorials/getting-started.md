# Getting Started with GitLab CI/CD Components

Welcome! This tutorial will introduce you to GitLab CI/CD components and help you set up your environment.

## What You'll Build

By the end of this tutorial, you will:

- Understand what CI/CD components are
- Set up a GitLab project for component development
- Use your first component in a pipeline
- See a successful pipeline run

## Prerequisites

- A GitLab account (GitLab.com or self-hosted GitLab 16.0+)
- Basic familiarity with Git
- Basic understanding of CI/CD concepts

## Step 1: Understanding Components

GitLab CI/CD components are reusable pipeline snippets stored in their own repositories. Think of them as functions for your CI/CD pipelines.

**Traditional approach:**
```yaml
# .gitlab-ci.yml - lots of repetition
build:
  script:
    - npm install
    - npm run build
  cache:
    key: npm
    paths:
      - node_modules/
```

**Component approach:**
```yaml
# .gitlab-ci.yml - clean and reusable
include:
  - component: gitlab.com/my-org/node-build@1.0.0

build:
  extends: .node-build
```

## Step 2: Create a New GitLab Project

1. Navigate to GitLab and create a new project
2. Name it `my-first-pipeline`
3. Initialize with a README
4. Clone it to your local machine:

```bash
git clone https://gitlab.com/your-username/my-first-pipeline.git
cd my-first-pipeline
```

## Step 3: Create a Simple .gitlab-ci.yml

Create a basic pipeline file:

```yaml
# .gitlab-ci.yml
stages:
  - test

hello-world:
  stage: test
  image: alpine:latest
  script:
    - echo "Hello from GitLab CI!"
    - echo "This is my first pipeline"
```

## Step 4: Commit and Push

```bash
git add .gitlab-ci.yml
git commit -m "Add initial CI pipeline"
git push origin main
```

## Step 5: View Your Pipeline

1. Go to your project in GitLab
2. Navigate to **CI/CD > Pipelines**
3. You should see your pipeline running (or completed)
4. Click on it to see the job output

## Step 6: Use Your First Component

Now let's use a pre-built component. Update your `.gitlab-ci.yml`:

```yaml
# .gitlab-ci.yml
include:
  - component: gitlab.com/components/echo/echo@1.0.0
    inputs:
      message: "Hello from a component!"

stages:
  - test

component-test:
  stage: test
  extends: .echo
```

Commit and push again:

```bash
git add .gitlab-ci.yml
git commit -m "Use echo component"
git push origin main
```

## What You've Learned

- ✅ Created a GitLab CI/CD pipeline
- ✅ Understood the basic pipeline structure
- ✅ Used your first GitLab component
- ✅ Viewed pipeline results in GitLab UI

## Next Steps

Now that you understand the basics, continue to:

- [Create Your First Component](/tutorials/first-component) - Learn how to build components
- [How-to Guides](/how-to/) - Solve specific problems
- [Reference Documentation](/reference/) - Deep dive into component specs

## Troubleshooting

**Pipeline doesn't start?**
- Check that `.gitlab-ci.yml` is in the root of your repository
- Ensure you have CI/CD enabled in your project settings

**Component not found?**
- Verify the component path and version
- Check that the component repository is public or you have access

**Job fails?**
- Click on the failed job to see error messages
- Check the script syntax in your YAML file
