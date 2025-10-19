// src/services/storage/scheduledBackup.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppStateStatus } from 'react-native';
import { STORAGE_KEYS } from '../../utils/env';
import { GoogleDriveBackupService } from './googleDriveBackup';

export type BackupFrequency = 'daily' | 'weekly' | 'monthly';
export type BackupMethod = 'google-drive' | 'email' | 'both';

export interface ScheduledBackupSettings {
  enabled: boolean;
  frequency: BackupFrequency;
  method: BackupMethod;
  lastBackupDate?: string;
  nextBackupDate?: string;
  autoBackupEnabled: boolean;
}

export class ScheduledBackupService {
  private static appStateListener: any = null;
  private static checkInterval: any = null;

  /**
   * Get scheduled backup settings
   */
  static async getSettings(): Promise<ScheduledBackupSettings> {
    try {
      const settings = await AsyncStorage.getItem(STORAGE_KEYS.SCHEDULED_BACKUP_SETTINGS);
      if (settings) {
        return JSON.parse(settings);
      }
      return {
        enabled: false,
        frequency: 'weekly',
        method: 'google-drive',
        autoBackupEnabled: false,
      };
    } catch (error) {
      console.error('Error getting scheduled backup settings:', error);
      return {
        enabled: false,
        frequency: 'weekly',
        method: 'google-drive',
        autoBackupEnabled: false,
      };
    }
  }

