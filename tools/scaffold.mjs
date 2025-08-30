// tools/scaffold.mjs
// Creates folders/files for your app structure. Existing files are left untouched unless --force.
//
// Usage:
//   node tools/scaffold.mjs
//   node tools/scaffold.mjs --force
//   node tools/scaffold.mjs --base=src

import { mkdir, writeFile, access } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import process from "node:process";

const args = Object.fromEntries(
    process.argv.slice(2).map((a) => {
        const [k, v] = a.includes("=") ? a.split("=") : [a, true];
        return [k.replace(/^--/, ""), v ?? true];
    })
);

const BASE = String(args.base ?? "src");
const FORCE = Boolean(args.force);

const files = [
    // ---------- app ----------
    "app/navigation/types.ts",
    "app/providers/ThemeProvider.tsx",      // will be skipped if exists
    "app/providers/StoreProvider.tsx",      // will be skipped if exists

    // ---------- components/ui ----------
    "components/ui/Button.tsx",
    "components/ui/Input.tsx",
    "components/ui/Card.tsx",
    "components/ui/Modal.tsx",
    "components/ui/ProgressBar.tsx",
    "components/ui/Chip.tsx",
    "components/ui/FloatingActionButton.tsx",
    "components/ui/LoadingSpinner.tsx",
    "components/ui/EmptyState.tsx",
    "components/ui/index.ts",

    // ---------- components/forms ----------
    "components/forms/FormField.tsx",
    "components/forms/AmountKeypad.tsx",
    "components/forms/DatePicker.tsx",
    "components/forms/CategorySelector.tsx",
    "components/forms/AccountSelector.tsx",
    "components/forms/TagInput.tsx",

    // ---------- components/charts ----------
    "components/charts/PieChart.tsx",
    "components/charts/BarChart.tsx",
    "components/charts/LineChart.tsx",
    "components/charts/ChartContainer.tsx",

    // ---------- components/lists ----------
    "components/lists/TransactionItem.tsx",
    "components/lists/AccountItem.tsx",
    "components/lists/CategoryItem.tsx",
    "components/lists/BudgetItem.tsx",
    "components/lists/SectionHeader.tsx",

    // ---------- components/layout ----------
    "components/layout/SafeContainer.tsx",
    "components/layout/Header.tsx",
    "components/layout/TabBar.tsx",
    "components/layout/KeyboardAvoidingContainer.tsx",

    // ---------- screens (from previous step, kept for completeness) ----------
    "screens/auth/OnboardingScreen.tsx",
    "screens/auth/LockScreen.tsx",

    "screens/dashboard/DashboardScreen.tsx",
    "screens/dashboard/components/KPICards.tsx",
    "screens/dashboard/components/MonthSelector.tsx",
    "screens/dashboard/components/MiniCharts.tsx",
    "screens/dashboard/components/QuickActions.tsx",

    "screens/transactions/TransactionListScreen.tsx",
    "screens/transactions/TransactionDetailScreen.tsx",
    "screens/transactions/AddTransactionScreen.tsx",
    "screens/transactions/components/TransactionFilters.tsx",
    "screens/transactions/components/TransactionForm.tsx",
    "screens/transactions/components/TransactionTypeToggle.tsx",
    "screens/transactions/components/AttachmentManager.tsx",

    "screens/accounts/AccountManagerScreen.tsx",
    "screens/accounts/components/AccountForm.tsx",
    "screens/accounts/components/AccountBalance.tsx",

    "screens/categories/CategoryManagerScreen.tsx",
    "screens/categories/components/CategoryForm.tsx",
    "screens/categories/components/CategoryTree.tsx",
    "screens/categories/components/CategoryIcon.tsx",

    "screens/budgets/BudgetScreen.tsx",
    "screens/budgets/components/BudgetForm.tsx",
    "screens/budgets/components/BudgetProgress.tsx",
    "screens/budgets/components/BudgetAlerts.tsx",

    "screens/reports/ReportsScreen.tsx",
    "screens/reports/components/ReportFilters.tsx",
    "screens/reports/components/MonthlyReport.tsx",
    "screens/reports/components/YearlyReport.tsx",
    "screens/reports/components/ExportOptions.tsx",

    "screens/settings/SettingsScreen.tsx",
    "screens/settings/components/SettingsItem.tsx",
    "screens/settings/components/CurrencySelector.tsx",
    "screens/settings/components/ThemeSelector.tsx",
    "screens/settings/components/DataManagement.tsx",

    // ---------- features ----------
    "features/accounts/hooks/useAccountBalance.ts",
    "features/accounts/hooks/useAccountValidation.ts",
    "features/accounts/utils/accountUtils.ts",
    "features/accounts/types.ts",

    "features/categories/hooks/useCategoryHierarchy.ts",
    "features/categories/utils/categoryUtils.ts",
    "features/categories/types.ts",

    "features/transactions/hooks/useTransactionForm.ts",
    "features/transactions/hooks/useTransactionFilters.ts",
    "features/transactions/hooks/useTransactionValidation.ts",
    "features/transactions/utils/transactionUtils.ts",
    "features/transactions/utils/balanceCalculations.ts",
    "features/transactions/types.ts",

    "features/budgets/hooks/useBudgetProgress.ts",
    "features/budgets/hooks/useBudgetAlerts.ts",
    "features/budgets/utils/budgetUtils.ts",
    "features/budgets/types.ts",

    "features/reports/hooks/useReportData.ts",
    "features/reports/hooks/useReportFilters.ts",
    "features/reports/utils/reportCalculations.ts",
    "features/reports/utils/chartDataTransformers.ts",
    "features/reports/types.ts",

    // ---------- state ----------
    "state/selectors/accountSelectors.ts",
    "state/selectors/transactionSelectors.ts",
    "state/selectors/budgetSelectors.ts",
    "state/selectors/reportSelectors.ts",
    "state/types.ts",

    // ---------- services ----------
    "services/api/baseQuery.ts",
    "services/api/endpoints/accounts.ts",
    "services/api/endpoints/categories.ts",
    "services/api/endpoints/transactions.ts",
    "services/api/endpoints/budgets.ts",
    "services/api/types.ts",

    "services/storage/asyncStorage.ts",
    "services/storage/fileStorage.ts",
    "services/storage/encryption.ts",

    "services/notifications/localNotifications.ts",
    "services/notifications/budgetAlerts.ts",

    "services/export/csvExport.ts",
    "services/export/csvImport.ts",
    "services/export/backupService.ts",

    "services/security/biometrics.ts",
    "services/security/pinService.ts",

    "services/attachments/imageService.ts",
    "services/attachments/fileManager.ts",

    // from your outline (same level as folders in services/)
    "services/appInitialization.ts",
    "services/localBaseQuery.ts",

    // ---------- utils ----------
    "utils/constants/colors.ts",
    "utils/constants/sizes.ts",
    "utils/constants/fonts.ts",
    "utils/constants/config.ts",

    "utils/helpers/dateUtils.ts",
    "utils/helpers/currencyUtils.ts",
    "utils/helpers/formatUtils.ts",
    "utils/helpers/validationUtils.ts",
    "utils/helpers/deviceUtils.ts",

    "utils/hooks/useDebounce.ts",
    "utils/hooks/usePermissions.ts",
    "utils/hooks/useKeyboard.ts",
    "utils/hooks/useAppState.ts",
    "utils/env.ts",

    // ---------- i18n ----------
    "i18n/index.ts",
    "i18n/locales/en.json",
    "i18n/locales/bn.json",
    "i18n/types.ts",

    // ---------- assets (placeholders; creates folders via .gitkeep) ----------
    "assets/images/.gitkeep",
    "assets/images/icons/.gitkeep",
    "assets/images/illustrations/.gitkeep",
    "assets/images/splash/.gitkeep",
    "assets/fonts/.gitkeep",
    "assets/data/categories.json",
    "assets/data/currencies.json",

    // ---------- types ----------
    "types/navigation.ts",
    "types/theme.ts",

    // ---------- tests ----------
    "../__tests__/__mocks__/.gitkeep",
    "../__tests__/components/.gitkeep",
    "../__tests__/screens/.gitkeep",
    "../__tests__/utils/.gitkeep",
    "../__tests__/features/.gitkeep",
    "../__tests__/e2e/.gitkeep",

    // ---------- docs ----------
    "../docs/API.md",
    "../docs/COMPONENTS.md",
    "../docs/TESTING.md",
    "../docs/DEPLOYMENT.md",
];

