#!/bin/bash
set -e

# --------------------------------------------------------------------
# Define Locations
# --------------------------------------------------------------------
SETUP_REPO_URL="https://github.com/amurphy99/chat_app_deployment.git"
SETUP_REPO_NAME="chat_app_deployment"
SETUP_REPO_BRANCH="robot"
SETUP_PRJ_DIR="$HOME"
SETUP_REPO_DIR="$SETUP_PRJ_DIR/$SETUP_REPO_NAME"

# --------------------------------------------------------------------
# Clone or pull from the app deployment repository
# --------------------------------------------------------------------
echo "Current working directory: $(pwd)"
cd "$SETUP_PRJ_DIR"
echo "Current working directory: $(pwd)"

# Check if the repository directory already exists
if [ -d "$SETUP_REPO_NAME" ]; then
    # If it already exists, pull from the given origin branch
    echo -e "Setup repo exists, pulling latest changes..."
    cd "$SETUP_REPO_NAME"
    git checkout $SETUP_REPO_BRANCH
    git pull origin $SETUP_REPO_BRANCH
else
    # If it doesn't exist at all yet, clone it
    echo -e "Cloning repo..."
    git clone -b $SETUP_REPO_BRANCH $SETUP_REPO_URL
fi


# --------------------------------------------------------------------
# Define some "secret" keys here
# --------------------------------------------------------------------
__SPEECH_KEY=""
__POSTGRES_USER="postgres"
__POSTGRES_PASSWORD="devpassword"

# Export them so they can be used in the deployment script
export __SPEECH_KEY
export __POSTGRES_USER
export __POSTGRES_PASSWORD

# --------------------------------------------------------------------
# Run the setup script
# --------------------------------------------------------------------
# deploy_app.sh --env=sandbox
source "$SETUP_REPO_DIR/deploy.sh" "$@"
