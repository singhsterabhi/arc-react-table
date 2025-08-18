#!/bin/bash

# React Table Publishing Script
# This script publishes arc-react-table to the npm public registry
# Usage: ./publish.sh [version]
# If no version is provided, the patch version will be automatically incremented

set -e  # Exit on any error

echo "🚀 Starting React Table Publishing Process..."

# Handle version argument
NEW_VERSION="$1"

if [ -n "$NEW_VERSION" ]; then
    echo "📝 Using provided version: $NEW_VERSION"
else
    echo "📝 No version provided, auto-incrementing patch version..."
    # Get current version and increment patch
    CURRENT_VERSION=$(node -p "require('./package.json').version")
    echo "📋 Current version: $CURRENT_VERSION"
    
    # Use npm version to increment patch version
    NEW_VERSION=$(npm version patch --no-git-tag-version | sed 's/^v//')
    echo "📈 New version: $NEW_VERSION"
fi

# Update package.json with the new version if it was provided as argument
if [ -n "$1" ]; then
    echo "📝 Updating package.json version to $NEW_VERSION..."
    npm version "$NEW_VERSION" --no-git-tag-version --allow-same-version
fi

# Check if user is logged in to npm
echo "🔐 Checking npm authentication..."
if ! npm whoami &>/dev/null; then
    echo "❌ Error: You are not logged in to npm!"
    echo "Please run 'npm login' first to authenticate with npm registry"
    echo "If you don't have an npm account, create one at https://www.npmjs.com/signup"
    exit 1
fi

NPM_USER=$(npm whoami)
echo "✅ Logged in as: $NPM_USER"

# Clean up any existing npm configuration that might interfere
echo "🧹 Cleaning up existing npm configuration..."

# Remove old .npmrc if it exists
if [ -f ".npmrc" ]; then
    echo "🗑️  Removing old .npmrc file..."
    rm .npmrc
fi

# Verify npm configuration points to public registry
echo "🔍 Verifying npm registry configuration..."
NPM_REGISTRY=$(npm config get registry)
if [[ "$NPM_REGISTRY" == "https://registry.npmjs.org/" ]]; then
    echo "✅ Registry configuration verified: $NPM_REGISTRY"
else
    echo "⚠️  Setting registry to public npm registry..."
    npm config set registry https://registry.npmjs.org/
    echo "✅ Registry set to: https://registry.npmjs.org/"
fi

# Build the package (this happens automatically in npm publish via prepublishOnly, but we can do it explicitly)
echo "🔨 Building package..."
npm run build

echo "✅ Build completed successfully"

# Show package info before publishing
echo "📦 Package information:"
PACKAGE_NAME=$(node -p "require('./package.json').name")
PACKAGE_VERSION="$NEW_VERSION"
echo "  Name: $PACKAGE_NAME"
echo "  Version: $PACKAGE_VERSION"
echo "  Registry: https://registry.npmjs.org/"

# Check if this version already exists
echo "🔍 Checking if version already exists..."
if npm view "$PACKAGE_NAME@$PACKAGE_VERSION" version &>/dev/null; then
    echo "❌ Error: Version $PACKAGE_VERSION already exists on npm!"
    echo "Please update the version in package.json before publishing"
    echo "Run: npm version patch|minor|major"
    exit 1
else
    echo "✅ Version $PACKAGE_VERSION is available for publishing"
fi

# Publish to npm registry
echo "🚀 Publishing to npm registry..."
echo "Registry: https://registry.npmjs.org/"

if npm publish --access public; then
    echo ""
    echo "🎉 SUCCESS! Package published successfully!"
    echo ""
    echo "📋 Package Details:"
    echo "  Name: $PACKAGE_NAME"
    echo "  Version: $PACKAGE_VERSION"
    echo "  Registry: https://registry.npmjs.org/"
    echo "  Installation: npm install $PACKAGE_NAME"
    echo "  Package URL: https://www.npmjs.com/package/$PACKAGE_NAME"
    echo ""
    
    # Verify package is available
    echo "🔍 Verifying package availability..."
    sleep 5  # Wait a few seconds for npm to index the package
    if npm view "$PACKAGE_NAME@$PACKAGE_VERSION" version &>/dev/null; then
        echo "✅ Package verified on npm registry"
    else
        echo "⚠️  Warning: Could not verify package immediately (but publish reported success)"
        echo "   Package may take a few minutes to appear in search"
    fi
else
    echo "❌ Error: Failed to publish package"
    echo ""
    echo "🔧 Troubleshooting:"
    echo "1. Ensure you are logged in: npm login"
    echo "2. Verify you have publish permissions for this package name"
    echo "3. Check that the package version is not already published"
    echo "4. Ensure package.json is valid"
    exit 1
fi

echo ""
echo "✨ Publishing process completed!"