// ------------------ content templates ------------------
function compNameFromFile(filePath) {
    const base = path.basename(filePath, path.extname(filePath));
    return /^[A-Z_]/.test(base)
        ? base
        : base.replace(/(^.|[-_].)/g, (m) => m.slice(-1).toUpperCase());
}

function tsxStub(name) {
    return `import React from "react";
import { View, Text } from "react-native";

const ${name}: React.FC = () => {
  return (
    <View>
      <Text>${name}</Text>
    </View>
  );
};

export default ${name};
`;
}

function tsStub(name) {
    return `// ${name}
export type { };
export default {};
`;
}

function selectorStub() {
    return `import { createSelector } from "@reduxjs/toolkit";
// Add selectors here
export const selectPlaceholder = createSelector(
  (state: any) => state,
  (s) => s
);
`;
}

function jsonStub(kind) {
    if (kind === "categories") {
        return `[
  { "id": "income", "name": "Income", "type": "income" },
  { "id": "food", "name": "Food & Dining", "type": "expense" },
  { "id": "transport", "name": "Transport", "type": "expense" }
]
`;
    }
    if (kind === "currencies") {
        return `[
  { "code": "USD", "symbol": "$", "name": "US Dollar" },
  { "code": "BDT", "symbol": "৳", "name": "Bangladeshi Taka" }
]
`;
    }
    return "{}\n";
}

