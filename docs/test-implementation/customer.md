# Customer

Test intent for the customer domain: customer directory, customer details, and customer
payments. Scope: `src/features/customer/**` and the customer routes under
`src/routes/dashboard/_dashboardLayout/customers/**`.

## Coverage summary

| Status      | Count  |
| ----------- | ------ |
| Implemented | 3      |
| Partial     | 3      |
| Missing     | 11     |
| Obsolete    | 2      |
| **Total**   | **19** |

## Customer payment create dialog

### CUST-001 · Payment is recorded for the currently selected customer

- **Covers:** `CustomerPaymentCreateDialog` — `src/features/customer/components/CustomerPaymentCreateDialog.tsx`
- **Type:** component · **Priority:** P0 · **Status:** Implemented
- **Given** the create-payment dialog is open for customer A
- **When** the `customerId` prop changes to customer B and the user submits a payment
- **Then** the create mutation receives customer B's id and the entered amount
- **Notes:** Guards the regression where react-hook-form kept the `customerId` captured
  at first mount. Test: `src/features/customer/components/CustomerPaymentCreateDialog.test.tsx`.
  The dialog also accepts an optional `open`/`setOpen` pair, so a row can open its own instance
  without using the shared atom. Opening it with a `saleId` keeps that sale selected.

### CUST-002 · Switching customers clears an in-progress payment

- **Covers:** `CustomerPaymentCreateDialog` — `src/features/customer/components/CustomerPaymentCreateDialog.tsx`
- **Type:** component · **Priority:** P1 · **Status:** Implemented
- **Given** the dialog is open for customer A and the user has typed an amount
- **When** the `customerId` prop changes to customer B
- **Then** the amount field is cleared so customer A's draft cannot be submitted for
  customer B
- **Notes:** Test: `src/features/customer/components/CustomerPaymentCreateDialog.test.tsx`.

## Customer details purchases and payments

### CUST-003 · Purchases and payments tabs share the URL time range and reset to page 1

- **Covers:** `CustomerPurchasesTab` and `CustomerPaymentsTab` — `src/features/customer/components/customer-details/`
- **Type:** component · **Priority:** P1 · **Status:** Missing
- **Given** the customer details page is open on page 2 of the payments tab
- **When** the user selects a new range in `TimeRangeFilter`
- **Then** the list query is requested with the new `createdAt` range, the page resets to 1,
  and the range stored in the URL is the same one the details tab reads
- **Notes:** Needs a mocked oRPC client and router search state.

## Customer bin (soft delete)

### CUST-004 · Customer delete is blocked when the customer has sales or payments

- **Covers:** superseded — see CUST-014
- **Type:** integration · **Priority:** P0 · **Status:** Obsolete
- **Notes:** The payment/sale records check was removed. Delete is now blocked only when the
  customer has sales (CUST-014), and remove no longer checks records.

### CUST-005 · Deleting a customer with no related records removes it

- **Covers:** superseded — see CUST-007
- **Type:** integration · **Priority:** P0 · **Status:** Obsolete
- **Notes:** Delete now moves the customer to the bin instead of removing the row.

### CUST-006 · Delete dialog copy follows the `mode` prop

- **Covers:** `DeleteDialog` — `src/components/DeleteDialog.tsx`, and `CustomerDeleteDialog` — `src/features/customer/components/CustomerDeleteDialog.tsx`
- **Type:** component · **Priority:** P1 · **Status:** Missing
- **Given** the dialog is open in `soft` mode with the default retention
- **When** the user types text other than `CONFIRM`, then types `CONFIRM` and clicks Move to bin
- **Then** the title reads "Move to bin", the description states the retention days (15 by default),
  the button stays disabled until `CONFIRM` is typed, and after the mutation succeeds the dialog closes
- **Notes:** In `permanent` mode the dialog shows the "cannot be undone" copy and a Delete button.
  Needs a mocked oRPC client. Covers the row action and the details header.

### CUST-007 · Soft delete moves the customer and its payments to the bin

