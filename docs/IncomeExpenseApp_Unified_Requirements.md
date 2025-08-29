# Income & Expense App — Unified Requirements & Delivery Plan
**Platform:** React Native CLI (TypeScript) · iOS 14+ · Android 8+  
**Data Layer:** Redux Toolkit + **RTK Query** against a **Dummy REST API** (`json-server`) in development; custom baseQuery with local database (AsyncStorage) in production for offline persistence  
**Goal:** Track income/expenses, budgets, and view monthly/yearly analytics with charts. Offline-friendly design; easy to swap to a real backend later.

---

## 0) What’s Included (Merged Summary)
This document consolidates both prior drafts into **one** engineering-ready spec:
- Full **product requirements** (features, data model, UX flows, non-functional).
- **RTK Query + Dummy API** plan for development-time persistence, with clear guidance on production local database integration using AsyncStorage to simulate API behavior.
- **Navigation map**, **screen list**, and **acceptance criteria**.
- **Developer runbook**, **testing plan**, and **release checklist**.
- **Work Breakdown Structure (WBS)** with milestones & responsibilities.

---

## 1) Scope & Goals
**MVP Goals**
- Transactions: **Income**, **Expense**, **Transfer** across **Accounts** and **Categories**.
- Monthly **Budgets** with threshold alerts (80%, 100%).
- **Reports**: Monthly & Yearly views with charts (category pie, trends, income vs expense).
- Search & filters, tags, notes, and receipt attachments.
- CSV **export/import** + local **backup/restore** (file-based snapshot of local DB). 
- **App lock** with PIN/biometrics. Light/Dark theme.

**Phase‑2 (Out of MVP)**: Multi-currency with FX, auto-posting recurring transactions, OCR for receipts, cloud backup/sync, shared household mode, widgets, goals/envelopes.

---

## 2) Personas
1) **Everyday User** — quick add, see where money goes.  
2) **Budgeter** — category budgets and alerts.  
3) **Power User** — tags, attachments, CSV import/export, detailed charts.

---

## 3) Platforms & Assumptions
- RN CLI (not Expo). TypeScript.  
- Data Flow Clarification: All data is saved to a local database. In development, RTK Query interacts with a fake REST API (json-server) that persists data to a local file (db.json). In production, RTK Query uses a custom baseQuery that simulates the same REST API behavior but operates directly on a local database stored in AsyncStorage (as a JSON object). This setup ensures offline functionality by default and allows minimal-effort migration to a real server-side API by simply swapping the baseQuery to fetchBaseQuery with a remote URL.  
- Single default currency per user in MVP; device locale for formatting.  
- Time zone: device time; month boundaries use device TZ.

---

## 4) Architecture & Tech Stack
```
React Native (TS)
 ├─ Navigation (Stack + Bottom Tabs)
 ├─ Screens (Dashboard, Transactions, Add, Reports, Settings)
 ├─ Redux Toolkit Store
 │   ├─ RTK Query API slice (createApi, tags, invalidation)
 │   └─ Feature slices (UI state: filters, prefs, theme)
 ├─ Services (notifications, export/import, backup)
 └─ Charts (victory-native or gifted-charts)
```
**Libraries**
- State: `@reduxjs/toolkit`, `react-redux`  
- Networking & cache: **RTK Query**  
- Local Storage (Production): `@react-native-async-storage/async-storage`  
- Charts: `victory-native` (SVG)  
- Forms: `react-hook-form`  
- Dates: `dayjs` or `date-fns`  
- Images: `react-native-image-picker`, `react-native-fs`  
- CSV: `papaparse` (parse) + custom exporter  
- Notifications: `react-native-push-notification` or Notifee (local)  
- Biometrics: `react-native-biometrics`  
- i18n/Theming: optional `react-native-paper` + `i18next`  
- UUID Generation: `uuid` (for generating unique IDs in local DB operations)

---

## 5) Navigation & Screens (with IDs for tests)
**Root Navigation:** Stack (Lock/Onboarding) → Tabs

**Tabs:** 1) Dashboard 2) Transactions 3) Add 4) Reports 5) Settings

