# CI/CD Pipeline Documentation

This document provides detailed information about the CI/CD pipeline set up for the Custom Candle E-commerce project.

## Overview

Our CI/CD pipeline automates the testing, building, and deployment processes, ensuring code quality and reliability. The pipeline is implemented using GitHub Actions and consists of the following stages:

1. **Continuous Integration (CI)**
   - Code linting
   - Unit testing
   - Integration testing
   - End-to-end testing
   - Code coverage reporting

2. **Continuous Deployment (CD)**
   - Automated builds
   - Deployment to production server

## Pipeline Workflow

The pipeline is triggered on:
- Push to the main branch
- Pull requests to the main branch

### CI Stage

The CI stage runs the following jobs:

#### Frontend Tests
- Sets up Node.js environment
- Installs dependencies
- Runs ESLint for code quality
- Executes Jest tests with coverage reporting
- Builds the Next.js application
- Caches build artifacts for the deployment stage
- Uploads test results as artifacts

#### Backend Tests
- Sets up Node.js environment
- Installs dependencies
- Runs ESLint for code quality
- Executes Jest tests with coverage reporting
- Builds the Express application
- Uploads test results as artifacts

### CD Stage

The CD stage runs only when changes are pushed to the main branch and includes:
- Retrieving cached build artifacts
- Deploying to the production server via SSH
- Running the deployment script on the server

## Test Coverage Requirements

We enforce minimum test coverage thresholds:
- 70% branch coverage
- 70% function coverage
- 70% line coverage
- 70% statement coverage

## Local Development

### Running Tests Locally

To run the same tests that the CI pipeline runs:

```bash
# Frontend
npm run lint
npm run test:ci
npm run test:e2e:ci

# Backend
cd server
npm run lint
npm run test:ci
```

### Simulating the CI Environment

To simulate the CI environment locally:

```bash
# Frontend
npm run ci:verify
npm run ci:build

# Backend
cd server
npm run ci:verify
npm run build
```

## Deployment Process

The deployment process:

1. Connects to the production server via SSH
2. Pulls the latest code from the main branch
3. Installs dependencies for both frontend and backend
4. Builds both applications
5. Restarts the services using PM2

## Monitoring the Pipeline

You can monitor the pipeline execution:
1. Go to the GitHub repository
2. Click on the "Actions" tab
3. Select the workflow run you want to inspect
4. View the detailed logs for each job

## Troubleshooting

### Common Issues

1. **Failed Tests**
   - Check the test logs for specific errors
   - Run the tests locally to reproduce the issue

2. **Deployment Failures**
   - Verify SSH connection settings
   - Check server logs for errors
   - Ensure the deployment user has the necessary permissions

3. **Build Failures**
   - Check for dependency issues
   - Verify that the build scripts are correctly configured

## Extending the Pipeline

To extend the pipeline:

1. Edit the `.github/workflows/ci-cd.yml` file
2. Add new jobs or steps as needed
3. Update the deployment script (`scripts/deploy.sh`) for new deployment requirements

## Security Considerations

- SSH keys and server credentials are stored as GitHub Secrets
- No sensitive information is exposed in logs or artifacts
- The deployment user has limited permissions on the server