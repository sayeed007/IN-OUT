#!/usr/bin/env node
/**
 * Complete App Branding Setup
 * One-stop script for managing app icons and splash screen
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🎨 FinanceApp - Complete Branding Setup');
console.log('=========================================\n');

function runCommand(command, description) {
  console.log(`📦 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed\n`);
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    return false;
  }
  return true;
}

function showStatus() {
  console.log('📊 Current Status:');
  console.log('==================');
  
  // Check if config exists
  const configExists = fs.existsSync('icon-config.json');
  console.log(`Config File: ${configExists ? '✅ Created' : '❌ Missing'}`);
  
  // Check if icons exist
  const androidIconExists = fs.existsSync('android/app/src/main/res/mipmap-hdpi/ic_launcher.png');
  const iosIconExists = fs.existsSync('ios/FinanceApp/Images.xcassets/AppIcon.appiconset/Icon-20.png');
  console.log(`Android Icons: ${androidIconExists ? '✅ Generated' : '❌ Missing'}`);
  console.log(`iOS Icons: ${iosIconExists ? '✅ Generated' : '❌ Missing'}`);
  
  // Check if custom source exists
  const customIconExists = fs.existsSync('assets/icon-source.png');
  console.log(`Custom Icon: ${customIconExists ? '✅ Found' : '⏳ Using default design'}`);
  
  // Check React Native icon
  const rnIconExists = fs.existsSync('src/assets/app-icon.png');
  console.log(`React Native Icon: ${rnIconExists ? '✅ Available' : '❌ Missing'}`);
  
  // Check splash screen
  const splashExists = fs.existsSync('src/components/ui/SplashScreen.tsx');
  console.log(`Splash Screen: ${splashExists ? '✅ Integrated' : '❌ Missing'}`);
  
  console.log('');
}

function showCommands() {
  console.log('🛠️  Available Commands:');
  console.log('=====================');
  console.log('npm run icons              - Complete icon setup');
  console.log('npm run configure-icons    - Interactive configuration');
  console.log('npm run generate-icons     - Generate from current config');
  console.log('npm run setup-icons        - Install dependencies only');
  console.log('');
}

function showUsage() {
  console.log('📖 Quick Start Guide:');
  console.log('====================');
  console.log('1. Run: npm run icons');
  console.log('2. Optional: Add your custom icon to assets/icon-source.png');
  console.log('3. Optional: Run npm run configure-icons to customize');
  console.log('4. Build and test your app');
  console.log('');
  console.log('📱 Custom Icon Guidelines:');
  console.log('- Size: 1024x1024px minimum');
  console.log('- Format: PNG with transparent background'); 
  console.log('- Design: Simple, recognizable, scalable');
  console.log('');
  console.log('🚀 The splash screen is automatically integrated!');
  console.log('   It will show when your app starts.');
  console.log('');
  console.log('📚 For detailed documentation, see: APP_ICON_CONFIG.md');
  console.log('');
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--status') || args.includes('-s')) {
    showStatus();
    return;
  }
  
  if (args.includes('--help') || args.includes('-h')) {
    showCommands();
    showUsage();
    return;
  }
  
  if (args.includes('--setup') || args.includes('--install')) {
    console.log('🔧 Setting up app branding system...\n');
    
    if (!runCommand('npm run setup-icons', 'Installing dependencies')) {
      process.exit(1);
    }
    
    if (!runCommand('npm run generate-icons', 'Generating app icons')) {
      process.exit(1);
    }
    
    console.log('🎉 App branding setup complete!');
    console.log('');
    showStatus();
    return;
  }
  
  // Default: show status and usage
  showStatus();
  showCommands();
  showUsage();
}

main();