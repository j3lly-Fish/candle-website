#!/bin/bash

# GitHub Deployment Script for Custom Candle E-commerce Application
# This script helps you push your project to GitHub with proper configuration

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}$1${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to validate GitHub repository URL
validate_repo_url() {
    local url="$1"
    if [[ $url =~ ^https://github\.com/[a-zA-Z0-9_.-]+/[a-zA-Z0-9_.-]+\.git$ ]] || 
       [[ $url =~ ^git@github\.com:[a-zA-Z0-9_.-]+/[a-zA-Z0-9_.-]+\.git$ ]]; then
        return 0
    else
        return 1
    fi
}

# Function to get user input with validation
get_input() {
    local prompt="$1"
    local var_name="$2"
    local validation_func="$3"
    local value
    
    while true; do
        read -p "$prompt" value
        if [[ -n "$value" ]]; then
            if [[ -n "$validation_func" ]]; then
                if $validation_func "$value"; then
                    eval "$var_name='$value'"
                    break
                else
                    print_error "Invalid input. Please try again."
                fi
            else
                eval "$var_name='$value'"
                break
            fi
        else
            print_error "This field is required. Please enter a value."
        fi
    done
}

# Function to setup Git configuration
setup_git_config() {
    print_header "=== Git Configuration Setup ==="
    
    # Check if git is installed
    if ! command_exists git; then
        print_error "Git is not installed. Please install Git first."
        exit 1
    fi
    
    # Get current git config
    current_name=$(git config --global user.name 2>/dev/null || echo "")
    current_email=$(git config --global user.email 2>/dev/null || echo "")
    
    if [[ -n "$current_name" && -n "$current_email" ]]; then
        print_status "Current Git configuration:"
        echo "  Name: $current_name"
        echo "  Email: $current_email"
        echo ""
        read -p "Do you want to use this configuration? (y/n): " use_current
        if [[ $use_current =~ ^[Yy]$ ]]; then
            return 0
        fi
    fi
    
    # Setup new git config
    echo "Please enter your Git configuration:"
    get_input "Your Name: " git_name
    get_input "Your Email: " git_email
    
    git config --global user.name "$git_name"
    git config --global user.email "$git_email"
    
    print_status "Git configuration updated successfully!"
}

# Function to setup GitHub authentication
setup_github_auth() {
    print_header "=== GitHub Authentication Setup ==="
    
    echo "Choose your authentication method:"
    echo "1. Personal Access Token (Recommended)"
    echo "2. SSH Key"
    echo "3. GitHub CLI (gh)"
    echo ""
    
    while true; do
        read -p "Select option (1-3): " auth_choice
        case $auth_choice in
            1)
                setup_token_auth
                break
                ;;
            2)
                setup_ssh_auth
                break
                ;;
            3)
                setup_gh_cli_auth
                break
                ;;
            *)
                print_error "Invalid option. Please select 1, 2, or 3."
                ;;
        esac
    done
}

# Function to setup Personal Access Token authentication
setup_token_auth() {
    print_status "Setting up Personal Access Token authentication..."
    echo ""
    echo "To create a Personal Access Token:"
    echo "1. Go to https://github.com/settings/tokens"
    echo "2. Click 'Generate new token' > 'Generate new token (classic)'"
    echo "3. Give it a name like 'Candle E-commerce Deploy'"
    echo "4. Select scopes: 'repo', 'workflow', 'write:packages'"
    echo "5. Click 'Generate token' and copy it"
    echo ""
    
    get_input "Enter your GitHub Personal Access Token: " github_token
    
    # Store token securely (you might want to use a more secure method in production)
    export GITHUB_TOKEN="$github_token"
    AUTH_METHOD="token"
    
    print_status "Personal Access Token configured successfully!"
}

