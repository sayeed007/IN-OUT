// src/screens/settings/components/DangerZoneSettings.tsx
import React, { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useTheme } from '../../../app/providers/ThemeProvider';
import AlertModal from '../../../components/modals/AlertModal';
import ConfirmationModal from '../../../components/modals/ConfirmationModal';
import Card from '../../../components/ui/Card';
import { Spacing } from '../../../theme';
import { resetDatabase } from '../../../utils/resetDatabase';
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

const DangerZoneSettings: React.FC = () => {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [modal, setModal] = useState<ModalState>({
    type: null,
    title: '',
    message: '',
  });

  const handleResetData = () => {
    if (isLoading) return;

    // First confirmation modal
    setModal({
      type: 'confirmation',
      title: 'Reset All Data',
      message: 'This will permanently delete all your transactions, accounts, and categories. This action cannot be undone.',
      confirmText: 'Reset',
      confirmStyle: 'destructive',
      icon: 'warning-outline',
      onConfirm: () => {
        // Second confirmation modal for extra safety
        setModal({
          type: 'confirmation',
          title: 'Are you absolutely sure?',
          message: 'This action cannot be undone. All your financial data will be permanently deleted.',
          confirmText: 'Delete All',
          confirmStyle: 'destructive',
          icon: 'trash-outline',
          onConfirm: async () => {
            await performReset();
          }
        });
      }
    });
  };

  const performReset = async () => {
    setModal({ type: null, title: '', message: '' });
    setIsLoading(true);

    try {
      await resetDatabase();
      setModal({
        type: 'alert',
        title: 'Reset Successful',
        message: 'All data has been permanently deleted. The app will refresh with fresh seed data.',
        alertType: 'success',
      });
    } catch (error) {
      console.error('Reset failed:', error);
      setModal({
        type: 'alert',
        title: 'Reset Failed',
        message: 'Unable to reset data. Please try again.',
        alertType: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setModal({ type: null, title: '', message: '' });
  };

  const styles = StyleSheet.create({
    section: {
      marginBottom: Spacing.base,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.error[500],
      marginBottom: Spacing.base,
    },
  });

  return (
    <>
      <Card style={styles.section} padding="small">
        <Text style={styles.sectionTitle}>Danger Zone</Text>

        <SettingItem
          title="Reset All Data"
          subtitle={isLoading ? "Resetting..." : "Permanently delete all your data"}
          onPress={handleResetData}
          showArrow={false}
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

export default DangerZoneSettings;