**Screens**
- **OnboardingScreen** — pick currency, create first account, seed categories.
- **LockScreen** — PIN/biometric unlock.
- **DashboardScreen** — Month selector; KPI cards (Total Income, Expense, Net, Budget %); mini charts (bar: income vs expense; pie: top categories).
- **TransactionListScreen** — Filter chips (All/Income/Expense/Transfer), search, date range presets; grouped list by date with day totals.
- **TransactionDetailScreen** — View/Edit/Delete; attachments, tags, balance impact.
- **AddTransactionScreen** — Type toggle; amount keypad; date/time; account(s); category (hidden for transfer); tags; note; photo; optional repeat (reminder only in MVP).
- **CategoryManagerScreen** — Hierarchical CRUD, icon/color.
- **AccountManagerScreen** — CRUD, opening balance, archive.
- **BudgetScreen** — Monthly budget per category with progress bars & alerts.
- **ReportsScreen** — Month/Year toggles; category pie; monthly trend (12 bars/line); income vs expense; export buttons.
- **SettingsScreen** — Currency, date format, first day of week, budget start day (1–28), theme, app lock, export/import/backup, data reset.

---

## 6) Detailed Functional Requirements (+ Acceptance Criteria)
### 6.1 Accounts
- Create/edit/delete (delete blocked if has transactions → archive or reassign).  
- Fields: name (unique), type (cash/bank/wallet/card/other), openingBalance, currencyCode, isArchived.  
- **AC:** Transfers move funds between accounts without altering income/expense totals.

### 6.2 Categories
- Hierarchical (max 2 levels MVP), typed to **income** or **expense**. Color/icon.  
- **AC:** Cannot delete if used; must reassign or archive.

### 6.3 Transactions
- Fields: type, accountId, (accountIdTo for transfer), categoryId (null for transfer), amount (>0), currencyCode, date, note, tags[], attachmentIds[].  
- **Quick add** (last used category, amount suggestions).  
- **Recurrence** in MVP = reminder only; no auto-post.  
- **AC:** Expense → decrease source account; Income → increase; Transfer → move equal amount between accounts; category type must match transaction type.

### 6.4 Budgets
- Per category, per month; progress = Σ(expense in month)/budget.  
- Alerts at 80% and 100% (in-app banner + optional local notification).  
- **AC:** Alerts fired once per category per month at thresholds.

### 6.5 Reports & Charts
- **Monthly:** totals (income, expense, net), category breakdown (pie), trend last 12 months (bar/line).  
- **Yearly:** totals by month (12 bars) + YoY comparison (current vs previous).  
- Filters: account(s), category, tag, date range. Legend toggles series/categories.  
- **AC:** Transfers excluded from totals; included only when filtered explicitly.

### 6.6 Search & Filters
- Text search over note/tags; multi-select filters persist per session.

### 6.7 Attachments
- Camera/gallery; store file locally using react-native-fs; store metadata (paths/IDs) in DB.  
- **AC:** Max single image 10MB (configurable); handle permissions for camera/storage.

### 6.8 Import/Export/Backup
- **Export CSV**: transactions, accounts, categories.  
- **Import CSV**: guided mapping (date, amount, type, account, category, note, tags).  
- **Local backup**: zip/json snapshot of local DB (AsyncStorage data) + media files.  
- **AC:** Import validates columns; previews errors w/ line numbers. Backup includes encryption option for sensitive data.

### 6.9 Security & Privacy
- App lock (PIN + biometric).  
- Local DB encryption: Use encrypted AsyncStorage or wrap data with encryption (e.g., crypto-js for JSON).  
- Dev mode: dummy server has **no auth**; keep LAN/local only.  
- **AC:** After background >X minutes (configurable), show LockScreen. Ensure local DB is not accessible without app lock.

### 6.10 Notifications
- Local: Recurring reminders (open AddTransactionScreen prefilled).  
- Budget threshold notifications (80%, 100%).

### 6.11 Settings & Preferences
- Currency, date/time format, first day of week, budget start day (1–28), theme, data management, include/exclude transfers (excluded from totals by default).

### 6.12 Error Handling
- Network/API errors: N/A in production (local), but handle storage failures with toasts and retries.  
- Validation errors: Real-time form feedback; prevent saves on invalid data.  
- **AC:** Graceful degradation on low storage; log errors for debugging.

---

