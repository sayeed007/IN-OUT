// src/screens/settings/components/EmailBackupSettings.tsx
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useTheme } from '../../../app/providers/ThemeProvider';
import AlertModal from '../../../components/modals/AlertModal';
import ConfirmationModal from '../../../components/modals/ConfirmationModal';
import Card from '../../../components/ui/Card';
import { EmailBackupService } from '../../../services/storage/emailBackup';
import { DataManagementService } from '../../../services/storage/dataManagement';
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

const EmailBackupSettings: React.FC = () => {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [lastBackupDate, setLastBackupDate] = useState<string | undefined>();
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
    infoText: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      marginBottom: Spacing.xs,
      lineHeight: 18,
    },
    lastBackupText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      fontStyle: 'italic',
      marginTop: Spacing.xs,
    },
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const emailSettings = await EmailBackupService.getSettings();
      setLastBackupDate(emailSettings.lastBackupDate);
    } catch (error) {
      console.error('Error loading email backup settings:', error);
    }
  };

  const handleShareBackup = async () => {
    if (isLoading) return;

    setModal({
      type: 'confirmation',
      title: 'Share Backup',
      message: 'This will create a backup file and open the share menu so you can send it via email, messaging, or save it to cloud storage.\n\nContinue?',
      confirmText: 'Share',
      icon: 'share-outline',
      onConfirm: async () => {
        setModal({ type: null, title: '', message: '' });
        setIsLoading(true);
        try {
          const result = await EmailBackupService.sendBackup();
          if (result.success) {
            await loadSettings();
            setModal({
              type: 'alert',
              title: 'Backup Shared',
              message: 'Your backup file has been created and the share dialog has been opened. You can now send it via email or any other app.',
              alertType: 'success',
            });
          } else if (result.cancelled) {
            // User cancelled, no need to show error
            console.log('User cancelled backup share');
          } else {
            setModal({
              type: 'alert',
              title: 'Share Failed',
              message: result.error || 'Failed to share backup file',
              alertType: 'error',
            });
          }
        } catch (error) {
          setModal({
            type: 'alert',
            title: 'Share Error',
            message: 'An error occurred while preparing the backup file',
            alertType: 'error',
          });
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  const handleRestoreBackup = async () => {
    if (isLoading) return;

    setModal({
      type: 'confirmation',
      title: 'Restore from Backup',
      message: 'This will restore your data from a backup file. Your current data will be replaced.\n\nMake sure you select a valid backup file (.json).\n\nContinue?',
      confirmText: 'Restore',
      confirmStyle: 'destructive',
      icon: 'warning-outline',
      onConfirm: async () => {
        setModal({ type: null, title: '', message: '' });
        setIsLoading(true);
        try {
          const result = await DataManagementService.restoreFromBackup();
          if (result) {
            setModal({
              type: 'alert',
              title: 'Restore Successful',
              message: 'Data restored successfully from backup file. The app will refresh to load the restored data.',
              alertType: 'success',
            });
          }
        } catch (error: any) {
          console.error('Restore failed:', error);
          setModal({
            type: 'alert',
            title: 'Restore Failed',
            message: error.message || 'Unable to restore from backup. Please check the file and try again.',
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
        <Text style={styles.sectionTitle}>Email & Share Backup</Text>

        <Text style={styles.infoText}>
          Create a backup file and share it via email, messaging apps, or save it to your preferred cloud storage (Dropbox, OneDrive, etc.)
        </Text>

        <SettingItem
          title="Share Backup File"
          subtitle={isLoading ? "Creating backup..." : "Share backup via any app"}
          onPress={handleShareBackup}
          disabled={isLoading}
        />

        <SettingItem
          title="Restore from Backup"
          subtitle={isLoading ? "Restoring..." : "Select a backup file to restore"}
          onPress={handleRestoreBackup}
          disabled={isLoading}
        />

        {lastBackupDate && (
          <Text style={styles.lastBackupText}>
            Last backup: {new Date(lastBackupDate).toLocaleString()}
          </Text>
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
    </>
  );
};

export default EmailBackupSettings;
