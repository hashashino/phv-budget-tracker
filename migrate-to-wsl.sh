#!/bin/bash

# PHV Budget Tracker - WSL Migration Script
# Moves the project from Windows filesystem to WSL2 for optimal performance

echo "🚗 PHV Budget Tracker - WSL Migration"
echo "===================================="

# Create projects directory in WSL
WSL_PROJECT_DIR="$HOME/projects/budget-tracker"
WINDOWS_PROJECT_DIR="/mnt/d/budget-tracker"

echo "📁 Creating WSL project directory..."
mkdir -p "$HOME/projects"

echo "📋 Copying project files to WSL filesystem..."
if [ -d "$WINDOWS_PROJECT_DIR" ]; then
    echo "   Copying from: $WINDOWS_PROJECT_DIR"
    echo "   Copying to: $WSL_PROJECT_DIR"
    
    # Copy entire project
    cp -r "$WINDOWS_PROJECT_DIR" "$WSL_PROJECT_DIR"
    
    echo "✅ Project copied successfully!"
    echo ""
    echo "🧹 Cleaning up node_modules for fresh install..."
    cd "$WSL_PROJECT_DIR"
    
    # Remove node_modules for fresh WSL install
    rm -rf node_modules backend/node_modules mobile/node_modules
    rm -rf backend/dist mobile/dist .expo mobile/.expo
    
    echo "✅ Cleanup complete!"
    echo ""
    echo "🔗 Setting up development environment..."
    
    # Install dependencies
    echo "📦 Installing dependencies..."
    npm install
    cd backend && npm install && cd ..
    cd mobile && npm install && cd ..
    
    echo "✅ Dependencies installed!"
    echo ""
    echo "🎉 Migration Complete!"
    echo "====================="
    echo ""
    echo "📍 Your project is now located at:"
    echo "   WSL: $WSL_PROJECT_DIR"
    echo "   Windows: \\\\wsl\$\\Ubuntu\\home\\$(whoami)\\projects\\budget-tracker"
    echo ""
    echo "🚀 Next steps:"
    echo "   cd ~/projects/budget-tracker"
    echo "   docker-compose up -d postgres redis"
    echo "   npm run dev"
    echo ""
    echo "💡 Pro tip: Open in VS Code with 'code .' from WSL"
    
else
    echo "❌ Project not found at $WINDOWS_PROJECT_DIR"
    echo "   Please update the WINDOWS_PROJECT_DIR variable in this script"
    exit 1
fi