import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import type { Category } from '../../types/global';
import { CategoryPickerModal } from './CategoryPickerModal';
import { useTheme } from '../../app/providers/ThemeProvider';

interface CategorySelectorProps {
  categories: Category[];
  selectedCategoryId?: string;
  onSelectCategory: (categoryId: string) => void;
  placeholder?: string;
  compact?: boolean;
  floatingLabel?: boolean;
  label?: string;
  onQuickAdd?: () => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  placeholder = "Select a category",
  compact = false,
  floatingLabel = false,
  label,
  onQuickAdd
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const labelAnimation = useRef(new Animated.Value(0)).current;
  const { theme } = useTheme();

  const selectedCategory = categories.find(category => category.id === selectedCategoryId);

  const getCategoryTypeColor = (type: Category['type']) => {
    return type === 'income' ? '#10B981' : '#EF4444';
  };

  const hasValue = !!selectedCategory;
  const displayLabel = label || placeholder;

  useEffect(() => {
    if (floatingLabel) {
      Animated.timing(labelAnimation, {
        toValue: hasValue ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [hasValue, floatingLabel, labelAnimation]);


  const labelStyle = {
    fontSize: labelAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [14, 12],
    }),
    color: labelAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [theme.colors.textSecondary, theme.colors.primary[500]],
    }),
  };

  return (
    <View style={[styles.container, compact && styles.compactContainer]}>

      {floatingLabel && (
        <View style={styles.labelContainer}>
          <Animated.Text style={[
            styles.floatingLabel,
            labelStyle
          ]}>
            {displayLabel}
          </Animated.Text>
          {onQuickAdd && (
            <TouchableOpacity
              style={styles.quickAddButton}
              onPress={onQuickAdd}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Icon name="add-circle-outline" size={20} color={theme.colors.primary[500]} />
            </TouchableOpacity>
          )}
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.selector,
          {
            borderColor: floatingLabel ? theme.colors.primary[500] : theme.colors.border,
            backgroundColor: theme.colors.surface
          },
          compact && styles.compactSelector,
          floatingLabel && styles.floatingSelector
        ]}
        onPress={() => setIsModalVisible(true)}
      >
        {selectedCategory ? (
          <View style={styles.selectedCategory}>
            <View
              style={[
                styles.categoryColorDot,
                { backgroundColor: selectedCategory.color }
              ]}
            />
            <View style={styles.categoryInfo}>
              <Text style={[styles.categoryName, { color: theme.colors.text }]}>{selectedCategory.name}</Text>
              <Text style={[
                styles.categoryType,
                { color: getCategoryTypeColor(selectedCategory.type) }
              ]}>
                {selectedCategory.type.charAt(0).toUpperCase() + selectedCategory.type.slice(1)}
              </Text>
            </View>
            {selectedCategory.icon && (
              <Text style={styles.categoryIcon}>
                {/* {getDisplayIcon(selectedCategory.icon)} */}
                <Icon name={selectedCategory.icon} size={24} color={selectedCategory.color} />

              </Text>
            )}
          </View>
        ) : (
          <Text style={[
            styles.placeholder,
            { color: theme.colors.textSecondary },
            floatingLabel && styles.floatingPlaceholder
          ]}>
            {floatingLabel ? '' : placeholder}
          </Text>
        )}
        <View style={styles.rightContent}>
          {!floatingLabel && onQuickAdd && (
            <TouchableOpacity
              style={styles.quickAddButtonInline}
              onPress={onQuickAdd}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Icon name="add-circle-outline" size={18} color={theme.colors.primary[500]} />
            </TouchableOpacity>
          )}
          <Icon name="chevron-down" size={20} color={theme.colors.textSecondary} />
        </View>
      </TouchableOpacity>

      <CategoryPickerModal
        visible={isModalVisible}
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={onSelectCategory}
        onClose={() => setIsModalVisible(false)}
        title="Select Category"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  compactContainer: {
    marginBottom: 12,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  floatingLabel: {
    fontWeight: '500',
  },
  quickAddButton: {
    padding: 2,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 8,
    minHeight: 48,
  },
  compactSelector: {
    paddingVertical: 10,
    minHeight: 44,
  },
  floatingSelector: {
    borderWidth: 1.5,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quickAddButtonInline: {
    padding: 2,
  },
  selectedCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
  },
  categoryType: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },
  categoryIcon: {
    fontSize: 18,
    marginLeft: 8,
  },
  placeholder: {
    fontSize: 16,
    flex: 1,
  },
  floatingPlaceholder: {
    color: 'transparent',
  },
});

export default CategorySelector;