# Function to setup SSH authentication
setup_ssh_auth() {
    print_status "Setting up SSH key authentication..."
    
    # Check if SSH key exists
    if [[ -f ~/.ssh/id_rsa.pub ]] || [[ -f ~/.ssh/id_ed25519.pub ]]; then
        print_status "SSH key found. Checking if it's added to GitHub..."
        echo "Please ensure your SSH key is added to your GitHub account:"
        echo "1. Go to https://github.com/settings/keys"
        echo "2. Click 'New SSH key'"
        echo "3. Add your public key"
        echo ""
        
        if [[ -f ~/.ssh/id_ed25519.pub ]]; then
            echo "Your Ed25519 public key:"
            cat ~/.ssh/id_ed25519.pub
        elif [[ -f ~/.ssh/id_rsa.pub ]]; then
            echo "Your RSA public key:"
            cat ~/.ssh/id_rsa.pub
        fi
        
        echo ""
        read -p "Press Enter after adding your SSH key to GitHub..."
    else
        print_status "No SSH key found. Generating a new one..."
        get_input "Enter your email for SSH key: " ssh_email
        
        ssh-keygen -t ed25519 -C "$ssh_email" -f ~/.ssh/id_ed25519 -N ""
        
        print_status "SSH key generated successfully!"
        echo "Your public key (add this to GitHub):"
        cat ~/.ssh/id_ed25519.pub
        echo ""
        echo "Add this key to GitHub:"
        echo "1. Go to https://github.com/settings/keys"
        echo "2. Click 'New SSH key'"
        echo "3. Paste the above key"
        echo ""
        read -p "Press Enter after adding your SSH key to GitHub..."
    fi
    
    # Test SSH connection
    print_status "Testing SSH connection to GitHub..."
    if ssh -T git@github.com 2>&1 | grep -q "successfully authenticated"; then
        print_status "SSH authentication successful!"
        AUTH_METHOD="ssh"
    else
        print_warning "SSH test failed. You may need to add your key to ssh-agent:"
        echo "ssh-add ~/.ssh/id_ed25519"
        AUTH_METHOD="ssh"
    fi
}

# Function to setup GitHub CLI authentication
setup_gh_cli_auth() {
    print_status "Setting up GitHub CLI authentication..."
    
    if ! command_exists gh; then
        print_error "GitHub CLI (gh) is not installed."
        echo "Install it from: https://cli.github.com/"
        echo "Or use: brew install gh"
        exit 1
    fi
    
    # Check if already authenticated
    if gh auth status >/dev/null 2>&1; then
        print_status "Already authenticated with GitHub CLI!"
        AUTH_METHOD="gh"
        return 0
    fi
    
    print_status "Authenticating with GitHub CLI..."
    gh auth login
    
    if gh auth status >/dev/null 2>&1; then
        print_status "GitHub CLI authentication successful!"
        AUTH_METHOD="gh"
    else
        print_error "GitHub CLI authentication failed!"
        exit 1
    fi
}

# Function to get repository information
get_repository_info() {
    print_header "=== Repository Configuration ==="
    
    echo "Choose how to specify your repository:"
    echo "1. Enter repository URL manually"
    echo "2. Create a new repository on GitHub"
    echo "3. Select from existing repositories (requires GitHub CLI)"
    echo ""
    
    while true; do
        read -p "Select option (1-3): " repo_choice
        case $repo_choice in
            1)
                get_repo_url_manual
                break
                ;;
            2)
                create_new_repository
                break
                ;;
            3)
                select_existing_repository
                break
                ;;
            *)
                print_error "Invalid option. Please select 1, 2, or 3."
                ;;
        esac
    done
}

# Function to manually enter repository URL
get_repo_url_manual() {
    echo ""
    echo "Repository URL formats:"
    echo "  HTTPS: https://github.com/username/repository-name.git"
    echo "  SSH:   git@github.com:username/repository-name.git"
    echo ""
    
    get_input "Enter your GitHub repository URL: " REPO_URL validate_repo_url
    
    # Extract repository name for display
    REPO_NAME=$(basename "$REPO_URL" .git)
    print_status "Repository: $REPO_NAME"
}

# Function to create a new repository
create_new_repository() {
    if [[ "$AUTH_METHOD" != "gh" ]] && ! command_exists gh; then
        print_error "GitHub CLI is required to create repositories automatically."
        print_status "Please create the repository manually at https://github.com/new"
        get_repo_url_manual
        return
    fi
    
    echo ""
    get_input "Enter repository name: " repo_name
    get_input "Enter repository description: " repo_description
    
    echo ""
    echo "Repository visibility:"
    echo "1. Public (anyone can see)"
    echo "2. Private (only you can see)"
    
    while true; do
        read -p "Select visibility (1-2): " visibility_choice
        case $visibility_choice in
            1)
                visibility="public"
                break
                ;;
            2)
                visibility="private"
                break
                ;;
            *)
                print_error "Invalid option. Please select 1 or 2."
                ;;
        esac
    done
    
    print_status "Creating repository '$repo_name'..."
    
    if gh repo create "$repo_name" --description "$repo_description" --$visibility; then
        print_status "Repository created successfully!"
        
        # Get the repository URL
        github_username=$(gh api user --jq .login)
        if [[ "$AUTH_METHOD" == "ssh" ]]; then
            REPO_URL="git@github.com:$github_username/$repo_name.git"
        else
            REPO_URL="https://github.com/$github_username/$repo_name.git"
        fi
        REPO_NAME="$repo_name"
    else
        print_error "Failed to create repository!"
        exit 1
    fi
}

