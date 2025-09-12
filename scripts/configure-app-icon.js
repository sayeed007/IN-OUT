#!/usr/bin/env node
/**
 * Interactive App Icon Configuration
 * Allows easy customization of app icon settings
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const CONFIG_FILE = 'icon-config.json';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function loadExistingConfig() {
  if (fs.existsSync(CONFIG_FILE)) {
    return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  }
  return {
    app_name: "FinanceApp",
    icon: {
      background_color: "#1E40AF",
      accent_color: "#3B82F6", 
      text_color: "#FFFFFF",
      symbol: "₱",
      use_gradient: true,
      rounded_corners: true
    },
    source_icon: "assets/icon-source.png",
    output_directories: {
      ios: "ios/FinanceApp/Images.xcassets/AppIcon.appiconset/",
      android: "android/app/src/main/res/"
    }
  };
}

function saveConfig(config) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

function validateColor(color) {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}

async function main() {
  console.log('\n🎨 App Icon Configuration');
  console.log('=' * 30);
  
  const config = loadExistingConfig();
  
  console.log('\nCurrent configuration:');
  console.log(`App Name: ${config.app_name}`);
  console.log(`Background Color: ${config.icon.background_color}`);
  console.log(`Accent Color: ${config.icon.accent_color}`);
  console.log(`Symbol: ${config.icon.symbol}`);
  console.log(`Use Gradient: ${config.icon.use_gradient}`);
  console.log(`Rounded Corners: ${config.icon.rounded_corners}`);
  
  const shouldUpdate = await question('\nWould you like to update the configuration? (y/N): ');
  
  if (shouldUpdate.toLowerCase() !== 'y' && shouldUpdate.toLowerCase() !== 'yes') {
    console.log('Configuration unchanged.');
    rl.close();
    return;
  }
  
  console.log('\n📝 Enter new values (press Enter to keep current):');
  
  // App Name
  const appName = await question(`App Name (${config.app_name}): `);
  if (appName.trim()) {
    config.app_name = appName.trim();
  }
  
  // Background Color
  let bgColor = await question(`Background Color (${config.icon.background_color}): `);
  if (bgColor.trim()) {
    if (!validateColor(bgColor.trim())) {
      console.log('⚠️  Invalid color format. Using current value.');
    } else {
      config.icon.background_color = bgColor.trim();
    }
  }
  
  // Accent Color
  let accentColor = await question(`Accent Color (${config.icon.accent_color}): `);
  if (accentColor.trim()) {
    if (!validateColor(accentColor.trim())) {
      console.log('⚠️  Invalid color format. Using current value.');
    } else {
      config.icon.accent_color = accentColor.trim();
    }
  }
  
  // Symbol
  const symbol = await question(`Icon Symbol (${config.icon.symbol}): `);
  if (symbol.trim()) {
    config.icon.symbol = symbol.trim();
  }
  
  // Use Gradient
  const gradient = await question(`Use Gradient (${config.icon.use_gradient}): `);
  if (gradient.trim()) {
    config.icon.use_gradient = gradient.toLowerCase() === 'true' || gradient.toLowerCase() === 'y' || gradient.toLowerCase() === 'yes';
  }
  
  // Rounded Corners
  const rounded = await question(`Rounded Corners (${config.icon.rounded_corners}): `);
  if (rounded.trim()) {
    config.icon.rounded_corners = rounded.toLowerCase() === 'true' || rounded.toLowerCase() === 'y' || rounded.toLowerCase() === 'yes';
  }
  
  // Save configuration
  saveConfig(config);
  console.log('\n✅ Configuration saved!');
  
  const generate = await question('\nGenerate icons now? (Y/n): ');
  if (generate.toLowerCase() !== 'n' && generate.toLowerCase() !== 'no') {
    console.log('\n🔄 Generating icons...');
    const { execSync } = require('child_process');
    try {
      execSync('python scripts/generate-app-icon.py', { stdio: 'inherit' });
      console.log('\n🎉 Icons generated successfully!');
    } catch (error) {
      console.error('\n❌ Error generating icons:', error.message);
      console.log('You can run "npm run generate-icons" manually.');
    }
  }
  
  console.log('\n📖 See APP_ICON_CONFIG.md for more details.');
  rl.close();
}

main().catch(error => {
  console.error('Error:', error);
  rl.close();
  process.exit(1);
});