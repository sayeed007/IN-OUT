// src/services/storage/googleDriveBackup.ts
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import * as RNFS from 'react-native-fs';
import { DataManagementService } from './dataManagement';

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: '1006490267671-n3lnjs2289d780c4f5kj1ilkrp4n87h3.apps.googleusercontent.com', // Web Client ID from Google Cloud Console
  offlineAccess: true,
  scopes: ['https://www.googleapis.com/auth/drive.file'], // Access to files created by the app
});

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  createdTime: string;
  modifiedTime: string;
  size: string;
}

export class GoogleDriveBackupService {
  private static DRIVE_API_URL = 'https://www.googleapis.com/drive/v3';
  private static UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3';

  /**
   * Check if user is signed in to Google
   */
  static async isSignedIn(): Promise<boolean> {
    try {
      const currentUser = GoogleSignin.getCurrentUser();
      return currentUser !== null;
    } catch (error) {
      console.error('Error checking Google sign-in status:', error);
      return false;
    }
  }

  /**
   * Sign in to Google account
   */
  static async signIn(): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      // Check Play Services availability with options for older devices
      const hasPlayServices = await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      if (!hasPlayServices) {
        return {
          success: false,
          error: 'Google Play Services is not available. Please update Google Play Services.'
        };
      }

      const userInfo = await GoogleSignin.signIn();
      console.log('Sign-in response:', JSON.stringify(userInfo, null, 2));

      // Handle different response structures
      // New version: { type: 'success', data: { user: {...}, idToken: '...', ... } }
      // or { type: 'cancelled', data: null }

      // Check if sign-in was cancelled
      if (userInfo.type === 'cancelled') {
        return { success: false, error: 'Sign-in was cancelled' };
      }

      // Handle success response (v16+)
      if (userInfo.type === 'success') {
        const userData = userInfo.data;

        // Validate we have required user information
        if (!userData || !userData.user || !userData.user.email) {
          console.error('Invalid user data structure:', userInfo);
          return {
            success: false,
            error: 'Failed to retrieve user information. Please try again.'
          };
        }

        console.log('Successfully signed in:', userData.user.email);
        return { success: true, user: userData };
      }

