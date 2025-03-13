#!/bin/bash

echo "This script will help you increase your Vercel function timeout using the Vercel CLI."
echo "Make sure you have the Vercel CLI installed and you're logged in."
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "Vercel CLI is not installed. Please install it first with:"
    echo "npm install -g vercel"
    exit 1
fi

# Check if user is logged in
vercel whoami &> /dev/null
if [ $? -ne 0 ]; then
    echo "You're not logged in to Vercel. Please log in first with:"
    echo "vercel login"
    exit 1
fi

# Get project info
echo "Getting project info..."
PROJECT_JSON=$(vercel project ls --json)
if [ $? -ne 0 ]; then
    echo "Failed to get project info. Are you in a Vercel project directory?"
    exit 1
fi

echo ""
echo "Here's how to increase your function timeout manually:"
echo ""
echo "1. Go to your Vercel dashboard: https://vercel.com/dashboard"
echo "2. Select your project"
echo "3. Go to Settings > Functions"
echo "4. Set the 'Max Duration' to 60 seconds"
echo ""
echo "Alternatively, run this command:"
echo "vercel env add VERCEL_FUNCTIONS_MAXDURATION 60"
echo ""
echo "After changing this setting, redeploy your project with:"
echo "vercel --prod" 