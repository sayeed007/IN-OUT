// src/screens/settings/components/CloudBackupSettings.tsx
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../app/providers/ThemeProvider';
import AlertModal from '../../../components/modals/AlertModal';
import ConfirmationModal from '../../../components/modals/ConfirmationModal';
import Card from '../../../components/ui/Card';
import { GoogleDriveBackupService, GoogleDriveFile } from '../../../services/storage/googleDriveBackup';
import { ScheduledBackupService, BackupFrequency } from '../../../services/storage/scheduledBackup';
import { Spacing } from '../../../theme';
import SettingItem from './SettingItem';

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

interface BackupFile {
  id: string;
  name: string;
  date: string;
  size: string;
}

const CloudBackupSettings: React.FC = () => {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [backupFiles, setBackupFiles] = useState<BackupFile[]>([]);
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false);
  const [backupFrequency, setBackupFrequency] = useState<BackupFrequency>('weekly');
  const [nextBackupDate, setNextBackupDate] = useState<Date | null>(null);
  const [lastBackupDate, setLastBackupDate] = useState<string | undefined>();
  const [lastError, setLastError] = useState<string | undefined>();
  const [lastErrorDate, setLastErrorDate] = useState<string | undefined>();
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
      marginTop: Spacing.sm,
      marginBottom: Spacing.sm,
    },
    subsectionTitle: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.textSecondary,
      marginBottom: Spacing.xs,
    },
    infoText: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      marginBottom: Spacing.sm,
      lineHeight: 18,
    },
    statusContainer: {
      padding: Spacing.sm,
      backgroundColor: theme.colors.background,
      borderRadius: 8,
      marginBottom: Spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    statusRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.xs,
    },
    statusLabel: {
      fontSize: 13,
      color: theme.colors.textSecondary,
    },
    statusValue: {
      fontSize: 13,
      color: theme.colors.text,
      fontWeight: '500',
    },
    activeIndicator: {
      fontSize: 13,
      color: '#22C55E',
      fontWeight: '600',
    },
    errorIndicator: {
      fontSize: 13,
      color: '#EF4444',
      fontWeight: '600',
    },
    errorContainer: {
      padding: Spacing.sm,
      backgroundColor: '#FEF2F2',
      borderRadius: 8,
      marginBottom: Spacing.sm,
      borderWidth: 1,
      borderColor: '#FCA5A5',
    },
    errorTitle: {
      fontSize: 13,
      color: '#991B1B',
      fontWeight: '600',
      marginBottom: 4,
    },
    errorText: {
      fontSize: 12,
      color: '#7F1D1D',
      lineHeight: 16,
    },
    errorDate: {
      fontSize: 11,
      color: '#991B1B',
      marginTop: 4,
      fontStyle: 'italic',
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: Spacing.sm,
    },
    optionButton: {
      paddingVertical: Spacing.base,
      paddingHorizontal: Spacing.base,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: theme.colors.border,
      marginBottom: Spacing.sm,
      backgroundColor: theme.colors.background,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    optionButtonSelected: {
      backgroundColor: '#3B82F6',
      borderColor: '#3B82F6',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    optionText: {
      fontSize: 15,
      color: theme.colors.text,
      textAlign: 'center',
      fontWeight: '500',
    },
    optionTextSelected: {
      color: '#FFFFFF',
      fontWeight: '600',
    },
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Check Google Drive sign-in status
      const signedIn = await GoogleDriveBackupService.isSignedIn();
      setIsSignedIn(signedIn);

      if (signedIn) {
        const user = await GoogleDriveBackupService.getCurrentUser();
        setUserEmail(user?.user?.email || '');

        // Load backup files
        await loadBackupFiles();

        // Load scheduled backup settings
        const scheduledSettings = await ScheduledBackupService.getSettings();
        setAutoBackupEnabled(scheduledSettings.enabled && scheduledSettings.autoBackupEnabled);
        setBackupFrequency(scheduledSettings.frequency);
        setLastBackupDate(scheduledSettings.lastBackupDate);
        setLastError(scheduledSettings.lastError);
        setLastErrorDate(scheduledSettings.lastErrorDate);

        if (scheduledSettings.enabled) {
          const next = await ScheduledBackupService.getNextBackupDate();
          setNextBackupDate(next);
        }
      }
    } catch (error) {
      console.error('Error loading cloud backup settings:', error);
    }
  };

  const loadBackupFiles = async () => {
    try {
      const result = await GoogleDriveBackupService.listBackups();
      if (result.success && result.files) {
        const files = result.files.map((file: GoogleDriveFile) => ({
          id: file.id,
          name: file.name,
          date: new Date(file.modifiedTime).toLocaleString(),
          size: file.size,
        }));
        setBackupFiles(files);
      }
    } catch (error) {
      console.error('Error loading backup files:', error);
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

  const handleGoogleSignIn = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const result = await GoogleDriveBackupService.signIn();

      if (result.success && result.user) {
        setIsSignedIn(true);
        setUserEmail(result.user.user?.email || '');
        setModal({
          type: 'alert',
          title: 'Signed In',
          message: `Successfully signed in to Google Drive as ${result.user.user?.email}`,
          alertType: 'success',
        });
        await loadBackupFiles();
      } else {
        setModal({
          type: 'alert',
          title: 'Sign In Failed',
          message: result.error || 'Failed to sign in to Google Drive',
          alertType: 'error',
        });
      }
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      setModal({
        type: 'alert',
        title: 'Sign In Error',
        message: error.message || 'An error occurred while signing in to Google Drive',
        alertType: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignOut = async () => {
    setModal({
      type: 'confirmation',
      title: 'Sign Out',
      message: 'Are you sure you want to sign out from Google Drive? This will also disable automatic backups.',
      confirmText: 'Sign Out',
      icon: 'log-out-outline',
      onConfirm: async () => {
        setModal({ type: null, title: '', message: '' });
        setIsLoading(true);
        try {
          // Disable scheduled backup if enabled
          if (autoBackupEnabled) {
            await ScheduledBackupService.disable();
          }

          await GoogleDriveBackupService.signOut();
          setIsSignedIn(false);
          setUserEmail('');
          setBackupFiles([]);
          setAutoBackupEnabled(false);
          setModal({
            type: 'alert',
            title: 'Signed Out',
            message: 'Successfully signed out from Google Drive',
            alertType: 'success',
          });
        } catch (error) {
          setModal({
            type: 'alert',
            title: 'Sign Out Error',
            message: 'An error occurred while signing out',
            alertType: 'error',
          });
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  const handleBackupToCloud = async () => {
    if (isLoading) return;

    setModal({
      type: 'confirmation',
      title: 'Backup to Google Drive',
      message: 'This will upload your data to Google Drive. Continue?',
      confirmText: 'Backup',
      icon: 'cloud-upload-outline',
      onConfirm: async () => {
        setModal({ type: null, title: '', message: '' });
        setIsLoading(true);
        try {
          const result = await GoogleDriveBackupService.uploadBackup();
          if (result.success) {
            setModal({
              type: 'alert',
              title: 'Backup Successful',
              message: `Backup uploaded to Google Drive: ${result.fileName}`,
              alertType: 'success',
            });
            await loadBackupFiles();
            await loadSettings(); // Refresh to update last backup date
          } else {
            // Handle quota exceeded error with helpful message
            const isQuotaError = result.error?.includes('storage is full') ||
                                 result.error?.includes('quota');

            setModal({
              type: 'alert',
              title: isQuotaError ? 'Storage Full' : 'Backup Failed',
              message: isQuotaError
                ? `${result.error}\n\nTip: You can delete old backups from this screen to free up space, or upgrade your Google Drive storage.`
                : result.error || 'Failed to backup to Google Drive',
              alertType: 'error',
            });
          }
        } catch (error) {
          setModal({
            type: 'alert',
            title: 'Backup Error',
            message: 'An error occurred while backing up to Google Drive',
            alertType: 'error',
          });
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  const handleDeleteBackup = (fileId: string, fileName: string) => {
    setModal({
      type: 'confirmation',
      title: 'Delete Backup',
      message: `Are you sure you want to delete this backup?\n\n${fileName}\n\nThis action cannot be undone.`,
      confirmText: 'Delete',
      confirmStyle: 'destructive',
      icon: 'trash-outline',
      onConfirm: async () => {
        setModal({ type: null, title: '', message: '' });
        setIsLoading(true);
        try {
          const result = await GoogleDriveBackupService.deleteBackup(fileId);
          if (result.success) {
            setModal({
              type: 'alert',
              title: 'Backup Deleted',
              message: 'The backup file has been successfully deleted from Google Drive.',
              alertType: 'success',
            });
            await loadBackupFiles(); // Refresh the list
          } else {
            setModal({
              type: 'alert',
              title: 'Delete Failed',
              message: result.error || 'Failed to delete backup from Google Drive',
              alertType: 'error',
            });
          }
        } catch (error) {
          setModal({
            type: 'alert',
            title: 'Delete Error',
            message: 'An error occurred while deleting the backup',
            alertType: 'error',
          });
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  const handleRestoreFromCloud = (fileId: string, fileName: string) => {
    setModal({
      type: 'confirmation',
      title: 'Restore from Google Drive',
      message: `This will restore your data from:\n${fileName}\n\nCurrent data will be replaced. Continue?`,
      confirmText: 'Restore',
      confirmStyle: 'destructive',
      icon: 'warning-outline',
      onConfirm: async () => {
        setModal({ type: null, title: '', message: '' });
        setIsLoading(true);
        try {
          const result = await GoogleDriveBackupService.restoreBackup(fileId);
          if (result.success) {
            setModal({
              type: 'alert',
              title: 'Restore Successful',
              message: 'Data restored successfully from Google Drive',
              alertType: 'success',
            });
          } else {
            setModal({
              type: 'alert',
              title: 'Restore Failed',
              message: result.error || 'Failed to restore from Google Drive',
              alertType: 'error',
            });
          }
        } catch (error) {
          setModal({
            type: 'alert',
            title: 'Restore Error',
            message: 'An error occurred while restoring from Google Drive',
            alertType: 'error',
          });
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  const handleToggleAutoBackup = async () => {
    if (autoBackupEnabled) {
      // Disable auto backup
      setModal({
        type: 'confirmation',
        title: 'Disable Auto Backup',
        message: 'This will stop automatic backups to Google Drive. You can still backup manually.',
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
              title: 'Auto Backup Disabled',
              message: 'Automatic backups have been disabled',
              alertType: 'success',
            });
          } catch (error) {
            setModal({
              type: 'alert',
              title: 'Error',
              message: 'An error occurred while disabling auto backup',
              alertType: 'error',
            });
          } finally {
            setIsLoading(false);
          }
        },
      });
    } else {
      // Enable auto backup
      setModal({
        type: 'confirmation',
        title: 'Enable Auto Backup',
        message: `This will automatically backup your data to Google Drive ${getFrequencyLabel(backupFrequency).toLowerCase()}.`,
        confirmText: 'Enable',
        icon: 'time-outline',
        onConfirm: async () => {
          setModal({ type: null, title: '', message: '' });
          setIsLoading(true);
          try {
            const result = await ScheduledBackupService.enable(backupFrequency, 'google-drive');
            if (result.success) {
              await loadSettings();
              setModal({
                type: 'alert',
                title: 'Auto Backup Enabled',
                message: `Automatic backups will occur ${getFrequencyLabel(backupFrequency).toLowerCase()} to Google Drive`,
                alertType: 'success',
              });
            } else {
              setModal({
                type: 'alert',
                title: 'Failed to Enable',
                message: result.error || 'Failed to enable auto backup',
                alertType: 'error',
              });
            }
          } catch (error) {
            setModal({
              type: 'alert',
              title: 'Error',
              message: 'An error occurred while enabling auto backup',
              alertType: 'error',
            });
          } finally {
            setIsLoading(false);
          }
        },
      });
    }
  };

  const handleChangeFrequency = () => {
    const frequencyOptions: Array<{ label: string; value: BackupFrequency }> = [
      { label: 'Daily', value: 'daily' },
      { label: 'Weekly', value: 'weekly' },
      { label: 'Monthly', value: 'monthly' },
    ];

    let tempSelectedFrequency = backupFrequency;

    setModal({
      type: 'select',
      title: 'Backup Frequency',
      message: 'How often should automatic backups be created?',
      options: frequencyOptions,
      confirmText: 'Save',
      onSelect: (value: BackupFrequency) => {
        tempSelectedFrequency = value;
        setBackupFrequency(value);
      },
      onConfirm: async () => {
        setModal({ type: null, title: '', message: '' });
        setIsLoading(true);
        try {
          await ScheduledBackupService.updateFrequency(tempSelectedFrequency);
          await loadSettings();
          setModal({
            type: 'alert',
            title: 'Frequency Updated',
            message: `Backup frequency changed to ${getFrequencyLabel(tempSelectedFrequency)}`,
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

  const closeModal = () => {
    setModal({ type: null, title: '', message: '' });
  };

  return (
    <>
      <Card style={styles.section} padding="small">
        <Text style={styles.sectionTitle}>Cloud Backup (Google Drive)</Text>

        {!isSignedIn ? (
          <>
            <Text style={styles.infoText}>
              Sign in to Google Drive to backup and restore your data to the cloud, and enable automatic backups.
            </Text>
            <SettingItem
              title="Connect Google Drive"
              subtitle={isLoading ? "Signing in..." : "Sign in with your Google account"}
              onPress={handleGoogleSignIn}
              disabled={isLoading}
            />
          </>
        ) : (
          <>
            <Text style={styles.infoText}>
              Signed in as: {userEmail}
            </Text>

            {/* Last Error Display */}
            {lastError && lastErrorDate && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorTitle}>⚠️ Last Backup Error</Text>
                <Text style={styles.errorText}>{lastError}</Text>
                <Text style={styles.errorDate}>
                  {new Date(lastErrorDate).toLocaleString()}
                </Text>
              </View>
            )}

            {/* Auto Backup Status */}
            {(autoBackupEnabled || lastBackupDate) && (
              <View style={styles.statusContainer}>
                {autoBackupEnabled && (
                  <>
                    <View style={styles.statusRow}>
                      <Text style={styles.statusLabel}>Auto Backup</Text>
                      <Text style={styles.activeIndicator}>✓ Active</Text>
                    </View>
                    <View style={styles.statusRow}>
                      <Text style={styles.statusLabel}>Frequency</Text>
                      <Text style={styles.statusValue}>{getFrequencyLabel(backupFrequency)}</Text>
                    </View>
                    {nextBackupDate && (
                      <View style={styles.statusRow}>
                        <Text style={styles.statusLabel}>Next Backup</Text>
                        <Text style={styles.statusValue}>{nextBackupDate.toLocaleString()}</Text>
                      </View>
                    )}
                  </>
                )}
                {lastBackupDate && (
                  <View style={styles.statusRow}>
                    <Text style={styles.statusLabel}>Last Backup</Text>
                    <Text style={styles.statusValue}>{new Date(lastBackupDate).toLocaleString()}</Text>
                  </View>
                )}
              </View>
            )}

            <SettingItem
              title="Backup to Cloud"
              subtitle={isLoading ? "Backing up..." : "Upload backup to Google Drive now"}
              onPress={handleBackupToCloud}
              disabled={isLoading}
            />

            {backupFiles.length > 0 && (
              <View style={styles.subsection}>
                <Text style={styles.subsectionTitle}>Available Backups ({backupFiles.length})</Text>
                {backupFiles.map((file) => (
                  <SettingItem
                    key={file.id}
                    title={file.name}
                    subtitle={`Modified: ${file.date} • Tap to restore, long-press to delete`}
                    onPress={() => handleRestoreFromCloud(file.id, file.name)}
                    onLongPress={() => handleDeleteBackup(file.id, file.name)}
                  />
                ))}
              </View>
            )}

            <View style={styles.divider} />

            <SettingItem
              title={autoBackupEnabled ? "Disable Auto Backup" : "Enable Auto Backup"}
              subtitle={autoBackupEnabled
                ? `Auto backup is active (${getFrequencyLabel(backupFrequency)})`
                : "Automatically backup to Google Drive"
              }
              onPress={handleToggleAutoBackup}
              disabled={isLoading}
            />

            {!autoBackupEnabled && (
              <SettingItem
                title="Auto Backup Frequency"
                subtitle={getFrequencyLabel(backupFrequency)}
                onPress={handleChangeFrequency}
                disabled={isLoading}
              />
            )}

            {autoBackupEnabled && (
              <SettingItem
                title="Change Frequency"
                subtitle={`Currently: ${getFrequencyLabel(backupFrequency)}`}
                onPress={handleChangeFrequency}
                disabled={isLoading}
              />
            )}

            <View style={styles.divider} />

            <SettingItem
              title="Disconnect Google Drive"
              subtitle="Sign out from your Google account"
              onPress={handleGoogleSignOut}
            />
          </>
        )}
      </Card>

      {/* Confirmation Modal */}
      {modal.type === 'confirmation' && (
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
      )}

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
          confirmText={modal.confirmText || 'Save'}
          cancelText="Cancel"
          icon="list-outline"
          onConfirm={modal.onConfirm || closeModal}
          onCancel={closeModal}
        >
          <View style={styles.subsection}>
            {modal.options.map((option, index) => {
              const isSelected = option.value === backupFrequency;
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    isSelected && styles.optionButtonSelected,
                  ]}
                  onPress={() => modal.onSelect && modal.onSelect(option.value)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {isSelected && (
                    <Icon
                      name="checkmark-circle"
                      size={20}
                      color="#FFFFFF"
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ConfirmationModal>
      )}
    </>
  );
};

export default CloudBackupSettings;
