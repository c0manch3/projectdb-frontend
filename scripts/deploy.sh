#!/bin/bash

################################################################################
# Deployment Script for ProjectDB Frontend
#
# This script automates the deployment process to the production server
# Usage: ./scripts/deploy.sh
################################################################################

set -e  # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
SERVER_USER="root"  # Change this to your server username
SERVER_HOST="209.38.74.75"
SERVER_PATH="/opt/projectdb-frontend"
DOCKER_IMAGE_NAME="projectdb-frontend"
CONTAINER_NAME="projectdb-frontend"

echo -e "${GREEN}=== ProjectDB Frontend Deployment ===${NC}\n"

# Step 1: Run tests
echo -e "${YELLOW}[1/8] Running tests...${NC}"
npm run test || {
    echo -e "${RED}Tests failed! Deployment aborted.${NC}"
    exit 1
}
echo -e "${GREEN}Tests passed!${NC}\n"

# Step 2: Type check
echo -e "${YELLOW}[2/8] Running TypeScript type check...${NC}"
npm run type-check || {
    echo -e "${RED}Type check failed! Deployment aborted.${NC}"
    exit 1
}
echo -e "${GREEN}Type check passed!${NC}\n"

# Step 3: Lint check
echo -e "${YELLOW}[3/8] Running linter...${NC}"
npm run lint || {
    echo -e "${RED}Linting failed! Deployment aborted.${NC}"
    exit 1
}
echo -e "${GREEN}Linting passed!${NC}\n"

# Step 4: Build locally to verify
echo -e "${YELLOW}[4/8] Building application locally...${NC}"
npm run build || {
    echo -e "${RED}Build failed! Deployment aborted.${NC}"
    exit 1
}
echo -e "${GREEN}Build successful!${NC}\n"

# Step 5: Create deployment archive
echo -e "${YELLOW}[5/8] Creating deployment archive...${NC}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
ARCHIVE_NAME="projectdb-frontend-${TIMESTAMP}.tar.gz"

tar -czf "$ARCHIVE_NAME" \
    --exclude='node_modules' \
    --exclude='dist' \
    --exclude='.git' \
    --exclude='*.tar.gz' \
    --exclude='.env.local' \
    --exclude='.env.development' \
    .

echo -e "${GREEN}Archive created: $ARCHIVE_NAME${NC}\n"

# Step 6: Upload to server
echo -e "${YELLOW}[6/8] Uploading to server...${NC}"
scp "$ARCHIVE_NAME" "${SERVER_USER}@${SERVER_HOST}:/tmp/" || {
    echo -e "${RED}Upload failed!${NC}"
    rm "$ARCHIVE_NAME"
    exit 1
}
echo -e "${GREEN}Upload complete!${NC}\n"

# Step 7: Deploy on server
echo -e "${YELLOW}[7/8] Deploying on server...${NC}"
ssh "${SERVER_USER}@${SERVER_HOST}" << EOF
    set -e

    echo "Creating deployment directory..."
    mkdir -p ${SERVER_PATH}

    echo "Extracting archive..."
    cd ${SERVER_PATH}
    tar -xzf /tmp/${ARCHIVE_NAME}
    rm /tmp/${ARCHIVE_NAME}

    echo "Building Docker image..."
    docker build -t ${DOCKER_IMAGE_NAME}:latest .

    echo "Stopping old container (if exists)..."
    docker stop ${CONTAINER_NAME} 2>/dev/null || true
    docker rm ${CONTAINER_NAME} 2>/dev/null || true

    echo "Starting new container..."
    docker run -d \
        --name ${CONTAINER_NAME} \
        --restart unless-stopped \
        -p 8080:80 \
        ${DOCKER_IMAGE_NAME}:latest

    echo "Waiting for container to be healthy..."
    sleep 5

    echo "Checking container status..."
    docker ps | grep ${CONTAINER_NAME}

    echo "Deployment completed successfully!"
EOF

echo -e "${GREEN}Deployment successful!${NC}\n"

# Step 8: Cleanup
echo -e "${YELLOW}[8/8] Cleaning up...${NC}"
rm "$ARCHIVE_NAME"
rm -rf dist  # Remove local build directory
echo -e "${GREEN}Cleanup complete!${NC}\n"

echo -e "${GREEN}=== Deployment Complete ===${NC}"
echo -e "Frontend is now available at: ${GREEN}http://lencondb.ru${NC}"
echo -e "You can check the status with: ${YELLOW}ssh ${SERVER_USER}@${SERVER_HOST} 'docker ps | grep ${CONTAINER_NAME}'${NC}"
