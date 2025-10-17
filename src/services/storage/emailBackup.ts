// src/services/storage/emailBackup.ts
import Mailer from 'react-native-mailer';
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
   * Send backup via email
   */
  static async sendBackup(
    recipientEmail?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get settings
      const settings = await this.getSettings();
      const email = recipientEmail || settings.email;

      if (!email) {
        return {
          success: false,
          error: 'No email address provided',
        };
      }

      // Create backup file
      const backupResult = await DataManagementService.backupAllData();

      // Prepare email with backup file attachment
      const emailData = {
        subject: 'Financial App Backup',
        recipients: [email],
        body: `
          <html>
            <body>
              <h2>Your Financial Data Backup</h2>
              <p>This email contains a backup of your financial data from the In & Out app.</p>
              <p><strong>Backup Date:</strong> ${new Date().toLocaleString()}</p>
              <p><strong>File Name:</strong> ${backupResult.fileName}</p>

              <h3>How to Restore:</h3>
              <ol>
                <li>Download the attached JSON file</li>
                <li>Open the In & Out app</li>
                <li>Go to Settings > Data Management</li>
                <li>Tap "Restore Data"</li>
                <li>Select the downloaded backup file</li>
              </ol>

              <p><em>Keep this backup safe and secure. It contains sensitive financial information.</em></p>

              <hr>
              <p style="font-size: 12px; color: #666;">
                This is an automated backup email from the In & Out financial management app.
              </p>
            </body>
          </html>
        `,
        isHTML: true,
        attachments: [
          {
            path: backupResult.filePath,
            type: 'json',
            name: backupResult.fileName,
          },
        ],
      };

      // Send email
      await Mailer.mail(emailData, (error, event) => {
        if (error) {
          console.error('Email error:', error);
        }
        console.log('Email event:', event);
      });

      // Update last backup date
      const updatedSettings = {
        ...settings,
        lastBackupDate: new Date().toISOString(),
      };
      await this.saveSettings(updatedSettings);

      return { success: true };
    } catch (error: any) {
      console.error('Email backup error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send backup via email',
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
