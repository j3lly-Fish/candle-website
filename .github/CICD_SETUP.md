# CI/CD Pipeline Setup Guide

This document explains how to set up and configure the CI/CD pipeline for the Custom Candle E-commerce project.

## Overview

Our CI/CD pipeline uses GitHub Actions to:
1. Run tests on both frontend and backend code
2. Build the application
3. Deploy to production when changes are pushed to the main branch

## Required GitHub Secrets

To use this CI/CD pipeline, you need to configure the following secrets in your GitHub repository:

1. `SSH_PRIVATE_KEY`: The private SSH key used to connect to your deployment server
2. `KNOWN_HOSTS`: The SSH known_hosts entry for your deployment server
3. `SSH_USER`: The username to use when connecting to your deployment server
4. `SSH_HOST`: The hostname or IP address of your deployment server
5. `PROJECT_PATH`: The path to the project directory on your deployment server

## How to Configure GitHub Secrets

1. Go to your GitHub repository
2. Click on "Settings"
3. Click on "Secrets and variables" > "Actions"
4. Click on "New repository secret"
5. Add each of the required secrets

## Generating SSH Keys

If you need to generate a new SSH key pair for deployment:

```bash
# Generate a new SSH key
ssh-keygen -t ed25519 -C "deployment-key"

# Copy the public key to your server
ssh-copy-id -i ~/.ssh/id_ed25519.pub user@your-server

# Get the content of your private key (to add as a GitHub secret)
cat ~/.ssh/id_ed25519

# Get the known_hosts entry for your server
ssh-keyscan your-server
```

## Local Testing

You can test the deployment script locally by running:

```bash
./scripts/deploy.sh
```

## Troubleshooting

If you encounter issues with the CI/CD pipeline:

1. Check the GitHub Actions logs for detailed error messages
2. Verify that all required secrets are correctly configured
3. Ensure your deployment server is accessible from GitHub Actions
4. Check that the deployment user has the necessary permissions on the server

## Manual Deployment

In case you need to deploy manually:

1. SSH into your server
2. Navigate to the project directory
3. Run the deployment script:
   ```bash
   ./scripts/deploy.sh
   ```