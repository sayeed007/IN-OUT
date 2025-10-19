// src/screens/settings/components/BackupSettings.tsx
import React, { useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import Card from '../../../components/ui/Card';
import SettingItem from './SettingItem';
import { Spacing } from '../../../theme';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { DataManagementService } from '../../../services/storage/dataManagement';
import ConfirmationModal from '../../../components/modals/ConfirmationModal';
import AlertModal from '../../../components/modals/AlertModal';

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

const BackupSettings: React.FC = () => {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
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
      marginBottom: Spacing.sm,
      lineHeight: 18,
    },
  });

  const handleCreateBackup = async () => {
    if (isLoading) return;

    setModal({
      type: 'confirmation',
      title: 'Create Backup',
      message: 'This will create a complete backup of all your data as a JSON file and open the share menu.',
      confirmText: 'Create & Share',
      icon: 'shield-checkmark-outline',
      onConfirm: async () => {
        setModal({ type: null, title: '', message: '' });
        setIsLoading(true);

        try {
          // Create the backup file
          const backupResult = await DataManagementService.backupAllData();

          // Automatically open share dialog
          const shareResult = await DataManagementService.shareBackupFile(
            backupResult.filePath,
            backupResult.fileName
          );

          if (shareResult.cancelled) {
            setModal({
              type: 'alert',
              title: 'Backup Created',
              message: 'Backup created successfully. You can find your backup file in the Downloads folder.',
              alertType: 'success',
            });
          } else if (shareResult.shared) {
            setModal({
              type: 'alert',
              title: 'Backup Shared',
              message: 'Your backup has been created and shared successfully.',
              alertType: 'success',
            });
          }
        } catch (error) {
          console.error('Backup failed:', error);
          setModal({
            type: 'alert',
            title: 'Backup Failed',
            message: 'Unable to create backup. Please try again.',
            alertType: 'error',
          });
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  const handleRestoreBackup = async () => {
    if (isLoading) return;

    setModal({
      type: 'confirmation',
      title: 'Restore from Backup',
      message: 'This will restore your data from a backup file. Current data will be replaced.\n\nMake sure you select a valid backup file (.json).',
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
              message: 'Data restored successfully. The app will refresh to load the restored data.',
              alertType: 'success',
            });
          }
        } catch (error) {
          console.error('Restore failed:', error);
          setModal({
            type: 'alert',
            title: 'Restore Failed',
            message: 'Unable to restore from backup. Please check the file and try again.',
            alertType: 'error',
          });
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  const handleExportCSV = async () => {
    if (isLoading) return;

    setModal({
      type: 'confirmation',
      title: 'Export to CSV',
      message: 'This will export your transactions to CSV files for use in Excel or other spreadsheet applications.',
      confirmText: 'Export',
      icon: 'download-outline',
      onConfirm: async () => {
        setModal({ type: null, title: '', message: '' });
        setIsLoading(true);

        try {
          const hasData = await DataManagementService.checkDataExists();
          if (!hasData) {
            setModal({
              type: 'alert',
              title: 'No Data to Export',
              message: 'You don\'t have any transactions, accounts, or categories to export yet.',
              alertType: 'warning',
            });
            return;
          }

          const exportResult = await DataManagementService.exportDataToCSV();

          // Automatically open share dialog
          const shareResult = await DataManagementService.shareExportedFile(
            exportResult.filePath,
            exportResult.fileName
          );

          if (shareResult.cancelled) {
            setModal({
              type: 'alert',
              title: 'Export Completed',
              message: 'CSV file exported successfully. You can find it in the Downloads folder.',
              alertType: 'success',
            });
          } else if (shareResult.shared) {
            setModal({
              type: 'alert',
              title: 'Export Shared',
              message: 'Your data has been exported and shared successfully.',
              alertType: 'success',
            });
          }
        } catch (error) {
          console.error('Export failed:', error);
          setModal({
            type: 'alert',
            title: 'Export Failed',
            message: 'Unable to export data. Please try again.',
            alertType: 'error',
          });
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  const handleImportCSV = async () => {
    if (isLoading) return;

    setModal({
      type: 'confirmation',
      title: 'Import from CSV',
      message: 'This will import transactions from a CSV file. Existing data will not be overwritten.',
      confirmText: 'Import',
      icon: 'cloud-upload-outline',
      onConfirm: async () => {
        setModal({ type: null, title: '', message: '' });
        setIsLoading(true);
        try {
          const result = await DataManagementService.importDataFromCSV();
          if (result && result.count > 0) {
            setModal({
              type: 'alert',
              title: 'Import Successful',
              message: `Successfully imported ${result.count} transactions.`,
              alertType: 'success',
            });
          } else if (result === null) {
            setModal({
              type: 'alert',
              title: 'Import Warning',
              message: 'No valid transactions found in the CSV file.',
              alertType: 'warning',
            });
          }
        } catch (error) {
          console.error('Import failed:', error);
          setModal({
            type: 'alert',
            title: 'Import Failed',
            message: 'Unable to import data. Please check your CSV format and try again.',
            alertType: 'error',
          });
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  const closeModal = () => {
    setModal({ type: null, title: '', message: '' });
  };

  return (
    <>
      <Card style={styles.section} padding="small">
        <Text style={styles.sectionTitle}>Backup & Restore</Text>

        <Text style={styles.infoText}>
          Create backups of your data and share them via email, messaging apps, or cloud storage.
        </Text>

        <SettingItem
          title="Create Backup"
          subtitle={isLoading ? "Creating backup..." : "Backup all data and share (JSON format)"}
          onPress={handleCreateBackup}
          disabled={isLoading}
        />

        <SettingItem
          title="Restore from Backup"
          subtitle={isLoading ? "Restoring..." : "Select a backup file to restore"}
          onPress={handleRestoreBackup}
          disabled={isLoading}
        />

        <SettingItem
          title="Export to CSV"
          subtitle={isLoading ? "Exporting..." : "Export transactions for Excel/spreadsheets"}
          onPress={handleExportCSV}
          disabled={isLoading}
        />

        <SettingItem
          title="Import from CSV"
          subtitle={isLoading ? "Importing..." : "Import transactions from CSV file"}
          onPress={handleImportCSV}
          disabled={isLoading}
        />
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
    </>
  );
};

export default BackupSettings;
