#!/usr/bin/env python3
"""
App Icon Generator Script
Generates app icons for iOS and Android from a single source image.
"""

import os
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import json
import shutil

# Configuration
CONFIG_FILE = "icon-config.json"
SOURCE_ICON_PATH = "assets/icon-source.png"

# iOS icon sizes
IOS_SIZES = {
    "Icon-20.png": 20,
    "Icon-20@2x.png": 40,
    "Icon-20@3x.png": 60,
    "Icon-29.png": 29,
    "Icon-29@2x.png": 58,
    "Icon-29@3x.png": 87,
    "Icon-40.png": 40,
    "Icon-40@2x.png": 80,
    "Icon-40@3x.png": 120,
    "Icon-60@2x.png": 120,
    "Icon-60@3x.png": 180,
    "Icon-76.png": 76,
    "Icon-76@2x.png": 152,
    "Icon-83.5@2x.png": 167,
    "Icon-1024.png": 1024,
}

# Android icon sizes
ANDROID_SIZES = {
    "mipmap-mdpi": 48,
    "mipmap-hdpi": 72,
    "mipmap-xhdpi": 96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi": 192,
}

def create_default_config():
    """Create default configuration file."""
    config = {
        "app_name": "FinanceApp",
        "icon": {
            "background_color": "#1E40AF",  # Blue
            "accent_color": "#3B82F6",     # Lighter blue
            "text_color": "#FFFFFF",       # White
            "symbol": "₱",                 # Currency symbol
            "use_gradient": True,
            "rounded_corners": True
        },
        "source_icon": SOURCE_ICON_PATH,
        "output_directories": {
            "ios": "ios/FinanceApp/Images.xcassets/AppIcon.appiconset/",
            "android": "android/app/src/main/res/"
        }
    }
    
    with open(CONFIG_FILE, 'w') as f:
        json.dump(config, f, indent=2)
    
    return config

def load_config():
    """Load configuration from file or create default."""
    if os.path.exists(CONFIG_FILE):
        with open(CONFIG_FILE, 'r') as f:
            return json.load(f)
    else:
        return create_default_config()

def hex_to_rgb(hex_color):
    """Convert hex color to RGB tuple."""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def create_gradient_background(size, color1, color2):
    """Create a gradient background."""
    image = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    
    # Create vertical gradient
    for y in range(size):
        # Calculate blend ratio
        ratio = y / size
        
        # Blend colors
        r = int(color1[0] * (1 - ratio) + color2[0] * ratio)
        g = int(color1[1] * (1 - ratio) + color2[1] * ratio)
        b = int(color1[2] * (1 - ratio) + color2[2] * ratio)
        
        draw.line([(0, y), (size - 1, y)], fill=(r, g, b, 255))
    
    return image