      // Unexpected response type
      console.error('Unexpected sign-in response:', userInfo);
      return {
        success: false,
        error: 'Unexpected sign-in response. Please try again.'
      };
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);

      // Provide more specific error messages
      let errorMessage = error.message || 'Sign-in failed';

      if (error.code === '-5' || error.code === '12501') {
        errorMessage = 'Sign-in cancelled by user';
      } else if (error.code === '10') {
        errorMessage = 'Developer error: OAuth client configuration is incorrect. Please check SHA-1 certificates and Web Client ID.';
      } else if (error.code === '12500') {
        errorMessage = 'Google Sign-In service error. Please ensure you are connected to the internet and try again.';
      } else if (error.code === '7') {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.code === '12502') {
        errorMessage = 'Sign-in cancelled or connection error.';
      } else if (error.message && error.message.includes('DEVELOPER_ERROR')) {
        errorMessage = 'Configuration error: Please ensure SHA-1 certificate is added to Google Cloud Console for this device.';
      }

      return { success: false, error: errorMessage };
    }
  }

  /**
   * Sign out from Google account
   */
  static async signOut(): Promise<void> {
    try {
      await GoogleSignin.signOut();
    } catch (error) {
      console.error('Google sign-out error:', error);
    }
  }

  /**
   * Get current user info
   */
  static async getCurrentUser(): Promise<any | null> {
    try {
      const userInfo = GoogleSignin.getCurrentUser();
      // getCurrentUser() returns User | null directly (synchronous)
      return userInfo;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Get access token for Google Drive API
   */
  private static async getAccessToken(): Promise<string> {
    try {
      const tokens = await GoogleSignin.getTokens();
      return tokens.accessToken;
    } catch (error) {
      console.error('Error getting access token:', error);
      throw new Error('Failed to get access token. Please sign in again.');
    }
  }

  /**
   * Upload backup to Google Drive
   */
  static async uploadBackup(): Promise<{ success: boolean; fileId?: string; fileName?: string; error?: string }> {
    try {
      // Check if signed in
      const isSignedIn = await this.isSignedIn();
      if (!isSignedIn) {
        return { success: false, error: 'Not signed in to Google' };
      }

      // Create backup file locally first
      const backupResult = await DataManagementService.backupAllData();

      // Get access token
      const accessToken = await this.getAccessToken();

      // Read the backup file
      const fileContent = await RNFS.readFile(backupResult.filePath, 'utf8');

      // Create file metadata
      const metadata = {
        name: backupResult.fileName,
        mimeType: 'application/json',
        description: 'Financial app backup - created by In & Out',
      };

      // Upload to Google Drive using multipart upload
      const boundary = '-------314159265358979323846';
      const delimiter = `\r\n--${boundary}\r\n`;
      const closeDelimiter = `\r\n--${boundary}--`;

      const multipartRequestBody =
        delimiter +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        fileContent +
        closeDelimiter;

      const response = await fetch(
        `${this.UPLOAD_URL}/files?uploadType=multipart`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': `multipart/related; boundary=${boundary}`,
          },
          body: multipartRequestBody,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error?.message || 'Upload failed';

        // Handle specific Google Drive errors
        if (errorMessage.includes('storage quota') || errorMessage.includes('storageQuotaExceeded')) {
          throw new Error('QUOTA_EXCEEDED');
        } else if (errorMessage.includes('rate limit') || errorMessage.includes('rateLimitExceeded')) {
          throw new Error('RATE_LIMIT');
        } else if (errorMessage.includes('invalid') && errorMessage.includes('credentials')) {
          throw new Error('AUTH_ERROR');
        } else {
          throw new Error(errorMessage);
        }
      }

      const result = await response.json();

      // Clean up local file
      try {
        await RNFS.unlink(backupResult.filePath);
      } catch (cleanupError) {
        console.warn('Failed to cleanup local backup file:', cleanupError);
      }

      return {
        success: true,
        fileId: result.id,
        fileName: result.name,
      };
    } catch (error: any) {
      console.error('Google Drive upload error:', error);

      // Provide user-friendly error messages
      let userMessage = 'Failed to upload backup to Google Drive';

      if (error.message === 'QUOTA_EXCEEDED') {
        userMessage = 'Your Google Drive storage is full. Please free up space and try again.';
      } else if (error.message === 'RATE_LIMIT') {
        userMessage = 'Too many requests. Please wait a few minutes and try again.';
      } else if (error.message === 'AUTH_ERROR') {
        userMessage = 'Authentication error. Please sign out and sign in again.';
      } else if (error.message.includes('Network request failed')) {
        userMessage = 'Network error. Please check your internet connection.';
      } else if (error.message) {
        userMessage = error.message;
      }

      return {
        success: false,
        error: userMessage,
      };
    }
  }

  /**
   * List backups from Google Drive
   */
  static async listBackups(): Promise<{ success: boolean; files?: GoogleDriveFile[]; error?: string }> {
    try {
      // Check if signed in
      const isSignedIn = await this.isSignedIn();
      if (!isSignedIn) {
        return { success: false, error: 'Not signed in to Google' };
      }

      // Get access token
      const accessToken = await this.getAccessToken();

      // Query for backup files (JSON files created by this app)
      const query = "mimeType='application/json' and name contains 'financial_backup'";

      const response = await fetch(
        `${this.DRIVE_API_URL}/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,createdTime,modifiedTime,size)&orderBy=modifiedTime desc`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error?.message || 'Failed to list backups';

        if (errorMessage.includes('invalid') && errorMessage.includes('credentials')) {
          throw new Error('AUTH_ERROR');
        } else {
          throw new Error(errorMessage);
        }
      }

      const result = await response.json();

      return {
        success: true,
        files: result.files || [],
      };
    } catch (error: any) {
      console.error('Google Drive list error:', error);

      let userMessage = 'Failed to list backups from Google Drive';

      if (error.message === 'AUTH_ERROR') {
        userMessage = 'Authentication error. Please sign out and sign in again.';
      } else if (error.message.includes('Network request failed')) {
        userMessage = 'Network error. Please check your internet connection.';
      } else if (error.message) {
        userMessage = error.message;
      }

      return {
        success: false,
        error: userMessage,
      };
    }
  }

  /**
   * Download and restore backup from Google Drive
   */
  static async restoreBackup(fileId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if signed in
      const isSignedIn = await this.isSignedIn();
      if (!isSignedIn) {
        return { success: false, error: 'Not signed in to Google' };
      }

      // Get access token
      const accessToken = await this.getAccessToken();

      // Download file content
      const response = await fetch(
        `${this.DRIVE_API_URL}/files/${fileId}?alt=media`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error?.message || 'Download failed';

        if (errorMessage.includes('invalid') && errorMessage.includes('credentials')) {
          throw new Error('AUTH_ERROR');
        } else if (errorMessage.includes('not found') || errorMessage.includes('File not found')) {
          throw new Error('FILE_NOT_FOUND');
        } else {
          throw new Error(errorMessage);
        }
      }

      const backupContent = await response.text();
      const backupData = JSON.parse(backupContent);

      // Validate and restore using existing DataManagementService
      // We'll need to expose a method to restore from data directly
      await this.performRestore(backupData);

      return { success: true };
    } catch (error: any) {
      console.error('Google Drive restore error:', error);

      let userMessage = 'Failed to restore backup from Google Drive';

      if (error.message === 'AUTH_ERROR') {
        userMessage = 'Authentication error. Please sign out and sign in again.';
      } else if (error.message === 'FILE_NOT_FOUND') {
        userMessage = 'Backup file not found. It may have been deleted.';
      } else if (error.message.includes('Network request failed')) {
        userMessage = 'Network error. Please check your internet connection.';
      } else if (error.message.includes('Invalid backup data structure')) {
        userMessage = 'Invalid backup file. The file may be corrupted or incompatible.';
      } else if (error.message) {
        userMessage = error.message;
      }

      return {
        success: false,
        error: userMessage,
      };
    }
  }

  /**
   * Delete backup from Google Drive
   */
  static async deleteBackup(fileId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if signed in
      const isSignedIn = await this.isSignedIn();
      if (!isSignedIn) {
        return { success: false, error: 'Not signed in to Google' };
      }

      // Get access token
      const accessToken = await this.getAccessToken();

      const response = await fetch(
        `${this.DRIVE_API_URL}/files/${fileId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error?.message || 'Delete failed';

        if (errorMessage.includes('invalid') && errorMessage.includes('credentials')) {
          throw new Error('AUTH_ERROR');
        } else if (errorMessage.includes('not found') || errorMessage.includes('File not found')) {
          throw new Error('FILE_NOT_FOUND');
        } else {
          throw new Error(errorMessage);
        }
      }

      return { success: true };
    } catch (error: any) {
      console.error('Google Drive delete error:', error);

      let userMessage = 'Failed to delete backup from Google Drive';

      if (error.message === 'AUTH_ERROR') {
        userMessage = 'Authentication error. Please sign out and sign in again.';
      } else if (error.message === 'FILE_NOT_FOUND') {
        userMessage = 'Backup file not found. It may have already been deleted.';
      } else if (error.message.includes('Network request failed')) {
        userMessage = 'Network error. Please check your internet connection.';
      } else if (error.message) {
        userMessage = error.message;
      }

      return {
        success: false,
        error: userMessage,
      };
    }
  }

  /**
   * Helper method to restore from backup data
   * (Extracted from DataManagementService to be reusable)
   */
  private static async performRestore(backupData: any): Promise<void> {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const { STORAGE_KEYS } = require('../../utils/env');

    try {
      // Validate backup data structure
      if (
        !backupData ||
        typeof backupData !== 'object' ||
        !Array.isArray(backupData.accounts) ||
        !Array.isArray(backupData.categories) ||
        !Array.isArray(backupData.transactions) ||
        !Array.isArray(backupData.budgets)
      ) {
        throw new Error('Invalid backup data structure');
      }

      // Store all backup data in the main app database structure
      const restoredDb = {
        accounts: backupData.accounts,
        categories: backupData.categories,
        transactions: backupData.transactions,
        budgets: backupData.budgets,
      };

      await AsyncStorage.setItem(STORAGE_KEYS.APP_DB, JSON.stringify(restoredDb));
    } catch (error) {
      console.error('Restore operation failed:', error);
      throw error;
    }
  }
}
