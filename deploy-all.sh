#!/bin/bash

# Quiet Consensus - Full Deployment Script
# This script deploys all components of the Quiet Consensus project:
# 1. SCT (Soulbound Credential Token) Contract
# 2. Polling Contract  
# 3. Frontend Web Application

# Designed for linux 

# Get the directory where the script was called from
REPO_DIR="$PWD"

echo "Starting Quiet Consensus deployment..."
echo "Working directory: $REPO_DIR"

# ============================================================================
# STEP 1: Deploy SCT Contract
# ============================================================================
echo "Step 1: Deploying SCT (Soulbound Credential Token) Contract..."

# Navigate to SCT uploader directory and install dependencies
cd "$REPO_DIR/sct/uploader/"
npm install

# Upload the SCT contract to Secret Network
echo "Uploading SCT contract..."
npm run upload
sleep 10

# Instantiate the uploaded SCT contract
echo "Instantiating SCT contract..."
npm run instantiate
sleep 10

# Mint initial SCT tokens
echo "Minting SCT tokens..."
npm run mint

# ============================================================================
# STEP 2: Deploy Polling Contract
# ============================================================================
echo "Step 2: Deploying Polling Contract..."

# Build the polling contract
echo "Building polling contract..."
cd "$REPO_DIR/poll/contract"
make build-mainnet-reproducible

# Navigate to polling uploader and install dependencies
cd "$REPO_DIR/poll/uploader"
npm install

# Upload the polling contract to Secret Network
echo "Uploading polling contract..."
npm run upload
sleep 10

# Instantiate the uploaded polling contract
echo "Instantiating polling contract..."
npm run instantiate

# ============================================================================
# STEP 3: Start Frontend Application
# ============================================================================
echo "Step 3: Starting Frontend Web Application..."

# Navigate to web directory and install dependencies
cd "$REPO_DIR/web/"
npm install

# Start the development server
echo "Starting development server..."
npm run dev
