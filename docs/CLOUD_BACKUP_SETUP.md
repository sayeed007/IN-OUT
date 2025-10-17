# Google Drive Backup Setup Guide

This guide will help you set up Google Drive backup for your In & Out financial app.

## Current Configuration

- **Package Name**: `com.in_out`
- **Firebase Project**: `income-and-expense-track-4325a`
- **Web Client ID**: `1082580928127-hs89senj1a34adqnoj7kb031uj1nf9q7.apps.googleusercontent.com`
- **Android Client ID**: Auto-configured via `google-services.json`
- **SHA-1 Fingerprint**: `9C:C3:41:80:28:AE:6F:E9:E8:34:F7:B1:5A:50:FB:55:88:2A:A4:91` (from debug-inout.keystore)

## Setup Status

✅ **Already configured:**
- Google Sign-In package installed (`@react-native-google-signin/google-signin`)
- `google-services.json` is in place with correct configuration
- `android/app/build.gradle` uses Google Services plugin
- `android/build.gradle` has Google Services classpath
- Unique debug keystore (`debug-inout.keystore`) created
- Web Client ID configured in `googleDriveBackup.ts`

## Prerequisites

Before testing, ensure you have:

1. **Firebase Console Access**: [https://console.firebase.google.com/](https://console.firebase.google.com/)
   - Project: `income-and-expense-track-4325a`
   - Android app registered with package `com.in_out`

2. **Google Cloud Console Access**: [https://console.cloud.google.com/](https://console.cloud.google.com/)
   - Google Drive API should be enabled
   - OAuth consent screen should be configured

## Required: Enable Google Drive API

**This is critical!** The DEVELOPER_ERROR can also occur if the Drive API is not enabled.

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (should match `income-and-expense-track-4325a`)
3. Click **"APIs & Services"** → **"Library"**
4. Search for **"Google Drive API"**
5. Click on it and press **"Enable"**
6. Do the same for **"Google Sign-In API"** if available

## Required: Configure OAuth Consent Screen

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **"APIs & Services"** → **"OAuth consent screen"**
3. If not configured:
   - Select **"External"** user type
   - Fill in App name: `In & Out`
   - Add your email as user support email
   - Add your email as developer contact
4. **Add Test Users** (Important!):
   - Click **"ADD USERS"**
   - Add the Gmail account(s) you'll use for testing
   - Save
5. Add required scopes:
   - Click **"ADD OR REMOVE SCOPES"**
   - Add: `https://www.googleapis.com/auth/drive.file`
   - Add: `https://www.googleapis.com/auth/userinfo.email`
   - Add: `https://www.googleapis.com/auth/userinfo.profile`
   - Save

## Verification Checklist

Before running the app, verify:

- [ ] Google Drive API is **enabled** in Google Cloud Console
- [ ] OAuth Consent Screen is **configured**
- [ ] Your test Gmail account is added as a **Test User**
- [ ] `google-services.json` exists at `android/app/google-services.json`
- [ ] The file contains Android client (client_type: 1) with your SHA-1
- [ ] Web Client ID in `googleDriveBackup.ts` matches your `google-services.json`

## How to Test

### Step 1: Clean and Rebuild

```bash
cd android
gradlew.bat clean
cd ..
npx react-native run-android
```

### Step 2: Test Google Sign-In

1. Open the app
2. Go to **Settings** → **Cloud Backup**
3. Tap **"Sign In to Google"**
4. You should see the Google account picker immediately (no infinite loading)
5. Select your test Gmail account
6. You'll see "This app hasn't been verified" warning - click **"Advanced"** → **"Go to In & Out (unsafe)"**
7. Grant permissions
8. Sign-in should complete successfully

### Step 3: Expected Logs

```
[GoogleDrive] Checking Play Services...
[GoogleDrive] Initiating sign-in...
[GoogleDrive] Sign-in response: { data: { user: { email: "your.email@gmail.com", ... } } }
[GoogleDrive] Sign-in successful: your.email@gmail.com
[CloudBackup] Sign-In result: { success: true, user: {...} }
```

### Step 4: Test Backup & Restore

1. After successful sign-in, tap **"Backup to Google Drive"**
2. Wait for confirmation
3. Tap **"View Backups"** to see your backup files
4. Tap **"Restore"** on any backup to restore data

## Troubleshooting

### DEVELOPER_ERROR (Error code 10)

**Possible causes:**
1. ❌ Google Drive API not enabled → Go enable it in Cloud Console
2. ❌ Web Client ID mismatch → Fixed! (using correct ID now)
3. ❌ OAuth Consent Screen not configured → Set it up and add test users
4. ❌ google-services.json doesn't match app → Re-download from Firebase Console
5. ❌ Stale build cache → Run clean build

**Solutions:**
```bash
# Clean rebuild
cd android
gradlew.bat clean
cd ..
npx react-native run-android

# Check logcat for detailed errors
npx react-native log-android
```

### "This app hasn't been verified"

This is **expected** during development. Your app is in testing mode.

**To bypass:**
- Click **"Advanced"**
- Click **"Go to In & Out (unsafe)"**
- This is safe - it's your own app!

**For production:**
- Submit OAuth Consent Screen for Google verification
- Can take several weeks

### "Sign-in cancelled" or "No user data"

This is **expected** if you:
- Back out of the Google account picker
- Deny permissions
- Close the sign-in dialog

The app now handles this gracefully.

### "Access blocked: Authorization Error"

**Cause:** You're not added as a test user

**Solution:**
1. Go to Google Cloud Console
2. OAuth Consent Screen
3. Test Users section
4. Add your Gmail account
5. Try signing in again

## Files Structure

```
android/
├── app/
│   ├── google-services.json        ← Firebase configuration
│   ├── debug-inout.keystore        ← Unique debug keystore for this app
│   └── build.gradle                ← Applies Google Services plugin
└── build.gradle                    ← Has Google Services classpath

src/
├── services/
│   └── storage/
│       ├── googleDriveBackup.ts    ← Main Google Drive integration
│       ├── emailBackup.ts          ← Email backup service
│       └── scheduledBackup.ts      ← Scheduled backup service
└── screens/
    └── settings/
        └── components/
            ├── CloudBackupSettings.tsx      ← UI for cloud backup
            └── ScheduledBackupSettings.tsx  ← UI for scheduled backup
```

## What's Implemented

### ✅ Google Drive Backup
- Sign in with Google account
- Upload backups to Google Drive
- List all backup files
- Restore from any backup
- Delete old backups
- Automatic token management

### ✅ Email Backup
- Configure email address
- Send backup via email
- Works with any mail app (Gmail, Outlook, etc.)

### ✅ Scheduled Backup
- Daily/Weekly/Monthly frequencies
- Choose backup method (Google Drive/Email/Both)
- Auto-triggers when app opens
- Manual backup trigger

## Security Notes

- Only accesses files created by the app (scoped Drive access)
- Uses OAuth 2.0 for authentication
- Tokens managed securely by Google Sign-In SDK
- No passwords stored in the app

## Next Steps

1. **Test the setup** following the steps above
2. **If it works**, you can start using Google Drive backup!
3. **For release builds**, you'll need to:
   - Generate a release keystore
   - Get SHA-1 from release keystore
   - Add release SHA-1 to Firebase project settings
   - Submit app for OAuth verification (for production)

## Support

- [React Native Google Sign-In Docs](https://react-native-google-signin.github.io/docs/)
- [Troubleshooting Guide](https://react-native-google-signin.github.io/docs/troubleshooting)
- [Firebase Console](https://console.firebase.google.com/)
- [Google Cloud Console](https://console.cloud.google.com/)

---

**Last Updated:** Fresh setup - Web Client ID fixed!
