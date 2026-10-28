# Company

Test intent for the company domain: company directory, company details, and company
payments and purchases. Scope: `src/features/company/**` and the company routes under
`src/routes/dashboard/_dashboardLayout/companies/**`.

## Coverage summary

| Status      | Count  |
| ----------- | ------ |
| Implemented | 8      |
| Partial     | 3      |
| Missing     | 18     |
| Obsolete    | 2      |
| **Total**   | **31** |

## Company details summary

### COMP-001 · Details summary is limited to the selected created-at range

- **Covers:** `companyDetailsProcedure` — `src/features/company/api/company.procedure.ts`
- **Type:** integration · **Priority:** P0 · **Status:** Missing
- **Given** a company with purchases and payments created on dates inside and outside a range
- **When** details are requested with a `createdAt` range
- **Then** `totalPurchases`, `purchaseCount`, `lastPurchaseAt`, `totalPaid`, `paymentCount`,
  and `dueAmount` only include records whose `createdAt` falls inside the range
- **Notes:** Without a `createdAt` input, all records are counted. Money assertions use an
  epsilon. Mirrors the customer details filter behavior.

### COMP-002 · Details tab refetches when the time range changes

- **Covers:** `CompanyDetailsTab` — `src/features/company/components/company-details/CompanyDetailsTab.tsx`
- **Type:** component · **Priority:** P1 · **Status:** Missing
- **Given** the company details tab is rendered with no range selected
- **When** the user selects a preset range from `TimeRangeFilter`
- **Then** the details query is requested with the `createdAt` range built from the URL
  search params, and the summary stats reflect the response
- **Notes:** Needs a mocked oRPC client and router search state.

## Company purchases and payments

### COMP-003 · Purchase list is limited to the selected created-at range

- **Covers:** `companyPurchaseListProcedure` — `src/features/company/api/companyPurchase.procedure.ts`
- **Type:** integration · **Priority:** P0 · **Status:** Missing
- **Given** a company with purchases created on dates inside and outside a range
- **When** the purchase list is requested with a `filter.createdAt` range
- **Then** only purchases whose `createdAt` falls inside the range are returned, and
  `meta.total` counts only those purchases
- **Notes:** Without a `filter`, all purchases are listed. Pagination meta must reflect the
  filtered count.

### COMP-004 · Purchases and payments tabs share the URL time range and reset to page 1

- **Covers:** `CompanyPurchasesTab` and `CompanyPaymentsTab` — `src/features/company/components/company-details/`
- **Type:** component · **Priority:** P1 · **Status:** Missing
- **Given** the company details page is open on page 2 of the payments tab
- **When** the user selects a new range in `TimeRangeFilter`
- **Then** the list query is requested with the new `createdAt` range, the page resets to 1,
  and the range stored in the URL is the same one the details tab reads
- **Notes:** Needs a mocked oRPC client and router search state.

## Company bin (soft delete)

### COMP-005 · Company delete is blocked when the company has purchases, returns, or payments

- **Covers:** superseded — see COMP-016
- **Type:** integration · **Priority:** P0 · **Status:** Obsolete
- **Notes:** The purchase/payment/return records check was removed. Delete is now blocked
  only when a batch of the company has been sold (COMP-016), and remove no longer checks
  records.

### COMP-006 · Deleting a company with no related records removes it

- **Covers:** superseded — see COMP-009
- **Type:** integration · **Priority:** P0 · **Status:** Obsolete
- **Notes:** Delete now moves the company to the bin instead of removing the row.

### COMP-007 · Delete dialog copy follows the `mode` prop

- **Covers:** `DeleteDialog` — `src/components/DeleteDialog.tsx`, and `CompanyDeleteDialog` — `src/features/company/components/CompanyDeleteDialog.tsx`
- **Type:** component · **Priority:** P1 · **Status:** Missing
- **Given** the dialog is open in `soft` mode with the default retention
- **When** the user types text other than `CONFIRM`, then types `CONFIRM` and clicks Move to bin
- **Then** the title reads "Move to bin", the description states the retention days (15 by default),
  the button stays disabled until `CONFIRM` is typed, and after the mutation succeeds the dialog closes
- **Notes:** In `permanent` mode the dialog shows the "cannot be undone" copy and a Delete button.
  Needs a mocked oRPC client.

### COMP-008 · Details header delete navigates back to the company list

