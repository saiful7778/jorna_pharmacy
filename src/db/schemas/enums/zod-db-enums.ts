import z from "zod";

import {
  ACTION_TYPE,
  MEDICINE_TYPE,
  PERMISSION_LEVEL,
  RESOURCE_TYPE,
  ROLES,
  USER_EVENT_TYPE,
} from "./enum-values";

export const RoleEnumSchema = z.enum(ROLES);
export type RoleEnumType = z.infer<typeof RoleEnumSchema>;

export const PermissionLevelEnumSchema = z.enum(PERMISSION_LEVEL);
export type PermissionLevelEnumType = z.infer<typeof PermissionLevelEnumSchema>;

export const ResourceTypeEnumSchema = z.enum(RESOURCE_TYPE);
export type ResourceTypeEnumType = z.infer<typeof ResourceTypeEnumSchema>;

export const ActionTypeEnumSchema = z.enum(ACTION_TYPE);
export type ActionTypeEnumType = z.infer<typeof ActionTypeEnumSchema>;

export const UserEventTypeEnumSchema = z.enum(USER_EVENT_TYPE);
export type UserEventTypeEnumType = z.infer<typeof UserEventTypeEnumSchema>;

export const MedicineTypeEnumSchema = z.enum(MEDICINE_TYPE);
export type MedicineTypeEnumType = z.infer<typeof MedicineTypeEnumSchema>;
