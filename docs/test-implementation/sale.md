# Sale

Test intent for the sale domain: the sales list, its search and date filters, and the
sale row actions. Scope: `src/features/sale/**` and the sales routes under
`src/routes/dashboard/_dashboardLayout/sales/**`.

## Coverage summary

| Status      | Count  |
| ----------- | ------ |
| Implemented | 14     |
| Partial     | 2      |
| Missing     | 16     |
| Obsolete    | 0      |
| **Total**   | **32** |

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
- **Then** “New payment” appears only when the sale has a customer, the sale's `dueAmount` is
  greater than 0, and the user has `customer_payment.create`. Choosing it opens the payment dialog for that customer with this
  sale pre-selected
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

## Sale create

### SALE-014 · Sale create allocates a line across earliest-expiry batches and decrements stock

- **Covers:** `saleCreateProcedure` — `src/features/sale/api/sale.procedure.ts`
- **Type:** integration · **Priority:** P0 · **Status:** Implemented
- **Given** two batches of the same medicine, the later-expiring one listed first, and a sale
  of 4 units priced at 44
- **When** the sale is created
- **Then** the sale subtotal and total are 44, the line is split 2 from the earliest-expiry
  batch (unit price 10, unit cost 6, line total 20) and 2 from the later batch (unit price 12,
  unit cost 7, line total 24), and each batch's remaining quantity is reduced accordingly
- **Notes:** Test: `src/features/sale/api/sale.procedure.test.ts`. Runs against a real
  in-memory SQLite database built from `full-schema.sql`.

### SALE-015 · Sale create aggregates duplicate medicine lines before allocating

- **Covers:** `saleCreateProcedure` — `src/features/sale/api/sale.procedure.ts`
- **Type:** integration · **Priority:** P1 · **Status:** Implemented
- **Given** a sale with two lines for the same medicine (quantities 1 and 2)
- **When** the sale is created
- **Then** a single sale item is written for the batch with quantity 3 and line total 30
- **Notes:** Test: `src/features/sale/api/sale.procedure.test.ts`.

### SALE-016 · Sale create rejects over-stock requests without writing

- **Covers:** `saleCreateProcedure` — `src/features/sale/api/sale.procedure.ts`
- **Type:** integration · **Priority:** P0 · **Status:** Implemented
- **Given** a batch with 3 units remaining and a sale of 4 units
- **When** the sale is created
- **Then** the request fails with `BAD_REQUEST`, no sale or sale item rows are written, and the
  batch quantity remains 3
- **Notes:** Test: `src/features/sale/api/sale.procedure.test.ts`.

### SALE-017 · Sale create rejects an unknown medicine

- **Covers:** `saleCreateProcedure` — `src/features/sale/api/sale.procedure.ts`
- **Type:** integration · **Priority:** P1 · **Status:** Implemented
- **Given** a sale line referencing a medicine ID that does not exist
- **When** the sale is created
- **Then** the request fails with `NOT_FOUND` and no sale row is written
- **Notes:** Test: `src/features/sale/api/sale.procedure.test.ts`.

### SALE-033 · A walk-in sale with no customer is recorded as fully paid

- **Covers:** `saleCreateProcedure` — `src/features/sale/api/sale.procedure.ts`
- **Type:** integration · **Priority:** P0 · **Status:** Partial
- **Given** a sale with no customer ID or name, one item for 2 units priced at 10, and a submitted paid amount of 0
- **When** the sale is created
- **Then** the sale has no customer, and its `paidAmount` equals its `totalAmount` (20), ignoring the submitted paid amount
- **Notes:** Test: `src/features/sale/api/sale.procedure.test.ts`. Partial because the test does not yet pass: `seedBase` fails on `companies.deleted_at`, which is missing from `full-schema.sql`. This failure predates this change and also affects the other create tests in the file.

### SALE-018 · Batches of a soft-deleted purchase are not sold and not counted as stock

