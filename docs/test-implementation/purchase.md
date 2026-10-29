# Purchase

Test intent for the purchase domain: company purchase list, details and stats, the purchase
bin (soft delete, restore, permanent remove), and the purchase UI shown on the companies
pages. Scope: `src/features/purchase/**` and the purchases route under
`src/routes/dashboard/_dashboardLayout/companies/purchases/**`.

Cases were moved here from [company.md](./company.md) when the purchase code left
`src/features/company/`. The replaced `COMP-` IDs are marked `Obsolete` there.

## Coverage summary

| Status      | Count  |
| ----------- | ------ |
| Implemented | 6      |
| Partial     | 0      |
| Missing     | 7      |
| Obsolete    | 0      |
| **Total**   | **13** |

## Purchase list and details

### PUR-001 · Purchase list is limited to the selected created-at range

- **Covers:** `listPurchaseProcedure` — `src/features/purchase/api/purchase.procedure.ts`
- **Type:** integration · **Priority:** P0 · **Status:** Missing
- **Given** a company with purchases created on dates inside and outside a range
- **When** the purchase list is requested with a `filter.createdAt` range
- **Then** only purchases whose `createdAt` falls inside the range are returned, and
  `meta.total` counts only those purchases
- **Notes:** Without a `filter`, all purchases are listed. Pagination meta must reflect the
  filtered count. Previously COMP-003.

## Purchase bin (soft delete)

### PUR-002 · Purchase delete moves the purchase and its payments to the bin, and is blocked when sold

- **Covers:** `deletePurchaseProcedure`, `deleteAllPurchaseProcedure` — `src/features/purchase/api/purchaseDelete.procedure.ts`
- **Type:** integration · **Priority:** P0 · **Status:** Implemented
- **Given** an active purchase with a linked company payment, and another active purchase of the same company
- **When** `delete` is called with the purchase id
- **Then** `deletedAt` and `deletedBy` are set on the purchase and its payment, and the other purchase and the company stay active. If one of the purchase's batches has a sale line, the call returns `HAS_SALES` and nothing changes.
- **Notes:** Asserted in `purchaseDelete.procedure.test.ts`. `deleteAll` is asserted for the happy path only; a mixed list with an inactive id is not yet asserted. Previously COMP-018.

### PUR-003 · Permanent purchase remove applies only to bin purchases

- **Covers:** `removePurchaseProcedure`, `removeAllPurchaseProcedure` — `src/features/purchase/api/purchaseDelete.procedure.ts`
- **Type:** integration · **Priority:** P0 · **Status:** Implemented
- **Given** an active purchase, and a bin purchase with items and a payment
- **When** `remove` is called for the active purchase, then for the bin purchase, and `removeAll` is called with a list containing an active purchase
- **Then** the active purchase returns `NOT_IN_BIN`. The bin purchase, its items, and its payments are deleted. `removeAll` with any non-bin id returns `NOT_IN_BIN` and deletes nothing.
- **Notes:** Asserted in `purchaseDelete.procedure.test.ts`. Previously COMP-019.

### PUR-004 · Purchase bin list returns only soft-deleted purchases

- **Covers:** `listPurchaseBinProcedure` — `src/features/purchase/api/purchaseDelete.procedure.ts`
- **Type:** integration · **Priority:** P0 · **Status:** Implemented
- **Given** an active purchase and a purchase moved to the bin
- **When** `purchase.listBin` is called with pagination
- **Then** only the bin purchase is returned, with its company
- **Notes:** Asserted in `purchaseDelete.procedure.test.ts`. Search by company invoice number is not yet asserted. Previously COMP-021.

### PUR-005 · Restore brings a bin purchase and its payments back without changing stock

- **Covers:** `restorePurchaseProcedure` — `src/features/purchase/api/purchaseDelete.procedure.ts`
- **Type:** integration · **Priority:** P0 · **Status:** Implemented
- **Given** a purchase moved to the bin together with its payment
- **When** `restore` is called with its `purchaseId`
- **Then** `deletedAt` and `deletedBy` are cleared on the purchase and its payment, and batch quantities are unchanged
- **Notes:** Asserted in `purchaseDelete.procedure.test.ts`. Returns of the purchase are restored with it but are not yet asserted. Previously COMP-022.

### PUR-006 · Restore rejects a purchase that is not in the bin

- **Covers:** `restorePurchaseProcedure` — `src/features/purchase/api/purchaseDelete.procedure.ts`
- **Type:** integration · **Priority:** P1 · **Status:** Implemented
- **Given** an active purchase
- **When** `restore` is called with its `purchaseId`
- **Then** the call fails with `NOT_IN_BIN` and nothing changes
- **Notes:** Asserted in `purchaseDelete.procedure.test.ts`. Previously COMP-023.

