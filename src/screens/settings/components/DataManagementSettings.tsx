// src/screens/settings/components/DataManagementSettings.tsx
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
  data?: any; // For passing additional data like file paths
}

const DataManagementSettings: React.FC = () => {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [modal, setModal] = useState<ModalState>({
    type: null,
    title: '',
    message: '',
  });

  const styles = StyleSheet.create({
    section: {
      marginHorizontal: Spacing.md,
      marginBottom: Spacing.base,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: Spacing.base,
    },
  });

  const handleExportData = async () => {
    if (isLoading) return;

    setModal({
      type: 'confirmation',
      title: 'Export Data',
      message: 'This will export your transactions to a CSV file.',
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

          // Step 1: Export the data (create file)
          const exportResult = await DataManagementService.exportDataToCSV();
          
          // Step 2: Ask if user wants to share the file
          setModal({
            type: 'confirmation',
            title: 'Export Successful!',
            message: `File exported successfully to your device.\n\nWould you like to share the exported file?`,
            confirmText: 'Share',
            icon: 'checkmark-circle',
            data: exportResult, // Pass file info for sharing
            onConfirm: async () => {
              await handleShareExportedFile(exportResult);
            }
          });
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

  const handleShareExportedFile = async (exportResult: { filePath: string; fileName: string }) => {
    setModal({ type: null, title: '', message: '' });
    setIsLoading(true);
    
    try {
      const shareResult = await DataManagementService.shareExportedFile(
        exportResult.filePath, 
        exportResult.fileName
      );
      
      if (shareResult.cancelled) {
        // User cancelled sharing - this is not an error
        setModal({
          type: 'alert',
          title: 'Share Cancelled',
          message: 'File export completed successfully. You can find your exported file in the Downloads folder.',
          alertType: 'info',
        });
      } else if (shareResult.shared) {
        // Successfully shared
        setModal({
          type: 'alert',
          title: 'Shared Successfully',
          message: 'Your data has been exported and shared successfully.',
          alertType: 'success',
        });
      }
    } catch (error) {
      console.error('Sharing failed:', error);
      setModal({
        type: 'alert',
        title: 'Share Failed',
        message: 'File was exported successfully, but sharing failed. You can find your file in the Downloads folder.',
        alertType: 'warning',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportData = async () => {
    if (isLoading) return;

    setModal({
      type: 'confirmation',
      title: 'Import Data',
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

  const handleBackupData = async () => {
    if (isLoading) return;

    setModal({
      type: 'confirmation',
      title: 'Backup Data',
      message: 'This will create a complete backup of all your data as a JSON file.',
      confirmText: 'Backup',
      icon: 'shield-checkmark-outline',
      onConfirm: async () => {
        setModal({ type: null, title: '', message: '' });
        setIsLoading(true);
        
        try {
          // Step 1: Create the backup file
          const backupResult = await DataManagementService.backupAllData();
          
          // Step 2: Ask if user wants to share the backup file
          setModal({
            type: 'confirmation',
            title: 'Backup Successful!',
            message: `Backup file created successfully on your device.\n\nWould you like to share the backup file?`,
            confirmText: 'Share',
            icon: 'checkmark-circle',
            data: backupResult, // Pass file info for sharing
            onConfirm: async () => {
              await handleShareBackupFile(backupResult);
            }
          });
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

  const handleShareBackupFile = async (backupResult: { filePath: string; fileName: string }) => {
    setModal({ type: null, title: '', message: '' });
    setIsLoading(true);
    
    try {
      const shareResult = await DataManagementService.shareBackupFile(
        backupResult.filePath, 
        backupResult.fileName
      );
      
      if (shareResult.cancelled) {
        // User cancelled sharing - this is not an error
        setModal({
          type: 'alert',
          title: 'Share Cancelled',
          message: 'Backup created successfully. You can find your backup file in the Downloads folder.',
          alertType: 'info',
        });
      } else if (shareResult.shared) {
        // Successfully shared
        setModal({
          type: 'alert',
          title: 'Shared Successfully',
          message: 'Your backup has been created and shared successfully.',
          alertType: 'success',
        });
      }
    } catch (error) {
      console.error('Backup sharing failed:', error);
      setModal({
        type: 'alert',
        title: 'Share Failed',
        message: 'Backup was created successfully, but sharing failed. You can find your backup in the Downloads folder.',
        alertType: 'warning',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreData = async () => {
    if (isLoading) return;

    setModal({
      type: 'confirmation',
      title: 'Restore Data',
      message: 'This will restore your data from a backup file. Current data will be replaced.',
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
            message: 'Unable to restore from backup. Please check the file.',
            alertType: 'error',
          });
        } finally {
          setIsLoading(false);
        }
      }
    });
  };

  const closeModal = () => {
    // If user is declining to share an already exported/backed up file, show success message
    if (modal.type === 'confirmation' && modal.data) {
      if (modal.title === 'Export Successful!') {
        setModal({
          type: 'alert',
          title: 'Export Completed',
          message: 'File exported successfully to your device. You can find it in your Downloads folder.',
          alertType: 'success',
        });
      } else if (modal.title === 'Backup Successful!') {
        setModal({
          type: 'alert',
          title: 'Backup Completed',
          message: 'Backup file created successfully on your device. You can find it in your Downloads folder.',
          alertType: 'success',
        });
      } else {
        setModal({ type: null, title: '', message: '' });
      }
    } else {
      setModal({ type: null, title: '', message: '' });
    }
  };

  return (
    <>
      <Card style={styles.section} padding="small">
        <Text style={styles.sectionTitle}>Data Management</Text>

        <SettingItem
          title="Export Data"
          subtitle={isLoading ? "Exporting..." : "Download your data as CSV files"}
          onPress={handleExportData}
        />

        <SettingItem
          title="Import Data"
          subtitle={isLoading ? "Importing..." : "Import transactions from CSV file"}
          onPress={handleImportData}
        />

        <SettingItem
          title="Backup Data"
          subtitle={isLoading ? "Creating backup..." : "Create a complete backup (JSON format)"}
          onPress={handleBackupData}
        />

        <SettingItem
          title="Restore Data"
          subtitle={isLoading ? "Restoring..." : "Restore from a backup file"}
          onPress={handleRestoreData}
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


export default DataManagementSettings;