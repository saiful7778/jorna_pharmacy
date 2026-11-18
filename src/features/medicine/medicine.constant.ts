import type { MedicineTypeEnumType } from "@/db/schemas/enums/zod-db-enums";

export const medicineTypeToBaseUnit: Record<MedicineTypeEnumType, string> = {
  tablet: "pice",
  capsule: "pice",
  syrup: "item",
  drop: "item",
  injection: "item",
  cream: "item",
  other: "other",
};