# Function to select from existing repositories
select_existing_repository() {
    if [[ "$AUTH_METHOD" != "gh" ]] && ! command_exists gh; then
        print_error "GitHub CLI is required to list repositories."
        get_repo_url_manual
        return
    fi
    
    print_status "Fetching your repositories..."
    
    # Get list of repositories
    repos=$(gh repo list --limit 20 --json name,url,isPrivate)
    
    if [[ -z "$repos" ]] || [[ "$repos" == "[]" ]]; then
        print_warning "No repositories found. Creating a new one..."
        create_new_repository
        return
    fi
    
    echo ""
    echo "Your repositories:"
    echo "$repos" | jq -r '.[] | "\(.name) - \(if .isPrivate then "Private" else "Public" end)"' | nl
    
    echo ""
    repo_count=$(echo "$repos" | jq length)
    
    while true; do
        read -p "Select repository number (1-$repo_count): " repo_num
        if [[ "$repo_num" =~ ^[0-9]+$ ]] && [[ "$repo_num" -ge 1 ]] && [[ "$repo_num" -le "$repo_count" ]]; then
            selected_repo=$(echo "$repos" | jq -r ".[$((repo_num-1))]")
            REPO_NAME=$(echo "$selected_repo" | jq -r .name)
            REPO_URL=$(echo "$selected_repo" | jq -r .url)
            
            # Convert to appropriate URL format
            if [[ "$AUTH_METHOD" == "ssh" ]]; then
                REPO_URL=$(echo "$REPO_URL" | sed 's|https://github.com/|git@github.com:|' | sed 's|$|.git|')
            else
                REPO_URL="$REPO_URL.git"
            fi
            
            print_status "Selected repository: $REPO_NAME"
            break
        else
            print_error "Invalid selection. Please enter a number between 1 and $repo_count."
        fi
    done
}

# Function to prepare the repository
prepare_repository() {
    print_header "=== Preparing Repository ==="
    
    # Initialize git repository if not already initialized
    if [[ ! -d .git ]]; then
        print_status "Initializing Git repository..."
        git init
        git branch -M main
    fi
    
    # Create or update .gitignore
    create_gitignore
    
    # Create or update README if needed
    if [[ ! -f README.md ]]; then
        print_warning "README.md not found. The existing README.md will be used."
    fi
    
    # Add remote origin
    if git remote get-url origin >/dev/null 2>&1; then
        print_status "Updating remote origin..."
        git remote set-url origin "$REPO_URL"
    else
        print_status "Adding remote origin..."
        git remote add origin "$REPO_URL"
    fi
    
    print_status "Repository prepared successfully!"
}

# Function to create comprehensive .gitignore
create_gitignore() {
    print_status "Creating/updating .gitignore..."
    
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# nyc test coverage
.nyc_output

# Grunt intermediate storage
.grunt

# Bower dependency directory
bower_components

# node-waf configuration
.lock-wscript

# Compiled binary addons
build/Release

# Dependency directories
jspm_packages/

# TypeScript cache
*.tsbuildinfo

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Optional stylelint cache
.stylelintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variable files
.env
.env.development.local
.env.test.local
.env.production.local
.env.local

# parcel-bundler cache
.cache
.parcel-cache

# Next.js build output
.next/
out/

# Nuxt.js build / generate output
.nuxt
dist

# Gatsby files
.cache/
public

# Vuepress build output
.vuepress/dist

# Serverless directories
.serverless/

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port

# Stores VSCode versions used for testing VSCode extensions
.vscode-test

# yarn v2
.yarn/cache
.yarn/unplugged
.yarn/build-state.yml
.yarn/install-state.gz
.pnp.*

# IDEs and editors
.vscode/
.idea/
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Logs
logs
*.log

# Docker
docker-compose.override.yml

# Database
*.sqlite
*.db

# Uploads and user content
uploads/
public/uploads/

# Backup files
backups/
*.backup

# Temporary files
tmp/
temp/

# Build artifacts
build/
dist/

# Test artifacts
test-results/
playwright-report/
test-results.xml

# Monitoring and metrics
prometheus_data/
grafana_data/

# SSL certificates
*.pem
*.key
*.crt
ssl/

# Local development
.env.local
.env.development
.env.test
.env.production

# Package manager lock files (uncomment if you want to ignore them)
# package-lock.json
# yarn.lock
# pnpm-lock.yaml
EOF

    print_status ".gitignore created/updated successfully!"
}