- **Covers:** `deleteCustomerProcedure` — `src/features/customer/api/customerDelete.procedure.ts`; `resolveCustomer` — `src/features/customer/customerResolver.ts`
- **Type:** integration · **Priority:** P0 · **Status:** Partial
- **Given** an active customer that has payments and no sales
- **When** the delete procedure is called with its `customerId`
- **Then** `deletedAt` and `deletedBy` are set on the customer and its payments, and the customer is excluded from the customer list, the search list, the details query (`NOT_FOUND`), and sale/payment customer lookups. Deleting it again returns `NOT_FOUND`.
- **Notes:** The cascade and `deletedBy` are asserted in `customerDelete.procedure.test.ts`. The list, search, details, and lookup exclusions are not yet asserted.

### CUST-014 · Delete is blocked when the customer has sales

- **Covers:** `deleteCustomerProcedure`, `deleteAllCustomerProcedure` — `src/features/customer/api/customerDelete.procedure.ts`
- **Type:** integration · **Priority:** P0 · **Status:** Implemented
- **Given** an active customer with at least one sale
- **When** `delete` is called with its `customerId`
- **Then** the call fails with `HAS_SALES`, and the customer and its payments stay active
- **Notes:** Asserted in `customerDelete.procedure.test.ts`. `deleteAll` shares the same check and is not yet asserted.

### CUST-015 · Sale and payment lists, totals, and sale candidates exclude soft-deleted rows

- **Covers:** `customer.procedure.ts` (list summary and details totals), `customerPayment.procedure.ts` (list, create candidates, stats), `sale.procedure.ts` (list, stats) — `src/features/customer/api/`, `src/features/sale/api/`
- **Type:** integration · **Priority:** P0 · **Status:** Missing
- **Given** a customer with active and soft-deleted sales and payments
- **When** the customer list, details, payment list/stats, or a new payment is requested
- **Then** soft-deleted sales and payments are excluded from every total, count, due amount, and candidate sale. A new payment never allocates to a soft-deleted sale.
- **Notes:** Requires `isNull(deletedAt)` on every query over these tables.

### CUST-008 · Bulk delete and restore are all-or-nothing

- **Covers:** `deleteAllCustomerProcedure`, `restoreAllCustomerProcedure` — `src/features/customer/api/customerDelete.procedure.ts`
- **Type:** integration · **Priority:** P0 · **Status:** Missing
- **Given** a list of customer ids where one id is unknown, or not in the expected state (active for delete, in the bin for restore)
- **When** `deleteAll` or `restoreAll` is called
- **Then** the call fails (`NOT_FOUND` or `NOT_IN_BIN`) and no customer changes state. When every id is valid, all of them change state and `count` equals the number of unique ids.
- **Notes:** Duplicate ids are counted once. Inputs above 50 ids are rejected.

### CUST-009 · Permanent remove deletes a bin customer together with its payments

- **Covers:** `removeCustomerProcedure`, `removeAllCustomerProcedure` — `src/features/customer/api/customerDelete.procedure.ts`
- **Type:** integration · **Priority:** P0 · **Status:** Partial
- **Given** a customer that is in the bin, or one that is still active
- **When** `remove` or `removeAll` is called
- **Then** an active customer returns `NOT_IN_BIN` and nothing is deleted. A customer in the bin is deleted together with its payments, with no "has records" check. `removeAll` returns `count`.
- **Notes:** `remove` is asserted in `customerDelete.procedure.test.ts`. The `NOT_IN_BIN` path and `removeAll` are not yet asserted. Users without `customer.manage` or `customer.delete` get `FORBIDDEN`.

### CUST-010 · Restore returns a customer and its payments to the active lists

- **Covers:** `restoreCustomerProcedure` — `src/features/customer/api/customerDelete.procedure.ts`
- **Type:** integration · **Priority:** P1 · **Status:** Partial
- **Given** a customer in the bin
- **When** `restore` is called with its `customerId`
- **Then** `deletedAt` and `deletedBy` are cleared on the customer and on the payments deleted with it, and the customer is returned by the list, search, and details queries again. Restoring a customer that is not in the bin returns `NOT_IN_BIN`.
- **Notes:** The restore of the customer and its payments is asserted in `customerDelete.procedure.test.ts`. The list/search/details visibility and the `NOT_IN_BIN` path are not yet asserted.

### CUST-011 · Bin list returns only soft-deleted customers

