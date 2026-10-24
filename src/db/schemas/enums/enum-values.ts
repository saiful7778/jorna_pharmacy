export const ROLES = ["USER", "EMPLOYEE", "ADMIN", "SUPER_ADMIN"] as const;

export const PERMISSION_LEVEL = ["system", "self"] as const;
export const RESOURCE_TYPE = [
  "user",
  "role_permission",
  "report",
  "purchase",
  "purchase_return",
  "vendor",
  "vendor_payment",
  "medicine",
  "customer",
  "customer_payment",
  "salary",
  "sale",
  "sale_closing",
] as const;
export const ACTION_TYPE = [
  "create",
  "read",
  "list",
  "update",
  "delete",
  "manage",
  "export",
] as const;

export const USER_EVENT_TYPE = [
  "auth.login",
  "auth.logout",
  "auth.login_failed",
  "auth.password_changed",
  "auth.password_reset",
  "device.new_detected",
  "admin.impersonation",
] as const;

export const MEDICINE_TYPE = [
  "tablet",
  "capsule",
  "syrup",
  "drop",
  "injection",
  "cream",
  "other",
] as const;