- **Covers:** `saleCreateProcedure` — `src/features/sale/api/sale.procedure.ts`; `listMedicineForSearchProcedure` — `src/features/medicine/api/medicine.procedure.ts`
- **Type:** integration · **Priority:** P0 · **Status:** Missing
- **Given** a medicine with batches from an active purchase and from a purchase that was soft-deleted with its company
- **When** a sale for that medicine is created, or the medicine search is requested
- **Then** the sale allocates only the active purchase's batches, and the search stock and sell price come from the active batches only
- **Notes:** Batch selection joins `purchases` and filters `deleted_at IS NULL`, because `purchase_items` has no soft-delete column.

### SALE-019 · Sale delete moves the sale to the bin, returns its stock, and moves its payments to the bin

- **Covers:** `deleteSaleProcedure` — `src/features/sale/api/saleDelete.procedure.ts`
- **Type:** integration · **Priority:** P0 · **Status:** Implemented
- **Given** an active sale with a sale item of 4 units from a batch with 5 remaining and a linked customer payment
- **When** `delete` is called with its `saleId`
- **Then** `deletedAt` and `deletedBy` are set on the sale and its payment, the batch has 9 remaining, and the sale items stay in place. Deleting the same sale again returns `NOT_FOUND`.
- **Notes:** Asserted in `saleDelete.procedure.test.ts`.

### SALE-020 · Bulk sale delete returns the stock of every selected sale

- **Covers:** `deleteAllSaleProcedure` — `src/features/sale/api/saleDelete.procedure.ts`
- **Type:** integration · **Priority:** P0 · **Status:** Implemented
- **Given** two active sales whose items draw from the same batch
- **When** `deleteAll` is called with both ids
- **Then** `count` is 2 and the batch stock returns to its purchased level. If any id is not active, the call returns `NOT_FOUND` and nothing changes.
- **Notes:** Asserted in `saleDelete.procedure.test.ts`. The `NOT_FOUND` path for a mixed list is not yet asserted.

### SALE-021 · Permanent sale remove applies only to bin sales and leaves stock unchanged

- **Covers:** `removeSaleProcedure`, `removeAllSaleProcedure` — `src/features/sale/api/saleDelete.procedure.ts`
- **Type:** integration · **Priority:** P0 · **Status:** Implemented
- **Given** an active sale, and a bin sale with linked payments
- **When** `remove` is called for the active sale, then for the bin sale, and `removeAll` is called with a list containing one active sale
- **Then** the active sale returns `NOT_IN_BIN`. The bin sale, its sale items, and its payments are deleted, and batch stock is unchanged. `removeAll` with any non-bin id returns `NOT_IN_BIN` and deletes nothing.
- **Notes:** Asserted in `saleDelete.procedure.test.ts`.

### SALE-022 · Bin list returns only soft-deleted sales

- **Covers:** `listSaleBinProcedure` — `src/features/sale/api/saleDelete.procedure.ts`
- **Type:** integration · **Priority:** P0 · **Status:** Implemented
- **Given** an active sale and a sale moved to the bin
- **When** `listBin` is called with pagination
- **Then** only the bin sale is returned
- **Notes:** Asserted in `saleDelete.procedure.test.ts`. Search filtering on invoice, customer name, and phone is not yet asserted.

### SALE-023 · Restore brings a bin sale and its payments back and takes its quantities out of stock again

- **Covers:** `restoreSaleProcedure` — `src/features/sale/api/saleDelete.procedure.ts`
- **Type:** integration · **Priority:** P0 · **Status:** Implemented
- **Given** a sale of 4 units from a batch that was returned to stock when the sale was deleted
- **When** `restore` is called with its `saleId`
- **Then** `deletedAt` and `deletedBy` are cleared on the sale and its payment, and the batch goes back to its level before the delete (5 remaining)
- **Notes:** Asserted in `saleDelete.procedure.test.ts`.

### SALE-024 · Restore is refused when a batch no longer has the sold quantity

- **Covers:** `restoreSaleProcedure` — `src/features/sale/api/saleDelete.procedure.ts`
- **Type:** integration · **Priority:** P0 · **Status:** Implemented
- **Given** a deleted sale of 4 units, and its batch now has only 3 remaining
- **When** `restore` is called
- **Then** the call fails with `NOT_ENOUGH_STOCK_TO_RESTORE`, the sale stays in the bin, and the batch quantity stays at 3
- **Notes:** Asserted in `saleDelete.procedure.test.ts`.

