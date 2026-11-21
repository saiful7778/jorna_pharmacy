# Sale closing

Test intent for the sale-closing (daily cash close) domain: expected cash, the create
flow, the list, the stats, and the closing UI. Scope: `src/features/sale-closings/**`.

ID prefix: `CLOSE`.

## Coverage summary

| Status      | Count  |
| ----------- | ------ |
| Implemented | 8      |
| Partial     | 0      |
| Missing     | 9      |
| Obsolete    | 0      |
| **Total**   | **17** |

## Cash math

### CLOSE-001 · Expected cash adds receipts and subtracts every outflow once

- **Covers:** `calculateExpectedCash` — `src/features/sale-closings/saleClosing.calc.ts`
- **Type:** unit · **Priority:** P0 · **Status:** Implemented
- **Given** opening cash 1000, cash received 5000, expenses 300, salary 1200, and
  company paid 500
- **When** expected cash is calculated
- **Then** the result is 4000
- **Notes:** Test: `src/features/sale-closings/saleClosing.calc.test.ts`.

### CLOSE-002 · Missing opening cash and company payment count as zero

- **Covers:** `calculateExpectedCash` — `src/features/sale-closings/saleClosing.calc.ts`
- **Type:** unit · **Priority:** P1 · **Status:** Implemented
- **Given** a closing with null opening cash and null company paid
- **When** expected cash is calculated
- **Then** both nulls are treated as zero and the result is cash received minus expenses
  and salary
- **Notes:** Test: `src/features/sale-closings/saleClosing.calc.test.ts`.

## Create

### CLOSE-003 · A closing stores gross totals, uses total sales as cash received, and records the user

- **Covers:** `saleClosingCreateProcedure` — `src/features/sale-closings/api/saleClosing.procedure.ts`
- **Type:** integration · **Priority:** P0 · **Status:** Implemented
- **Given** a closing submitted with total sales 12,500 and total salary 3,000
- **When** the closing is created
- **Then** `totalSales` is 12,500 and `cashReceived` is 12,500 (the submitted total sales),
  `totalSalary` is 3,000, `closedBy` is the signed-in user, the period starts at today's
  UTC midnight and ends at the request time
- **Then** the closing's `expectedCash` is 9,500, because salary is subtracted once as its
  own outflow and is **not** netted out of the stored totals
- **Notes:** Test: `src/features/sale-closings/api/saleClosing.create.procedure.test.ts`.
  Guards the regression where salary was subtracted twice: netting salary out of
  `totalSales`/`cashReceived` and then again in `calculateExpectedCash`.

### CLOSE-004 · A second closing on the same day is rejected

- **Covers:** `saleClosingCreateProcedure` — `src/features/sale-closings/api/saleClosing.procedure.ts`
- **Type:** integration · **Priority:** P0 · **Status:** Implemented
- **Given** a closing already exists with a period end after today's UTC midnight
- **When** another closing is created later the same day
- **Then** the request fails with `ALREADY_CLOSED_TODAY` and only one closing is stored
- **Notes:** Test: `src/features/sale-closings/api/saleClosing.create.procedure.test.ts`.

### CLOSE-005 · The next closing starts where the previous one ended

- **Covers:** `saleClosingCreateProcedure` — `src/features/sale-closings/api/saleClosing.procedure.ts`
- **Type:** integration · **Priority:** P0 · **Status:** Implemented
- **Given** a closing created yesterday at 20:00
- **When** a closing is created the next day at 09:00
- **Then** the new period starts at the previous period's end and ends at the request time,
  so no sales fall between periods
- **Notes:** Test: `src/features/sale-closings/api/saleClosing.create.procedure.test.ts`.

### CLOSE-006 · Closing amounts accept non-negative strings and reject empty or negative values

- **Covers:** `saleClosingCreateSchema` — `src/features/sale-closings/saleClosing.schema.ts`
- **Type:** unit · **Priority:** P1 · **Status:** Implemented
- **Given** amount fields typed into the form
- **When** the values are validated
- **Then** `"1500.5"` coerces to 1500.5, an empty string is rejected as required, and a
  negative value is rejected
- **Notes:** Test: `src/features/sale-closings/api/saleClosing.create.procedure.test.ts`.

