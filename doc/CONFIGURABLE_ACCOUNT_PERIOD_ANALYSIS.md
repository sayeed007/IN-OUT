# Configurable Account Period - Feature Analysis & Implementation Plan

**Document Version:** 1.0
**Date:** 2025-10-25
**Status:** Analysis & Planning Phase

---

## Executive Summary

This document analyzes the feasibility, complexity, and implementation requirements for adding **Configurable Account Period** functionality to the IN_OUT expense tracking application.

### Current State
The application currently uses **calendar months** (1st to last day of month) as the fixed period for all income/expense tracking, budgeting, and reporting.

### Feature Request
Users need the ability to configure custom accounting periods to match their real-world payroll cycles:

1. **Mid-month payroll**: Companies paying from 15th to 15th (or any day to same day next month)
2. **Delayed payroll**: Companies with 5-7 day salary delays requiring periods like 5th-to-5th or 7th-to-7th
3. **Flexibility**: Any day of month (1-28) as period start date

### Impact Assessment
- **Complexity:** HIGH (⚠️)
- **Files Affected:** 20+ files
- **Components Affected:** State management, UI, calculations, reports, budgets
- **Estimated Effort:** Medium-Large feature (1-2 weeks)
- **Breaking Changes:** Potentially affects data model (Budget table)

---