## 7) Data Model (TypeScript)
```ts
type UUID = string;

export type Account = {
  id: UUID; name: string; type: 'cash'|'bank'|'wallet'|'card'|'other';
  openingBalance: number; currencyCode: string; isArchived: boolean;
  createdAt: string; updatedAt: string;
};

export type Category = {
  id: UUID; name: string; type: 'income'|'expense';
  parentId: UUID | null; color: string; icon: string; isArchived: boolean;
  createdAt: string; updatedAt: string;
};

export type Transaction = {
  id: UUID; type: 'income'|'expense'|'transfer';
  accountId: UUID; accountIdTo: UUID | null; categoryId: UUID | null;
  amount: number; currencyCode: string; date: string; note?: string;
  tags: string[]; attachmentIds: UUID[]; createdAt: string; updatedAt: string;
};

export type Budget = {
  id: UUID; categoryId: UUID; month: string; amount: number;
  rollover: boolean; createdAt: string; updatedAt: string;
};
```

**Derived**
- `currentBalance(account)` = openingBalance + Σ(income) − Σ(expense) + Σ(incoming transfers) − Σ(outgoing transfers).

---

## 8) Dummy API (json-server) for Dev
### 8.1 Run
```bash
npm i -D json-server
npx json-server --watch server/db.json --port 3001 --delay 350
```
- iOS Simulator: `http://localhost:3001`  
- Android Emulator: `http://10.0.2.2:3001`  

### 8.2 Sample `server/db.json`
```json
{
  "accounts": [
    { "id": "acc_cash", "name": "Cash", "type": "cash", "openingBalance": 200, "currencyCode": "USD", "isArchived": false, "createdAt": "2025-01-01T00:00:00Z", "updatedAt": "2025-01-01T00:00:00Z" }
  ],
  "categories": [
    { "id": "cat_food", "name": "Food", "type": "expense", "parentId": null, "color": "#F97316", "icon": "utensils", "isArchived": false, "createdAt": "2025-01-01T00:00:00Z", "updatedAt": "2025-01-01T00:00:00Z" }
  ],
  "transactions": [],
  "budgets": [],
  "attachments": [],
  "recurringRules": [],
  "transactionTemplates": []
}
```

### 8.3 Endpoints
CRUD for `/accounts`, `/categories`, `/transactions`, `/budgets`, `/attachments`.  
Query helpers: `_sort`, `_order`, `_page`, `_limit`, `date_gte`, `date_lte`.

### 8.4 Base URL Helper
```ts
// /src/utils/env.ts
import { Platform } from 'react-native';
export const API_BASE = Platform.OS === 'android'
  ? 'http://10.0.2.2:3001'
  : 'http://localhost:3001';
```

### 8.5 Production Local Database (AsyncStorage with Custom BaseQuery)
In production, replace fetchBaseQuery with a custom baseQuery that simulates REST API operations using AsyncStorage. Data is stored as a single JSON object (mimicking db.json) under key 'appDb'. This ensures all data operations are local and offline-capable, while keeping the RTK Query endpoints identical for easy server migration.

**Install:** `npm i @react-native-async-storage/async-storage uuid`