- **Covers:** `listCustomerBinProcedure` — `src/features/customer/api/customerDelete.procedure.ts`
- **Type:** integration · **Priority:** P0 · **Status:** Missing
- **Given** a mix of active and soft-deleted customers, some matching a search term
- **When** `listBin` is called with pagination and a search term
- **Then** only customers with `deletedAt` set are returned, filtered by the search fields (`name`, `phone`, `address`), ordered by most recently deleted first, with `meta` counting only bin rows
- **Notes:** Requires `customer.manage` and `customer.delete`; other users get `FORBIDDEN`.

### CUST-012 · Bin table restores and permanently deletes customers

- **Covers:** `CustomerBinTable`, `CustomerBinTableRowAction` — `src/features/customer/components/customer-bin-table/`
- **Type:** component · **Priority:** P1 · **Status:** Missing
- **Given** the bin table shows a deleted customer, and the user has `customer.delete`
- **When** the user clicks Restore on the row, or selects rows and clicks Restore All
- **Then** the restore mutation runs for the selected ids, the bin list refreshes, and the active list is invalidated. "Purge in" shows the days left from `BIN_RETENTION_DAYS`.
- **When** the user clicks Delete permanently, or Delete All, and types `CONFIRM`
- **Then** the remove mutation runs for the selected ids through the `permanent` `DeleteDialog`, and the dialog closes on success
- **Notes:** Needs a mocked oRPC client. Users without `customer.delete` do not see the row menu items.

### CUST-013 · Customers page switches between Active and Bin views

- **Covers:** `customers/index.tsx` route — `src/routes/dashboard/_dashboardLayout/customers/index.tsx`
- **Type:** component · **Priority:** P1 · **Status:** Missing
- **Given** a user with `customer.delete` is on `/dashboard/customers` with a search term and page 3
- **When** the user selects the Bin tab
- **Then** the URL gets `view=bin`, the search term and page are kept, and the bin table renders. Selecting Active returns to the active table.
- **Notes:** Built on `TabNavigation` (`paramName="view"`, `defaultTab="active"`), which does not reset pagination. Tabs use icons. Without `customer.delete` the tabs are hidden, and a `view=bin` URL shows the active table. Needs router and permission mocks.

### CUST-016 · Customer purchases tab shows date with invoice, API due amount, and status

- **Covers:** `CustomerPurchasesTab` — `src/features/customer/components/customer-details/CustomerPurchasesTab.tsx`; `sale.procedure.ts` (list `dueAmount`) — `src/features/sale/api/`
- **Type:** component · **Priority:** P1 · **Status:** Missing
- **Given** a customer with a partially paid sale and a fully paid sale
- **When** the purchases tab renders the sale list
- **Then** the first column shows the date with the invoice number beneath it, followed by right-aligned Total, Paid, and Due, and a status badge (`Paid`, `Partially paid`, or `Unpaid`) computed from the returned `dueAmount`
- **Then** `sale.list` rows include `dueAmount` equal to `totalAmount - paidAmount`, never below zero
- **Notes:** The empty state spans all five columns. Needs a mocked oRPC client for the component and a D1/Drizzle fixture for the list `dueAmount`.

### CUST-017 · Customer payments tab shows date with the invoice it was made against

- **Covers:** `CustomerPaymentsTab` and `CustomerPaymentRowAction` — `src/features/customer/components/customer-details/`; `CustomerPaymentsTable` (shared by the tab and the customers payments page) — `src/features/customer/components/CustomerPaymentsTable.tsx`
- **Type:** component · **Priority:** P2 · **Status:** Missing
- **Given** a customer with a payment linked to a sale invoice and a general payment with no invoice
- **When** the payments tab renders the payment list
- **Then** the Date column shows the payment date. The Sale column shows `Invoice <no>` with the sale date and `Total` beneath it for a linked payment, or `General payment` for a payment with no sale. Then come right-aligned Amount and Note, and an Action column with a row menu only for linked payments
- **When** the user opens the row menu and selects View sale
- **Then** the sale details dialog opens for that payment's sale (`SaleViewDialog`)
- **Notes:** The empty state spans all five columns. The list output adds `saleTotalAmount` and `saleCreatedAt` (nullable) from the joined sale. Needs a mocked oRPC client and router search state.

### CUST-018 · Customer purchases tab creates a sale for the customer and offers view and delete per sale

