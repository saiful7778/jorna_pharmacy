import { text } from "drizzle-orm/sqlite-core";

import { MEDICINE_TYPE, ROLES, USER_EVENT_TYPE } from "./enum-values";

export const RoleEnum = (name: string) => text(name, { enum: ROLES });

export const UserEventTypeEnum = (name: string) =>
  text(name, { enum: USER_EVENT_TYPE });

export const MedicineTypeEnum = (name: string) =>
  text(name, { enum: MEDICINE_TYPE });