**Custom BaseQuery Implementation** (excerpt in `/src/state/api.ts`):
```ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';

// Default DB structure if no data exists
const defaultDb = {
  accounts: [],
  categories: [],
  transactions: [],
  budgets: [],
  attachments: [],
  recurringRules: [],
  transactionTemplates: []
};

const localBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args) => {
  try {
    // Load DB from AsyncStorage
    const dbJson = await AsyncStorage.getItem('appDb');
    let db = dbJson ? JSON.parse(dbJson) : defaultDb;

    // Normalize args to FetchArgs
    const { url, method = 'GET', body } = typeof args === 'string' ? { url: args } : args;

    // Extract resource and query params
    const [path, queryString] = url.split('?');
    const resource = path.replace('/', '');
    const params = new URLSearchParams(queryString);

    let result;

    switch (method.toUpperCase()) {
      case 'GET': {
        let data = db[resource] || [];
        // Apply filters (e.g., type, date_gte, date_lte)
        if (params.get('type')) data = data.filter(item => item.type === params.get('type'));
        if (params.get('date_gte')) data = data.filter(item => new Date(item.date) >= new Date(params.get('date_gte')!));
        if (params.get('date_lte')) data = data.filter(item => new Date(item.date) <= new Date(params.get('date_lte')!));
        // Apply sort and order (simplified)
        const sort = params.get('_sort') || 'createdAt';
        const order = params.get('_order') || 'desc';
        data.sort((a, b) => {
          if (order === 'desc') return b[sort] > a[sort] ? 1 : -1;
          return a[sort] > b[sort] ? 1 : -1;
        });
        // Pagination (simplified, add _page and _limit if needed)
        result = data;
        break;
      }
      case 'POST': {
        const id = uuidv4();
        const now = new Date().toISOString();
        const newItem = { ...body, id, createdAt: now, updatedAt: now };
        db[resource] = [...(db[resource] || []), newItem];
        result = newItem;
        break;
      }
      case 'PATCH': {
        const id = params.get('id'); // Assume patch by id in query or body
        const index = db[resource].findIndex(item => item.id === body.id || item.id === id);
        if (index !== -1) {
          const updated = { ...db[resource][index], ...body, updatedAt: new Date().toISOString() };
          db[resource][index] = updated;
          result = updated;
        } else {
          return { error: { status: 404, data: 'Not found' } };
        }
        break;
      }
      case 'DELETE': {
        const id = params.get('id');
        db[resource] = db[resource].filter(item => item.id !== id);
        result = { id };
        break;
      }
      default:
        return { error: { status: 405, data: 'Method not allowed' } };
    }

    // Save updated DB back to AsyncStorage
    await AsyncStorage.setItem('appDb', JSON.stringify(db));

    return { data: result };
  } catch (error) {
    return { error: { status: 500, data: (error as Error).message } };
  }
};

// In createApi, use conditional baseQuery
const baseQuery = __DEV__ ? fetchBaseQuery({ baseUrl: API_BASE }) : localBaseQuery;
```

**Notes:**
- Extend the custom baseQuery to handle more query params (_page, _limit, etc.) as needed.
- For attachments, store file paths; use react-native-fs to manage files.
- On app start/onboarding, initialize 'appDb' if empty.
- For encryption, encrypt the JSON string before storing (e.g., using react-native-encrypted-storage).
- Migration to server: Change baseQuery to fetchBaseQuery({ baseUrl: 'https://api.example.com' }), assuming server matches endpoints.

---

## 9) RTK Query Setup
Install:
```bash
npm i @reduxjs/toolkit react-redux
npm i -D @types/react-redux
```

**API slice** `/src/state/api.ts` (excerpt, incorporate custom baseQuery from 8.5):
```ts
import { createApi } from '@reduxjs/toolkit/query/react';
// ... (baseQuery as above)

export const api = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['Account','Category','Transaction','Budget'],
  endpoints: (b) => ({
    getAccounts: b.query<Account[], void>({
      query: () => '/accounts?_sort=createdAt&_order=desc',
      providesTags: (res) => res
        ? [...res.map(({id}) => ({type:'Account' as const, id})), {type:'Account', id:'LIST'}]
        : [{type:'Account', id:'LIST'}],
    }),
    addAccount: b.mutation<Account, Partial<Account>>({
      query: (body) => ({ url: '/accounts', method: 'POST', body }),
      invalidatesTags: [{ type:'Account', id:'LIST' }],
    }),
    getTransactions: b.query<Transaction[], {type?:string; start?:string; end?:string}>({
      query: (p={}) => {
        const q = new URLSearchParams();
        if (p.type) q.append('type', p.type);
        if (p.start) q.append('date_gte', p.start);
        if (p.end) q.append('date_lte', p.end);
        q.append('_sort','date'); q.append('_order','desc');
        return `/transactions?${q.toString()}`;
      },
      providesTags: (res) => res
        ? [...res.map(({id}) => ({type:'Transaction' as const, id})), {type:'Transaction', id:'LIST'}]
        : [{type:'Transaction', id:'LIST'}],
    }),
    addTransaction: b.mutation<Transaction, Transaction>({
      query: (body) => ({ url:'/transactions', method:'POST', body }),
      invalidatesTags: [{type:'Transaction', id:'LIST'}, {type:'Account', id:'LIST'}],
    }),
    getCategories: b.query<Category[], void>({
      query: () => '/categories?_sort=name&_order=asc',
      providesTags: (res) => res
        ? [...res.map(({id}) => ({type:'Category' as const, id})), {type:'Category', id:'LIST'}]
        : [{type:'Category', id:'LIST'}],
    }),
    getBudgets: b.query<Budget[], {month?:string} | void>({
      query: (p) => p?.month ? `/budgets?month=${p.month}` : '/budgets',
      providesTags: (res) => res
        ? [...res.map(({id}) => ({type:'Budget' as const, id})), {type:'Budget', id:'LIST'}]
        : [{type:'Budget', id:'LIST'}],
    }),
  }),
});
export const {
  useGetAccountsQuery, useAddAccountMutation,
  useGetTransactionsQuery, useAddTransactionMutation,
  useGetCategoriesQuery, useGetBudgetsQuery,
} = api;
```