- **Covers:** `companies/$companyId` route header — `src/routes/dashboard/_dashboardLayout/companies/$companyId.tsx`
- **Type:** component · **Priority:** P2 · **Status:** Missing
- **Given** a user with `company.delete` permission is on the company details page
- **When** the user confirms the move to bin in the header dialog
- **Then** the app navigates to `/dashboard/companies`; users without the permission do not see the Delete button
- **Notes:** Needs router and permission context mocks.

### COMP-009 · Soft delete moves the company and its purchases, returns, and payments to the bin

- **Covers:** `deleteCompanyProcedure` — `src/features/company/api/companyDelete.procedure.ts`; `resolveCompany` — `src/features/company/companyResolver.ts`
- **Type:** integration · **Priority:** P0 · **Status:** Partial
- **Given** an active company that has purchases and payments
- **When** the delete procedure is called with its `companyId`
- **Then** `deletedAt` and `deletedBy` are set on the company and on its purchases and payments, and the company is excluded from the company list, the search list, the details query (`NOT_FOUND`), and purchase/payment company lookups. Deleting it again returns `NOT_FOUND`.
- **Notes:** The cascade and `deletedBy` are asserted in `companyDelete.procedure.test.ts`. The list, search, details, and lookup exclusions are not yet asserted.

### COMP-010 · Bulk delete and restore are all-or-nothing

- **Covers:** `deleteAllCompanyProcedure`, `restoreAllCompanyProcedure` — `src/features/company/api/companyDelete.procedure.ts`
- **Type:** integration · **Priority:** P0 · **Status:** Missing
- **Given** a list of company ids where one id is unknown, or not in the expected state (active for delete, in the bin for restore)
- **When** `deleteAll` or `restoreAll` is called
- **Then** the call fails (`NOT_FOUND` or `NOT_IN_BIN`) and no company changes state. When every id is valid, all of them change state and `count` equals the number of unique ids.
- **Notes:** Duplicate ids are counted once. Inputs above 50 ids are rejected.

### COMP-011 · Permanent remove deletes a bin company together with all its child rows

- **Covers:** `removeCompanyProcedure`, `removeAllCompanyProcedure` — `src/features/company/api/companyDelete.procedure.ts`
- **Type:** integration · **Priority:** P0 · **Status:** Partial
- **Given** a company that is in the bin, or one that is still active
- **When** `remove` or `removeAll` is called
- **Then** an active company returns `NOT_IN_BIN` and nothing is deleted. A company in the bin is deleted together with its purchases, purchase items, purchase returns, and payments, with no "has records" check. `removeAll` returns `count`.
- **Notes:** `remove` is asserted in `companyDelete.procedure.test.ts`. The `NOT_IN_BIN` path and `removeAll` are not yet asserted. Users without `company.manage` or `company.delete` get `FORBIDDEN`.

### COMP-012 · Restore returns a company and its child rows to the active lists

- **Covers:** `restoreCompanyProcedure` — `src/features/company/api/companyDelete.procedure.ts`
- **Type:** integration · **Priority:** P1 · **Status:** Partial
- **Given** a company in the bin
- **When** `restore` is called with its `companyId`
- **Then** `deletedAt` and `deletedBy` are cleared on the company and on the purchases and payments deleted with it, and the company is returned by the list, search, and details queries again. Restoring a company that is not in the bin returns `NOT_IN_BIN`.
- **Notes:** The restore of the company and its purchases/payments is asserted in `companyDelete.procedure.test.ts`. The list/search/details visibility and the `NOT_IN_BIN` path are not yet asserted.

### COMP-013 · Bin list returns only soft-deleted companies

- **Covers:** `listCompanyBinProcedure` — `src/features/company/api/companyDelete.procedure.ts`
- **Type:** integration · **Priority:** P0 · **Status:** Missing
- **Given** a mix of active and soft-deleted companies, some matching a search term
- **When** `listBin` is called with pagination and a search term
- **Then** only companies with `deletedAt` set are returned, filtered by the search fields (`name`, `phone`, `address`), ordered by most recently deleted first, with `meta` counting only bin rows
- **Notes:** Requires `company.manage` and `company.delete`; other users get `FORBIDDEN`.

### COMP-014 · Bin table restores and permanently deletes companies

