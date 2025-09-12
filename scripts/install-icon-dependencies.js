#!/usr/bin/env node
/**
 * Install Python dependencies for icon generation
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up icon generation dependencies...');

// Check if Python is installed
try {
  execSync('python --version', { stdio: 'pipe' });
  console.log('✓ Python found');
} catch (error) {
  try {
    execSync('python3 --version', { stdio: 'pipe' });
    console.log('✓ Python3 found');
  } catch (error) {
    console.error('❌ Python not found. Please install Python 3.7+ from https://www.python.org/downloads/');
    process.exit(1);
  }
}

// Install Pillow (PIL) for image processing
console.log('📦 Installing Pillow (PIL) for image processing...');
try {
  const pythonCmd = (() => {
    try {
      execSync('python --version', { stdio: 'pipe' });
      return 'python';
    } catch {
      return 'python3';
    }
  })();
  
  execSync(`${pythonCmd} -m pip install Pillow`, { stdio: 'inherit' });
  console.log('✓ Pillow installed successfully');
} catch (error) {
  console.error('❌ Failed to install Pillow. You may need to run: pip install Pillow');
  console.error('   Or on some systems: pip3 install Pillow');
}

// Create assets directory
const assetsDir = path.join(process.cwd(), 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
  console.log('✓ Created assets directory');
}

// Make the Python script executable (Unix/Mac)
if (process.platform !== 'win32') {
  const scriptPath = path.join(process.cwd(), 'scripts', 'generate-app-icon.py');
  try {
    execSync(`chmod +x "${scriptPath}"`);
    console.log('✓ Made Python script executable');
  } catch (error) {
    console.log('⚠️  Could not make script executable (this is okay on Windows)');
  }
}

console.log('\n🎉 Setup complete!');
console.log('You can now run: npm run generate-icons');