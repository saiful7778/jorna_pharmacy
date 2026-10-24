# Customer

Test intent for the customer domain: customer directory, customer details, and customer
payments. Scope: `src/features/customer/**` and the customer routes under
`src/routes/dashboard/_dashboardLayout/customers/**`.

## Coverage summary

| Status      | Count |
| ----------- | ----- |
| Implemented | 2     |
| Partial     | 0     |
| Missing     | 0     |
| Obsolete    | 0     |
| **Total**   | **2** |

## Customer payment create dialog

### CUST-001 · Payment is recorded for the currently selected customer

- **Covers:** `CustomerPaymentCreateDialog` — `src/features/customer/components/CustomerPaymentCreateDialog.tsx`
- **Type:** component · **Priority:** P0 · **Status:** Implemented
- **Given** the create-payment dialog is open for customer A
- **When** the `customerId` prop changes to customer B and the user submits a payment
- **Then** the create mutation receives customer B's id and the entered amount
- **Notes:** Guards the regression where react-hook-form kept the `customerId` captured
  at first mount. Test: `src/features/customer/components/CustomerPaymentCreateDialog.test.tsx`.

### CUST-002 · Switching customers clears an in-progress payment

- **Covers:** `CustomerPaymentCreateDialog` — `src/features/customer/components/CustomerPaymentCreateDialog.tsx`
- **Type:** component · **Priority:** P1 · **Status:** Implemented
- **Given** the dialog is open for customer A and the user has typed an amount
- **When** the `customerId` prop changes to customer B
- **Then** the amount field is cleared so customer A's draft cannot be submitted for
  customer B
- **Notes:** Test: `src/features/customer/components/CustomerPaymentCreateDialog.test.tsx`.

## Source map

| Source file                                                        | Test file                                                               | Cases              |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------- | ------------------ |
| `src/features/customer/components/CustomerPaymentCreateDialog.tsx` | `src/features/customer/components/CustomerPaymentCreateDialog.test.tsx` | CUST-001, CUST-002 |
