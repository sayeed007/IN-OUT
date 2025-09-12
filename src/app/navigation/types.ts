// src/app/navigation/types.ts
import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { TransactionType } from '../../types/global';
import { ModalStackParamList } from '../../types/navigation';

export type UUID = string;

// Root Stack Navigator (Onboarding, Lock, Main App)
export type RootStackParamList = {
  Onboarding: undefined;
  Lock: undefined;
  Main: NavigatorScreenParams<TabParamList>;
  ModalStack: NavigatorScreenParams<ModalStackParamList>;
};

// Tab Navigator (Main App Tabs)
export type TabParamList = {
  Dashboard: undefined;
  Transactions: {
    filter?: {
      type?: TransactionType;
      accountId?: UUID;
      categoryId?: UUID;
    };
  };
  Add: {
    type?: TransactionType;
    accountId?: UUID;
    categoryId?: UUID;
  };
  Reports: undefined;
  Settings: undefined;
};

// Individual Stack Navigators for each tab
export type DashboardStackParamList = {
  DashboardMain: undefined;
};

export type TransactionStackParamList = {
  TransactionList: {
    filter?: {
      type?: TransactionType;
      accountId?: UUID;
      categoryId?: UUID;
    };
  };
  TransactionDetail: { transactionId: UUID };
  AddTransaction: {
    type?: TransactionType;
    accountId?: UUID;
    categoryId?: UUID;
  };
  EditTransaction: { transactionId: UUID };
};

export type AddStackParamList = {
  AddTransaction: {
    type?: TransactionType;
    accountId?: UUID;
    categoryId?: UUID;
  };
};

export type ReportsStackParamList = {
  ReportsMain: undefined;
  ReportDetail: {
    type: 'monthly' | 'yearly';
    period: string;
  };
};

export type SettingsStackParamList = {
  SettingsMain: undefined;
  AccountManager: undefined;
  AccountForm: { accountId?: UUID };
  CategoryManager: undefined;
  CategoryForm: { categoryId?: UUID };
  BudgetManager: undefined;
  BudgetForm: { budgetId?: UUID; categoryId?: UUID; month?: string };
  Budget: undefined;
  DataManagement: undefined;
  SecuritySettings: undefined;
  AppearanceSettings: undefined;
};

// Screen Props Types
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type TabScreenProps<T extends keyof TabParamList> =
  BottomTabScreenProps<TabParamList, T>;

export type DashboardScreenProps<T extends keyof DashboardStackParamList> =
  NativeStackScreenProps<DashboardStackParamList, T>;

export type TransactionScreenProps<T extends keyof TransactionStackParamList> =
  NativeStackScreenProps<TransactionStackParamList, T>;

export type AddScreenProps<T extends keyof AddStackParamList> =
  NativeStackScreenProps<AddStackParamList, T>;

export type ReportsScreenProps<T extends keyof ReportsStackParamList> =
  NativeStackScreenProps<ReportsStackParamList, T>;

export type SettingsScreenProps<T extends keyof SettingsStackParamList> =
  NativeStackScreenProps<SettingsStackParamList, T>;

// Combined navigation param list for cross-stack navigation
export type AppParamList = TabParamList & TransactionStackParamList & SettingsStackParamList & {
  AddTransaction: {
    type?: TransactionType;
    accountId?: UUID;
    categoryId?: UUID;
  };
  TransactionList: {
    filter?: {
      type?: TransactionType;
      accountId?: UUID;
      categoryId?: UUID;
    };
  };
};

// Global navigation props for use with navigation.navigate()
declare global {
  namespace ReactNavigation {
    interface RootParamList extends AppParamList { }
  }
}
