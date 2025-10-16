import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import { TransactionType } from './global';

// Root Stack (App level navigation)
export type RootStackParamList = {
  Onboarding: undefined;
  Lock: undefined;
  Main: undefined;
  ModalStack: {
    screen: keyof ModalStackParamList;
    params?: ModalStackParamList[keyof ModalStackParamList];
  };
};

// Main Tab Navigation
export type MainTabParamList = {
  Dashboard: undefined;
  Transactions: {
    filter?: 'all' | TransactionType;
    searchQuery?: string;
  };
  Add: {
    type?: TransactionType;
    accountId?: string;
    categoryId?: string;
    amount?: number;
    note?: string;
  };
  Reports: {
    period?: 'monthly' | 'yearly';
    month?: string;
    year?: string;
  };
  Settings: undefined;
};

// Modal Stack Navigation
export type ModalStackParamList = {
  TransactionDetail: {
    transactionId: string;
    isEditing?: boolean;
  };
  EditTransaction: {
    transactionId: string;
  };
  AccountManager: {
    accountId?: string;
    isEditing?: boolean;
  };
  CategoryManager: {
    categoryId?: string;
    parentId?: string;
    type?: TransactionType;
  };
  Budget: {
    categoryId?: string;
    month?: string;
  };
};

// Screen Props Types
export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

export type MainTabScreenProps<T extends keyof MainTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, T>,
  RootStackScreenProps<keyof RootStackParamList>
>;

export type ModalStackScreenProps<T extends keyof ModalStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<ModalStackParamList, T>,
  RootStackScreenProps<keyof RootStackParamList>
>;

// Specific screen props for easy use
export type OnboardingScreenProps = RootStackScreenProps<'Onboarding'>;
export type LockScreenProps = RootStackScreenProps<'Lock'>;

export type DashboardScreenProps = MainTabScreenProps<'Dashboard'>;
export type TransactionListScreenProps = MainTabScreenProps<'Transactions'>;
export type AddTransactionScreenProps = MainTabScreenProps<'Add'>;
export type ReportsScreenProps = MainTabScreenProps<'Reports'>;
export type SettingsScreenProps = MainTabScreenProps<'Settings'>;

export type TransactionDetailScreenProps = ModalStackScreenProps<'TransactionDetail'>;
export type AccountManagerScreenProps = ModalStackScreenProps<'AccountManager'>;
export type CategoryManagerScreenProps = ModalStackScreenProps<'CategoryManager'>;
export type BudgetScreenProps = ModalStackScreenProps<'Budget'>;

// Navigation utilities
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList { }
  }
}

// Common navigation patterns
export interface NavigationHelpers {
  goBack: () => void;
  navigate: <T extends keyof RootStackParamList>(
    screen: T,
    params?: RootStackParamList[T]
  ) => void;
  reset: () => void;
}

// Route parameter extraction utility
export type RouteParams<T extends keyof (RootStackParamList & MainTabParamList & ModalStackParamList)> =
  T extends keyof RootStackParamList ? RootStackParamList[T] :
  T extends keyof MainTabParamList ? MainTabParamList[T] :
  T extends keyof ModalStackParamList ? ModalStackParamList[T] :
  never;

export default {};