- **Covers:** `CompanyBinTable`, `CompanyBinTableRowAction` — `src/features/company/components/company-bin-table/`
- **Type:** component · **Priority:** P1 · **Status:** Missing
- **Given** the bin table shows a deleted company, and the user has `company.delete`
- **When** the user clicks Restore on the row, or selects rows and clicks Restore All
- **Then** the restore mutation runs for the selected ids, the bin list refreshes, and the active list is invalidated. "Purge in" shows the days left from `BIN_RETENTION_DAYS`.
- **When** the user clicks Delete permanently, or Delete All, and types `CONFIRM`
- **Then** the remove mutation runs for the selected ids through the `permanent` `DeleteDialog`, and the dialog closes on success
- **Notes:** Needs a mocked oRPC client. Users without `company.delete` do not see the row menu items.

### COMP-015 · Companies page switches between Active and Bin views

- **Covers:** `companies/index.tsx` route — `src/routes/dashboard/_dashboardLayout/companies/index.tsx`
- **Type:** component · **Priority:** P1 · **Status:** Missing
- **Given** a user with `company.delete` is on `/dashboard/companies` with a search term and page 3
- **When** the user selects the Bin tab
- **Then** the URL gets `view=bin`, the search term and page are kept, and the bin table renders. Selecting Active returns to the active table.
- **Notes:** Built on `TabNavigation` (`paramName="view"`, `defaultTab="active"`), which does not reset pagination. Tabs use icons. Without `company.delete` the tabs are hidden, and a `view=bin` URL shows the active table. Needs router and permission mocks.

### COMP-016 · Delete is blocked when a batch of the company has been sold

- **Covers:** `deleteCompanyProcedure`, `deleteAllCompanyProcedure` — `src/features/company/api/companyDelete.procedure.ts`
- **Type:** integration · **Priority:** P0 · **Status:** Implemented
- **Given** an active company with a purchase batch that has a sale line (`sale_items`)
- **When** `delete` is called with its `companyId`
- **Then** the call fails with `HAS_SALES`, and the company, its purchases, and its payments stay active
- **Notes:** Asserted in `companyDelete.procedure.test.ts`. `deleteAll` shares the same check and is not yet asserted.

### COMP-017 · Purchase and payment lists, totals, and payment candidates exclude soft-deleted rows

- **Covers:** `company.procedure.ts` (list summary and details totals), `companyPurchase.procedure.ts` (list, stats, details), `companyPayment.procedure.ts` (list, create candidates, stats) — `src/features/company/api/`
- **Type:** integration · **Priority:** P0 · **Status:** Missing
- **Given** a company with active and soft-deleted purchases and payments
- **When** the company list, details, purchase list/stats, payment list/stats, or a new payment is requested
- **Then** soft-deleted purchases and payments are excluded from every total, count, due amount, and candidate purchase. A new payment never allocates to a soft-deleted purchase.
- **Notes:** Requires `isNull(deletedAt)` on every query over these tables.

### COMP-018 · Purchase delete moves the purchase and its payments to the bin, and is blocked when sold

- **Covers:** `deleteCompanyPurchaseProcedure`, `deleteAllCompanyPurchaseProcedure` — `src/features/company/api/companyPurchaseDelete.procedure.ts`
- **Type:** integration · **Priority:** P0 · **Status:** Implemented
- **Given** an active purchase with a linked company payment, and another active purchase of the same company
- **When** `delete` is called with the purchase id
- **Then** `deletedAt` and `deletedBy` are set on the purchase and its payment, and the other purchase and the company stay active. If one of the purchase's batches has a sale line, the call returns `HAS_SALES` and nothing changes.
- **Notes:** Asserted in `companyPurchaseDelete.procedure.test.ts`. `deleteAll` is asserted for the happy path only; a mixed list with an inactive id is not yet asserted.

### COMP-019 · Permanent purchase remove applies only to bin purchases

- **Covers:** `removeCompanyPurchaseProcedure`, `removeAllCompanyPurchaseProcedure` — `src/features/company/api/companyPurchaseDelete.procedure.ts`
- **Type:** integration · **Priority:** P0 · **Status:** Implemented
- **Given** an active purchase, and a bin purchase with items and a payment
- **When** `remove` is called for the active purchase, then for the bin purchase, and `removeAll` is called with a list containing an active purchase
- **Then** the active purchase returns `NOT_IN_BIN`. The bin purchase, its items, and its payments are deleted. `removeAll` with any non-bin id returns `NOT_IN_BIN` and deletes nothing.
- **Notes:** Asserted in `companyPurchaseDelete.procedure.test.ts`.

### COMP-020 · Restoring a company does not bring back a purchase deleted on its own

