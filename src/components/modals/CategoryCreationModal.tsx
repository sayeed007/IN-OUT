// src/components/modals/CategoryCreationModal.tsx
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../app/providers/ThemeProvider';
import { useAddCategoryMutation } from '../../state/api';
import type { Category, TransactionType } from '../../types/global';
import { CATEGORY_COLORS, CATEGORY_ICONS, CATEGORY_TYPES } from '../../utils/constants/categories';
import LoadingSpinner from '../ui/LoadingSpinner';
import { showToast } from '../../utils/helpers/toast';

interface CategoryCreationModalProps {
  visible: boolean;
  onClose: () => void;
  onCategoryCreated: (category: Category) => void;
  type?: TransactionType;
}

export const CategoryCreationModal: React.FC<CategoryCreationModalProps> = ({
  visible,
  onClose,
  onCategoryCreated,
  type = 'expense',
}) => {
  const { theme } = useTheme();
  const [categoryName, setCategoryName] = useState('');
  const [categoryType, setCategoryType] = useState<Category['type']>(type as Category['type']);
  const [categoryColor, setCategoryColor] = useState<string>(CATEGORY_COLORS[0]);
  const [categoryIcon, setCategoryIcon] = useState<string>(() => {
    return type === 'income' ? CATEGORY_ICONS.income[0] : CATEGORY_ICONS.expense[0];
  });
  const [isCreating, setIsCreating] = useState(false);
  const [addCategory] = useAddCategoryMutation();

  const resetForm = () => {
    setCategoryName('');
    setCategoryType(type as Category['type']);
    setCategoryColor(CATEGORY_COLORS[0]);
    setCategoryIcon(getDefaultIcon());
    setIsCreating(false);
  };

  const getDefaultIcon = () => {
    const icons = categoryType === 'income' ? CATEGORY_ICONS.income : CATEGORY_ICONS.expense;
    return icons[0]; // Return first icon as default
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleCreateCategory = async () => {
    if (!categoryName.trim()) {
      showToast.error('Please enter a category name');
      return;
    }

    setIsCreating(true);
    try {
      const newCategory = await addCategory({
        name: categoryName.trim(),
        type: categoryType,
        parentId: null,
        color: categoryColor,
        icon: categoryIcon,
        isArchived: false,
      }).unwrap();

      onCategoryCreated(newCategory);
      resetForm();
      onClose();
      showToast.success('Category created successfully!');
    } catch (error) {
      console.error('Failed to create category:', error);
      showToast.error('Failed to create category. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const getCategoryTypeColor = (categoryTypeValue: Category['type']) => {
    switch (categoryTypeValue) {
      case 'income': return theme.colors.income.main || '#10B981';
      case 'expense': return theme.colors.expense.main || '#EF4444';
      default: return theme.colors.neutral[500] || '#64748B';
    }
  };

  const getIconOptions = () => {
    return categoryType === 'income' ? CATEGORY_ICONS.income : CATEGORY_ICONS.expense;
  };

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
    },
    keyboardAvoid: {
      justifyContent: 'flex-end',
    },
    modalContent: {
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      height: '95%',
      backgroundColor: theme.colors.background,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
    },
    scrollContainer: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingBottom: 40,
    },
    section: {
      marginVertical: 12,
    },
    sectionMargin: {
      marginHorizontal: 20,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 12,
    },
    textInput: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      color: theme.colors.text,
      backgroundColor: theme.colors.surface,
    },
    typeSelector: {
      gap: 12,
    },
    typeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    typeButtonActive: {
      borderColor: getCategoryTypeColor(categoryType),
      backgroundColor: `${getCategoryTypeColor(categoryType)}15`,
    },
    typeButtonLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
    },
    radioButton: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      justifyContent: 'center',
      alignItems: 'center',
    },
    radioButtonInner: {
      width: 12,
      height: 12,
      borderRadius: 6,
    },
    typeInfo: {
      flex: 1,
    },
    typeName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 4,
    },
    typeDescription: {
      fontSize: 13,
      color: theme.colors.textSecondary,
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
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
    },
    iconButtonActive: {
      borderColor: categoryColor,
      backgroundColor: `${categoryColor}10`,
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
      borderColor: theme.colors.text,
    },
    createButton: {
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 20,
      marginVertical: 12,
      backgroundColor: theme.colors.primary[500],
    },
    createButtonDisabled: {
      opacity: 0.6,
    },
    createButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.onPrimary,
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Category</Text>
              <TouchableOpacity onPress={handleClose} disabled={isCreating}>
                <Icon name="close" size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Category Name */}
            <View style={[styles.section, styles.sectionMargin]}>
              <Text style={styles.sectionTitle}>Category Name</Text>
              <TextInput
                style={styles.textInput}
                value={categoryName}
                onChangeText={setCategoryName}
                placeholder="e.g. Groceries, Salary, Entertainment"
                placeholderTextColor={theme.colors.textSecondary}
                autoCapitalize="words"
                autoFocus
              />
            </View>

            <ScrollView
              style={styles.scrollContainer}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >

              {/* Category Type */}
              <View>
                <Text style={styles.sectionTitle}>Category Type</Text>
                <View style={styles.typeSelector}>
                  {CATEGORY_TYPES.map((typeOption) => {
                    const isSelected = categoryType === typeOption.value;
                    const typeColor = getCategoryTypeColor(typeOption.value);

                    return (
                      <TouchableOpacity
                        key={typeOption.value}
                        style={[
                          styles.typeButton,
                          {
                            backgroundColor: isSelected
                              ? `${typeColor}15`
                              : theme.colors.surface,
                            borderColor: isSelected ? typeColor : theme.colors.border,
                          }
                        ]}
                        onPress={() => setCategoryType(typeOption.value)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.typeButtonLeft}>
                          <View style={[styles.radioButton, { borderColor: isSelected ? typeColor : theme.colors.border }]}>
                            {isSelected && (
                              <View style={[styles.radioButtonInner, { backgroundColor: typeColor }]} />
                            )}
                          </View>
                          <View style={styles.typeInfo}>
                            <Text style={styles.typeName}>{typeOption.label}</Text>
                            <Text style={styles.typeDescription}>
                              {typeOption.description}
                            </Text>
                          </View>
                        </View>
                        <Icon name={typeOption.icon} size={20} color={typeColor} />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Category Icon */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Category Icon</Text>
                <View style={styles.iconSelector}>
                  {getIconOptions().map((iconName) => (
                    <TouchableOpacity
                      key={iconName}
                      style={[
                        styles.iconButton,
                        categoryIcon === iconName && styles.iconButtonActive
                      ]}
                      onPress={() => setCategoryIcon(iconName)}
                    >
                      <Icon name={iconName} size={20} color={categoryIcon === iconName ? categoryColor : theme.colors.textSecondary} />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Category Color */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Category Color</Text>
                <View style={styles.colorSelector}>
                  {CATEGORY_COLORS.map((color) => (
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
            </ScrollView>

            {/* Create Button */}
            <TouchableOpacity
              style={[
                styles.createButton,
                isCreating && styles.createButtonDisabled
              ]}
              onPress={handleCreateCategory}
              disabled={isCreating}
              activeOpacity={0.8}
            >
              {isCreating ? (
                <LoadingSpinner size="small" color={theme.colors.onPrimary} />
              ) : (
                <Text style={styles.createButtonText}>
                  Create Category
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );


};