**Store** `/src/state/store.ts`:
```ts
import { configureStore } from '@reduxjs/toolkit';
import { api } from './api';
export const store = configureStore({
  reducer: { [api.reducerPath]: api.reducer },
  middleware: (gDM) => gDM().concat(api.middleware),
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

**Usage** (in screen):
```ts
const { data: txs, isLoading } = useGetTransactionsQuery({ start:'2025-08-01', end:'2025-08-31' });
```

**Invalidation strategy**
- Transactions add/delete → invalidate `Transaction/LIST` and `Account/LIST`.  
- Accounts/Categories/Budgets mutate → invalidate their `LIST` + specific ids on patch.

---

## 10) Reporting Logic
- **Monthly**: incomeM, expenseM, netM; category breakdown; last‑12 trend.  
- **Yearly**: totals by month + YoY.  
- **Transfers**: excluded from totals; visible when filtered.

---

## 11) Validations & Edge Cases
- Amount > 0; category type matches transaction type; prevent circular category parents.  
- Delete with relations → reassign or archive.  
- Import: required columns present; show row errors with reasons.  
- Local DB: Handle storage quota exceeded; migrate data on app updates (versioned DB key).

---

## 12) Import/Export Specs
**CSV Export (Transactions)**  
`id,type,account,accountTo,category,amount,currency,date,note,tags(|-separated)` — date ISO.

**CSV Import**  
Required: `type,account,amount,date`.  
Optional auto-create missing categories/accounts if enabled.

**Backup file**  
Zip/JSON snapshot of local DB (AsyncStorage 'appDb') + media files (copied via react-native-fs).

---

## 13) Security & Privacy
- App lock (PIN + biometric).  
- Keep dev API local; never expose to internet.  
- Encrypt local DB JSON for financial data sensitivity.

---

## 14) Notifications
- Local reminders for recurring templates.  
- Budget threshold events fire once per threshold per month.

---

## 15) Non‑Functional Requirements
- Smooth lists at **100k** transactions (virtualized).  
- Summary queries under **150ms** on mid-tier device (via memoized selectors).  
- Accessibility AA; dynamic fonts; RTL-ready.  
- Theming: system default + manual override.  
- Offline: Fully functional without network (production mode).

---

## 16) Directory Structure
```
/src
  /app (navigation, providers)
  /components
  /features (accounts, categories, transactions, budgets, reports)
  /screens
  /state (slices, store, api)
  /services (notifications, export, backup)
  /db (for later, if swapping to advanced local DB like SQLite)
  /utils (dates, currency, validation)
  /theme
  /i18n
