# Sale

Test intent for the sale domain: the sales list, its search and date filters, and the
sale row actions. Scope: `src/features/sale/**` and the sales routes under
`src/routes/dashboard/_dashboardLayout/sales/**`.

## Coverage summary

| Status      | Count  |
| ----------- | ------ |
| Implemented | 2      |
| Partial     | 1      |
| Missing     | 9      |
| Obsolete    | 0      |
| **Total**   | **12** |

## Sale table

### SALE-001 · Sale row shows its invoice, customer, items, totals, and payment status

- **Covers:** `saleTableColumn` — `src/features/sale/components/sale-table/saleTableColumn.tsx`
- **Type:** component · **Priority:** P1 · **Status:** Missing
- **Given** a sale with invoice `INV-001`, a customer, two items, a total of 500, and a
  paid amount of 200
- **When** the sale table renders the row
- **Then** the row shows the invoice number and created date, the customer name and
  phone, the item count, the formatted total and paid amounts, and a
  “Partially paid” status badge with the 300 outstanding due
- **Notes:** Assert money with an epsilon. A null customer renders “Walk-in customer”.

### SALE-002 · Global search filters sales by invoice number, customer name, or phone

- **Covers:** `SaleManagementTable` — `src/features/sale/components/sale-table/SaleManagementTable.tsx`
- **Type:** component · **Priority:** P1 · **Status:** Missing
- **Given** the sales route is open with the default filters
- **When** the user types a search term and the debounce elapses
- **Then** the list request carries the term with `searchFields` set to
  `invoiceNo`, `customerName`, and `customerPhone`, and the page resets to the first page
- **Notes:** Mock the oRPC query client and assert the request input.

### SALE-003 · Time range filter narrows sales by creation date

- **Covers:** `SaleManagementTable` — `src/features/sale/components/sale-table/SaleManagementTable.tsx`
- **Type:** component · **Priority:** P1 · **Status:** Missing
- **Given** the sales route is open
- **When** the user picks a preset or custom range in the time range filter
- **Then** the list request includes a `from`/`to` filter for the selected start and end
  times and the page resets to the first page
- **Notes:** Verify the filter is absent when the range is cleared.

### SALE-004 · Clearing the time range removes the date restriction

- **Covers:** `SaleManagementTable` — `src/features/sale/components/sale-table/SaleManagementTable.tsx`
- **Type:** component · **Priority:** P2 · **Status:** Missing
- **Given** a time range is active
- **When** the user presses the reset control in the time range filter
- **Then** the range, start time, and end time leave the route search, and the list
  request no longer sends a date filter
- **Notes:** Covers the reset path of `TimeRangeFilter` when wired to the sales route.

### SALE-005 · Empty state is shown when no sales match the filters

- **Covers:** `SaleManagementTable` — `src/features/sale/components/sale-table/SaleManagementTable.tsx`
- **Type:** component · **Priority:** P2 · **Status:** Missing
- **Given** the list request succeeds with an empty `data` array
- **When** the sale table renders
- **Then** the empty-data fallback is shown instead of an empty table body
- **Notes:** Also assert the loading fallback while the request is pending.

### SALE-006 · Row actions depend on whether the sale has a customer

- **Covers:** `SaleTableRowAction` — `src/features/sale/components/sale-table/SaleTableRowAction.tsx`
- **Type:** component · **Priority:** P2 · **Status:** Missing
- **Given** a sale row
- **When** the row action menu opens
- **Then** “Copy invoice no” is always available and copies the invoice number, while
  “Customer details” appears only when the sale has a customer and links to that
  customer's details
- **Notes:** Stub the clipboard and assert the copied value and the toast.

### SALE-007 · The sales route requires sale list or manage permission

- **Covers:** `Route` — `src/routes/dashboard/_dashboardLayout/sales/index.tsx`
- **Type:** e2e · **Priority:** P0 · **Status:** Missing
- **Given** a signed-in user without the `sale:list` or `sale:manage` permission
- **When** the user opens `/dashboard/sales`
- **Then** the route blocks access; a user holding either permission can load the list
- **Notes:** Exercise `requirePermissions` through the route's `beforeLoad`.

### SALE-008 · The invoice column sorts by creation date

- **Covers:** `saleTableColumn` — `src/features/sale/components/sale-table/saleTableColumn.tsx`
- **Type:** component · **Priority:** P2 · **Status:** Missing
- **Given** the sale table is rendered
- **When** the user sorts the invoice column ascending or descending
- **Then** the route search receives `orderField=createdAt` with the matching `order`
  value, because creation date is the only sortable field exposed by the list contract