### PUR-007 · Bulk purchase restore restores every selected purchase

- **Covers:** `restoreAllPurchaseProcedure` — `src/features/purchase/api/purchaseDelete.procedure.ts`
- **Type:** integration · **Priority:** P0 · **Status:** Implemented
- **Given** two bin purchases of the same company
- **When** `restoreAll` is called with both ids
- **Then** `count` is 2 and both purchases are active again
- **Notes:** Asserted in `purchaseDelete.procedure.test.ts`. A mixed list with an active id is not yet asserted. Previously COMP-024.

## Purchase UI

### PUR-008 · Purchases page switches between Active and Bin views

- **Covers:** `companies/purchases/index.tsx` route — `src/routes/dashboard/_dashboardLayout/companies/purchases/index.tsx`
- **Type:** component · **Priority:** P1 · **Status:** Missing
- **Given** a user with `purchase.delete` is on `/dashboard/companies/purchases` with a search term and a date range
- **When** the user selects the Bin tab
- **Then** the URL gets `view=bin`, the search term and date range are kept, and the bin table renders. Selecting Active returns to the purchases table.
- **Notes:** Built on `TabNavigation` (`paramName="view"`, `defaultTab="active"`), same as customers. Without `purchase.delete` the tabs are hidden. Needs router and permission mocks. Previously COMP-025.

### PUR-009 · Purchase rows can be moved to the bin, and bin purchases restored or removed

- **Covers:** `PurchaseTableRowAction`, `PurchaseTable`, `PurchaseDeleteDialog`, `PurchaseBinTable`, `PurchaseBinTableRowAction` — `src/features/purchase/components/`
- **Type:** component · **Priority:** P1 · **Status:** Missing
- **Given** the purchase table with rows selected, and a bin table with a deleted purchase; the user has `purchase.delete`
- **When** the user deletes a row or selects rows and clicks Delete All in the active table
- **Then** the delete mutation runs for that purchase or the selected ids
- **When** the user clicks Restore or Restore All in the bin, or Delete permanently or Delete All and confirms
- **Then** the matching mutation runs for the selected ids and the lists refresh
- **Notes:** "Purge in" shows the days left from `BIN_RETENTION_DAYS`. Without `purchase.delete` the Delete items and action bars are hidden. Needs a mocked oRPC client. Previously COMP-026.

### PUR-010 · Purchase list rows return company, invoice number, and non-negative due amount

- **Covers:** `listPurchaseProcedure` — `src/features/purchase/api/purchase.procedure.ts`; `purchaseTableColumn` — `src/features/purchase/components/purchase-table/purchaseTableColumn.tsx`
- **Type:** integration · **Priority:** P1 · **Status:** Missing
- **Given** a company with a purchase that has an invoice number and a paid amount below its total, and a purchase fully paid or overpaid
- **When** `purchase.list` is requested
- **Then** each row includes `company`, `companyInvoiceNo`, and `dueAmount` equal to `totalAmount - paidAmount`, and `dueAmount` is `0` when the purchase is paid or overpaid
- **Then** the table renders the company name as a link to `/dashboard/companies/$companyId?tab=details`, with its invoice number (or "No invoice no") below it, and right-aligned Total, Paid and Due amounts, and a status badge computed from `dueAmount`
- **Notes:** Money assertions use an epsilon. Needs a D1/Drizzle fixture for the procedure and a rendered table with mocked row data for the column. Previously COMP-027.

### PUR-011 · Company purchases tab shows invoice, API due amount, and the shared status badge

- **Covers:** `CompanyPurchasesTab` — `src/features/purchase/components/company-details/CompanyPurchasesTab.tsx`
- **Type:** component · **Priority:** P1 · **Status:** Missing
- **Given** a company with a purchase that has an invoice number and a partial payment, and a purchase with no invoice number that is fully paid
- **When** the company purchases tab renders the list
- **Then** the first column shows the date with the invoice number (or "No invoice no") beneath it in the same cell, followed by right-aligned Total, Paid, and Due, and a status badge (`Paid`, `Partially paid`, or `Unpaid`) computed from the returned `dueAmount`
- **Then** Due is shown in destructive styling only when `dueAmount` is above zero, and the empty state spans all six columns (the last column is the row actions menu, see PUR-012)
- **Notes:** Needs a mocked oRPC client and router search state. Uses the shared `PurchaseStatusBadge`, so the badge rules are asserted once there. Previously COMP-028.

### PUR-012 · Company purchase row menu views a purchase and moves it to the bin

