// src/screens/settings/CategoryFormScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Card from '../../components/ui/Card';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useTheme } from '../../app/providers/ThemeProvider';
import { GradientHeader } from '../../components/ui/GradientHeader';
import {
  useGetCategoryQuery,
  useAddCategoryMutation,
  useUpdateCategoryMutation
} from '../../state/api';
import type { Category } from '../../types/global';
import type { SettingsStackParamList } from '../../app/navigation/types';
import BottomSpacing from '../../components/ui/BottomSpacing';
import { CATEGORY_TYPES, CATEGORY_COLORS, CATEGORY_ICONS } from '../../utils/constants/categories';
import { showToast } from '../../utils/helpers/toast';

type CategoryFormRouteProp = RouteProp<SettingsStackParamList, 'CategoryForm'>;

export const CategoryFormScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<CategoryFormRouteProp>();
  const categoryId = route.params?.categoryId;
  const isEditing = !!categoryId;

  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState<Category['type']>('expense');
  const [color, setColor] = useState<string>(CATEGORY_COLORS[0]);
  const [icon, setIcon] = useState('restaurant-outline');
  const [isArchived, setIsArchived] = useState(false);

  // API hooks
  const {
    data: category,
    isLoading: isLoadingCategory
  } = useGetCategoryQuery(categoryId!, { skip: !categoryId });

  const [addCategory, { isLoading: isAdding }] = useAddCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();

  const isLoading = isAdding || isUpdating;

  // Load category data when editing
  useEffect(() => {
    if (category && isEditing) {
      setName(category.name);
      setType(category.type);
      setColor(category.color || CATEGORY_COLORS[0]);
      setIcon(category.icon || 'restaurant-outline');
      setIsArchived(category.isArchived);
    }
  }, [category, isEditing]);

  const getCategoryTypeColor = (categoryType: Category['type']) => {
    switch (categoryType) {
      case 'income': return theme.colors.success[500];
      case 'expense': return theme.colors.error[500];
      default: return theme.colors.neutral[500];
    }
  };

  const styles = StyleSheet.create({
    keyboardAvoidingViewStyle: {
      flex: 1,
    },
    container: {
      flex: 1,
      backgroundColor: '#f8fafc',
    },
    content: {
      flex: 1,
      backgroundColor: '#f8fafc',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 16,
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: 12,
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
      fontSize: 14,
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
      borderColor: getCategoryTypeColor(type),
      backgroundColor: `${getCategoryTypeColor(type)}10`,
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
      backgroundColor: getCategoryTypeColor(type),
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
      fontSize: 12,
      color: theme.colors.textSecondary,
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
    iconSelector: {
      flexDirection: 'row',
      justifyContent: 'space-between',
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
      borderColor: color,
      backgroundColor: `${color}10`,
    },
    iconText: {
      fontSize: 20,
    },
    toggleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 8,
    },
    toggleInfo: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between'
    },
    toggleTextContainer: {
      width: '60%'
    },
    toggleLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 4,
    },
    toggleHint: {
      fontSize: 10,
      color: theme.colors.textSecondary,
    },
    toggle: {
      width: 50,
      height: 30,
      borderRadius: 15,
      backgroundColor: theme.colors.neutral[300],
      justifyContent: 'center',
      paddingHorizontal: 2,
    },
    toggleActive: {
      backgroundColor: theme.colors.primary[500],
      alignItems: 'flex-end',
    },
    toggleThumb: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: theme.colors.surface,
    },
    actionContainer: {
      flexDirection: 'row',
      paddingBottom: 40,
      gap: 12,
    },
    cancelButton: {
      flex: 1,
      paddingVertical: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
    },
    cancelButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    submitButton: {
      flex: 2,
      paddingVertical: 16,
      borderRadius: 12,
      backgroundColor: theme.colors.primary[500],
      alignItems: 'center',
      justifyContent: 'center',
    },
    submitButtonDisabled: {
      opacity: 0.6,
    },
    submitButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.surface,
    },
  });

  const handleSubmit = async () => {
    // Validation
    if (!name.trim()) {
      showToast.error('Please enter a category name', 'Validation Error');
      return;
    }

    try {
      const categoryData: Partial<Category> = {
        name: name.trim(),
        type,
        color,
        icon,
        isArchived,
        parentId: null, // For now, we don't support subcategories in this form
      };

      if (isEditing && categoryId) {
        await updateCategory({ id: categoryId, ...categoryData }).unwrap();
        showToast.success('Category updated successfully');
        navigation.goBack();
      } else {
        await addCategory(categoryData).unwrap();
        showToast.success('Category created successfully');
        navigation.goBack();
      }
    } catch (error) {
      showToast.error(`Failed to ${isEditing ? 'update' : 'create'} category. Please try again.`);
    }
  };

  if (isLoadingCategory) {
    return (
      <View style={styles.container}>
        <GradientHeader
          title={isEditing ? 'Edit Category' : 'Create Category'}
          subtitle={isEditing ? 'Update category details' : 'Add a new category'}
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
        />
        <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
          <LoadingSpinner size="large" />
          <Text style={styles.loadingText}>Loading category...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GradientHeader
        title={isEditing ? 'Edit Category' : 'Create Category'}
        subtitle={isEditing ? 'Update category details' : 'Add a new category'}
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingViewStyle}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >

          {/* Category Name */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category Name</Text>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Groceries, Salary, Entertainment"
              placeholderTextColor={theme.colors.textSecondary}
              autoCapitalize="words"
            />
          </View>

          {/* Category Type */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category Type</Text>
            <View style={styles.typeSelector}>
              {CATEGORY_TYPES.map((categoryType) => (
                <TouchableOpacity
                  key={categoryType.value}
                  style={[
                    styles.typeButton,
                    type === categoryType.value && styles.typeButtonActive
                  ]}
                  onPress={() => setType(categoryType.value)}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.typeIconContainer,
                    type === categoryType.value && styles.typeIconContainerActive
                  ]}>
                    <Icon
                      name={categoryType.icon}
                      size={20}
                      color={type === categoryType.value ? theme.colors.surface : getCategoryTypeColor(categoryType.value)}
                    />
                  </View>
                  <View style={styles.typeContent}>
                    <Text style={styles.typeName}>{categoryType.label}</Text>
                    <Text style={styles.typeDescription}>
                      {categoryType.description}
                    </Text>
                  </View>
                  {type === categoryType.value && (
                    <Icon name="checkmark-circle" size={24} color={getCategoryTypeColor(categoryType.value)} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Category Color */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category Color</Text>
            <Card style={styles.inputCard}>
              <View style={styles.colorSelector}>
                {CATEGORY_COLORS.map((colorOption) => (
                  <TouchableOpacity
                    key={colorOption}
                    style={[
                      styles.colorButton,
                      { backgroundColor: colorOption },
                      color === colorOption && styles.colorButtonActive
                    ]}
                    onPress={() => setColor(colorOption)}
                  />
                ))}
              </View>
            </Card>
          </View>

          {/* Category Icon */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category Icon</Text>
            <Card style={styles.inputCard}>
              <View style={styles.iconSelector}>
                {CATEGORY_ICONS[type as keyof typeof CATEGORY_ICONS]?.map((iconOption: string) => (
                  <TouchableOpacity
                    key={iconOption}
                    style={[
                      styles.iconButton,
                      icon === iconOption && styles.iconButtonActive
                    ]}
                    onPress={() => setIcon(iconOption)}
                  >
                    <Icon name={iconOption} size={20} color={icon === iconOption ? color : theme.colors.textSecondary} />
                  </TouchableOpacity>
                ))}              </View>
            </Card>
          </View>

          {/* Archive Toggle (only for editing) */}
          {isEditing && (
            <View style={styles.section}>
              <Card style={styles.inputCard}>
                <View style={styles.toggleInfo}>
                  <View style={styles.toggleTextContainer}>
                    <Text style={styles.toggleLabel}>Archive Category</Text>
                    <Text style={styles.toggleHint}>
                      Archived categories won't appear in transaction forms
                    </Text>
                  </View>


                  <Switch
                    value={isArchived}
                    onValueChange={() => setIsArchived(!isArchived)}
                    trackColor={{ false: '#E5E7EB', true: '#6366F1' }}
                    thumbColor={isArchived ? '#FFFFFF' : '#FFFFFF'}
                  />
                </View>
              </Card>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <LoadingSpinner size="small" color={theme.colors.surface} />
              ) : (
                <Text style={styles.submitButtonText}>
                  {isEditing ? 'Update Category' : 'Create Category'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Bottom spacing for tab bar */}
          <BottomSpacing />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};