### SALE-025 · Restore rejects a sale that is not in the bin

- **Covers:** `restoreSaleProcedure` — `src/features/sale/api/saleDelete.procedure.ts`
- **Type:** integration · **Priority:** P1 · **Status:** Implemented
- **Given** an active sale
- **When** `restore` is called with its `saleId`
- **Then** the call fails with `NOT_IN_BIN` and nothing changes
- **Notes:** Asserted in `saleDelete.procedure.test.ts`.

### SALE-026 · Bulk restore restores every selected sale and takes their quantities out of stock

- **Covers:** `restoreAllSaleProcedure` — `src/features/sale/api/saleDelete.procedure.ts`
- **Type:** integration · **Priority:** P0 · **Status:** Implemented
- **Given** two bin sales that drew from the same batch
- **When** `restoreAll` is called with both ids
- **Then** `count` is 2, both sales are active, and the batch stock is reduced by both sales' quantities
- **Notes:** Asserted in `saleDelete.procedure.test.ts`. A mixed list with an active id is not yet asserted.

### SALE-027 · Sales page switches between Active and Bin views

- **Covers:** `sales/index.tsx` route — `src/routes/dashboard/_dashboardLayout/sales/index.tsx`
- **Type:** component · **Priority:** P1 · **Status:** Missing
- **Given** a user with `sale.delete` is on `/dashboard/sales` with a search term and a date range
- **When** the user selects the Bin tab
- **Then** the URL gets `view=bin`, the search term and date range are kept, and the bin table renders. Selecting Active returns to the sales table.
- **Notes:** Built on `TabNavigation` (`paramName="view"`, `defaultTab="active"`), same as customers. Without `sale.delete` the tabs are hidden and only the active table renders. Needs router and permission mocks.

### SALE-028 · Sale bin table restores and permanently deletes sales

- **Covers:** `SaleBinTable`, `SaleBinTableRowAction` — `src/features/sale/components/sale-bin-table/`
- **Type:** component · **Priority:** P1 · **Status:** Missing
- **Given** the bin table shows a deleted sale, and the user has `sale.delete`
- **When** the user clicks Restore on the row, or selects rows and clicks Restore All
- **Then** the restore mutation runs for the selected ids and the bin and active lists are refreshed
- **When** the user clicks Delete permanently, or Delete All, and confirms
- **Then** the remove mutation runs for the selected ids through the `permanent` `DeleteDialog`
- **Notes:** "Purge in" shows the days left from `BIN_RETENTION_DAYS`. Needs a mocked oRPC client.

### SALE-029 · Active sale rows can be moved to the bin one by one or in bulk

- **Covers:** `SaleTableRowAction`, `SaleTable`, `SaleDeleteDialog` — `src/features/sale/components/`
- **Type:** component · **Priority:** P1 · **Status:** Missing
- **Given** the sale table with rows selected, and the user has `sale.delete`
- **When** the user clicks Delete on a row and confirms, or selects rows and clicks Delete All
- **Then** the delete mutation runs for that sale or the selected ids, and the active and bin lists refresh
- **Notes:** Without `sale.delete` the Delete item and the action bar are not shown.

### SALE-030 · Sale details return customer, items, totals, and due for an active sale only

- **Covers:** `saleDetailsProcedure` — `src/features/sale/api/sale.procedure.ts`
- **Type:** integration · **Priority:** P1 · **Status:** Missing
- **Given** an active sale with a customer, two items, and a partial payment, a walk-in sale with no customer, and a sale moved to the bin
- **When** `sale.details` is requested for each sale
- **Then** the active sale returns `invoiceNo`, `customer` (id, name, phone, address), `items` (qty, unit price, line total, and medicine name, generic name, strength, type, and base unit) in creation order, and `dueAmount` equal to `totalAmount - paidAmount`, never negative
- **Then** the walk-in sale returns `customer: null`, and a bin sale or an unknown id returns `NOT_FOUND`
- **Notes:** Money assertions use an epsilon. Needs a D1/Drizzle fixture.

### SALE-031 · Sale details dialog opens from the sales table row and the customer purchases tab

