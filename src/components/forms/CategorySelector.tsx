import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import type { Category } from '../../types/global';

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

  const selectedCategory = categories.find(category => category.id === selectedCategoryId);
  const activeCategories = categories.filter(category => !category.isArchived);

  const handleSelectCategory = (categoryId: string) => {
    onSelectCategory(categoryId);
    setIsModalVisible(false);
  };

  const getCategoryTypeColor = (type: Category['type']) => {
    return type === 'income' ? '#10B981' : '#EF4444';
  };

  const getDisplayIcon = (icon: string | undefined) => {
    if (!icon) return '';
    
    // If it's already an emoji, return as is
    if (icon.length <= 4 && /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu.test(icon)) {
      return icon;
    }
    
    // Map common icon names to emojis (fallback for old data)
    const iconMap: { [key: string]: string } = {
      'folder': '📁',
      'food': '🍽️',
      'dining': '🍽️',
      'transport': '🚗',
      'car': '🚗',
      'money': '💰',
      'salary': '💰',
      'home': '🏠',
      'shopping': '🛒',
      'entertainment': '🎉',
      'health': '🏥',
      'education': '📚',
    };
    
    // Try to find a match in the icon map
    const lowerIcon = icon.toLowerCase();
    return iconMap[lowerIcon] || '📁'; // Default fallback
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
      outputRange: ['#9CA3AF', '#6366F1'],
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
              <Icon name="add-circle-outline" size={20} color="#6366F1" />
            </TouchableOpacity>
          )}
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.selector,
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
              <Text style={styles.categoryName}>{selectedCategory.name}</Text>
              <Text style={[
                styles.categoryType,
                { color: getCategoryTypeColor(selectedCategory.type) }
              ]}>
                {selectedCategory.type.charAt(0).toUpperCase() + selectedCategory.type.slice(1)}
              </Text>
            </View>
            {selectedCategory.icon && (
              <Text style={styles.categoryIcon}>{getDisplayIcon(selectedCategory.icon)}</Text>
            )}
          </View>
        ) : (
          <Text style={[
            styles.placeholder,
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
              <Icon name="add-circle-outline" size={18} color="#6366F1" />
            </TouchableOpacity>
          )}
          <Icon name="chevron-down" size={20} color="#9CA3AF" />
        </View>
      </TouchableOpacity>

      {isModalVisible &&
        <Modal
          visible={isModalVisible}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsModalVisible(false)}
              >
                <Icon name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.categoryList}>
              {activeCategories.length > 0 ? (
                activeCategories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryItem,
                      selectedCategoryId === category.id && styles.selectedCategoryItem
                    ]}
                    onPress={() => handleSelectCategory(category.id)}
                  >
                    <View style={styles.categoryItemContent}>
                      <View
                        style={[
                          styles.categoryItemColorDot,
                          { backgroundColor: category.color }
                        ]}
                      />
                      <View style={styles.categoryItemInfo}>
                        <Text style={styles.categoryItemName}>{category.name}</Text>
                        <Text style={[
                          styles.categoryItemType,
                          { color: getCategoryTypeColor(category.type) }
                        ]}>
                          {category.type.charAt(0).toUpperCase() + category.type.slice(1)}
                        </Text>
                      </View>
                      {category.icon && (
                        <Text style={styles.categoryItemIcon}>{getDisplayIcon(category.icon)}</Text>
                      )}
                    </View>
                    {selectedCategoryId === category.id && (
                      <Icon name="checkmark" size={20} color="#10B981" />
                    )}
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Icon name="pricetag-outline" size={48} color="#9CA3AF" />
                  <Text style={styles.emptyStateTitle}>No categories found</Text>
                  <Text style={styles.emptyStateSubtitle}>
                    Add categories in settings to get started
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </Modal>
      }
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
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    minHeight: 48,
  },
  compactSelector: {
    paddingVertical: 10,
    minHeight: 44,
  },
  floatingSelector: {
    borderColor: '#6366F1',
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
    color: '#111827',
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
    color: '#9CA3AF',
    flex: 1,
  },
  floatingPlaceholder: {
    color: 'transparent',
  },
  modal: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  categoryList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  selectedCategoryItem: {
    backgroundColor: '#F0FDF4',
  },
  categoryItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryItemColorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  categoryItemInfo: {
    flex: 1,
  },
  categoryItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  categoryItemType: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },
  categoryItemIcon: {
    fontSize: 20,
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
});

export default CategorySelector;