- **Covers:** `restoreCompanyProcedure` — `src/features/company/api/companyDelete.procedure.ts`
- **Type:** integration · **Priority:** P0 · **Status:** Implemented
- **Given** a purchase deleted on its own, followed by the company being deleted
- **When** the company is restored
- **Then** the company is active again, but the purchase and its payment stay in the bin. Children are restored only when their `deletedAt` matches the company's.
- **Notes:** Asserted in `companyDelete.procedure.test.ts`. Restoring several companies at once groups them by `deletedAt`; that path is not yet asserted.

### COMP-021 · Purchase bin list returns only soft-deleted purchases

- **Covers:** `listCompanyPurchaseBinProcedure` — `src/features/company/api/companyPurchaseDelete.procedure.ts`
- **Type:** integration · **Priority:** P0 · **Status:** Implemented
- **Given** an active purchase and a purchase moved to the bin
- **When** `company.purchase.listBin` is called with pagination
- **Then** only the bin purchase is returned, with its company
- **Notes:** Asserted in `companyPurchaseDelete.procedure.test.ts`. Search by company invoice number is not yet asserted.

### COMP-022 · Restore brings a bin purchase and its payments back without changing stock

- **Covers:** `restoreCompanyPurchaseProcedure` — `src/features/company/api/companyPurchaseDelete.procedure.ts`
- **Type:** integration · **Priority:** P0 · **Status:** Implemented
- **Given** a purchase moved to the bin together with its payment
- **When** `restore` is called with its `purchaseId`
- **Then** `deletedAt` and `deletedBy` are cleared on the purchase and its payment, and batch quantities are unchanged
- **Notes:** Asserted in `companyPurchaseDelete.procedure.test.ts`. Returns of the purchase are restored with it but are not yet asserted.

### COMP-023 · Restore rejects a purchase that is not in the bin

- **Covers:** `restoreCompanyPurchaseProcedure` — `src/features/company/api/companyPurchaseDelete.procedure.ts`
- **Type:** integration · **Priority:** P1 · **Status:** Implemented
- **Given** an active purchase
- **When** `restore` is called with its `purchaseId`
- **Then** the call fails with `NOT_IN_BIN` and nothing changes
- **Notes:** Asserted in `companyPurchaseDelete.procedure.test.ts`.

### COMP-024 · Bulk purchase restore restores every selected purchase

- **Covers:** `restoreAllCompanyPurchaseProcedure` — `src/features/company/api/companyPurchaseDelete.procedure.ts`
- **Type:** integration · **Priority:** P0 · **Status:** Implemented
- **Given** two bin purchases of the same company
- **When** `restoreAll` is called with both ids
- **Then** `count` is 2 and both purchases are active again
- **Notes:** Asserted in `companyPurchaseDelete.procedure.test.ts`. A mixed list with an active id is not yet asserted.

### COMP-025 · Purchases page switches between Active and Bin views

- **Covers:** `companies/purchases/index.tsx` route — `src/routes/dashboard/_dashboardLayout/companies/purchases/index.tsx`
- **Type:** component · **Priority:** P1 · **Status:** Missing
- **Given** a user with `purchase.delete` is on `/dashboard/companies/purchases` with a search term and a date range
- **When** the user selects the Bin tab
- **Then** the URL gets `view=bin`, the search term and date range are kept, and the bin table renders. Selecting Active returns to the purchases table.
- **Notes:** Built on `TabNavigation` (`paramName="view"`, `defaultTab="active"`), same as customers. Without `purchase.delete` the tabs are hidden. Needs router and permission mocks.

### COMP-027 · Purchase list rows return company, invoice number, and non-negative due amount

- **Covers:** `listCompanyPurchaseProcedure` — `src/features/company/api/companyPurchase.procedure.ts`; `purchaseTableColumn` — `src/features/company/components/purchase-table/purchaseTableColumn.tsx`
- **Type:** integration · **Priority:** P1 · **Status:** Missing
- **Given** a company with a purchase that has an invoice number and a paid amount below its total, and a purchase fully paid or overpaid
- **When** `company.purchase.list` is requested
- **Then** each row includes `company`, `companyInvoiceNo`, and `dueAmount` equal to `totalAmount - paidAmount`, and `dueAmount` is `0` when the purchase is paid or overpaid
- **Then** the table renders the company name as a link to `/dashboard/companies/$companyId?tab=details`, with its invoice number (or "No invoice no") below it, and right-aligned Total, Paid and Due amounts, and a status badge computed from `dueAmount`
- **Notes:** Money assertions use an epsilon. Needs a D1/Drizzle fixture for the procedure and a rendered table with mocked row data for the column.

