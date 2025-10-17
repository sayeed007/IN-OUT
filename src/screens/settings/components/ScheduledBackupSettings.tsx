// src/screens/settings/components/ScheduledBackupSettings.tsx
import React, { useState, useEffect } from 'react';
import { Text, StyleSheet, View, Switch } from 'react-native';
import Card from '../../../components/ui/Card';
import SettingItem from './SettingItem';
import { Spacing } from '../../../theme';
import { useTheme } from '../../../app/providers/ThemeProvider';
import {
  ScheduledBackupService,
  BackupFrequency,
  BackupMethod,
  ScheduledBackupSettings as Settings,
} from '../../../services/storage/scheduledBackup';
import ConfirmationModal from '../../../components/modals/ConfirmationModal';
import AlertModal from '../../../components/modals/AlertModal';

interface ModalState {
  type: 'confirmation' | 'alert' | 'select' | null;
  title: string;
  message: string;
  confirmText?: string;
  onConfirm?: () => void;
  alertType?: 'success' | 'error' | 'warning' | 'info';
  icon?: string;
  confirmStyle?: 'default' | 'destructive';
  options?: Array<{ label: string; value: any }>;
  onSelect?: (value: any) => void;
}

const ScheduledBackupSettings: React.FC = () => {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    enabled: false,
    frequency: 'weekly',
    method: 'google-drive',
    autoBackupEnabled: false,
  });
  const [nextBackupDate, setNextBackupDate] = useState<Date | null>(null);
  const [modal, setModal] = useState<ModalState>({
    type: null,
    title: '',
    message: '',
  });

  const styles = StyleSheet.create({
    section: {
      marginBottom: Spacing.base,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: Spacing.base,
    },
    subsection: {
      marginTop: Spacing.small,
      marginBottom: Spacing.small,
    },
    infoText: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      marginBottom: Spacing.small,
      lineHeight: 18,
    },
    switchContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: Spacing.small,
      paddingHorizontal: Spacing.small,
      backgroundColor: theme.colors.cardBackground,
      borderRadius: 8,
      marginBottom: Spacing.xs,
    },
    switchLabel: {
      fontSize: 14,
      color: theme.colors.text,
      flex: 1,
    },
    statusContainer: {
      padding: Spacing.small,
      backgroundColor: theme.colors.cardBackground,
      borderRadius: 8,
      marginBottom: Spacing.small,
    },
    statusLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginBottom: 4,
    },
    statusValue: {
      fontSize: 14,
      color: theme.colors.text,
      fontWeight: '500',
    },
    optionButton: {
      paddingVertical: Spacing.small,
      paddingHorizontal: Spacing.base,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: Spacing.xs,
    },
    optionButtonSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    optionText: {
      fontSize: 14,
      color: theme.colors.text,
      textAlign: 'center',
    },
    optionTextSelected: {
      color: '#fff',
      fontWeight: '500',
    },
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const currentSettings = await ScheduledBackupService.getSettings();
      setSettings(currentSettings);

      if (currentSettings.enabled) {
        const next = await ScheduledBackupService.getNextBackupDate();
        setNextBackupDate(next);
      }
    } catch (error) {
      console.error('Error loading scheduled backup settings:', error);
    }
  };

  const getFrequencyLabel = (frequency: BackupFrequency): string => {
    switch (frequency) {
      case 'daily':
        return 'Daily';
      case 'weekly':
        return 'Weekly';
      case 'monthly':
        return 'Monthly';
      default:
        return 'Weekly';
    }
  };

  const getMethodLabel = (method: BackupMethod): string => {
    switch (method) {
      case 'google-drive':
        return 'Google Drive';
      case 'email':
        return 'Email';
      case 'both':
        return 'Google Drive & Email';
      default:
        return 'Google Drive';
    }
  };

  const handleEnableScheduledBackup = async () => {
    setModal({
      type: 'confirmation',
      title: 'Enable Scheduled Backup',
      message: 'This will automatically backup your data based on the schedule you set. Make sure you have configured at least one backup method (Google Drive or Email).',
      confirmText: 'Enable',
      icon: 'time-outline',
      onConfirm: async () => {
        setModal({ type: null, title: '', message: '' });
        setIsLoading(true);
        try {
          const result = await ScheduledBackupService.enable(
            settings.frequency,
            settings.method
          );
          if (result.success) {
            await loadSettings();
            setModal({
              type: 'alert',
              title: 'Scheduled Backup Enabled',
              message: `Automatic backups will occur ${getFrequencyLabel(settings.frequency).toLowerCase()} via ${getMethodLabel(settings.method)}`,
              alertType: 'success',
            });
          } else {
            setModal({
              type: 'alert',
              title: 'Failed to Enable',
              message: result.error || 'Failed to enable scheduled backup',
              alertType: 'error',
            });
          }
        } catch (error) {
          setModal({
            type: 'alert',
            title: 'Error',
            message: 'An error occurred while enabling scheduled backup',
            alertType: 'error',
          });
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  const handleDisableScheduledBackup = async () => {
    setModal({
      type: 'confirmation',
      title: 'Disable Scheduled Backup',
      message: 'This will stop automatic backups. You can still backup manually.',
      confirmText: 'Disable',
      confirmStyle: 'destructive',
      icon: 'close-circle-outline',
      onConfirm: async () => {
        setModal({ type: null, title: '', message: '' });
        setIsLoading(true);
        try {
          await ScheduledBackupService.disable();
          await loadSettings();
          setModal({
            type: 'alert',
            title: 'Scheduled Backup Disabled',
            message: 'Automatic backups have been disabled',
            alertType: 'success',
          });
        } catch (error) {
          setModal({
            type: 'alert',
            title: 'Error',
            message: 'An error occurred while disabling scheduled backup',
            alertType: 'error',
          });
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  const handleChangeFrequency = () => {
    const frequencyOptions: Array<{ label: string; value: BackupFrequency }> = [
      { label: 'Daily', value: 'daily' },
      { label: 'Weekly', value: 'weekly' },
      { label: 'Monthly', value: 'monthly' },
    ];

    setModal({
      type: 'select',
      title: 'Backup Frequency',
      message: 'How often should backups be created?',
      options: frequencyOptions,
      onSelect: async (value: BackupFrequency) => {
        setModal({ type: null, title: '', message: '' });
        setIsLoading(true);
        try {
          await ScheduledBackupService.updateFrequency(value);
          await loadSettings();
          setModal({
            type: 'alert',
            title: 'Frequency Updated',
            message: `Backup frequency changed to ${getFrequencyLabel(value)}`,
            alertType: 'success',
          });
        } catch (error) {
          setModal({
            type: 'alert',
            title: 'Error',
            message: 'Failed to update backup frequency',
            alertType: 'error',
          });
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  const handleChangeMethod = () => {
    const methodOptions: Array<{ label: string; value: BackupMethod }> = [
      { label: 'Google Drive', value: 'google-drive' },
      { label: 'Email', value: 'email' },
      { label: 'Both (Google Drive & Email)', value: 'both' },
    ];

    setModal({
      type: 'select',
      title: 'Backup Method',
      message: 'Where should backups be stored?',
      options: methodOptions,
      onSelect: async (value: BackupMethod) => {
        setModal({ type: null, title: '', message: '' });
        setIsLoading(true);
        try {
          const result = await ScheduledBackupService.updateMethod(value);
          if (result.success) {
            await loadSettings();
            setModal({
              type: 'alert',
              title: 'Method Updated',
              message: `Backup method changed to ${getMethodLabel(value)}`,
              alertType: 'success',
            });
          } else {
            setModal({
              type: 'alert',
              title: 'Failed to Update',
              message: result.error || 'Failed to update backup method',
              alertType: 'error',
            });
          }
        } catch (error) {
          setModal({
            type: 'alert',
            title: 'Error',
            message: 'Failed to update backup method',
            alertType: 'error',
          });
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  const handleBackupNow = async () => {
    if (isLoading) return;

    setModal({
      type: 'confirmation',
      title: 'Backup Now',
      message: 'This will create an immediate backup using your scheduled backup settings.',
      confirmText: 'Backup',
      icon: 'cloud-upload-outline',
      onConfirm: async () => {
        setModal({ type: null, title: '', message: '' });
        setIsLoading(true);
        try {
          const result = await ScheduledBackupService.triggerManualBackup();
          if (result.success) {
            await loadSettings();
            setModal({
              type: 'alert',
              title: 'Backup Complete',
              message: 'Backup completed successfully',
              alertType: 'success',
            });
          } else {
            setModal({
              type: 'alert',
              title: 'Backup Failed',
              message: result.error || 'Failed to create backup',
              alertType: 'error',
            });
          }
        } catch (error) {
          setModal({
            type: 'alert',
            title: 'Error',
            message: 'An error occurred while creating backup',
            alertType: 'error',
          });
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  const closeModal = () => {
    setModal({ type: null, title: '', message: '' });
  };

  return (
    <>
      <Card style={styles.section} padding="small">
        <Text style={styles.sectionTitle}>Scheduled Backup</Text>

        <Text style={styles.infoText}>
          Automatically backup your data at regular intervals. Similar to WhatsApp's backup feature,
          your data will be backed up to your chosen cloud service on a schedule.
        </Text>

        {/* Status Section */}
        {settings.enabled && (
          <View style={styles.statusContainer}>
            <Text style={styles.statusLabel}>Status</Text>
            <Text style={styles.statusValue}>
              {settings.autoBackupEnabled ? '✓ Active' : '○ Paused'}
            </Text>

            {nextBackupDate && (
              <>
                <Text style={[styles.statusLabel, { marginTop: Spacing.xs }]}>Next Backup</Text>
                <Text style={styles.statusValue}>
                  {nextBackupDate.toLocaleString()}
                </Text>
              </>
            )}

            {settings.lastBackupDate && (
              <>
                <Text style={[styles.statusLabel, { marginTop: Spacing.xs }]}>Last Backup</Text>
                <Text style={styles.statusValue}>
                  {new Date(settings.lastBackupDate).toLocaleString()}
                </Text>
              </>
            )}
          </View>
        )}

        {/* Configuration Section */}
        {!settings.enabled ? (
          <>
            <SettingItem
              title="Backup Frequency"
              subtitle={getFrequencyLabel(settings.frequency)}
              onPress={handleChangeFrequency}
            />

            <SettingItem
              title="Backup Method"
              subtitle={getMethodLabel(settings.method)}
              onPress={handleChangeMethod}
            />

            <SettingItem
              title="Enable Scheduled Backup"
              subtitle="Turn on automatic backups"
              onPress={handleEnableScheduledBackup}
              disabled={isLoading}
            />
          </>
        ) : (
          <>
            <SettingItem
              title="Backup Frequency"
              subtitle={getFrequencyLabel(settings.frequency)}
              onPress={handleChangeFrequency}
            />

            <SettingItem
              title="Backup Method"
              subtitle={getMethodLabel(settings.method)}
              onPress={handleChangeMethod}
            />

            <SettingItem
              title="Backup Now"
              subtitle={isLoading ? "Creating backup..." : "Create immediate backup"}
              onPress={handleBackupNow}
              disabled={isLoading}
            />

            <SettingItem
              title="Disable Scheduled Backup"
              subtitle="Turn off automatic backups"
              onPress={handleDisableScheduledBackup}
            />
          </>
        )}
      </Card>

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={modal.type === 'confirmation'}
        title={modal.title}
        message={modal.message}
        confirmText={modal.confirmText}
        confirmStyle={modal.confirmStyle}
        icon={modal.icon}
        onConfirm={modal.onConfirm || closeModal}
        onCancel={closeModal}
      />

      {/* Alert Modal */}
      <AlertModal
        visible={modal.type === 'alert'}
        title={modal.title}
        message={modal.message}
        type={modal.alertType}
        onClose={closeModal}
      />

      {/* Selection Modal */}
      {modal.type === 'select' && modal.options && (
        <ConfirmationModal
          visible={true}
          title={modal.title}
          message={modal.message}
          confirmText="Cancel"
          icon="list-outline"
          onConfirm={closeModal}
          onCancel={closeModal}
        >
          <View style={styles.subsection}>
            {modal.options.map((option, index) => (
              <View
                key={index}
                style={[
                  styles.optionButton,
                  option.value === settings.frequency || option.value === settings.method
                    ? styles.optionButtonSelected
                    : {},
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    option.value === settings.frequency || option.value === settings.method
                      ? styles.optionTextSelected
                      : {},
                  ]}
                  onPress={() => modal.onSelect && modal.onSelect(option.value)}
                >
                  {option.label}
                </Text>
              </View>
            ))}
          </View>
        </ConfirmationModal>
      )}
    </>
  );
};

export default ScheduledBackupSettings;
