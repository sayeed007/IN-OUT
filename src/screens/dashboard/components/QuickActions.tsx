import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../app/providers/ThemeProvider';
import Card from '../../../components/ui/Card';

interface QuickActionsProps {
  onAction: (action: string) => void;
}

interface ActionItem {
  id: string;
  label: string;
  icon: string;
  color: string;
  backgroundColor: string;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onAction }) => {
  const { theme } = useTheme();

  const actions: ActionItem[] = [
    {
      id: 'add-income',
      label: 'Add Income',
      icon: 'trending-up',
      color: theme.colors.success[500],
      backgroundColor: theme.colors.success[500] + '20',
    },
    {
      id: 'add-expense',
      label: 'Add Expense',
      icon: 'trending-down',
      color: theme.colors.error[500],
      backgroundColor: theme.colors.error[500] + '20',
    },
    {
      id: 'transfer',
      label: 'Transfer',
      icon: 'swap-horizontal',
      color: theme.colors.info[500],
      backgroundColor: theme.colors.info[500] + '20',
    },
    {
      id: 'view-budget',
      label: 'Budget',
      icon: 'pie-chart',
      color: theme.colors.secondary[500],
      backgroundColor: theme.colors.secondary[500] + '20',
    },
  ];

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Quick Actions
        </Text>
      </View>

      <View style={styles.actionsGrid}>
        {actions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={[
              styles.actionButton,
              { backgroundColor: action.backgroundColor }
            ]}
            onPress={() => onAction(action.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, { backgroundColor: action.color }]}>
              <Icon
                name={action.icon}
                size={24}
                color="#FFFFFF"
              />
            </View>
            <Text style={[styles.actionLabel, { color: theme.colors.text }]}>
              {action.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    padding: 0,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default QuickActions;