  /**
   * Save scheduled backup settings
   */
  static async saveSettings(settings: ScheduledBackupSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.SCHEDULED_BACKUP_SETTINGS,
        JSON.stringify(settings)
      );
    } catch (error) {
      console.error('Error saving scheduled backup settings:', error);
      throw error;
    }
  }

  /**
   * Initialize scheduled backups with app state monitoring
   */
  static async initialize(): Promise<void> {
    try {
      const settings = await this.getSettings();

      if (!settings.enabled || !settings.autoBackupEnabled) {
        console.log('[ScheduledBackup] Not enabled, skipping initialization');
        return;
      }

      // Check for due backups when app becomes active
      this.appStateListener = AppState.addEventListener('change', async (nextAppState: AppStateStatus) => {
        if (nextAppState === 'active') {
          console.log('[ScheduledBackup] App became active, checking for due backups');
          const isDue = await this.isBackupDue();
          if (isDue) {
            await this.performScheduledBackup();
          }
        }
      });

      // Also check periodically while app is running (every hour)
      this.checkInterval = setInterval(async () => {
        if (AppState.currentState === 'active') {
          const isDue = await this.isBackupDue();
          if (isDue) {
            await this.performScheduledBackup();
          }
        }
      }, 60 * 60 * 1000); // Check every hour

      // Check immediately on initialization
      const isDue = await this.isBackupDue();
      if (isDue) {
        await this.performScheduledBackup();
      }

      console.log('[ScheduledBackup] Initialized successfully');
    } catch (error) {
      console.error('[ScheduledBackup] Failed to initialize:', error);
    }
  }

  /**
   * Cleanup listeners
   */
  static cleanup(): void {
    if (this.appStateListener) {
      this.appStateListener.remove();
      this.appStateListener = null;
    }
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Convert frequency to minutes for background fetch
   */
  private static getIntervalMinutes(frequency: BackupFrequency): number {
    switch (frequency) {
      case 'daily':
        return 60 * 24; // 24 hours
      case 'weekly':
        return 60 * 24 * 7; // 7 days
      case 'monthly':
        return 60 * 24 * 30; // 30 days
      default:
        return 60 * 24 * 7; // Default to weekly
    }
  }

  /**
   * Calculate next backup date based on frequency
   */
  private static calculateNextBackupDate(frequency: BackupFrequency): Date {
    const now = new Date();
    switch (frequency) {
      case 'daily':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      case 'weekly':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      case 'monthly':
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    }
  }

  /**
   * Check if backup is due based on last backup date and frequency
   */
  static async isBackupDue(): Promise<boolean> {
    try {
      const settings = await this.getSettings();

      if (!settings.enabled || !settings.autoBackupEnabled) {
        return false;
      }

      if (!settings.lastBackupDate) {
        return true; // Never backed up before
      }

      const lastBackup = new Date(settings.lastBackupDate);
      const now = new Date();
      const diffMs = now.getTime() - lastBackup.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      switch (settings.frequency) {
        case 'daily':
          return diffDays >= 1;
        case 'weekly':
          return diffDays >= 7;
        case 'monthly':
          return diffDays >= 30;
        default:
          return false;
      }
    } catch (error) {
      console.error('Error checking if backup is due:', error);
      return false;
    }
  }

  /**
   * Perform scheduled backup
   */
  static async performScheduledBackup(force: boolean = false): Promise<{ success: boolean; error?: string }> {
    try {
      const settings = await this.getSettings();

      if (!settings.enabled || !settings.autoBackupEnabled) {
        return { success: false, error: 'Scheduled backup is not enabled' };
      }

      // Check if backup is due (unless forced)
      if (!force) {
        const isDue = await this.isBackupDue();
        if (!isDue) {
          console.log('[ScheduledBackup] Backup not due yet');
          return { success: true };
        }
      }

      let backupSuccess = false;
      const errors: string[] = [];

      // Backup to Google Drive
      const isSignedIn = await GoogleDriveBackupService.isSignedIn();
      if (isSignedIn) {
        const result = await GoogleDriveBackupService.uploadBackup();
        if (result.success) {
          backupSuccess = true;
          console.log('[ScheduledBackup] Google Drive backup successful');
        } else {
          errors.push(`Google Drive: ${result.error}`);
        }
      } else {
        errors.push('Google Drive: Not signed in');
      }

      // Update settings with last backup date if backup succeeded
      if (backupSuccess) {
        const now = new Date();
        const nextBackup = this.calculateNextBackupDate(settings.frequency);

        await this.saveSettings({
          ...settings,
          lastBackupDate: now.toISOString(),
          nextBackupDate: nextBackup.toISOString(),
        });

        console.log('[ScheduledBackup] Backup completed successfully');
        console.log('[ScheduledBackup] Next backup scheduled for:', nextBackup.toLocaleString());

        return {
          success: true,
          error: errors.length > 0 ? `Partial success: ${errors.join(', ')}` : undefined,
        };
      } else {
        return {
          success: false,
          error: errors.length > 0 ? errors.join(', ') : 'Backup failed',
        };
      }
    } catch (error: any) {
      console.error('[ScheduledBackup] Error:', error);
      return {
        success: false,
        error: error.message || 'Scheduled backup failed',
      };
    }
  }

  /**
   * Enable scheduled backups
   */
  static async enable(
    frequency: BackupFrequency,
    method: BackupMethod = 'google-drive'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const settings = await this.getSettings();

      // Validate Google Drive is signed in
      const isSignedIn = await GoogleDriveBackupService.isSignedIn();
      if (!isSignedIn) {
        return {
          success: false,
          error: 'Please sign in to Google Drive first',
        };
      }

      const nextBackup = this.calculateNextBackupDate(frequency);

      await this.saveSettings({
        ...settings,
        enabled: true,
        frequency,
        method: 'google-drive',
        autoBackupEnabled: true,
        nextBackupDate: nextBackup.toISOString(),
      });

      // Re-initialize background fetch with new settings
      await this.initialize();

      return { success: true };
    } catch (error: any) {
      console.error('Error enabling scheduled backup:', error);
      return {
        success: false,
        error: error.message || 'Failed to enable scheduled backup',
      };
    }
  }

  /**
   * Disable scheduled backups
   */
  static async disable(): Promise<void> {
    try {
      const settings = await this.getSettings();
      await this.saveSettings({
        ...settings,
        enabled: false,
        autoBackupEnabled: false,
      });

      // Cleanup listeners
      this.cleanup();
    } catch (error) {
      console.error('Error disabling scheduled backup:', error);
      throw error;
    }
  }

  /**
   * Update backup frequency
   */
  static async updateFrequency(frequency: BackupFrequency): Promise<void> {
    try {
      const settings = await this.getSettings();
      const nextBackup = this.calculateNextBackupDate(frequency);

      await this.saveSettings({
        ...settings,
        frequency,
        nextBackupDate: nextBackup.toISOString(),
      });

      // Re-initialize background fetch with new interval
      if (settings.enabled) {
        await this.initialize();
      }
    } catch (error) {
      console.error('Error updating backup frequency:', error);
      throw error;
    }
  }


  /**
   * Get next scheduled backup date
   */
  static async getNextBackupDate(): Promise<Date | null> {
    try {
      const settings = await this.getSettings();
      if (settings.enabled && settings.nextBackupDate) {
        return new Date(settings.nextBackupDate);
      }
      return null;
    } catch (error) {
      console.error('Error getting next backup date:', error);
      return null;
    }
  }

  /**
   * Manually trigger a backup (outside of schedule)
   */
  static async triggerManualBackup(): Promise<{ success: boolean; error?: string }> {
    try {
      const settings = await this.getSettings();

      if (!settings.enabled) {
        return { success: false, error: 'Scheduled backup is not configured' };
      }

      // Temporarily enable auto backup to trigger the backup
      const originalAutoBackup = settings.autoBackupEnabled;
      await this.saveSettings({
        ...settings,
        autoBackupEnabled: true,
      });

      // Force the backup to run regardless of schedule
      const result = await this.performScheduledBackup(true);

      // Restore original auto backup setting
      const currentSettings = await this.getSettings();
      await this.saveSettings({
        ...currentSettings,
        autoBackupEnabled: originalAutoBackup,
      });

      return result;
    } catch (error: any) {
      console.error('Error triggering manual backup:', error);
      return {
        success: false,
        error: error.message || 'Failed to trigger manual backup',
      };
    }
  }
}
