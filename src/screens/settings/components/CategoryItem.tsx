import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Card from '../../../components/ui/Card';
import Chip from '../../../components/ui/Chip';
import { useTheme } from '../../../app/providers/ThemeProvider';
import type { Category } from '../../../types/global';

interface CategoryItemProps {
  category: Category;
  onEdit: () => void;
  onToggleArchive: () => void;
}

export const CategoryItem: React.FC<CategoryItemProps> = ({ category, onEdit, onToggleArchive }) => {
  const { theme } = useTheme();


  const styles = StyleSheet.create({
    categoryCard: {
      padding: 0,
      marginVertical: 4,
    },
    cardContent: {
      padding: 16,
    },
    mainRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    leftSection: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    categoryColorDot: {
      width: 16,
      height: 16,
      borderRadius: 8,
      marginRight: 12,
    },
    categoryDetails: {
      flex: 1,
      marginRight: 12,
    },
    categoryName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 6,
    },
    categoryMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    typeChip: {
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    incomeChip: {
      backgroundColor: theme.colors.income.light,
    },
    expenseChip: {
      backgroundColor: theme.colors.expense.light,
    },
    typeChipText: {
      fontSize: 12,
      fontWeight: '500',
    },
    incomeChipText: {
      color: theme.colors.income.main,
    },
    expenseChipText: {
      color: theme.colors.expense.main,
    },
    categoryIcon: {
      fontSize: 16,
    },
    rightSection: {
      alignItems: 'flex-end',
    },
    actionButtons: {
      flexDirection: 'row',
      gap: 8,
    },
    actionButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surfaceVariant,
    },
    editButton: {
      backgroundColor: `${theme.colors.primary[500]}15`,
    },
    archiveButton: {
      backgroundColor: theme.colors.surfaceVariant,
    },
    archiveActiveButton: {
      backgroundColor: `${theme.colors.error[500]}15`,
    },
    archivedBadge: {
      position: 'absolute',
      top: 8,
      right: 8,
      paddingVertical: 3,
      paddingHorizontal: 6,
      backgroundColor: theme.colors.warning[50] || '#FEF3C7',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.warning[500] || '#F59E0B',
    },
    archivedText: {
      fontSize: 10,
      fontWeight: '600',
      color: theme.colors.warning[700] || '#92400E',
      textTransform: 'uppercase',
      letterSpacing: 0.3,
    },
    archivedOverlay: {
      opacity: 0.7,
    },
  });

  return (
    <Card
      variant="elevated"
      padding="none"
      borderRadius="medium"
      style={StyleSheet.flatten([styles.categoryCard, category.isArchived && styles.archivedOverlay])}
    >
      <View style={styles.cardContent}>
        <View style={styles.mainRow}>
          <View style={styles.leftSection}>
            <View style={[styles.categoryColorDot, { backgroundColor: category.color }]} />
            <View style={styles.categoryDetails}>
              <Text style={styles.categoryName}>{category.name}</Text>
              <View style={styles.categoryMeta}>
                <Chip
                  label={category.type === 'income' ? 'Income' : 'Expense'}
                  selected={true}
                  style={StyleSheet.flatten([
                    styles.typeChip,
                    category.type === 'income' ? styles.incomeChip : styles.expenseChip
                  ])}
                  textStyle={StyleSheet.flatten([
                    styles.typeChipText,
                    category.type === 'income' ? styles.incomeChipText : styles.expenseChipText
                  ])}
                />
                {category.icon && (
                  <Icon
                    name={category.icon}
                    size={16}
                    color={theme.colors.primary[600]}
                  />
                )}
              </View>
            </View>
          </View>

          <View style={styles.rightSection}>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={onEdit}
                activeOpacity={0.7}
              >
                <Icon
                  name="pencil"
                  size={16}
                  color={theme.colors.primary[600]}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  styles.archiveButton,
                  category.isArchived && styles.archiveActiveButton
                ]}
                onPress={onToggleArchive}
                activeOpacity={0.7}
              >
                <Icon
                  name={category.isArchived ? "archive" : "archive-outline"}
                  size={16}
                  color={category.isArchived ? theme.colors.error[600] : theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {category.isArchived && (
        <View style={styles.archivedBadge}>
          <Text style={styles.archivedText}>Archived</Text>
        </View>
      )}
    </Card>
  );
};