```

---

## 17) Dev Runbook
**Scripts**
```json
{
  "scripts": {
    "api": "json-server --watch server/db.json --port 3001 --delay 350",
    "android": "react-native run-android",
    "ios": "react-native run-ios"
  }
}
```
**Start sequence**
1) `npm run api` (dev only)  
2) `npm run android` or `npm run ios`  
3) Verify `/accounts` responds (iOS localhost; Android 10.0.2.2 in dev; local storage in prod).

**Seeding**
- Edit `server/db.json` (dev). For prod, use onboarding to seed or import. Keep `db.seed.json` to reset easily.

---

## 18) Testing Plan
**Unit (Jest)** — currency/date utils; budget calculations; report aggregations.  
**RTK Query** — mock with MSW (dev); test custom baseQuery logic (prod) for CRUD and queries.  
**Component (RTL)** — **AddTransactionScreen**:  
- [TC-ATS-001] amount enables Save  
- [TC-ATS-002] Transfer hides Category  
- [TC-ATS-003] Save calls mutation with normalized payload  
**Integration (Detox)**  
- [TC-INT-001] Adding expense updates Dashboard monthly totals  
- [TC-INT-002] Transfer does not change totals  
- [TC-INT-003] Budget 80% alert appears after save  
- [TC-INT-004] Prod mode: Mutations persist across app restarts (AsyncStorage)  
**E2E (Detox)**  
- [TC-E2E-001] Onboarding → create account → add expense → visible in list & dashboard  
- [TC-E2E-002] Lock app → reopen → PIN/biometric required
- [TC-E2E-003] Offline mode: Add transaction without network; data persists.

---

## 19) Work Breakdown Structure (WBS) & Milestones
**Team Roles:**  
- **Mobile Lead (ML)** — architecture, store, navigation.  
- **Feature Dev (FD)** — screens & business logic.  
- **QA (QA)** — test plan, E2E.  
- **UX (UX)** — flows, icons/colors.

**M1 — Project Setup (ML)**
- RN CLI scaffold; TS config; React Navigation; theming; folder structure.  
- RTK Query base + store; env helper; json-server with seed db; custom baseQuery for prod.  
**Deliverables:** running app hitting dummy API (dev) and local storage (prod); lint/test infra.

**M2 — Core Domain (FD)**
- Accounts + Categories CRUD (screens + API hooks).  
- AddTransactionScreen with validations; TransactionList with filters/search.  
**Deliverables:** Add/Edit/Delete flows; list rendering; tags/notes.

**M3 — Budgets & Reports (FD)**
- BudgetScreen with progress & alerts; ReportsScreen with charts.  
- Aggregation selectors (monthly/yearly); exclude transfers from totals.  
**Deliverables:** charts render with real data; alerts triggered.

**M4 — Attachments, Import/Export, Lock (FD/ML)**
- Image capture/pick + metadata; CSV import/export; backup/restore.  
- App lock with PIN/biometric; background re-lock.  
**Deliverables:** happy paths covered; file IO verified on both OS.

**M5 — Hardening & QA (QA/All)**
- A11y pass; performance (virtualized lists); error handling & toasts.  
- Detox flows; MSW tests for RTK Query; release checklist.  
**Deliverables:** MVP sign-off.

**Definition of Done (per story)**
- AC met; unit/component tests added; errors handled; UX reviewed; docs updated.

---

## 20) Release Checklist (MVP)
- [ ] Lock screen on background timeout (both OS)  
- [ ] RTKQ endpoints + tags finalized  
- [ ] Onboarding seeds defaults  
- [ ] Reports totals match transactions (tests green)  
- [ ] Import/Export/Backup verified on device (including prod local DB)  
- [ ] Notifications (permissions + triggers) validated  
- [ ] Accessibility labels & dynamic fonts OK  
- [ ] Crash-free smoke suite on low-end device  
- [ ] Prod mode: Data persists offline; custom baseQuery handles all operations without network.

---

## 21) Future Enhancements (Phase‑2+)
- Multi-currency with historical FX; auto-post recurring; OCR receipts.  
- Cloud backup/sync (Drive/iCloud) with E2E encryption; household sharing.  
- Goals/envelopes; widgets; tax exports.  
- Switch to advanced local DB (e.g., SQLite) if data scales beyond AsyncStorage limits.

---

## 22) Appendix
### 22.1 Example Balance Selector
```ts
export const selectAccountBalance = (accId: string) => createSelector(
  [api.endpoints.getTransactions.select({}), api.endpoints.getAccounts.select()],
  (txRes, accRes) => {
    const acc = accRes.data?.find(a => a.id === accId);
    if (!acc) return 0;
    const txs = txRes.data ?? [];
    const delta = txs.reduce((s, t) => {
      if (t.accountId === accId) {
        if (t.type === 'income') return s + t.amount;
        if (t.type === 'expense') return s - t.amount;
        if (t.type === 'transfer') return s - t.amount;
      }
      if (t.type === 'transfer' && t.accountIdTo === accId) return s + t.amount;
      return s;
    }, 0);
    return acc.openingBalance + delta;
  }
);
```

### 22.2 CSV Columns (Transactions)
`id,type,account,accountTo,category,amount,currency,date,note,tags` (pipe-separated tags).

**End of document.**