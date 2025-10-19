// src/screens/settings/components/CloudBackupSettings.tsx
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../../app/providers/ThemeProvider';
import AlertModal from '../../../components/modals/AlertModal';
import ConfirmationModal from '../../../components/modals/ConfirmationModal';
import Card from '../../../components/ui/Card';
import { GoogleDriveBackupService, GoogleDriveFile } from '../../../services/storage/googleDriveBackup';
import { Spacing } from '../../../theme';
import SettingItem from './SettingItem';

interface ModalState {
  type: 'confirmation' | 'alert' | null;
  title: string;
  message: string;
  confirmText?: string;
  onConfirm?: () => void;
  alertType?: 'success' | 'error' | 'warning' | 'info';
  icon?: string;
  confirmStyle?: 'default' | 'destructive';
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
    } catch (error) {
      console.error('Error loading Google Drive backup settings:', error);
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

  const closeModal = () => {
    setModal({ type: null, title: '', message: '' });
  };

  return (
    <>
      <Card style={styles.section} padding="small">
        <Text style={styles.sectionTitle}>Google Drive Backup</Text>

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
    </>
  );
};

export default CloudBackupSettings;