### CLOSE-007 · Creating a closing requires the create or manage permission

- **Covers:** `saleClosingCreateProcedure` — `src/features/sale-closings/api/saleClosing.procedure.ts`
- **Type:** integration · **Priority:** P0 · **Status:** Missing
- **Given** a signed-in user without `sale_closing:create` or `sale_closing:manage`
- **When** the create procedure is called
- **Then** the request is rejected before any closing is written
- **Notes:** The auth middleware is stubbed in the existing tests, so this is not asserted.

## List, stats, and details

### CLOSE-008 · Closing stats total the selected period and count uncounted closings

- **Covers:** `saleClosingStatsProcedure` — `src/features/sale-closings/api/saleClosing.procedure.ts`
- **Type:** integration · **Priority:** P1 · **Status:** Missing
- **Given** closings inside and outside a requested period-end range, some with a counted
  cash value and some without
- **When** stats are requested with `filter: { periodEnd: { from, to } }`
- **Then** `closingCount`, `totalSales`, `cashReceived`, `uncountedCount`, and
  `netVariance` only reflect the matching closings, and `netVariance` sums counted cash
  minus expected cash
- **Notes:** The expected-cash expression in the stats SQL must stay equal to
  `calculateExpectedCash`; see CLOSE-003 for the salary rule.

### CLOSE-009 · A closing list row returns its totals, expected cash, and closing user

- **Covers:** `listSaleClosingProcedure` — `src/features/sale-closings/api/saleClosing.procedure.ts`
- **Type:** integration · **Priority:** P1 · **Status:** Missing
- **Given** closings closed by users with roles, plus an older closing with no closing user
- **When** the list is requested with pagination
- **Then** each row returns the period, `totalSales`, `cashReceived`, `totalSalary`,
  `countedCash`, `expectedCash`, and `closedByUser` with the user's roles, or `null` when
  no user is linked
- **Notes:** Assert money with an epsilon. Pagination totals must match the filter.

### CLOSE-010 · Closing details return one closing with its user and expected cash

- **Covers:** `saleClosingDetailsProcedure` — `src/features/sale-closings/api/saleClosing.procedure.ts`
- **Type:** integration · **Priority:** P1 · **Status:** Missing
- **Given** an existing closing and an unknown id
- **When** details are requested for each
- **Then** the existing closing is returned with `closedByUser` and `expectedCash`, and the
  unknown id returns `NOT_FOUND`
- **Notes:** Needs a D1/Drizzle fixture.

## Components

### CLOSE-011 · Closing stats cards show count, sales, cash received, variance, and uncounted closings

- **Covers:** `SaleClosingStats` — `src/features/sale-closings/components/SaleClosingStats.tsx`
- **Type:** component · **Priority:** P1 · **Status:** Implemented
- **Given** the stats query resolves with 12 closings, 12,500 sales, 10,000 cash received,
  a variance of -250, and 2 uncounted closings
- **When** the stats render
- **Then** the cards show "Closings" 12, "Total sales" 12,500 ৳, "Cash received" 10,000 ৳,
  "Net variance" -250 ৳, and "2 closings not counted"
- **Notes:** Test: `src/features/sale-closings/components/SaleClosingStats.test.tsx`.

### CLOSE-012 · Closing stats request uses the active period-end range

- **Covers:** `SaleClosingStats` — `src/features/sale-closings/components/SaleClosingStats.tsx`
- **Type:** component · **Priority:** P1 · **Status:** Implemented
- **Given** the route has a start and end time
- **When** the stats query is built
- **Then** the request carries `filter: { periodEnd: { from, to } }` with those times
- **Notes:** Test: `src/features/sale-closings/components/SaleClosingStats.test.tsx`.

### CLOSE-013 · Closing table rows show the period, sales, salary, counted cash, and status

- **Covers:** `saleClosingTableColumn` — `src/features/sale-closings/components/sale-closing-table/saleClosingTableColumn.tsx`
- **Type:** component · **Priority:** P1 · **Status:** Missing
- **Given** a closing row with totals and a counted cash value
- **When** the closing table renders the row
- **Then** the row shows the period dates, right-aligned Total sales and Salary amounts, the
  counted cash (or "Not counted"), and a variance status badge