# Function to commit and push changes
commit_and_push() {
    print_header "=== Committing and Pushing Changes ==="
    
    # Check if there are any changes to commit
    if git diff --quiet && git diff --staged --quiet; then
        print_warning "No changes to commit."
        return
    fi
    
    # Show status
    print_status "Current repository status:"
    git status --short
    echo ""
    
    # Add all files
    print_status "Adding files to staging area..."
    git add .
    
    # Get commit message
    echo "Enter commit message (or press Enter for default):"
    read -p "Commit message: " commit_message
    
    if [[ -z "$commit_message" ]]; then
        commit_message="Initial commit: Custom Candle E-commerce Application

- Complete Next.js frontend with React 19 and Tailwind CSS
- Express.js backend API with TypeScript
- MongoDB database with automated backups
- Docker Compose setup with monitoring stack
- Nginx reverse proxy with rate limiting
- Prometheus and Grafana monitoring
- Automated CI/CD pipeline with GitHub Actions
- Comprehensive documentation and deployment scripts"
    fi
    
    # Commit changes
    print_status "Committing changes..."
    git commit -m "$commit_message"
    
    # Push to GitHub
    print_status "Pushing to GitHub..."
    
    # Check if we need to set upstream
    if ! git rev-parse --abbrev-ref --symbolic-full-name @{u} >/dev/null 2>&1; then
        print_status "Setting upstream branch..."
        git push -u origin main
    else
        git push
    fi
    
    print_status "Successfully pushed to GitHub!"
}

# Function to setup GitHub Actions (optional)
setup_github_actions() {
    print_header "=== GitHub Actions Setup ==="
    
    read -p "Do you want to enable GitHub Actions CI/CD? (y/n): " enable_actions
    
    if [[ ! $enable_actions =~ ^[Yy]$ ]]; then
        print_status "Skipping GitHub Actions setup."
        return
    fi
    
    print_status "GitHub Actions is already configured in .github/workflows/ci-cd.yml"
    print_status "You may need to configure the following secrets in your GitHub repository:"
    echo ""
    echo "Required secrets (go to Settings > Secrets and variables > Actions):"
    echo "  - SSH_PRIVATE_KEY: Your deployment server SSH private key"
    echo "  - KNOWN_HOSTS: SSH known_hosts entry for your server"
    echo "  - SSH_USER: Username for deployment server"
    echo "  - SSH_HOST: Hostname/IP of deployment server"
    echo "  - PROJECT_PATH: Path to project on deployment server"
    echo ""
    echo "Optional secrets:"
    echo "  - STRIPE_SECRET_KEY: For Stripe integration"
    echo "  - EMAIL_PASSWORD: For email notifications"
    echo ""
    
    read -p "Press Enter to continue..."
}

# Function to display final information
display_final_info() {
    print_header "=== Deployment Complete! ==="
    
    echo ""
    print_status "Your Custom Candle E-commerce Application has been successfully pushed to GitHub!"
    echo ""
    echo "Repository Information:"
    echo "  📁 Repository: $REPO_NAME"
    echo "  🔗 URL: ${REPO_URL%.git}"
    echo "  🌐 Web: https://github.com/$(echo $REPO_URL | sed 's/.*github.com[:/]//' | sed 's/.git$//')"
    echo ""
    echo "Next Steps:"
    echo "  1. 🔧 Configure GitHub Secrets for CI/CD (if enabled)"
    echo "  2. 🚀 Set up deployment server (see SERVER_SETUP.md)"
    echo "  3. 🔑 Add your Stripe API keys to environment variables"
    echo "  4. 📧 Configure email settings for notifications"
    echo "  5. 🌍 Set up domain and SSL certificates"
    echo ""
    echo "Useful Commands:"
    echo "  📥 Clone elsewhere: git clone $REPO_URL"
    echo "  🐳 Run locally: ./start.sh"
    echo "  📊 View logs: docker-compose logs -f"
    echo ""
    echo "Documentation:"
    echo "  📖 README.md - Complete setup instructions"
    echo "  🔧 SERVER_SETUP.md - Production deployment guide"
    echo "  📈 MONITORING_SETUP.md - Monitoring configuration"
    echo "  💾 BACKUP_RECOVERY_STRATEGY.md - Backup procedures"
    echo ""
    print_status "Happy coding! 🕯️✨"
}

# Main execution
main() {
    print_header "🕯️ Custom Candle E-commerce - GitHub Deployment Script"
    echo ""
    
    # Check if we're in the right directory
    if [[ ! -f "docker-compose.yml" ]] || [[ ! -f "package.json" ]]; then
        print_error "This script must be run from the candle-ecommerce project root directory."
        exit 1
    fi
    
    # Setup Git configuration
    setup_git_config
    echo ""
    
    # Setup GitHub authentication
    setup_github_auth
    echo ""
    
    # Get repository information
    get_repository_info
    echo ""
    
    # Prepare repository
    prepare_repository
    echo ""
    
    # Commit and push changes
    commit_and_push
    echo ""
    
    # Setup GitHub Actions (optional)
    setup_github_actions
    echo ""
    
    # Display final information
    display_final_info
}

# Run main function
main "$@"