- **Covers:** `CompanyPurchaseRowAction` — `src/features/purchase/components/company-details/CompanyPurchaseRowAction.tsx`; `CompanyPurchasesTab` — `src/features/purchase/components/company-details/CompanyPurchasesTab.tsx`
- **Type:** component · **Priority:** P1 · **Status:** Missing
- **Given** a purchase row on the company purchases tab, and a user with `purchase.delete`
- **When** the user opens the row menu and selects View purchase
- **Then** the purchase details dialog opens for that purchase (`purchase.details` is requested with its `purchaseId`)
- **When** the user selects Delete and confirms in the soft-delete dialog
- **Then** the delete mutation runs for that purchase, the dialog closes on success, and the purchases list refreshes without it
- **Notes:** Without `purchase.delete` the Delete item is hidden, and View purchase stays available. Needs a mocked oRPC client and a permission mock. Previously COMP-030.

### PUR-013 · Create purchase medicine items reflow into stacked fields on mobile

- **Covers:** `PurchaseMedicineItems`, `PurchaseMedicineItem` — `src/features/purchase/components/PurchaseCreateDialog.tsx`
- **Type:** component · **Priority:** P2 · **Status:** Missing
- **Given** the New Purchase dialog with one medicine item added, rendered at a mobile and a desktop viewport
- **When** the item renders
- **Then** on mobile the table header is hidden and the medicine name, qty, cost, and sell fields stack in a two-column grid, with the remove button in the last grid slot. The generic name, strength, medicine type, and base unit fields follow in the same two-column grid once the item is new.
- **Then** on desktop the header is shown and each field spans its original column width (5, 2, 2, 2, 1 for the main row and 3, 2, 3, 3 for the details row)
- **Notes:** Layout is class-based (Tailwind `md:` breakpoint). Assert the classes on the header and cells, or check computed layout in a Storybook story. Behavior (inputs, validation, remove) is covered by PUR-009-style tests once added.

## Source map

| Source file                                                                         | Test file                                                    | Cases                        |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------ | ---------------------------- |
| `src/features/purchase/api/purchase.procedure.ts`                                   | _none yet_                                                   | PUR-001, PUR-010             |
| `src/features/purchase/api/purchase.contract.ts`                                    | —                                                            | PUR-001, PUR-010             |
| `src/features/purchase/api/purchaseDelete.procedure.ts`                             | `src/features/purchase/api/purchaseDelete.procedure.test.ts` | PUR-002 to PUR-007           |
| `src/features/purchase/api/purchaseDelete.contract.ts`                              | —                                                            | PUR-002 to PUR-007           |
| `src/features/purchase/api/purchaseDelete.api.hook.ts`                              | —                                                            | PUR-009                      |
| `src/features/purchase/api/purchase.api.hook.ts`                                    | —                                                            | PUR-009                      |
| `src/features/purchase/api/purchase.router.ts`                                      | —                                                            | PUR-001 to PUR-007           |
| `src/features/purchase/companyResolver.ts`                                          | —                                                            | PUR-002                      |
| `src/features/purchase/purchase.schema.ts`                                          | —                                                            | PUR-009                      |
| `src/features/purchase/components/PurchaseDeleteDialog.tsx`                         | —                                                            | PUR-009                      |
| `src/features/purchase/components/PurchaseViewDialog.tsx`                           | _none yet_                                                   | PUR-012                      |
| `src/features/purchase/components/PurchaseStatusBadge.tsx`                          | _none yet_                                                   | PUR-010, PUR-011             |
| `src/features/purchase/components/purchase-table/PurchaseTable.tsx`                 | —                                                            | PUR-009                      |
| `src/features/purchase/components/purchase-table/PurchaseTableRowAction.tsx`        | —                                                            | PUR-009                      |
| `src/features/purchase/components/purchase-table/purchaseTableColumn.tsx`           | _none yet_                                                   | PUR-010                      |
| `src/features/purchase/components/purchase-bin-table/PurchaseBinTable.tsx`          | —                                                            | PUR-009                      |
| `src/features/purchase/components/purchase-bin-table/PurchaseBinTableRowAction.tsx` | —                                                            | PUR-009                      |
| `src/features/purchase/components/company-details/CompanyPurchasesTab.tsx`          | _none yet_                                                   | PUR-011, PUR-012             |
| `src/features/purchase/components/company-details/CompanyPurchaseRowAction.tsx`     | _none yet_                                                   | PUR-012                      |
| `src/features/purchase/components/PurchaseCreateDialog.tsx`                         | _none yet_                                                   | PUR-013                      |
| `src/features/purchase/components/PurchaseSelectorField.tsx`                        | _none yet_                                                   | — (used by company payments) |
| `src/features/purchase/components/PurchaseStats.tsx`                                | _none yet_                                                   | —                            |
| `src/routes/dashboard/_dashboardLayout/companies/purchases/index.tsx`               | —                                                            | PUR-008                      |