### COMP-028 · Company purchases tab shows invoice, API due amount, and the shared status badge

- **Covers:** `CompanyPurchasesTab` — `src/features/company/components/company-details/CompanyPurchasesTab.tsx`
- **Type:** component · **Priority:** P1 · **Status:** Missing
- **Given** a company with a purchase that has an invoice number and a partial payment, and a purchase with no invoice number that is fully paid
- **When** the company purchases tab renders the list
- **Then** the first column shows the date with the invoice number (or "No invoice no") beneath it in the same cell, followed by right-aligned Total, Paid, and Due, and a status badge (`Paid`, `Partially paid`, or `Unpaid`) computed from the returned `dueAmount`
- **Then** Due is shown in destructive styling only when `dueAmount` is above zero, and the empty state spans all six columns (the last column is the row actions menu, see COMP-030)
- **Notes:** Needs a mocked oRPC client and router search state. Uses the shared `PurchaseStatusBadge`, so the badge rules are asserted once there.

### COMP-026 · Purchase rows can be moved to the bin, and bin purchases restored or removed

- **Covers:** `PurchaseTableRowAction`, `PurchaseTable`, `PurchaseDeleteDialog`, `PurchaseBinTable`, `PurchaseBinTableRowAction` — `src/features/company/components/`
- **Type:** component · **Priority:** P1 · **Status:** Missing
- **Given** the purchase table with rows selected, and a bin table with a deleted purchase; the user has `purchase.delete`
- **When** the user deletes a row or selects rows and clicks Delete All in the active table
- **Then** the delete mutation runs for that purchase or the selected ids
- **When** the user clicks Restore or Restore All in the bin, or Delete permanently or Delete All and confirms
- **Then** the matching mutation runs for the selected ids and the lists refresh
- **Notes:** "Purge in" shows the days left from `BIN_RETENTION_DAYS`. Without `purchase.delete` the Delete items and action bars are hidden. Needs a mocked oRPC client.

### COMP-029 · Company payments tab shows date with the purchase invoice it was made against

- **Covers:** `CompanyPaymentsTab` — `src/features/company/components/company-details/CompanyPaymentsTab.tsx`; `listCompanyPaymentsProcedure` (`purchaseInvoiceNo`) — `src/features/company/api/companyPayment.procedure.ts`
- **Type:** component · **Priority:** P2 · **Status:** Missing
- **Given** a company with a payment against a purchase that has an invoice number, a payment against a purchase with no invoice number, and a general payment
- **When** the payments tab renders, and `company.payment.list` is requested
- **Then** each payment row returns `purchase` (`null` for a general payment; otherwise `companyInvoiceNo`, `totalAmount`, `paidAmount`, and a non-negative `dueAmount`), and the first column shows the date with `Invoice <no>`, `No invoice no`, or `General payment` beneath it, followed by right-aligned Amount, the Purchase column (total and status badge, or `—`), and Note
- **Notes:** The empty state spans all five columns. Needs a mocked oRPC client and a D1/Drizzle fixture for the join.

### COMP-030 · Company purchase row menu views a purchase and moves it to the bin

- **Covers:** `CompanyPurchaseRowAction` — `src/features/company/components/company-details/CompanyPurchaseRowAction.tsx`; `CompanyPurchasesTab` — `src/features/company/components/company-details/CompanyPurchasesTab.tsx`
- **Type:** component · **Priority:** P1 · **Status:** Missing
- **Given** a purchase row on the company purchases tab, and a user with `purchase.delete`
- **When** the user opens the row menu and selects View purchase
- **Then** the purchase details dialog opens for that purchase (`company.purchase.details` is requested with its `purchaseId`)
- **When** the user selects Delete and confirms in the soft-delete dialog
- **Then** the delete mutation runs for that purchase, the dialog closes on success, and the purchases list refreshes without it
- **Notes:** Without `purchase.delete` the Delete item is hidden, and View purchase stays available. Needs a mocked oRPC client and a permission mock.

### COMP-031 · Company payment row menu views the linked purchase only when one exists

