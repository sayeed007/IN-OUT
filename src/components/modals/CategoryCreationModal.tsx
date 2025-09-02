// src/components/modals/CategoryCreationModal.tsx
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAddCategoryMutation } from '../../state/api';
import type { Category, TransactionType } from '../../types/global';

interface CategoryCreationModalProps {
  visible: boolean;
  onClose: () => void;
  onCategoryCreated: (category: Category) => void;
  transactionType: TransactionType;
}

export const CategoryCreationModal: React.FC<CategoryCreationModalProps> = ({
  visible,
  onClose,
  onCategoryCreated,
  transactionType,
}) => {
  const [categoryName, setCategoryName] = useState('');
  const [categoryColor, setCategoryColor] = useState('#6366F1');
  const [categoryIcon, setCategoryIcon] = useState(() => {
    // Set default icon based on transaction type
    return transactionType === 'income' ? '💰' : '🍽️';
  });
  const [isCreating, setIsCreating] = useState(false);
  const [addCategory] = useAddCategoryMutation();

  const resetForm = () => {
    setCategoryName('');
    setCategoryColor('#6366F1');
    setCategoryIcon(getDefaultIcon());
    setIsCreating(false);
  };

  const getDefaultIcon = () => {
    const incomeIcons = ['💰', '💼', '🏆', '💵', '📈', '🎯'];
    const expenseIcons = ['🍽️', '🚗', '🏠', '🛒', '⚡', '🎉'];
    const icons = transactionType === 'income' ? incomeIcons : expenseIcons;
    return icons[0]; // Return first icon as default
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleCreateCategory = async () => {
    if (!categoryName.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    setIsCreating(true);
    try {
      const newCategory = await addCategory({
        name: categoryName.trim(),
        type: transactionType === 'income' ? 'income' : 'expense',
        parentId: null,
        color: categoryColor,
        icon: categoryIcon,
        isArchived: false,
      }).unwrap();

      onCategoryCreated(newCategory);
      resetForm();
      onClose();
      Alert.alert('Success', 'Category created successfully!');
    } catch (error) {
      console.error('Failed to create category:', error);
      Alert.alert('Error', 'Failed to create category. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const colorOptions = [
    '#6366F1', // Blue
    '#EF4444', // Red  
    '#10B981', // Green
    '#F59E0B', // Orange
    '#8B5CF6', // Purple
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#F97316', // Orange-600
    '#EC4899', // Pink
    '#64748B', // Slate
  ];

  const getIconOptions = () => {
    if (transactionType === 'income') {
      return ['💰', '💼', '🏆', '💵', '📈', '🎯', '🎁', '💎', '🌟', '🏅'];
    } else {
      return ['🍽️', '🚗', '🏠', '🛒', '⚡', '🎉', '🏥', '📚', '✈️', '🎬'];
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleClose}
            style={styles.closeButton}
          >
            <Text style={styles.closeText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Add Category</Text>
          <TouchableOpacity
            onPress={handleCreateCategory}
            style={[styles.saveButton, isCreating && styles.saveButtonDisabled]}
            disabled={isCreating}
          >
            <Text style={[styles.saveText, isCreating && styles.saveTextDisabled]}>
              {isCreating ? 'Creating...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.content}>
          <View style={styles.field}>
            <Text style={styles.label}>Category Name</Text>
            <TextInput
              style={styles.input}
              value={categoryName}
              onChangeText={setCategoryName}
              placeholder="Enter category name"
              autoFocus
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Icon</Text>
            <View style={styles.iconSelector}>
              {getIconOptions().map((icon) => (
                <TouchableOpacity
                  key={icon}
                  style={[
                    styles.iconButton,
                    categoryIcon === icon && styles.iconButtonActive
                  ]}
                  onPress={() => setCategoryIcon(icon)}
                >
                  <Text style={styles.iconText}>{icon}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Color</Text>
            <View style={styles.colorSelector}>
              {colorOptions.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorButton,
                    { backgroundColor: color },
                    categoryColor === color && styles.colorButtonActive
                  ]}
                  onPress={() => setCategoryColor(color)}
                />
              ))}
            </View>
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.infoLabel}>Type:</Text>
            <Text style={[
              styles.infoValue,
              { color: transactionType === 'income' ? '#10B981' : '#EF4444' }
            ]}>
              {transactionType === 'income' ? 'Income' : 'Expense'}
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  closeText: {
    fontSize: 16,
    color: '#6B7280',
  },
  saveButton: {
    padding: 4,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366F1',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveTextDisabled: {
    color: '#9CA3AF',
  },
  content: {
    padding: 20,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  iconSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonActive: {
    borderColor: '#6366F1',
    backgroundColor: '#EEF2FF',
  },
  iconText: {
    fontSize: 20,
  },
  colorSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorButtonActive: {
    borderColor: '#111827',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
});