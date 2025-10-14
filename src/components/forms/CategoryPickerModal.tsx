import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../app/providers/ThemeProvider';
import type { Category } from '../../types/global';

const ITEM_HEIGHT = 60;
const VISIBLE_ITEMS = 3;
const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

interface CategoryPickerModalProps {
  visible: boolean;
  categories: Category[];
  selectedCategoryId?: string;
  onSelectCategory: (categoryId: string) => void;
  onClose: () => void;
  title?: string;
}

export const CategoryPickerModal: React.FC<CategoryPickerModalProps> = ({
  visible,
  categories,
  selectedCategoryId,
  onSelectCategory,
  onClose,
  title = 'Select Category'
}) => {
  const { theme } = useTheme();
  const scrollRef = useRef<ScrollView>(null);

  const activeCategories = categories.filter(category => !category.isArchived);
  const [selectedIndex, setSelectedIndex] = useState(() => {
    const currentIndex = activeCategories.findIndex(category => category.id === selectedCategoryId);
    return currentIndex !== -1 ? currentIndex : 0;
  });

  const getCategoryTypeColor = (type: Category['type']) => {
    return type === 'income' ? theme.colors.income.main : theme.colors.expense.main;
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

  const handleConfirm = () => {
    onClose();
  };

  useEffect(() => {
    const currentIndex = activeCategories.findIndex(category => category.id === selectedCategoryId);
    if (currentIndex !== -1) {
      setSelectedIndex(currentIndex);
    }
  }, [selectedCategoryId, activeCategories]);

  useEffect(() => {
    if (visible && scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({
          y: selectedIndex * ITEM_HEIGHT,
          animated: false
        });
      }, 100);
    }
  }, [visible, selectedIndex]);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="slide">
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
          {/* Modal Header */}
          <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {title}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {activeCategories.length > 0 ? (
            <>
              {/* Wheel Picker */}
              <View style={styles.wheelContainer}>
                <View style={[
                  styles.wheelWrapper,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  }
                ]}>
                  <ScrollView
                    ref={scrollRef}
                    style={styles.wheel}
                    contentContainerStyle={styles.wheelContent}
                    showsVerticalScrollIndicator={false}
                    snapToInterval={ITEM_HEIGHT}
                    decelerationRate="fast"
                    onMomentumScrollEnd={handleCategoryScroll}
                  >
                    {activeCategories.map((category, index) => {
                      const isSelected = selectedIndex === index;
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
                              <Text style={StyleSheet.flatten([
                                styles.wheelItemName,
                                {
                                  color: isSelected ? theme.colors.text : theme.colors.textSecondary,
                                  fontWeight: isSelected ? '600' : '400',
                                  fontSize: isSelected ? 16 : 14,
                                }
                              ])}>
                                {category.name}
                              </Text>
                              <Text style={StyleSheet.flatten([
                                styles.wheelItemType,
                                {
                                  color: isSelected ? getCategoryTypeColor(category.type) : theme.colors.textTertiary,
                                  fontSize: isSelected ? 13 : 11,
                                  fontWeight: isSelected ? '500' : '400',
                                }
                              ])}>
                                {category.type.charAt(0).toUpperCase() + category.type.slice(1)}
                              </Text>
                            </View>
                            {category.icon && (
                              <Text style={StyleSheet.flatten([
                                styles.wheelItemIcon,
                                { fontSize: isSelected ? 20 : 16 }
                              ])}>
                                <Icon name={category.icon} size={24} color={category.color || theme.colors.textTertiary} />
                              </Text>
                            )}
                          </View>
                        </View>
                      );
                    })}
                  </ScrollView>
                  {/* Selection overlay */}
                  <View style={[
                    styles.selectionOverlay,
                    {
                      borderColor: theme.colors.primary[500],
                      backgroundColor: `${theme.colors.primary[500]}10`,
                    }
                  ]} />
                </View>
              </View>

              {/* Action Buttons */}
              <View style={[styles.actions, { borderTopColor: theme.colors.border }]}>
                <TouchableOpacity
                  style={[
                    styles.cancelButton,
                    {
                      borderColor: theme.colors.border,
                      backgroundColor: theme.colors.surface,
                    }
                  ]}
                  onPress={onClose}
                >
                  <Text style={[styles.cancelButtonText, { color: theme.colors.textSecondary }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.confirmButton,
                    { backgroundColor: theme.colors.primary[500] }
                  ]}
                  onPress={handleConfirm}
                >
                  <Text style={[styles.confirmButtonText, { color: theme.colors.onPrimary }]}>
                    Confirm
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={styles.emptyState}>
              <Icon name="pricetag-outline" size={48} color={theme.colors.textTertiary} />
              <Text style={[styles.emptyStateTitle, { color: theme.colors.text }]}>
                No categories found
              </Text>
              <Text style={[styles.emptyStateSubtitle, { color: theme.colors.textSecondary }]}>
                Add categories in settings to get started
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
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
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  wheelContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
  },
  wheelWrapper: {
    height: WHEEL_HEIGHT,
    width: '100%',
    maxWidth: 320,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
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
    borderTopWidth: 2,
    borderBottomWidth: 2,
    pointerEvents: 'none',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
});

export default CategoryPickerModal;