- **Covers:** `SaleViewDialog` — `src/features/sale/components/SaleViewDialog.tsx`; `SaleTableRowAction` — `src/features/sale/components/sale-table/SaleTableRowAction.tsx`
- **Type:** component · **Priority:** P1 · **Status:** Missing
- **Given** a sale row in the sales table
- **When** the user opens the row menu and selects View sale
- **Then** the sale details dialog opens and requests `sale.details` for that sale id, showing the invoice number, sold-at date, status badge, customer, item table, and totals (Subtotal, Discount, Total, Paid, and Due only when above zero)
- **Notes:** The query runs only while the dialog is open. A walk-in sale shows "Walk-in" as the customer. Needs a mocked oRPC client.

### SALE-032 · Sale create dialog takes open state from props and hides the customer fields for a given customer

- **Covers:** `SaleCreateDialog` — `src/features/sale/components/SaleCreateDialog.tsx`; `SaleManagementTable` — `src/features/sale/components/sale-table/SaleManagementTable.tsx`
- **Type:** component · **Priority:** P1 · **Status:** Missing
- **Given** the sales page with `saleCreateDialog` closed, and the dialog rendered with a `customerId`
- **When** the user clicks New Sale, or the dialog is opened from a customer page
- **Then** the dialog opens and closes through `open` and `setOpen`, and the sales page state is updated through `handleOpenDialog`. With a `customerId`, the customer name, phone, and address fields are hidden and the submitted sale carries that `customerId`.
- **Notes:** Needs router and permission mocks. The submit payload is asserted without hitting the API.

## Source map

| Source file                                                              | Test file                                            | Cases                                    |
| ------------------------------------------------------------------------ | ---------------------------------------------------- | ---------------------------------------- |
| `src/constants/sidebarLinks.tsx`                                         | —                                                    | SALE-010                                 |
| `src/features/sale/api/sale.procedure.ts`                                | `src/features/sale/api/sale.procedure.test.ts`       | SALE-009, SALE-013 to SALE-018, SALE-030 |
| `src/features/medicine/api/medicine.procedure.ts`                        | —                                                    | SALE-018                                 |
| `src/features/sale/api/saleDelete.procedure.ts`                          | `src/features/sale/api/saleDelete.procedure.test.ts` | SALE-019 to SALE-026                     |
| `src/features/sale/api/saleDelete.contract.ts`                           | —                                                    | SALE-019 to SALE-026                     |
| `src/features/sale/api/sale.api.hook.ts`                                 | —                                                    | SALE-020, SALE-026, SALE-029             |
| `src/features/sale/components/SaleDeleteDialog.tsx`                      | —                                                    | SALE-029                                 |
| `src/features/sale/components/SaleViewDialog.tsx`                        | —                                                    | SALE-031                                 |
| `src/features/sale/components/SaleCreateDialog.tsx`                      | —                                                    | SALE-032                                 |
| `src/features/sale/components/SaleStats.tsx`                             | `src/features/sale/components/SaleStats.test.tsx`    | SALE-011, SALE-012                       |
| `src/features/sale/components/sale-table/SaleManagementTable.tsx`        | —                                                    | SALE-002 to SALE-005, SALE-032           |
| `src/features/sale/components/sale-table/SaleTable.tsx`                  | —                                                    | SALE-001, SALE-029                       |
| `src/features/sale/components/sale-table/saleTableColumn.tsx`            | —                                                    | SALE-001, SALE-008, SALE-029             |
| `src/features/sale/components/sale-table/SaleTableRowAction.tsx`         | —                                                    | SALE-006, SALE-029, SALE-031             |
| `src/features/sale/components/sale-bin-table/SaleBinManagementTable.tsx` | —                                                    | SALE-028                                 |
| `src/features/sale/components/sale-bin-table/SaleBinTable.tsx`           | —                                                    | SALE-028                                 |
| `src/features/sale/components/sale-bin-table/SaleBinTableRowAction.tsx`  | —                                                    | SALE-028                                 |
| `src/features/sale/components/sale-bin-table/saleBinTableColumn.tsx`     | —                                                    | SALE-028                                 |
| `src/routes/dashboard/_dashboardLayout/sales/index.tsx`                  | —                                                    | SALE-007, SALE-027                       |