def generate_default_icon(size, config):
    """Generate a default financial app icon."""
    icon_config = config['icon']
    
    # Create base image
    if icon_config.get('use_gradient', True):
        bg_color = hex_to_rgb(icon_config['background_color'])
        accent_color = hex_to_rgb(icon_config['accent_color'])
        image = create_gradient_background(size, bg_color, accent_color)
    else:
        bg_color = hex_to_rgb(icon_config['background_color'])
        image = Image.new('RGBA', (size, size), bg_color + (255,))
    
    draw = ImageDraw.Draw(image)
    
    # Add rounded corners if specified
    if icon_config.get('rounded_corners', True):
        # Create rounded rectangle mask
        mask = Image.new('L', (size, size), 0)
        mask_draw = ImageDraw.Draw(mask)
        corner_radius = size // 8
        mask_draw.rounded_rectangle(
            [(0, 0), (size - 1, size - 1)], 
            radius=corner_radius, 
            fill=255
        )
        
        # Apply mask
        rounded_image = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        rounded_image.paste(image, (0, 0))
        rounded_image.putalpha(mask)
        image = rounded_image
        draw = ImageDraw.Draw(image)
    
    # Add financial symbol (currency or chart-like icon)
    symbol = icon_config.get('symbol', '$')
    text_color = hex_to_rgb(icon_config['text_color'])
    
    # Try to load a font, fall back to default
    try:
        font_size = size // 2
        font = ImageFont.truetype("arial.ttf", font_size)
    except:
        font = ImageFont.load_default()
    
    # Calculate text position (center)
    bbox = draw.textbbox((0, 0), symbol, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    x = (size - text_width) // 2
    y = (size - text_height) // 2
    
    # Draw the symbol
    draw.text((x, y), symbol, fill=text_color + (255,), font=font)
    
    # Add a subtle circular background for the symbol
    circle_size = size // 3
    circle_x = (size - circle_size) // 2
    circle_y = (size - circle_size) // 2
    
    # Semi-transparent white circle
    overlay = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    overlay_draw = ImageDraw.Draw(overlay)
    overlay_draw.ellipse(
        [(circle_x, circle_y), (circle_x + circle_size, circle_y + circle_size)],
        fill=(255, 255, 255, 50)
    )
    
    # Composite the overlay
    image = Image.alpha_composite(image, overlay)
    
    return image

def generate_icon_from_source(source_path, size):
    """Generate icon from source image."""
    try:
        source_image = Image.open(source_path)
        # Resize maintaining aspect ratio and center crop
        source_image = source_image.resize((size, size), Image.Resampling.LANCZOS)
        return source_image.convert('RGBA')
    except Exception as e:
        print(f"Error loading source image: {e}")
        return None

def generate_ios_icons(config):
    """Generate iOS app icons."""
    print("Generating iOS icons...")
    
    ios_dir = Path(config['output_directories']['ios'])
    ios_dir.mkdir(parents=True, exist_ok=True)
    
    for filename, size in IOS_SIZES.items():
        # Try to use source image first, fall back to generated
        if os.path.exists(config['source_icon']):
            icon = generate_icon_from_source(config['source_icon'], size)
        else:
            icon = None
            
        if icon is None:
            icon = generate_default_icon(size, config)
        
        output_path = ios_dir / filename
        icon.save(str(output_path), 'PNG')
        print(f"  Generated: {filename} ({size}x{size})")

def generate_android_icons(config):
    """Generate Android app icons."""
    print("Generating Android icons...")
    
    android_base_dir = Path(config['output_directories']['android'])
    
    for folder, size in ANDROID_SIZES.items():
        folder_path = android_base_dir / folder
        folder_path.mkdir(parents=True, exist_ok=True)
        
        # Try to use source image first, fall back to generated
        if os.path.exists(config['source_icon']):
            icon = generate_icon_from_source(config['source_icon'], size)
        else:
            icon = None
            
        if icon is None:
            icon = generate_default_icon(size, config)
        
        # Generate both regular and round icons
        for icon_name in ['ic_launcher.png', 'ic_launcher_round.png']:
            if icon_name == 'ic_launcher_round.png':
                # Create round version
                round_icon = create_round_icon(icon, size)
                output_path = folder_path / icon_name
                round_icon.save(str(output_path), 'PNG')
            else:
                output_path = folder_path / icon_name
                icon.save(str(output_path), 'PNG')
        
        print(f"  Generated: {folder} ({size}x{size})")

def create_round_icon(icon, size):
    """Create a round version of the icon."""
    # Create circular mask
    mask = Image.new('L', (size, size), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.ellipse([(0, 0), (size - 1, size - 1)], fill=255)
    
    # Apply mask to create circular icon
    round_icon = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    round_icon.paste(icon, (0, 0))
    round_icon.putalpha(mask)
    
    return round_icon

def generate_contents_json():
    """Generate Contents.json for iOS."""
    contents = {
        "images": [],
        "info": {
            "author": "xcode",
            "version": 1
        }
    }
    
    # Add all iOS icon entries
    size_mappings = {
        20: ["20x20"],
        29: ["29x29"],
        40: ["40x40"],
        60: ["60x60"],
        76: ["76x76"],
        83.5: ["83.5x83.5"],
        1024: ["1024x1024"]
    }
    
    for filename, size in IOS_SIZES.items():
        scale = "1x"
        if "@2x" in filename:
            scale = "2x"
        elif "@3x" in filename:
            scale = "3x"
        
        base_size = size
        if scale == "2x":
            base_size = size // 2
        elif scale == "3x":
            base_size = size // 3
        
        size_str = f"{base_size}x{base_size}"
        
        entry = {
            "filename": filename,
            "idiom": "iphone" if size <= 180 else "ios-marketing",
            "scale": scale,
            "size": size_str
        }
        
        contents["images"].append(entry)
    
    return contents

def main():
    """Main function."""
    print("App Icon Generator")
    print("=" * 40)
    
    # Load configuration
    config = load_config()
    print(f"Loaded configuration for {config['app_name']}")
    
    # Create assets directory
    assets_dir = Path("assets")
    assets_dir.mkdir(exist_ok=True)
    
    # Generate icons
    try:
        generate_ios_icons(config)
        generate_android_icons(config)
        
        # Generate iOS Contents.json
        ios_dir = Path(config['output_directories']['ios'])
        contents_json = generate_contents_json()
        with open(ios_dir / "Contents.json", 'w') as f:
            json.dump(contents_json, f, indent=2)
        print("Generated iOS Contents.json")
        
        # Copy main icon to src/assets for React Native usage
        src_assets_dir = Path("src/assets")
        src_assets_dir.mkdir(exist_ok=True)
        
        # Copy the 1024px icon as the main app icon for React Native
        ios_1024_icon = Path(config['output_directories']['ios']) / "Icon-1024.png"
        if ios_1024_icon.exists():
            shutil.copy(str(ios_1024_icon), str(src_assets_dir / "app-icon.png"))
            print("Copied app icon to src/assets/app-icon.png")
        
        print("\nSuccessfully generated all app icons!")
        print(f"iOS icons: {config['output_directories']['ios']}")
        print(f"Android icons: {config['output_directories']['android']}")
        print(f"React Native icon: src/assets/app-icon.png")
        
        if not os.path.exists(config['source_icon']):
            print(f"\nTip: Place your custom icon at '{config['source_icon']}' and run again to use it instead of the generated default.")
        
    except Exception as e:
        print(f"Error generating icons: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()