- **Notes:** The column is keyed by `createdAt` while presenting the invoice and date.

### SALE-009 · Sale list applies the from/to date filter

- **Covers:** `listSaleProcedure` — `src/features/sale/api/sale.procedure.ts`
- **Type:** integration · **Priority:** P1 · **Status:** Missing
- **Given** sales exist inside and outside a requested date range
- **When** the list procedure receives `filter: { from, to }`
- **Then** only sales whose `createdAt` falls inside the inclusive range are returned, and
  the pagination totals match that filtered set
- **Notes:** Guards the mapping from the public `{ from, to }` filter to the paginate
  helper's `{ createdAt: { from, to } }` shape. Delete a filter key to assert the open-ended
  boundary behavior.

### SALE-010 · Sales link appears in the Sales sidebar group

- **Covers:** `sidebarMenuLinks` — `src/constants/sidebarLinks.tsx`
- **Type:** component · **Priority:** P2 · **Status:** Missing
- **Given** a user with the `sale:list` or `sale:manage` permission
- **When** the dashboard sidebar renders
- **Then** the Sales group shows a “Sales” link to `/dashboard/sales` with the receipt icon
- **And** the link is hidden for users without either permission, and is marked active on
  `/dashboard/sales` including a trailing slash
- **Notes:** Covers the route-to-sidebar wiring for the sales list page.

## Sale stats

### SALE-011 · Sale stats cards show count, revenue, collected, and outstanding due

- **Covers:** `SaleStats` — `src/features/sale/components/SaleStats.tsx`
- **Type:** component · **Priority:** P1 · **Status:** Implemented
- **Given** the stats query resolves with 7 sales, a revenue of 12,500, a collected amount of
  10,000, and a due of 2,500
- **When** the sale stats render
- **Then** the cards show “Total Sales” 7, “Revenue” 12,500 ৳, “Collected” 10,000 ৳, and
  “Outstanding Due” 2,500 ৳
- **Notes:** Test: `src/features/sale/components/SaleStats.test.tsx`.

### SALE-012 · Sale stats request uses the active date range

- **Covers:** `SaleStats` — `src/features/sale/components/SaleStats.tsx`
- **Type:** component · **Priority:** P1 · **Status:** Implemented
- **Given** the sales route has a start and end time in its search
- **When** the sale stats query is built
- **Then** the request carries `filter: { from, to }` with those times; with no range the
  request carries no filter
- **Notes:** Test: `src/features/sale/components/SaleStats.test.tsx`.

### SALE-013 · Sale stats procedure returns totals and zeros when no sales match

- **Covers:** `saleStatsProcedure` — `src/features/sale/api/sale.procedure.ts`
- **Type:** integration · **Priority:** P1 · **Status:** Partial
- **Given** the stats procedure runs against aggregated sale rows
- **When** it receives a date filter, or no filter and no matching rows
- **Then** it returns `saleCount`, `totalRevenue`, `totalPaid`, and `dueAmount` (revenue minus
  paid), and all zeros when no sales match
- **Notes:** Test: `src/features/sale/api/sale.procedure.test.ts`. Partial because the database
  is mocked, so the SQL date-range boundary is not asserted. Real D1 coverage is still
  missing (see SALE-009 for the same gap on the list procedure).

## Source map

| Source file                                                       | Test file                                                   | Cases                |
| ----------------------------------------------------------------- | ----------------------------------------------------------- | -------------------- |
| `src/constants/sidebarLinks.tsx`                                  | —                                                           | SALE-010             |
| `src/features/sale/api/sale.procedure.ts`                         | `src/features/sale/api/sale.procedure.test.ts` (stats only) | SALE-009, SALE-013   |
| `src/features/sale/components/SaleStats.tsx`                      | `src/features/sale/components/SaleStats.test.tsx`           | SALE-011, SALE-012   |
| `src/features/sale/components/sale-table/SaleManagementTable.tsx` | —                                                           | SALE-002 to SALE-005 |
| `src/features/sale/components/sale-table/SaleTable.tsx`           | —                                                           | SALE-001             |
| `src/features/sale/components/sale-table/saleTableColumn.tsx`     | —                                                           | SALE-001, SALE-008   |
| `src/features/sale/components/sale-table/SaleTableRowAction.tsx`  | —                                                           | SALE-006             |
| `src/routes/dashboard/_dashboardLayout/sales/index.tsx`           | —                                                           | SALE-007             |
