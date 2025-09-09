// src/components/modals/CategoryCreationModal.tsx
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
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
import type { Category } from '../../types/global';
import Card from '../ui/Card';
import LoadingSpinner from '../ui/LoadingSpinner';
import { CATEGORY_TYPES, CATEGORY_COLORS, CATEGORY_ICONS } from '../../utils/constants/categories';

interface CategoryCreationModalProps {
  visible: boolean;
  onClose: () => void;
  onCategoryCreated: (category: Category) => void;
  type?: 'income' | 'expense';
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
      Alert.alert('Error', 'Please enter a category name');
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
      Alert.alert('Success', 'Category created successfully!');
    } catch (error) {
      console.error('Failed to create category:', error);
      Alert.alert('Error', 'Failed to create category. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const getCategoryTypeColor = (categoryTypeValue: Category['type']) => {
    switch (categoryTypeValue) {
      case 'income': return theme.colors.success[500] || '#10B981';
      case 'expense': return theme.colors.error[500] || '#EF4444';
      default: return theme.colors.neutral[500] || '#64748B';
    }
  };

  const getIconOptions = () => {
    return categoryType === 'income' ? CATEGORY_ICONS.income : CATEGORY_ICONS.expense;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
    },
    headerButton: {
      padding: 4,
      minWidth: 60,
    },
    cancelText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
    saveText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.primary[500],
      textAlign: 'right',
    },
    saveTextDisabled: {
      color: theme.colors.textTertiary,
    },
    scrollContent: {
      flexGrow: 1,
      padding: 20,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 12,
    },
    inputCard: {
      padding: 16,
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
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    typeButtonActive: {
      borderColor: getCategoryTypeColor(categoryType),
      backgroundColor: `${getCategoryTypeColor(categoryType)}10`,
    },
    typeIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
      backgroundColor: theme.colors.surfaceVariant,
    },
    typeIconContainerActive: {
      backgroundColor: getCategoryTypeColor(categoryType),
    },
    typeContent: {
      flex: 1,
    },
    typeName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 2,
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
    keyboardAvoidingView: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Add Category</Text>
          <TouchableOpacity
            onPress={handleCreateCategory}
            style={styles.headerButton}
            disabled={isCreating}
          >
            {isCreating ? (
              <LoadingSpinner size="small" color={theme.colors.primary[500]} />
            ) : (
              <Text style={[styles.saveText, isCreating && styles.saveTextDisabled]}>
                Save
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Category Name */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Category Name</Text>
              <Card style={styles.inputCard}>
                <TextInput
                  style={styles.textInput}
                  value={categoryName}
                  onChangeText={setCategoryName}
                  placeholder="e.g. Groceries, Salary, Entertainment"
                  placeholderTextColor={theme.colors.textSecondary}
                  autoCapitalize="words"
                  autoFocus
                />
              </Card>
            </View>

            {/* Category Type */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Category Type</Text>
              <View style={styles.typeSelector}>
                {CATEGORY_TYPES.map((typeOption) => (
                  <TouchableOpacity
                    key={typeOption.value}
                    style={[
                      styles.typeButton,
                      categoryType === typeOption.value && styles.typeButtonActive
                    ]}
                    onPress={() => setCategoryType(typeOption.value)}
                    activeOpacity={0.7}
                  >
                    <View style={[
                      styles.typeIconContainer,
                      categoryType === typeOption.value && styles.typeIconContainerActive
                    ]}>
                      <Icon
                        name={typeOption.icon}
                        size={20}
                        color={categoryType === typeOption.value ? theme.colors.surface : getCategoryTypeColor(typeOption.value)}
                      />
                    </View>
                    <View style={styles.typeContent}>
                      <Text style={styles.typeName}>{typeOption.label}</Text>
                      <Text style={styles.typeDescription}>
                        {typeOption.description}
                      </Text>
                    </View>
                    {categoryType === typeOption.value && (
                      <Icon name="checkmark-circle" size={24} color={getCategoryTypeColor(typeOption.value)} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Category Icon */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Category Icon</Text>
              <Card style={styles.inputCard}>
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
              </Card>
            </View>

            {/* Category Color */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Category Color</Text>
              <Card style={styles.inputCard}>
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
              </Card>
            </View>
          </ScrollView>

        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};