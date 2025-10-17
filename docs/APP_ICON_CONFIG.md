# App Icon & Splash Screen Configuration

This project includes an automated app icon and splash screen system that makes it easy to update your app's visual identity.

## 🎨 App Icon Management

### Quick Setup

1. **Generate default icons:**
   ```bash
   npm run icons
   ```

2. **Use your custom icon:**
   - Place your icon image at `assets/icon-source.png` (1024x1024px recommended)
   - Run `npm run generate-icons` to regenerate all sizes

### Commands

- `npm run setup-icons` - Install Python dependencies
- `npm run generate-icons` - Generate icons from source or default design
- `npm run icons` - Complete setup (dependencies + generation)

### Configuration

The icon system uses `icon-config.json` for customization:

```json
{
  "app_name": "FinanceApp",
  "icon": {
    "background_color": "#1E40AF",
    "accent_color": "#3B82F6", 
    "text_color": "#FFFFFF",
    "symbol": "₱",
    "use_gradient": true,
    "rounded_corners": true
  },
  "source_icon": "assets/icon-source.png"
}
```

### Custom Icon Guidelines

When providing your own icon (`assets/icon-source.png`):

- **Size:** 1024x1024px minimum
- **Format:** PNG with transparent background
- **Design:** Simple, recognizable, works at small sizes
- **Safe Area:** Keep important elements within 80% of the canvas

## 🚀 Splash Screen

### Configuration

The splash screen is automatically integrated and shows:
- **Real app icon** (uses generated or custom icon from assets/icon-source.png)
- App name and tagline with smooth animations
- Version information
- Professional gradient background
- Smooth transitions to main app

### Customization

Edit `src/components/ui/SplashScreen.tsx` to customize:

- **Duration:** Change the `duration` prop (default: 2500ms)
- **Colors:** Uses your theme colors automatically
- **Content:** Modify text, animations, and layout
- **Branding:** Update app name, tagline, and version info

### Integration

The splash screen is integrated into `AppNavigator.tsx` and shows:
1. First app launch
2. Before onboarding check
3. Smooth transition to main app

## 🔧 Advanced Configuration

### Manual Icon Sizes

If you need to manually adjust specific icon sizes, edit the generated files:

**iOS:** `ios/FinanceApp/Images.xcassets/AppIcon.appiconset/`
**Android:** `android/app/src/main/res/mipmap-*/`

### Theme Integration

Both icons and splash screen automatically use your app's theme colors from:
- `src/theme/colors.ts`
- Theme provider context

### Platform-Specific Customization

The system generates platform-appropriate variations:
- **iOS:** All required sizes for iPhone, iPad, App Store
- **Android:** Adaptive icons with round variants
- **Both:** Proper scaling and format optimization

## 📱 Testing

After generating icons:

1. **Clean and rebuild:**
   ```bash
   # React Native
   npx react-native run-android --reset-cache
   npx react-native run-ios --reset-cache
   
   # Or clean platform-specific caches
   cd android && ./gradlew clean && cd ..
   cd ios && rm -rf build && cd ..
   ```

2. **Check on device:**
   - App icon appears correctly on home screen
   - Splash screen shows real app icon (not text symbol)
   - Splash animations are smooth
   - Transitions work properly
   - Custom icon (if provided) appears everywhere

## 🎯 Best Practices

1. **Keep source files:** Always keep your original `assets/icon-source.png`
2. **Version control:** Commit generated icons to ensure consistency
3. **Test thoroughly:** Check on multiple devices and screen densities
4. **Brand consistency:** Use colors that match your app's theme
5. **Regular updates:** Re-run generation when updating app design

## 🛠 Troubleshooting

### Python/PIL Issues
```bash
# Install Python 3.7+
# Then install Pillow:
pip install Pillow
# or
pip3 install Pillow
```

### Icon Not Updating
```bash
# Clean builds
npx react-native run-android --reset-cache
# or
cd android && ./gradlew clean && cd ..
```

### Splash Screen Issues
- Check theme provider is properly set up
- Verify LinearGradient dependency is installed
- Ensure proper navigation integration

## 📦 Dependencies

- **Python 3.7+** with Pillow (PIL) for icon generation
- **react-native-linear-gradient** for splash screen gradients
- **react-native-vector-icons** for icon fonts (if using custom symbols)

This system provides a complete, maintainable solution for managing your app's visual identity across both platforms.