- **Notes:** Assert money with an epsilon. Cover the not-counted, balanced, over, and short
  statuses.

### CLOSE-014 · The create dialog submits both amounts and closes on success

- **Covers:** `SaleClosingCreateDialog` — `src/features/sale-closings/components/SaleClosingCreateDialog.tsx`
- **Type:** component · **Priority:** P1 · **Status:** Missing
- **Given** the create dialog closed, and the user has `sale_closing:create`
- **When** the user enters total sales and total salary and submits
- **Then** the create mutation runs with both entered values, the form resets, and the
  dialog closes on success
- **Notes:** Needs a mocked oRPC client. Assert validation errors are mapped back onto the
  fields.

### CLOSE-015 · The view dialog shows sales, outflows, and cash reconciliation

- **Covers:** `SaleClosingViewDialog` — `src/features/sale-closings/components/SaleClosingViewDialog.tsx`
- **Type:** component · **Priority:** P1 · **Status:** Missing
- **Given** a closing with totals, outflows, opening cash, and a counted cash value
- **When** the view dialog opens
- **Then** it shows Total sales, Cash received, Expenses, Salary, Company paid, Opening
  cash, Expected cash, and Counted cash, and only shows Due-style extras when present
- **Notes:** A null counted cash renders "Not counted". Expected cash uses the API value,
  not a client-side recalculation.

### CLOSE-016 · Closing row action opens the view dialog

- **Covers:** `SaleClosingTableRowAction` — `src/features/sale-closings/components/sale-closing-table/SaleClosingTableRowAction.tsx`
- **Type:** component · **Priority:** P2 · **Status:** Missing
- **Given** a closing row
- **When** the row menu opens and the user selects "View closing"
- **Then** the view dialog opens for that closing, and no delete action is offered because
  closings are an audit record and there is no delete procedure
- **Notes:** Needs a mocked oRPC client for the details query.

### CLOSE-017 · The closings page requires the list or manage permission

- **Covers:** `Route` — `src/routes/dashboard/_dashboardLayout/sale-closings.tsx`
- **Type:** e2e · **Priority:** P0 · **Status:** Missing
- **Given** a signed-in user without `sale_closing:list` or `sale_closing:manage`
- **When** the user opens `/dashboard/sale-closings`
- **Then** the route blocks access; a user holding either permission can load it
- **Notes:** Exercise `requirePermissions` through the route's `beforeLoad`.

## Source map

| Source file                                                                              | Test file                                                             | Cases                                          |
| ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ---------------------------------------------- |
| `src/features/sale-closings/saleClosing.calc.ts`                                         | `src/features/sale-closings/saleClosing.calc.test.ts`                 | CLOSE-001, CLOSE-002                           |
| `src/features/sale-closings/saleClosing.schema.ts`                                       | `src/features/sale-closings/api/saleClosing.create.procedure.test.ts` | CLOSE-006                                      |
| `src/features/sale-closings/api/saleClosing.procedure.ts`                                | `src/features/sale-closings/api/saleClosing.create.procedure.test.ts` | CLOSE-003 to CLOSE-005, CLOSE-007 to CLOSE-010 |
| `src/features/sale-closings/api/saleClosing.contract.ts`                                 | —                                                                     | CLOSE-008 to CLOSE-010                         |
| `src/features/sale-closings/api/saleClosing.api.hook.ts`                                 | —                                                                     | CLOSE-014 to CLOSE-016                         |
| `src/features/sale-closings/components/SaleClosingStats.tsx`                             | `src/features/sale-closings/components/SaleClosingStats.test.tsx`     | CLOSE-011, CLOSE-012                           |
| `src/features/sale-closings/components/SaleClosingCreateDialog.tsx`                      | —                                                                     | CLOSE-014                                      |
| `src/features/sale-closings/components/SaleClosingViewDialog.tsx`                        | —                                                                     | CLOSE-015                                      |
| `src/features/sale-closings/components/sale-closing-table/saleClosingTableColumn.tsx`    | —                                                                     | CLOSE-013                                      |
| `src/features/sale-closings/components/sale-closing-table/SaleClosingTableRowAction.tsx` | —                                                                     | CLOSE-016                                      |