## Table of Contents
1. [Feature Requirements](#feature-requirements)
2. [Current Implementation Analysis](#current-implementation-analysis)
3. [Complexity Assessment](#complexity-assessment)
4. [Technical Challenges](#technical-challenges)
5. [Files to Modify](#files-to-modify)
6. [Implementation Approach](#implementation-approach)
7. [Data Model Changes](#data-model-changes)
8. [Testing Requirements](#testing-requirements)
9. [Migration Strategy](#migration-strategy)
10. [Timeline & Milestones](#timeline--milestones)

---

## Feature Requirements

### User Stories

**US-1: Configure Period Start Day**
> As a user, I want to set my account period start day (1-28) in settings, so that all income/expense tracking aligns with my payroll cycle.

**US-2: View Custom Period in Dashboard**
> As a user, when I select a "month" in the dashboard, I want to see transactions and totals for my custom period (e.g., Oct 15 - Nov 15) instead of calendar month.

**US-3: Budget for Custom Periods**
> As a user, I want budgets to apply to my custom accounting period, not just calendar months.

**US-4: Reports Based on Custom Periods**
> As a user, when I view monthly reports, I want them to show data for my custom period boundaries.

**US-5: Period Navigation**
> As a user, I want to navigate between periods using prev/next buttons, with proper labels showing the actual date range (e.g., "Oct 15 - Nov 15").

### Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Add "Period Start Day" setting (1-28) in Preferences | MUST |
| FR-2 | Calculate custom period boundaries based on start day | MUST |
| FR-3 | Filter transactions by custom period instead of calendar month | MUST |
| FR-4 | Update dashboard to show custom period totals | MUST |
| FR-5 | Update budget system to align with custom periods | MUST |
| FR-6 | Update reports to use custom period boundaries | MUST |
| FR-7 | Display custom period labels in UI (e.g., "Oct 15 - Nov 15") | MUST |
| FR-8 | Handle edge cases (Feb 29, months with 30/31 days) | MUST |
| FR-9 | Maintain backward compatibility with calendar month mode | SHOULD |
| FR-10 | Allow per-account period configuration (optional) | NICE-TO-HAVE |

---

## Current Implementation Analysis

### How Monthly Periods Are Currently Defined

#### 1. State Management

**File:** `src/state/slices/appSlice.ts`

```typescript
interface AppState {
  currentMonth: string; // "YYYY-MM" format
  currentYear: string;  // "YYYY" format
}

const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};
```

**Key Finding:** Global state tracks selected "month" in YYYY-MM format, which assumes calendar months.

#### 2. Date Boundaries

**File:** `src/utils/helpers/dateUtils.ts`

Current utility functions:
- `getStartOfMonth(date)` → Returns 1st of month at 00:00
- `getEndOfMonth(date)` → Returns last day at 23:59:59
- `getMonthYear(date)` → Returns "YYYY-MM" string

**Key Finding:** All month boundary calculations hardcoded to calendar months. No support for custom start days.

#### 3. Transaction Filtering

**File:** `src/state/selectors/transactionSelectors.ts`

```typescript
export const selectCurrentMonthTransactions = createSelector(
  [(state: RootState) => state.app.currentMonth,
   api.endpoints.getTransactions.select({})],
  (currentMonth, transactionsResult) => {
    const [year, month] = currentMonth.split('-');
    return transactions.filter(tx => {
      const txDate = new Date(tx.date);
      return txDate.getFullYear().toString() === year &&
        (txDate.getMonth() + 1).toString().padStart(2, '0') === month;
    });
  }
);
```

**Key Finding:** Transaction filtering hardcoded to calendar month boundaries.

#### 4. Dashboard Period Display

**File:** `src/screens/dashboard/DashboardScreen.tsx` (lines 35-36)

```typescript
const startDate = dayjs(selectedMonth).startOf('month').toISOString();
const endDate = dayjs(selectedMonth).endOf('month').toISOString();
```

**Key Finding:** Uses dayjs `.startOf('month')` and `.endOf('month')` - needs custom period logic.

#### 5. Budget System

**File:** `src/types/global.ts` (lines 45-50)

```typescript
interface Budget extends BaseEntity {
  categoryId: UUID;
  month: string; // "YYYY-MM" format
  amount: number;
  rollover: boolean;
}
```

**Key Finding:** Budgets tied to YYYY-MM calendar month format. May need refactoring.

#### 6. Existing Foundation

**File:** `src/state/slices/preferencesSlice.ts` (line 10)

```typescript
interface AppPreferences {
  budgetStartDay: number; // 1-28 (DEFAULT: 1)
  // ... other fields
}
```

**CRITICAL FINDING:** ✅ The `budgetStartDay` field **already exists** in preferences but is:
- Not exposed in UI
- Not used in any calculations
- Set to default value of 1 (calendar month)

**This is excellent news!** We can leverage this existing field.

---

## Complexity Assessment

### Overall Complexity: HIGH ⚠️

| Category | Complexity | Rationale |
|----------|------------|-----------|
| **Date Calculations** | MEDIUM | Need new utility functions for custom period boundaries |
| **State Management** | LOW | Can reuse existing `budgetStartDay` field |
| **Transaction Filtering** | HIGH | Need to refactor selectors and queries |
| **UI Components** | MEDIUM | Need to update labels, selectors, and navigation |
| **Budget System** | HIGH | Budget period format may need migration |
| **Reports** | HIGH | Complex date iteration logic in reports |
| **Testing** | HIGH | Edge cases: leap years, month boundaries, DST |
| **Migration** | MEDIUM | Need to handle existing calendar-month budgets |

### Risk Areas

1. **Edge Cases:**
   - What happens when period start day is 31 and current month has 30 days?
   - February with 28/29 days?
   - Daylight saving time transitions?

2. **Budget Migration:**
   - Existing budgets are in "YYYY-MM" format
   - Need strategy to migrate or interpret them with new period logic

3. **Report Calculations:**
   - Complex trend iteration logic in `useReportData.ts` (lines 118-160)
   - May need significant refactoring

4. **Performance:**
   - Custom period calculations may be more expensive than calendar month logic
   - Need to ensure selectors remain performant

---

## Technical Challenges

### Challenge 1: Period Boundary Calculations

**Problem:** Determining start/end dates for a custom period is non-trivial.

**Example Scenarios:**

| Start Day | Current Date | Period Start | Period End |
|-----------|--------------|--------------|------------|
| 1 | 2025-10-25 | 2025-10-01 | 2025-10-31 |
| 15 | 2025-10-25 | 2025-10-15 | 2025-11-14 |
| 15 | 2025-11-10 | 2025-10-15 | 2025-11-14 |
| 5 | 2025-02-03 | 2025-01-05 | 2025-02-04 |
| 31 | 2025-02-15 | 2025-01-31 | 2025-02-?? |

**Edge Case:** Start day 31 in February
- Feb has only 28/29 days
- Solution options:
  1. Use last day of month (28/29)
  2. Disallow start days > 28
  3. Roll over to next month

**Recommendation:** Restrict `budgetStartDay` to 1-28 to avoid edge cases.

### Challenge 2: Period Representation

**Problem:** Current system uses "YYYY-MM" format. Custom periods span multiple months.

**Options:**

1. **Keep YYYY-MM, interpret differently**
   - "2025-10" means "period containing Oct 2025"
   - Pro: No data migration needed
   - Con: Ambiguous, confusing

2. **Use YYYY-MM-DD format**
   - "2025-10-15" means "period starting Oct 15"
   - Pro: Clear, explicit
   - Con: Requires budget table migration

3. **Add period index**
   - Calculate period number from epoch
   - Pro: Simple comparisons
   - Con: Loses human readability

**Recommendation:** Option 2 (YYYY-MM-DD) for clarity, with migration script.

### Challenge 3: UI/UX Consistency

**Problem:** Users expect "month" navigation but periods may span multiple calendar months.

**Questions:**
- How to label "Oct 15 - Nov 14"?
  - "October 2025" (misleading)
  - "Oct 15 - Nov 14" (accurate but verbose)
  - "Period 10/2025" (unclear)

- How to navigate periods?
  - Show all 12 periods per year?
  - Free scrolling through periods?

**Recommendation:**
- Label: "Oct 15 - Nov 14, 2025"
- Navigation: Prev/Next buttons increment by period length
- Month selector: Show period start month

### Challenge 4: Budget System Alignment

**Problem:** Budgets are stored per "month". With custom periods, this becomes ambiguous.

**Scenario:**
- User sets budget for "October 2025"
- Period is 15th-to-15th
- Does budget apply to:
  - Oct 1-31? (calendar month)
  - Oct 15 - Nov 14? (custom period)

**Recommendation:**
- Budgets must be tied to custom periods
- When user creates budget, store period start date (YYYY-MM-DD)
- Display budget aligned with user's period settings

---

## Files to Modify

### Category 1: Core Utilities (CRITICAL)

| File | Changes Required | Priority |
|------|------------------|----------|
| `src/utils/helpers/dateUtils.ts` | Add `getCustomPeriodStart()`, `getCustomPeriodEnd()`, `getNextPeriod()`, `getPrevPeriod()` | P0 |

**New Functions Needed:**

```typescript
/**
 * Get start date of custom accounting period
 * @param date - Any date within the period
 * @param periodStartDay - Day of month period starts (1-28)
 * @returns ISO date string of period start
 */
export const getCustomPeriodStart = (
  date: Date | string,
  periodStartDay: number
): Date;

/**
 * Get end date of custom accounting period
 * @param date - Any date within the period
 * @param periodStartDay - Day of month period starts (1-28)
 * @returns ISO date string of period end
 */
export const getCustomPeriodEnd = (
  date: Date | string,
  periodStartDay: number
): Date;

/**
 * Get period identifier string for custom period
 * @param date - Any date within the period
 * @param periodStartDay - Day of month period starts (1-28)
 * @returns String like "2025-10-15" (period start date)
 */
export const getCustomPeriodId = (
  date: Date | string,
  periodStartDay: number
): string;

/**
 * Navigate to next period
 */
export const getNextPeriod = (
  currentPeriodId: string,
  periodStartDay: number
): string;

/**
 * Navigate to previous period
 */
export const getPrevPeriod = (
  currentPeriodId: string,
  periodStartDay: number
): string;

/**
 * Format period for display
 * @returns "Oct 15 - Nov 14, 2025"
 */
export const formatPeriodLabel = (
  periodId: string,
  periodStartDay: number,
  dateFormat: DateFormat
): string;
```

---

### Category 2: State Management (HIGH PRIORITY)

| File | Changes Required | Priority |
|------|------------------|----------|
| `src/state/slices/appSlice.ts` | Change `currentMonth` to `currentPeriod`, update selectors | P0 |
| `src/state/slices/preferencesSlice.ts` | ✅ Already has `budgetStartDay`, expose in UI | P0 |
| `src/state/selectors/transactionSelectors.ts` | Refactor `selectCurrentMonthTransactions` to use custom periods | P0 |

**Changes to appSlice.ts:**

```typescript
interface AppState {
  currentPeriod: string; // Change from currentMonth, format: "YYYY-MM-DD"
  currentYear: string;   // Keep for year-based views
}

// New helper
const getCurrentPeriod = (periodStartDay: number) => {
  const now = new Date();
  return getCustomPeriodId(now, periodStartDay);
};
```

---

### Category 3: UI Components - Period Selection (HIGH PRIORITY)

| File | Changes Required | Priority |
|------|------------------|----------|
| `src/screens/dashboard/components/MonthSelector.tsx` | Update to display custom periods, handle navigation | P0 |
| `src/screens/reports/components/PeriodSelector.tsx` | Update monthly period selection | P1 |
| `src/screens/reports/components/MonthYearPicker.tsx` | Update to show period start dates | P1 |

**MonthSelector.tsx Changes:**
- Replace `.startOf('month')` with `getCustomPeriodStart()`
- Display period labels: "Oct 15 - Nov 14"
- Update prev/next navigation to use `getPrevPeriod()` / `getNextPeriod()`

---

### Category 4: Data Display - Dashboard (HIGH PRIORITY)

| File | Changes Required | Priority |
|------|------------------|----------|
| `src/screens/dashboard/DashboardScreen.tsx` | Lines 35-36: Replace month boundaries with custom period | P0 |
| `src/screens/dashboard/components/BalanceHeader.tsx` | Update period label display | P1 |
| `src/screens/dashboard/components/KPICards.tsx` | Update period-based KPI calculations | P1 |
| `src/screens/dashboard/components/TrendChart.tsx` | Update trend data period filtering | P1 |
| `src/screens/dashboard/components/CategoryBreakdown.tsx` | Update category totals for custom period | P1 |

**DashboardScreen.tsx Changes:**

```typescript
// BEFORE
const startDate = dayjs(selectedMonth).startOf('month').toISOString();
const endDate = dayjs(selectedMonth).endOf('month').toISOString();

// AFTER
const periodStartDay = useAppSelector(state => state.preferences.budgetStartDay);
const startDate = getCustomPeriodStart(selectedPeriod, periodStartDay).toISOString();
const endDate = getCustomPeriodEnd(selectedPeriod, periodStartDay).toISOString();
```

---

### Category 5: Budget System (CRITICAL)

| File | Changes Required | Priority |
|------|------------------|----------|
| `src/types/global.ts` | Update `Budget` interface - change `month` field | P0 |
| `src/screens/budgets/BudgetScreen.tsx` | Lines 55-56: Update period calculation | P0 |
| `src/screens/budgets/components/BudgetForm.tsx` | Update budget period selection | P1 |
| `src/screens/budgets/components/BudgetCreationModal.tsx` | Update period selection UI | P1 |

**Budget Interface Changes:**

```typescript
// BEFORE
interface Budget extends BaseEntity {
  categoryId: UUID;
  month: string; // "YYYY-MM" format
  amount: number;
  rollover: boolean;
}

// AFTER (Option A - Minimal change)
interface Budget extends BaseEntity {
  categoryId: UUID;
  month: string; // NOW: "YYYY-MM-DD" format (period start date)
  amount: number;
  rollover: boolean;
}

// AFTER (Option B - Explicit)
interface Budget extends BaseEntity {
  categoryId: UUID;
  periodId: string;      // "YYYY-MM-DD" (period start date)
  periodStartDay: number; // Store at time of creation for historical accuracy
  amount: number;
  rollover: boolean;
}
```

**Recommendation:** Option B for data integrity and auditability.

---

### Category 6: Reports (HIGH COMPLEXITY)

| File | Changes Required | Priority |
|------|------------------|----------|
| `src/screens/reports/ReportsScreen.tsx` | Lines 52-85: Update monthly dateRange calculation | P0 |
| `src/screens/reports/hooks/useReportData.ts` | Lines 118-160: Update trend iteration logic | P0 |
| `src/screens/reports/components/ReportHeader.tsx` | Update period label | P1 |
| `src/screens/reports/components/TrendChart.tsx` | Verify trend data alignment | P1 |

**ReportsScreen.tsx Changes:**

```typescript
// BEFORE
case 'monthly':
  start = currentDate.startOf('month');
  end = currentDate.endOf('month');
  label = currentDate.format('MMMM YYYY');
  break;

// AFTER
case 'monthly':
  const periodStartDay = preferences.budgetStartDay;
  start = dayjs(getCustomPeriodStart(currentDate, periodStartDay));
  end = dayjs(getCustomPeriodEnd(currentDate, periodStartDay));
  label = formatPeriodLabel(currentDate.toISOString(), periodStartDay, preferences.dateFormat);
  break;
```

**useReportData.ts Complexity:**
- Current logic iterates through days/weeks within period
- Needs to adapt to custom period boundaries
- Edge case: 7-day chunks may not align perfectly with custom periods

---

### Category 7: Settings UI (MEDIUM PRIORITY)

| File | Changes Required | Priority |
|------|------------------|----------|
| `src/screens/settings/components/PreferencesSettings.tsx` | Add UI for "Period Start Day" setting | P0 |

**UI Component to Add:**

```typescript
// Add to PreferencesSettings.tsx
<SettingItem
  label="Account Period Start Day"
  description="First day of your income/expense tracking period (1-28)"
  value={preferences.budgetStartDay.toString()}
  onPress={() => {
    // Open number picker modal for selecting 1-28
  }}
/>
```

**UX Considerations:**
- Show example: "If set to 15, your periods will be: Oct 15 - Nov 14, Nov 15 - Dec 14, etc."
- Warn if changing existing setting with budgets already created
- Suggest best practices (match payroll cycle)

---

### Category 8: API & Queries (MEDIUM PRIORITY)

| File | Changes Required | Priority |
|------|------------------|----------|
| `src/state/api.ts` | Update query parameters for getBudgets, getTransactions | P1 |

**Potential Changes:**
- May need to pass `periodStartDay` to backend queries (if using server-side filtering)
- Or handle all filtering client-side using selectors

---

### Category 9: Transaction Screens (LOW PRIORITY)

| File | Changes Required | Priority |
|------|------------------|----------|
| `src/screens/transactions/TransactionListScreen.tsx` | Verify period filtering works correctly | P2 |
| `src/screens/transactions/components/TransactionFilters.tsx` | Update date range filtering | P2 |

**Note:** Transaction screens mostly delegate to selectors, so changes should be minimal if selectors are updated correctly.

---

## Implementation Approach

### Phase 1: Foundation (Week 1, Days 1-3)

**Goal:** Build utility functions and update state management

**Tasks:**
1. ✅ Add new date utility functions to `dateUtils.ts`:
   - `getCustomPeriodStart()`
   - `getCustomPeriodEnd()`
   - `getCustomPeriodId()`
   - `getNextPeriod()` / `getPrevPeriod()`
   - `formatPeriodLabel()`

2. ✅ Write comprehensive unit tests for edge cases:
   - Period start day 1 (calendar month)
   - Period start day 15 (mid-month)
   - Period start day 28 (late month)
   - February boundaries
   - Year transitions (Dec → Jan)

3. ✅ Update `appSlice.ts`:
   - Rename `currentMonth` → `currentPeriod`
   - Update initializer to use `getCustomPeriodId()`
   - Update reducers

4. ✅ Expose `budgetStartDay` in Settings UI:
   - Add to `PreferencesSettings.tsx`
   - Create number picker modal (1-28)
   - Add help text / examples

**Deliverable:** Working period calculation system with settings UI

---

### Phase 2: Core Data Filtering (Week 1, Days 4-5)

**Goal:** Update transaction and budget queries to use custom periods

**Tasks:**
1. ✅ Refactor `transactionSelectors.ts`:
   - Update `selectCurrentMonthTransactions`
   - Update `selectMonthlyTotals`
   - Make period-aware

2. ✅ Update Budget data model:
   - Decide on Budget interface changes (Option A vs B)
   - Create migration script for existing budgets
   - Update `BudgetScreen.tsx` queries

3. ✅ Test data filtering:
   - Verify transactions filtered correctly
   - Verify budget amounts calculated correctly

**Deliverable:** Accurate data filtering for custom periods

---

### Phase 3: Dashboard Updates (Week 2, Days 1-2)

**Goal:** Update dashboard to display custom periods

**Tasks:**
1. ✅ Update `DashboardScreen.tsx`:
   - Replace month boundary calculations
   - Update date range queries

2. ✅ Update `MonthSelector.tsx`:
   - Display custom period labels
   - Handle prev/next navigation
   - Update "This Month" button to "This Period"

3. ✅ Update dashboard components:
   - `BalanceHeader.tsx` - period label
   - `KPICards.tsx` - period calculations
   - `TrendChart.tsx` - period data
   - `CategoryBreakdown.tsx` - period totals

**Deliverable:** Fully functional dashboard with custom periods

---

### Phase 4: Reports & Budgets (Week 2, Days 3-4)

**Goal:** Update reports and budget screens

**Tasks:**
1. ✅ Update `ReportsScreen.tsx`:
   - Monthly period calculation
   - Period label display

2. ✅ Update `useReportData.ts`:
   - Trend iteration logic
   - Handle custom period boundaries

3. ✅ Update budget components:
   - `BudgetForm.tsx`
   - `BudgetCreationModal.tsx`
   - Period selection UI

**Deliverable:** Reports and budgets working with custom periods

---

### Phase 5: Testing & Polish (Week 2, Day 5)

**Goal:** Comprehensive testing and edge case handling

**Tasks:**
1. ✅ Test all edge cases:
   - Start day 1 (should behave like calendar month)
   - Start day 15 (mid-month)
   - Start day 28 (late month)
   - February handling
   - Year transitions
   - Leap years

2. ✅ Performance testing:
   - Large transaction datasets
   - Period navigation performance
   - Selector memoization

3. ✅ UX polish:
   - Period label formatting
   - Navigation smoothness
   - Settings help text

**Deliverable:** Production-ready feature

---

## Data Model Changes

### Budget Table Migration

**Current Schema:**
```sql
CREATE TABLE budgets (
  id TEXT PRIMARY KEY,
  categoryId TEXT NOT NULL,
  month TEXT NOT NULL,  -- "YYYY-MM" format
  amount REAL NOT NULL,
  rollover INTEGER DEFAULT 0,
  createdAt TEXT,
  updatedAt TEXT
);
```

**New Schema (Option B - Recommended):**
```sql
CREATE TABLE budgets (
  id TEXT PRIMARY KEY,
  categoryId TEXT NOT NULL,
  periodId TEXT NOT NULL,      -- "YYYY-MM-DD" format (period start date)
  periodStartDay INTEGER,      -- Store for historical accuracy
  amount REAL NOT NULL,
  rollover INTEGER DEFAULT 0,
  createdAt TEXT,
  updatedAt TEXT
);
```

**Migration Script:**

```typescript
// Migration: Convert old budgets to new format
async function migrateBudgets(periodStartDay: number) {
  const oldBudgets = await db.query('SELECT * FROM budgets');

  for (const budget of oldBudgets) {
    // Old: "2025-10"
    // New: "2025-10-15" (if periodStartDay is 15)
    const [year, month] = budget.month.split('-');
    const newPeriodId = `${year}-${month}-${periodStartDay.toString().padStart(2, '0')}`;

    await db.update('budgets', budget.id, {
      periodId: newPeriodId,
      periodStartDay: periodStartDay, // Assume current setting
    });
  }
}
```

**Considerations:**
- Run migration on first app launch after update
- Store `periodStartDay` in budget record for historical accuracy
- If user changes period setting, old budgets remain tied to old period

---

## Testing Requirements

### Unit Tests

**File:** `src/utils/helpers/__tests__/dateUtils.test.ts`

Test cases:
1. ✅ Period boundaries for start day 1 (calendar month)
2. ✅ Period boundaries for start day 15
3. ✅ Period boundaries for start day 28
4. ✅ February edge cases (28/29 days)
5. ✅ Year transitions (Dec 15 → Jan 14)
6. ✅ Next/Prev period navigation
7. ✅ Period label formatting
8. ✅ Leap year handling

**File:** `src/state/selectors/__tests__/transactionSelectors.test.ts`

Test cases:
1. ✅ Filter transactions for custom period
2. ✅ Monthly totals with custom period
3. ✅ Edge case: transactions on period boundary
4. ✅ Edge case: empty periods

### Integration Tests

**Dashboard:**
1. ✅ Display correct period label
2. ✅ Show correct transactions for selected period
3. ✅ Navigate prev/next periods correctly
4. ✅ "This Period" button resets to current period

**Budgets:**
1. ✅ Create budget for custom period
2. ✅ Calculate budget vs actual correctly
3. ✅ Display correct period in budget list

**Reports:**
1. ✅ Monthly report shows custom period data
2. ✅ Trend chart aligns with period boundaries
3. ✅ Custom comparison works with custom periods

### Manual Testing Checklist

- [ ] Set period start day to 1 → should behave exactly like before
- [ ] Set period start day to 15 → verify all screens update
- [ ] Set period start day to 28 → test edge cases
- [ ] Create transactions near period boundaries
- [ ] Create budgets and verify calculations
- [ ] Navigate between periods
- [ ] Test reports with various period settings
- [ ] Change period setting mid-use → verify graceful handling

---

## Migration Strategy

### User Communication

**Before Update:**
- No action needed from users
- Setting will default to 1 (calendar month) for existing users

**After Update:**
1. Show "What's New" screen explaining feature
2. Prompt user to set their period start day
3. Explain that budgets will be migrated

### Data Migration Steps

1. **On App Launch (First Time After Update):**
   ```typescript
   if (!hasCompletedPeriodMigration) {
     const periodStartDay = preferences.budgetStartDay || 1;
     await migrateBudgets(periodStartDay);
     await setMigrationFlag('periodMigration', true);
   }
   ```

2. **Backward Compatibility:**
   - If `budgetStartDay === 1`, app behaves exactly like before
   - No breaking changes for users who don't need custom periods

3. **Rollback Plan:**
   - Keep old budget `month` field as well
   - Can revert to old logic if critical bugs found

---

## Timeline & Milestones

### Estimated Timeline: 8-10 Working Days

| Phase | Duration | Milestone |
|-------|----------|-----------|
| Phase 1: Foundation | 3 days | Period utility functions + Settings UI |
| Phase 2: Core Filtering | 2 days | Transaction/Budget selectors working |
| Phase 3: Dashboard | 2 days | Dashboard fully updated |
| Phase 4: Reports/Budgets | 2 days | All screens updated |
| Phase 5: Testing | 1 day | All tests passing, edge cases handled |

### Success Criteria

- [ ] User can set period start day (1-28) in Settings
- [ ] Dashboard displays transactions for custom period
- [ ] Period navigation works correctly
- [ ] Budgets align with custom periods
- [ ] Reports show correct data for custom periods
- [ ] All edge cases handled (Feb, year transitions)
- [ ] No performance regressions
- [ ] Backward compatible (start day 1 = calendar month)
- [ ] All tests passing (unit + integration)
- [ ] Migration script tested with production-like data

---

## Appendix A: Alternative Approaches Considered

### Alternative 1: Per-Account Period Settings

**Description:** Allow each account to have its own period start day.

**Pros:**
- Ultimate flexibility (checking account 1st-1st, credit card 15th-15th)
- Matches real-world use case better

**Cons:**
- Massively increases complexity
- Reports would need account filtering
- Budget system would need account awareness
- UI becomes confusing (which account's period to show?)

**Decision:** Defer to v2. Start with global period setting.

### Alternative 2: Completely Free Date Ranges

**Description:** No concept of "period", just free date range selection.

**Pros:**
- Maximum flexibility
- Simple implementation

**Cons:**
- Loses period navigation (prev/next month)
- Budgets have no natural boundaries
- Inconsistent with user mental model (users think in monthly cycles)

**Decision:** Reject. Users want structured periods.

### Alternative 3: Keep Calendar Months, Add "Offset" View

**Description:** Still store/calculate in calendar months, but shift display by N days.

**Pros:**
- Minimal backend changes
- Budgets don't need migration

**Cons:**
- Confusing UX (internal vs display dates)
- Hard to reason about
- Reports would be complex

**Decision:** Reject. Clean separation between period and display is better.

---

## Appendix B: Key Files Reference

### Files with CRITICAL Changes
1. `src/utils/helpers/dateUtils.ts` - Add period calculation functions
2. `src/state/slices/appSlice.ts` - Change currentMonth to currentPeriod
3. `src/state/selectors/transactionSelectors.ts` - Update filtering
4. `src/screens/dashboard/DashboardScreen.tsx` - Update period boundaries
5. `src/screens/budgets/BudgetScreen.tsx` - Update period queries
6. `src/screens/reports/ReportsScreen.tsx` - Update period calculation
7. `src/types/global.ts` - Update Budget interface

### Files with MEDIUM Changes
8. `src/screens/dashboard/components/MonthSelector.tsx` - Period navigation
9. `src/screens/settings/components/PreferencesSettings.tsx` - Add setting UI
10. `src/screens/reports/hooks/useReportData.ts` - Update trend logic

### Files with MINOR Changes
11. `src/screens/dashboard/components/BalanceHeader.tsx` - Label update
12. `src/screens/dashboard/components/KPICards.tsx` - Use period data
13. `src/screens/budgets/components/BudgetForm.tsx` - Period selection
14. `src/screens/reports/components/PeriodSelector.tsx` - Label update

---

## Conclusion

This feature is **feasible but non-trivial**. The good news is that the foundation (`budgetStartDay` field) already exists. The challenge is systematically updating all components to use custom period calculations instead of calendar months.

**Key Recommendations:**

1. ✅ **Restrict period start day to 1-28** to avoid edge cases
2. ✅ **Store period start date in Budget records** for historical accuracy
3. ✅ **Implement in phases** - test thoroughly at each phase
4. ✅ **Maintain backward compatibility** - default to 1 for existing users
5. ⚠️ **Focus on edge case testing** - February, year transitions, leap years
6. ⚠️ **Watch performance** - ensure selectors remain memoized

**Estimated Effort:** 8-10 days for complete implementation and testing.

**Risk Level:** Medium (manageable with careful planning)

**User Impact:** HIGH (addresses critical user need, improves app usability significantly)

---

**Document End**
