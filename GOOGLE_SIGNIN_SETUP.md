# Google Sign-In Setup - Single Custom Keystore

## Configuration Summary

Your app is now configured to use **only** your custom keystore with SHA-1:
```
65:CF:EB:87:3A:D4:22:25:80:F1:A0:85:C2:69:E9:DC:EA:41:2F:04
```

## What Was Fixed

1. ✅ **Removed conflicting keystore configurations** from `gradle.properties`
2. ✅ **Verified app/build.gradle** uses custom keystore (`debug-inout.keystore`)
3. ✅ **Confirmed single SHA-1** across all build variants
4. ✅ **Enhanced error handling** in Google Sign-In service with better error messages
5. ✅ **Added compatibility** for different response structures (old and new devices)

## Google Cloud Console Setup

### Required: Add Your SHA-1 to Google Cloud Console

1. Go to https://console.cloud.google.com/
2. Select your project
3. Navigate to **APIs & Services** > **Credentials**
4. Create or edit an **Android OAuth Client**:
   - **Type:** Android
   - **Package Name:** `com.in_out`
   - **SHA-1:** `65:CF:EB:87:3A:D4:22:25:80:F1:A0:85:C2:69:E9:DC:EA:41:2F:04`

5. Make sure you also have a **Web OAuth Client** (already configured):
   - **Client ID:** `1006490267671-n3lnjs2289d780c4f5kj1ilkrp4n87h3.apps.googleusercontent.com`

### Important Notes

- **Wait 5-10 minutes** after adding the SHA-1 for changes to propagate
- You **cannot** use your default Android keystore SHA-1 because it's already used by another app
- All devices will now use the same SHA-1 certificate

## Testing on Galaxy S9

After setup:

1. **Uninstall the app** from Galaxy S9:
   ```bash
   adb uninstall com.in_out
   ```

2. **Clean build**:
   ```bash
   cd android
   ./gradlew clean
   cd ..
   ```

3. **Reinstall**:
   ```bash
   npm run android
   ```

4. **Test Google Sign-In** - should now work on both Samsung A34 and Galaxy S9

## Error Messages

The updated code provides better error messages:

- **Error 10 / DEVELOPER_ERROR**: "OAuth client configuration is incorrect. Please check SHA-1 certificates and Web Client ID."
- **Error 12500**: "Google Sign-In service error. Please ensure you are connected to the internet."
- **Error 12501**: "Sign-in cancelled by user"

Check Android logs for detailed error information:
```bash
npx react-native log-android
```

## Verification

To verify your SHA-1 certificate:
```bash
cd android
./gradlew :app:signingReport
```

Look for the SHA-1 under **Variant: debug** - it should match:
```
65:CF:EB:87:3A:D4:22:25:80:F1:A0:85:C2:69:E9:DC:EA:41:2F:04
```

## Keystore Location

Your custom keystore is located at:
```
android/app/debug-inout.keystore
```

**Keep this file safe!** All your debug builds use this keystore.

## Production Release

When building for production, you should:
1. Generate a **production keystore** (separate from debug)
2. Add the production SHA-1 to Google Cloud Console
3. Update `android/app/build.gradle` to use production keystore for release builds
