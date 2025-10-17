// src/screens/dashboard/components/CompactQuickActions.tsx
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../app/providers/ThemeProvider';

interface CompactQuickActionsProps {
  onAction: (action: string) => void;
}

interface ActionItem {
  id: string;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
}

export const CompactQuickActions: React.FC<CompactQuickActionsProps> = ({ onAction }) => {
  const { theme } = useTheme();

  const isDark = theme.mode === 'dark';

  const actions: ActionItem[] = [
    {
      id: 'add-income',
      label: 'Income',
      icon: 'add-circle',
      color: theme.colors.success[500],
      bgColor: isDark ? theme.colors.dark.surfaceVariant : theme.colors.success[50],
    },
    {
      id: 'add-expense',
      label: 'Expense',
      icon: 'remove-circle',
      color: theme.colors.error[500],
      bgColor: isDark ? theme.colors.dark.surfaceVariant : theme.colors.error[50],
    },
    {
      id: 'transfer',
      label: 'Transfer',
      icon: 'swap-horizontal',
      color: theme.colors.info[500],
      bgColor: isDark ? theme.colors.dark.surfaceVariant : theme.colors.info[50],
    },
    {
      id: 'view-budget',
      label: 'Budget',
      icon: 'pie-chart',
      color: theme.colors.secondary[500],
      bgColor: isDark ? theme.colors.dark.surfaceVariant : theme.colors.secondary[50],
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        Quick Actions
      </Text>
      <View style={styles.actionsContainer}>
        {actions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={styles.actionButton}
            onPress={() => onAction(action.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, { backgroundColor: action.bgColor }]}>
              <Icon name={action.icon} size={24} color={action.color} />
            </View>
            <Text style={[styles.actionLabel, { color: theme.colors.text }]} numberOfLines={1}>
              {action.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 4,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});