- **Covers:** `CustomerPurchasesTab` and `CustomerPurchaseRowAction` — `src/features/customer/components/customer-details/`
- **Type:** component · **Priority:** P1 · **Status:** Missing
- **Given** a customer with a sale, and a user with `sale.manage` or `sale.create`, and another user with `sale.delete`
- **When** the user clicks New sale on the purchases tab, then opens a sale row menu
- **Then** the create dialog opens with the customer already selected (customer fields hidden), and the menu offers View sale, which opens the sale details dialog for that sale
- **When** the user opens a row menu for a sale with a customer and selects New payment
- **Then** the payment dialog opens for that customer with the sale pre-selected (the "Against purchase" selector is hidden), and recording it sends that `saleId` with the entered amount. New payment is hidden without `customer_payment.create`, for walk-in sales with no customer, and when the sale's `dueAmount` is not greater than 0
- **Then** Delete is shown only with `sale.delete`, and confirming it soft-deletes the sale and refreshes the tab
- **Notes:** The New sale button is hidden without `sale.manage` or `sale.create`. Needs a mocked oRPC client and permission mocks.

### CUST-019 · Customer payment stats are limited to the created-at range when one is given

- **Covers:** `customerPaymentStatsProcedure` — `src/features/customer/api/customerPayment.procedure.ts`; `customerPaymentStatsContract` filter — `src/features/customer/api/customerPayment.contract.ts`
- **Type:** integration · **Priority:** P1 · **Status:** Missing
- **Given** a customer with a sale and a payment created inside the range and another sale and payment created before it
- **When** the stats are requested with `filter.createdAt` set to the range
- **Then** `totalSales`, `saleCount`, `totalPaid`, and `paymentCount` count only the rows inside the range, and `dueAmount` equals `totalSales - totalPaid` for that range
- **Notes:** With no `createdAt` filter, the totals cover all active rows, as before. Needs a seeded D1 database.

## Source map

| Source file                                                                         | Test file                                                               | Cases                                                      |
| ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------- |
| `src/features/customer/components/CustomerPaymentCreateDialog.tsx`                  | `src/features/customer/components/CustomerPaymentCreateDialog.test.tsx` | CUST-001, CUST-002                                         |
| `src/features/customer/components/customer-details/CustomerPurchasesTab.tsx`        | _none yet_                                                              | CUST-003, CUST-016, CUST-018                               |
| `src/features/customer/components/customer-details/CustomerPurchaseRowAction.tsx`   | _none yet_                                                              | CUST-018                                                   |
| `src/features/customer/components/customer-details/CustomerPaymentsTab.tsx`         | _none yet_                                                              | CUST-003, CUST-017                                         |
| `src/features/customer/components/customer-details/CustomerPaymentRowAction.tsx`    | _none yet_                                                              | CUST-017                                                   |
| `src/features/customer/components/CustomerPaymentsTable.tsx`                        | _none yet_                                                              | CUST-017                                                   |
| `src/features/customer/api/customerDelete.procedure.ts`                             | `src/features/customer/api/customerDelete.procedure.test.ts`            | CUST-007, CUST-008, CUST-009, CUST-010, CUST-011, CUST-014 |
| `src/features/customer/api/customer.procedure.ts`                                   | _none yet_                                                              | CUST-015                                                   |
| `src/features/customer/api/customerPayment.procedure.ts`                            | _none yet_                                                              | CUST-015, CUST-019                                         |
| `src/features/customer/components/customer-bin-table/CustomerBinTable.tsx`          | _none yet_                                                              | CUST-012                                                   |
| `src/features/customer/components/customer-bin-table/CustomerBinTableRowAction.tsx` | _none yet_                                                              | CUST-012                                                   |
| `src/routes/dashboard/_dashboardLayout/customers/index.tsx`                         | _none yet_                                                              | CUST-013                                                   |
| `src/components/DeleteDialog.tsx`                                                   | _none yet_                                                              | CUST-006                                                   |
| `src/features/customer/components/CustomerDeleteDialog.tsx`                         | _none yet_                                                              | CUST-006                                                   |
| `src/features/customer/components/customer-table/CustomerTableRowAction.tsx`        | _none yet_                                                              | CUST-006                                                   |
| `src/routes/dashboard/_dashboardLayout/customers/$customerId.tsx`                   | _none yet_                                                              | CUST-006                                                   |
