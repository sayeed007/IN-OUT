// src/screens/settings/components/CloudBackupSettings.tsx
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '../../../app/providers/ThemeProvider';
import AlertModal from '../../../components/modals/AlertModal';
import ConfirmationModal from '../../../components/modals/ConfirmationModal';
import Card from '../../../components/ui/Card';
import { EmailBackupService } from '../../../services/storage/emailBackup';
import { GoogleDriveBackupService, GoogleDriveFile } from '../../../services/storage/googleDriveBackup';
import { Spacing } from '../../../theme';
import SettingItem from './SettingItem';

interface ModalState {
  type: 'confirmation' | 'alert' | 'input' | null;
  title: string;
  message: string;
  confirmText?: string;
  onConfirm?: () => void;
  alertType?: 'success' | 'error' | 'warning' | 'info';
  icon?: string;
  confirmStyle?: 'default' | 'destructive';
  inputValue?: string;
  onInputChange?: (value: string) => void;
  inputPlaceholder?: string;
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
  const [emailBackupEnabled, setEmailBackupEnabled] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [backupFiles, setBackupFiles] = useState<BackupFile[]>([]);
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
      marginBottom: Spacing.xs,
    },
    inputContainer: {
      marginVertical: Spacing.sm,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 8,
      padding: Spacing.sm,
      fontSize: 14,
      color: theme.colors.text,
      backgroundColor: theme.colors.background,
    },
    switchContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: Spacing.sm,
    },
    switchLabel: {
      fontSize: 14,
      color: theme.colors.text,
      flex: 1,
    },
    backupFileItem: {
      paddingVertical: Spacing.xs,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    backupFileName: {
      fontSize: 14,
      color: theme.colors.text,
      fontWeight: '500',
    },
    backupFileDate: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 2,
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
      }

      // Load email backup settings
      const emailSettings = await EmailBackupService.getSettings();
      setEmailBackupEnabled(emailSettings.enabled);
      setEmailAddress(emailSettings.email);
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
      message: 'Are you sure you want to sign out from Google Drive?',
      confirmText: 'Sign Out',
      icon: 'log-out-outline',
      onConfirm: async () => {
        setModal({ type: null, title: '', message: '' });
        setIsLoading(true);
        try {
          await GoogleDriveBackupService.signOut();
          setIsSignedIn(false);
          setUserEmail('');
          setBackupFiles([]);
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

  const handleBackupToGoogleDrive = async () => {
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
          } else {
            setModal({
              type: 'alert',
              title: 'Backup Failed',
              message: result.error || 'Failed to backup to Google Drive',
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

  const handleRestoreFromGoogleDrive = (fileId: string, fileName: string) => {
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

  const handleConfigureEmailBackup = () => {
    setModal({
      type: 'input',
      title: 'Configure Email Backup',
      message: 'Enter your email address to receive backups:',
      inputPlaceholder: 'your.email@example.com',
      inputValue: emailAddress,
      confirmText: 'Save',
      icon: 'mail-outline',
      onConfirm: async () => {
        if (!EmailBackupService.validateEmail(modal.inputValue || '')) {
          setModal({
            type: 'alert',
            title: 'Invalid Email',
            message: 'Please enter a valid email address',
            alertType: 'error',
          });
          return;
        }

        setModal({ type: null, title: '', message: '' });
        setIsLoading(true);
        try {
          const result = await EmailBackupService.enable(modal.inputValue || '');
          if (result.success) {
            setEmailBackupEnabled(true);
            setEmailAddress(modal.inputValue || '');
            setModal({
              type: 'alert',
              title: 'Email Backup Configured',
              message: `Email backup will be sent to: ${modal.inputValue}`,
              alertType: 'success',
            });
          } else {
            setModal({
              type: 'alert',
              title: 'Configuration Failed',
              message: result.error || 'Failed to configure email backup',
              alertType: 'error',
            });
          }
        } catch (error) {
          setModal({
            type: 'alert',
            title: 'Configuration Error',
            message: 'An error occurred while configuring email backup',
            alertType: 'error',
          });
        } finally {
          setIsLoading(false);
        }
      },
      onInputChange: (value) => {
        setModal({ ...modal, inputValue: value });
      },
    });
  };

  const handleSendEmailBackup = async () => {
    if (isLoading) return;

    setModal({
      type: 'confirmation',
      title: 'Send Email Backup',
      message: `This will send a backup to: ${emailAddress}\n\nContinue?`,
      confirmText: 'Send',
      icon: 'mail-outline',
      onConfirm: async () => {
        setModal({ type: null, title: '', message: '' });
        setIsLoading(true);
        try {
          const result = await EmailBackupService.sendBackup();
          if (result.success) {
            setModal({
              type: 'alert',
              title: 'Backup Sent',
              message: `Backup email sent to: ${emailAddress}`,
              alertType: 'success',
            });
          } else {
            setModal({
              type: 'alert',
              title: 'Send Failed',
              message: result.error || 'Failed to send email backup',
              alertType: 'error',
            });
          }
        } catch (error) {
          setModal({
            type: 'alert',
            title: 'Send Error',
            message: 'An error occurred while sending email backup',
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
        <Text style={styles.sectionTitle}>Cloud Backup</Text>

        {/* Google Drive Section */}
        <View style={styles.subsection}>
          <Text style={styles.subsectionTitle}>Google Drive</Text>

          {!isSignedIn ? (
            <>
              <Text style={styles.infoText}>
                Sign in to Google to backup and restore your data from Google Drive
              </Text>
              <SettingItem
                title="Sign In to Google"
                subtitle={isLoading ? "Signing in..." : "Connect your Google account"}
                onPress={handleGoogleSignIn}
                disabled={isLoading}
              />
            </>
          ) : (
            <>
              <Text style={styles.infoText}>
                Signed in as: {userEmail}
              </Text>
              <SettingItem
                title="Backup to Google Drive"
                subtitle={isLoading ? "Backing up..." : "Upload backup to Google Drive"}
                onPress={handleBackupToGoogleDrive}
                disabled={isLoading}
              />

              {backupFiles.length > 0 && (
                <View style={styles.subsection}>
                  <Text style={styles.subsectionTitle}>Available Backups ({backupFiles.length})</Text>
                  {backupFiles.map((file) => (
                    <SettingItem
                      key={file.id}
                      title={file.name}
                      subtitle={`Modified: ${file.date}`}
                      onPress={() => handleRestoreFromGoogleDrive(file.id, file.name)}
                    />
                  ))}
                </View>
              )}

              <SettingItem
                title="Sign Out"
                subtitle="Disconnect Google account"
                onPress={handleGoogleSignOut}
              />
            </>
          )}
        </View>

        {/* Email Backup Section */}
        {/* <View style={styles.subsection}>
          <Text style={styles.subsectionTitle}>Email Backup</Text>

          {!emailBackupEnabled ? (
            <>
              <Text style={styles.infoText}>
                Configure email to receive backup files via email
              </Text>
              <SettingItem
                title="Configure Email Backup"
                subtitle="Set up email for backups"
                onPress={handleConfigureEmailBackup}
              />
            </>
          ) : (
            <>
              <Text style={styles.infoText}>
                Backups will be sent to: {emailAddress}
              </Text>
              <SettingItem
                title="Send Backup via Email"
                subtitle={isLoading ? "Sending..." : "Send backup to your email"}
                onPress={handleSendEmailBackup}
                disabled={isLoading}
              />
              <SettingItem
                title="Change Email Address"
                subtitle="Update email for backups"
                onPress={handleConfigureEmailBackup}
              />
            </>
          )}
        </View> */}
      </Card>

      {/* Confirmation Modal */}
      {modal.type === 'confirmation' &&
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
      }

      {/* Alert Modal */}
      <AlertModal
        visible={modal.type === 'alert'}
        title={modal.title}
        message={modal.message}
        type={modal.alertType}
        onClose={closeModal}
      />

      {/* Input Modal (using Confirmation Modal with input) */}
      {modal.type === 'input' && (
        <ConfirmationModal
          visible={true}
          title={modal.title}
          message={modal.message}
          confirmText={modal.confirmText}
          icon={modal.icon}
          onConfirm={modal.onConfirm || closeModal}
          onCancel={closeModal}
        >
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder={modal.inputPlaceholder}
              placeholderTextColor={theme.colors.textSecondary}
              value={modal.inputValue}
              onChangeText={modal.onInputChange}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </ConfirmationModal>
      )}
    </>
  );
};

export default CloudBackupSettings;
