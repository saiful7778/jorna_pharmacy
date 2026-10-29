# Dashboard Home

Owner of the dashboard home page: `src/routes/dashboard/_dashboardLayout/index.tsx` and the
`src/features/dashboard/components/**` overview, quick actions, KPI cards, sales chart,
daily sale summary, and payments card. The sale, purchase, and sale closing data comes from
their feature folders; the per-day sales endpoint `sale.trend` is covered here as well.

## Coverage summary

| Status      | Count |
| ----------- | ----- |
| Implemented | 0     |
| Partial     | 0     |
| Missing     | 8     |
| Obsolete    | 0     |

## Source map

- `src/routes/dashboard/_dashboardLayout/index.tsx`
- `src/features/dashboard/components/DashboardOverview.tsx`
- `src/features/dashboard/components/DashboardQuickActions.tsx`
- `src/features/dashboard/components/DashboardKpis.tsx`
- `src/features/dashboard/components/SalesTrendChart.tsx`
- `src/features/dashboard/components/DailySaleSummary.tsx`
- `src/features/dashboard/components/PaymentsSummary.tsx`
- `src/components/ui/chart.tsx` (shadcn chart primitive; third-party wrapper, covered through the sales chart)
- `src/features/sale/api/sale.procedure.ts` (`saleTrendProcedure`) and `sale.contract.ts` (`saleTrendContract`), covered by DASH-007
- Test files not yet created (planned under `src/features/dashboard/components/` and `src/routes/dashboard/_dashboardLayout/index.test.tsx`)

## Cases

### DASH-001 · Each section appears only for users who can read its figures

- **Covers:** `DashboardOverview` — `src/features/dashboard/components/DashboardOverview.tsx`
- **Type:** component · **Priority:** P0 · **Status:** Missing
- **Given** a user whose permissions include sale list but not purchase read, sale closing list, customer payment read, or company payment read
- **When** the home page renders
- **Then** only the sales KPIs and the sales chart render, and no stats or trend request is made for the purchases, daily sale, or payments sections
- **Notes:** The gates use the same permission sets as the endpoints: `manage` or `list` for sales and sale closings, `manage` or `read` for purchases and payments.

### DASH-002 · Quick actions show only the pages the user can open

- **Covers:** `DashboardQuickActions` — `src/features/dashboard/components/DashboardQuickActions.tsx`
- **Type:** component · **Priority:** P1 · **Status:** Missing
- **Given** a user with sale list permission only
- **When** the quick actions render
- **Then** only the All sales button is shown; New sale and Daily sale are not
- **Notes:** The row is hidden entirely when the user has none of the three permissions.

### DASH-003 · New sale opens the sale create dialog on the home page

- **Covers:** `DashboardQuickActions` — `src/features/dashboard/components/DashboardQuickActions.tsx`
- **Type:** component · **Priority:** P1 · **Status:** Missing
- **Given** a user with sale manage or sale create permission
- **When** the user clicks New sale
- **Then** the sale create dialog opens and the route does not change
- **Notes:** Needs permission mocks and a stubbed `SaleCreateDialog`.

### DASH-008 · New Purchase opens the purchase create dialog on the home page

- **Covers:** `DashboardQuickActions` — `src/features/dashboard/components/DashboardQuickActions.tsx`
- **Type:** component · **Priority:** P1 · **Status:** Missing
- **Given** a user with purchase manage or purchase create permission
- **When** the user clicks New Purchase
- **Then** the purchase create dialog opens and the route does not change
- **Given** a user with neither purchase permission
- **Then** the New Purchase button is not rendered
- **Notes:** Needs permission mocks and a stubbed `PurchaseCreateDialog`.

### DASH-004 · Home range defaults to today and is kept in the URL

- **Covers:** `Route` validation and `RouteComponent` — `src/routes/dashboard/_dashboardLayout/index.tsx`
- **Type:** component · **Priority:** P1 · **Status:** Missing
- **Given** the home page is opened with no range in the URL, with the current time frozen to a fixed date
- **When** the page validates its search params
- **Then** `range` is `TODAY`, `startTime` is local 00:00:00.000 of that day, and `endTime` is local 23:59:59.999 of that day
- **When** the user picks another range in the time filter
- **Then** the URL search updates with that range and its start and end times, and every figure on the page uses those times
- **Notes:** Freeze time with fake timers.

### DASH-005 · Payments card sends the selected range and shows only the columns the user can read

- **Covers:** `PaymentsSummary` — `src/features/dashboard/components/PaymentsSummary.tsx`
- **Type:** component · **Priority:** P1 · **Status:** Missing
- **Given** a selected range, and a user who can read customer payments but not company payments
- **When** the card renders
- **Then** the customer column requests stats with `filter.createdAt` set to the range and shows "Received" and "Net due"; the company column is not rendered
- **Notes:** Backend filtering is covered by CUST-019 and COMP-032.

### DASH-006 · A message is shown when the user has no dashboard figures

- **Covers:** `DashboardOverview` — `src/features/dashboard/components/DashboardOverview.tsx`
- **Type:** component · **Priority:** P2 · **Status:** Missing
- **Given** a user with none of the sale, purchase, sale closing, or payment permissions
- **When** the home page renders
- **Then** the message "Your role does not have access to any dashboard figures yet." is shown and no section is rendered

### DASH-007 · Sales chart groups sales by the user's local day

- **Covers:** `SalesTrendChart` — `src/features/dashboard/components/SalesTrendChart.tsx`; `saleTrendProcedure` — `src/features/sale/api/sale.procedure.ts`
- **Type:** integration · **Priority:** P1 · **Status:** Missing
- **Given** sales created at 23:30 UTC on one day, for a client whose UTC offset is +06:00
- **When** `sale.trend` is requested with `utcOffsetMinutes: 360`
- **Then** the sale is counted under the next local day, with `saleCount`, `revenue`, and `collected` summed per day, sorted by date ascending
- **When** the chart renders with no rows in the range
- **Then** the text "No sales in the selected range." is shown instead of the chart
- **Notes:** Soft-deleted sales are excluded. Needs a seeded D1 database for the procedure part.
