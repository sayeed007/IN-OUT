import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../../../app/providers/ThemeProvider';
import Card from '../../../components/ui/Card';
import { Account } from '../../../types/global';

interface AccountOverviewProps {
  accounts: Account[];
}

const AccountOverview: React.FC<AccountOverviewProps> = ({ accounts }) => {
  const { theme } = useTheme();

  // Calculate total balance
  const totalBalance = accounts.reduce((sum, account) => sum + account.openingBalance, 0);

  return (
    <Card style={styles.halfCard}>
      <View style={styles.chartHeader}>
        <Text style={[styles.chartTitle, { color: theme.colors.text }]}>
          Accounts
        </Text>
        <Text style={[styles.totalBalance, { color: theme.colors.primary[500] }]}>
          ${totalBalance.toFixed(2)}
        </Text>
      </View>

      <View style={styles.accountsList}>
        {accounts.slice(0, 3).map((account) => (
          <View key={account.id} style={styles.accountItem}>
            <View style={styles.accountInfo}>
              <Text style={[styles.accountName, { color: theme.colors.text }]}>
                {account.name}
              </Text>
              <Text style={[styles.accountType, { color: theme.colors.textSecondary }]}>
                {account.type}
              </Text>
            </View>
            <Text style={[styles.accountBalance, {
              color: account.openingBalance >= 0 ? theme.colors.income.main : theme.colors.expense.main
            }]}>
              ${Math.abs(account.openingBalance).toFixed(2)}
            </Text>
          </View>
        ))}

        {accounts.length > 3 && (
          <TouchableOpacity style={styles.seeMoreButton}>
            <Text style={[styles.seeMoreText, { color: theme.colors.primary[500] }]}>
              +{accounts.length - 3} more accounts
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  halfCard: {
    flex: 1,
  },
  chartHeader: {
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  totalBalance: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  accountsList: {
    gap: 8,
  },
  accountItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 14,
    fontWeight: '500',
  },
  accountType: {
    fontSize: 11,
    textTransform: 'capitalize',
  },
  accountBalance: {
    fontSize: 14,
    fontWeight: '600',
  },
  seeMoreButton: {
    marginTop: 4,
    paddingVertical: 4,
  },
  seeMoreText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default AccountOverview;