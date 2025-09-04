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

const ITEM_HEIGHT = 60;
const VISIBLE_ITEMS = 3;
const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

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
  const [selectedIndex, setSelectedIndex] = useState(0);
  const labelAnimation = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<ScrollView>(null);

  const selectedCategory = categories.find(category => category.id === selectedCategoryId);
  const activeCategories = categories.filter(category => !category.isArchived);

  const handleSelectCategory = (categoryId: string) => {
    onSelectCategory(categoryId);
    setIsModalVisible(false);
  };

  const handleCategoryScroll = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(activeCategories.length - 1, index));
    
    if (clampedIndex !== selectedIndex) {
      setSelectedIndex(clampedIndex);
      const selectedCategory = activeCategories[clampedIndex];
      if (selectedCategory) {
        onSelectCategory(selectedCategory.id);
      }
    }
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

  useEffect(() => {
    const currentIndex = activeCategories.findIndex(category => category.id === selectedCategoryId);
    if (currentIndex !== -1) {
      setSelectedIndex(currentIndex);
    }
  }, [selectedCategoryId, activeCategories]);

  useEffect(() => {
    if (isModalVisible && scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({
          y: selectedIndex * ITEM_HEIGHT,
          animated: false
        });
      }, 100);
    }
  }, [isModalVisible, selectedIndex]);

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

            {activeCategories.length > 0 ? (
              <>
                {/* Selected Display */}
                <View style={styles.selectedDisplay}>
                  <Text style={styles.selectedLabel}>Selected Category:</Text>
                  <View style={styles.selectedCategoryDisplay}>
                    {selectedCategory && (
                      <>
                        <View
                          style={[
                            styles.selectedCategoryColorDot,
                            { backgroundColor: selectedCategory.color }
                          ]}
                        />
                        <View style={styles.selectedCategoryInfo}>
                          <Text style={styles.selectedCategoryName}>{selectedCategory.name}</Text>
                          <Text style={[
                            styles.selectedCategoryType,
                            { color: getCategoryTypeColor(selectedCategory.type) }
                          ]}>
                            {selectedCategory.type.charAt(0).toUpperCase() + selectedCategory.type.slice(1)}
                          </Text>
                        </View>
                        {selectedCategory.icon && (
                          <Text style={styles.selectedCategoryIcon}>{getDisplayIcon(selectedCategory.icon)}</Text>
                        )}
                      </>
                    )}
                  </View>
                </View>

                {/* Wheel Picker */}
                <View style={styles.wheelContainer}>
                  <Text style={styles.wheelLabel}>Select Category</Text>
                  <View style={styles.wheelWrapper}>
                    <ScrollView
                      ref={scrollRef}
                      style={styles.wheel}
                      contentContainerStyle={styles.wheelContent}
                      showsVerticalScrollIndicator={false}
                      snapToInterval={ITEM_HEIGHT}
                      decelerationRate="fast"
                      onMomentumScrollEnd={handleCategoryScroll}
                    >
                      {activeCategories.map((category) => {
                        const isSelected = selectedCategoryId === category.id;
                        return (
                          <View key={category.id} style={styles.wheelItem}>
                            <View style={styles.wheelItemContent}>
                              <View
                                style={[
                                  styles.wheelItemColorDot,
                                  { backgroundColor: category.color },
                                  isSelected && styles.wheelItemColorDotSelected
                                ]}
                              />
                              <View style={styles.wheelItemInfo}>
                                <Text style={[
                                  styles.wheelItemName,
                                  {
                                    color: isSelected ? '#111827' : '#6B7280',
                                    fontWeight: isSelected ? '600' : '400',
                                    fontSize: isSelected ? 16 : 14
                                  }
                                ]}>
                                  {category.name}
                                </Text>
                                <Text style={[
                                  styles.wheelItemType,
                                  {
                                    color: isSelected ? getCategoryTypeColor(category.type) : '#9CA3AF',
                                    fontSize: isSelected ? 14 : 12,
                                    fontWeight: isSelected ? '500' : '400'
                                  }
                                ]}>
                                  {category.type.charAt(0).toUpperCase() + category.type.slice(1)}
                                </Text>
                              </View>
                              {category.icon && (
                                <Text style={[
                                  styles.wheelItemIcon,
                                  { fontSize: isSelected ? 20 : 16 }
                                ]}>
                                  {getDisplayIcon(category.icon)}
                                </Text>
                              )}
                            </View>
                          </View>
                        );
                      })}
                    </ScrollView>
                    {/* Selection overlay */}
                    <View style={styles.selectionOverlay} />
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setIsModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={() => setIsModalVisible(false)}
                  >
                    <Text style={styles.confirmButtonText}>Confirm</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <ScrollView style={styles.categoryList}>
                <View style={styles.emptyState}>
                  <Icon name="pricetag-outline" size={48} color="#9CA3AF" />
                  <Text style={styles.emptyStateTitle}>No categories found</Text>
                  <Text style={styles.emptyStateSubtitle}>
                    Add categories in settings to get started
                  </Text>
                </View>
              </ScrollView>
            )}
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
  selectedDisplay: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#F9FAFB',
  },
  selectedLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  selectedCategoryDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedCategoryColorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  selectedCategoryInfo: {
    alignItems: 'center',
  },
  selectedCategoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  selectedCategoryType: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },
  selectedCategoryIcon: {
    fontSize: 20,
    marginLeft: 8,
  },
  wheelContainer: {
    paddingHorizontal: 40,
    paddingVertical: 24,
    alignItems: 'center',
  },
  wheelLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
    color: '#111827',
  },
  wheelWrapper: {
    height: WHEEL_HEIGHT,
    width: 280,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  wheel: {
    flex: 1,
  },
  wheelContent: {
    paddingVertical: ITEM_HEIGHT * 1,
  },
  wheelItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  wheelItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  wheelItemColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  wheelItemColorDotSelected: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  wheelItemInfo: {
    flex: 1,
  },
  wheelItemName: {
    textAlign: 'center',
  },
  wheelItemType: {
    textAlign: 'center',
    marginTop: 2,
  },
  wheelItemIcon: {
    marginLeft: 8,
  },
  selectionOverlay: {
    position: 'absolute',
    top: ITEM_HEIGHT * 1,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#6366F1',
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
    pointerEvents: 'none',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: 'transparent',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default CategorySelector;