- **Covers:** `CompanyPaymentRowAction` — `src/features/company/components/company-details/CompanyPaymentRowAction.tsx`; `CompanyPaymentsTab` — `src/features/company/components/company-details/CompanyPaymentsTab.tsx`; payments page table — `src/routes/dashboard/_dashboardLayout/companies/payments.tsx`
- **Type:** component · **Priority:** P2 · **Status:** Missing
- **Given** a payment row linked to a purchase, and a general payment row with no `purchaseId`
- **When** the user opens the row menu on the linked payment and selects View purchase
- **Then** the purchase details dialog opens for that `purchaseId`
- **Then** the general payment row renders no row menu
- **Notes:** Needs a mocked oRPC client. The row menu is only rendered for payments with a `purchaseId`.

## Source map

| Source file                                                                        | Test file                                                          | Cases                                                                |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------- |
| `src/features/company/api/company.procedure.ts`                                    | _none yet_                                                         | COMP-001, COMP-017                                                   |
| `src/features/company/api/companyDelete.procedure.ts`                              | `src/features/company/api/companyDelete.procedure.test.ts`         | COMP-009, COMP-010, COMP-011, COMP-012, COMP-013, COMP-016, COMP-020 |
| `src/features/company/components/company-bin-table/CompanyBinTable.tsx`            | _none yet_                                                         | COMP-014                                                             |
| `src/features/company/components/company-bin-table/CompanyBinTableRowAction.tsx`   | _none yet_                                                         | COMP-014                                                             |
| `src/routes/dashboard/_dashboardLayout/companies/index.tsx`                        | _none yet_                                                         | COMP-015                                                             |
| `src/features/company/components/company-details/CompanyDetailsTab.tsx`            | _none yet_                                                         | COMP-002                                                             |
| `src/features/company/api/companyPurchase.procedure.ts`                            | _none yet_                                                         | COMP-003, COMP-017, COMP-027                                         |
| `src/features/company/components/purchase-table/purchaseTableColumn.tsx`           | _none yet_                                                         | COMP-027                                                             |
| `src/features/company/api/companyPayment.procedure.ts`                             | _none yet_                                                         | COMP-017, COMP-029                                                   |
| `src/features/company/api/companyPurchaseDelete.procedure.ts`                      | `src/features/company/api/companyPurchaseDelete.procedure.test.ts` | COMP-018 to COMP-024                                                 |
| `src/features/company/api/companyPurchaseDelete.contract.ts`                       | —                                                                  | COMP-018 to COMP-024                                                 |
| `src/features/company/api/companyPurchaseDelete.api.hook.ts`                       | —                                                                  | COMP-026                                                             |
| `src/features/company/components/PurchaseDeleteDialog.tsx`                         | —                                                                  | COMP-026                                                             |
| `src/features/company/components/purchase-table/PurchaseTable.tsx`                 | —                                                                  | COMP-026                                                             |
| `src/features/company/components/purchase-table/PurchaseTableRowAction.tsx`        | —                                                                  | COMP-026                                                             |
| `src/features/company/components/purchase-bin-table/PurchaseBinTable.tsx`          | —                                                                  | COMP-026                                                             |
| `src/features/company/components/purchase-bin-table/PurchaseBinTableRowAction.tsx` | —                                                                  | COMP-026                                                             |
| `src/routes/dashboard/_dashboardLayout/companies/purchases/index.tsx`              | —                                                                  | COMP-025                                                             |
| `src/features/company/components/company-details/CompanyPurchasesTab.tsx`          | _none yet_                                                         | COMP-004, COMP-028, COMP-030                                         |
| `src/features/company/components/company-details/CompanyPurchaseRowAction.tsx`     | _none yet_                                                         | COMP-030                                                             |
| `src/features/company/components/PurchaseViewDialog.tsx`                           | _none yet_                                                         | COMP-030                                                             |
| `src/features/company/components/company-details/CompanyPaymentsTab.tsx`           | _none yet_                                                         | COMP-004, COMP-029, COMP-031                                         |
| `src/features/company/components/company-details/CompanyPaymentRowAction.tsx`      | _none yet_                                                         | COMP-031                                                             |
| `src/routes/dashboard/_dashboardLayout/companies/payments.tsx`                     | _none yet_                                                         | COMP-031                                                             |
| `src/components/DeleteDialog.tsx`                                                  | _none yet_                                                         | COMP-007                                                             |
| `src/features/company/components/CompanyDeleteDialog.tsx`                          | _none yet_                                                         | COMP-007                                                             |
| `src/features/company/components/company-table/CompanyTableRowAction.tsx`          | _none yet_                                                         | COMP-007                                                             |
| `src/routes/dashboard/_dashboardLayout/companies/$companyId.tsx`                   | _none yet_                                                         | COMP-008                                                             |