function mdStub(title) {
    return `# ${title}

> TODO: Document this section.

## Overview
Describe purpose and usage.

## Usage
Examples and steps.

`;
}

function i18nJsonStub(locale) {
    return JSON.stringify(
        {
            common: {
                ok: "OK",
                cancel: "Cancel",
                save: "Save",
            },
            screens: {
                dashboard: "Dashboard",
                settings: "Settings",
            },
        },
        null,
        2
    ) + "\n";
}

async function fileExists(fp) {
    try {
        await access(fp, constants.FOK ?? constants.F_OK);
        return true;
    } catch {
        return false;
    }
}

async function ensureDir(dir) {
    await mkdir(dir, { recursive: true });
}

async function write(fp, content) {
    const exists = await fileExists(fp);
    if (exists && !FORCE) return false;
    await writeFile(fp, content, "utf8");
    return true;
}

function makeContent(relPath) {
    const ext = path.extname(relPath);
    const base = path.basename(relPath, ext);

    if (relPath.endsWith(".gitkeep")) return "";
    if (relPath.includes("assets/data/categories.json")) return jsonStub("categories");
    if (relPath.includes("assets/data/currencies.json")) return jsonStub("currencies");

    // i18n
    if (relPath.endsWith("i18n/locales/en.json")) return i18nJsonStub("en");
    if (relPath.endsWith("i18n/locales/bn.json")) return i18nJsonStub("bn");

    // docs
    if (relPath.startsWith("../docs/")) {
        return mdStub(base.toUpperCase().replace(/\./g, " "));
    }

    // tests placeholders
    if (relPath.startsWith("../__tests__/") && relPath.endsWith(".gitkeep")) return "";

    switch (ext) {
        case ".tsx":
            return tsxStub(compNameFromFile(relPath));
        case ".ts":
            // a few nicer defaults
            if (relPath.includes("/selectors/")) return selectorStub();
            return tsStub(base);
        case ".json":
            return "{}\n";
        case ".md":
            return mdStub(base);
        default:
            return "";
    }
}

(async () => {
    const created = [];
    const skipped = [];

    for (const rel of files) {
        // allow writing outside src for tests/docs using ../
        const root = rel.startsWith("../") ? process.cwd() : path.join(process.cwd(), BASE);
        const relClean = rel.replace(/^\.\.\//, "");
        const full = path.join(root, rel.startsWith("../") ? relClean : rel);

        await ensureDir(path.dirname(full));
        const didWrite = await write(full, makeContent(rel));
        (didWrite ? created : skipped).push(path.relative(process.cwd(), full));
    }

    console.log(`\nScaffold complete. Base="${BASE}", force=${FORCE}`);
    if (created.length) {
        console.log(`\nFiles ${FORCE ? "created/overwritten" : "created"} (${created.length}):`);
        created.forEach((f) => console.log("  +", f));
    }
    if (skipped.length && !FORCE) {
        console.log(`\nFiles skipped (already exist) (${skipped.length}):`);
        skipped.forEach((f) => console.log("  •", f));
        console.log('\nTip: pass "--force" to overwrite existing files.');
    }
})().catch((err) => {
    console.error("Scaffold error:", err);
    process.exit(1);
});
