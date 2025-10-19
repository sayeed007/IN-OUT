// src/services/storage/emailBackup.ts
import Share from 'react-native-share';
import { DataManagementService } from './dataManagement';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../../utils/env';

export interface EmailBackupSettings {
  enabled: boolean;
  email: string;
  lastBackupDate?: string;
}

export class EmailBackupService {
  /**
   * Get email backup settings
   */
  static async getSettings(): Promise<EmailBackupSettings> {
    try {
      const settings = await AsyncStorage.getItem(STORAGE_KEYS.EMAIL_BACKUP_SETTINGS);
      if (settings) {
        return JSON.parse(settings);
      }
      return {
        enabled: false,
        email: '',
      };
    } catch (error) {
      console.error('Error getting email backup settings:', error);
      return {
        enabled: false,
        email: '',
      };
    }
  }

  /**
   * Save email backup settings
   */
  static async saveSettings(settings: EmailBackupSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.EMAIL_BACKUP_SETTINGS,
        JSON.stringify(settings)
      );
    } catch (error) {
      console.error('Error saving email backup settings:', error);
      throw error;
    }
  }

  /**
   * Send backup via share dialog (email, messaging, cloud storage, etc.)
   */
  static async sendBackup(): Promise<{ success: boolean; error?: string; cancelled?: boolean }> {
    try {
      // Create backup file
      const backupResult = await DataManagementService.backupAllData();

      // Prepare share message
      const shareMessage = `Your Financial Data Backup

Backup Date: ${new Date().toLocaleString()}
File Name: ${backupResult.fileName}

How to Restore:
1. Save the attached backup file
2. Open the In & Out app
3. Go to Settings > Cloud Backup > Restore from Backup
4. Select the backup file

⚠️ Keep this backup safe and secure. It contains sensitive financial information.

---
Backup from In & Out financial management app.`;

      // Share options - using Share.open for better compatibility
      const shareOptions = {
        title: 'Financial App Backup',
        message: shareMessage,
        subject: `In & Out App Backup - ${new Date().toLocaleDateString()}`,
        url: `file://${backupResult.filePath}`,
        type: 'application/json',
        filename: backupResult.fileName,
      };

      // Open share dialog
      await Share.open(shareOptions);

      // Update last backup date
      const settings = await this.getSettings();
      const updatedSettings = {
        ...settings,
        lastBackupDate: new Date().toISOString(),
      };
      await this.saveSettings(updatedSettings);

      return { success: true };
    } catch (error: any) {
      console.error('Backup share error:', error);

      // Check if user cancelled
      const errorMessage = error?.message?.toLowerCase() || '';
      const isCancelled = errorMessage.includes('cancel') ||
        errorMessage.includes('dismiss') ||
        errorMessage.includes('user did not share');

      if (isCancelled) {
        return {
          success: false,
          cancelled: true,
        };
      }

      return {
        success: false,
        error: error.message || 'Failed to share backup file',
      };
    }
  }

  /**
   * Validate email address format
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Check if email backup is enabled
   */
  static async isEnabled(): Promise<boolean> {
    try {
      const settings = await this.getSettings();
      return settings.enabled && !!settings.email;
    } catch (error) {
      console.error('Error checking email backup status:', error);
      return false;
    }
  }

  /**
   * Enable email backup
   */
  static async enable(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.validateEmail(email)) {
        return {
          success: false,
          error: 'Invalid email address format',
        };
      }

      const settings = await this.getSettings();
      await this.saveSettings({
        ...settings,
        enabled: true,
        email,
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error enabling email backup:', error);
      return {
        success: false,
        error: error.message || 'Failed to enable email backup',
      };
    }
  }

  /**
   * Disable email backup
   */
  static async disable(): Promise<void> {
    try {
      const settings = await this.getSettings();
      await this.saveSettings({
        ...settings,
        enabled: false,
      });
    } catch (error) {
      console.error('Error disabling email backup:', error);
      throw error;
    }
  }
}
