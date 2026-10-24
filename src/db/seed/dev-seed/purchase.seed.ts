import { faker } from "@faker-js/faker";
import { eq } from "drizzle-orm";

import type { DatabaseType } from "../../clients/drizzle-client";
import type {
  MedicineDataModel,
  PurchaseDataModel,
  PurchaseItemDataModel,
  PurchaseReturnDataModel,
  PurchaseReturnItemDataModel,
  UserDataModel,
  CompanyDataModel,
  InsertPurchase,
  InsertPurchaseItem,
  InsertPurchaseReturn,
  InsertPurchaseReturnItem,
} from "../../schemas";
import {
  PurchaseItemTable,
  PurchaseReturnItemTable,
  PurchaseReturnTable,
  PurchaseTable,
} from "../../schemas";
import { addDays, daysAgo, insertChunkedReturning } from "../seed-utils";
import { seedConfigs } from "../seed.config";

const RETURN_REASONS = [
  "Near expiry",
  "Damaged packaging",
  "Wrong delivery",
  "Expired stock",
];

export async function seedPurchases(
  db: DatabaseType,
  {
    companies,
    medicines,
    users,
  }: {
    companies: Array<CompanyDataModel>;
    medicines: Array<MedicineDataModel>;
    users: Array<UserDataModel>;
  }
): Promise<{
  purchases: Array<PurchaseDataModel>;
  purchaseItems: Array<PurchaseItemDataModel>;
}> {
  console.log("🌱 Seeding purchases...");

  const purchasesData: Array<InsertPurchase> = [];
  const purchaseItemsData: Array<InsertPurchaseItem> = [];
  const companyInvoiceCounters = new Map<string, number>();

  for (let i = 1; i <= seedConfigs.targets.purchases; i++) {
    const purchaseId = crypto.randomUUID();
    const createdAt = faker.date.between({
      from: daysAgo(180),
      to: daysAgo(90),
    });
    const company = faker.helpers.arrayElement(companies);
    const companyInvoiceCounter =
      (companyInvoiceCounters.get(company.id) ?? 0) + 1;
    companyInvoiceCounters.set(company.id, companyInvoiceCounter);
    const companyInvoiceNo = faker.datatype.boolean(0.85)
      ? `VINV-${createdAt.getFullYear()}-${String(companyInvoiceCounter).padStart(4, "0")}`
      : null;

    const items = faker.helpers
      .arrayElements(medicines, { min: 2, max: 6 })
      .map((medicine) => {
        const qtyPurchased = faker.number.int({ min: 20, max: 300 });
        const costPerUnit = faker.number.int({ min: 5, max: 400 });

        return {
          id: crypto.randomUUID(),
          purchaseId,
          medicineId: medicine.id,
          batchNo: faker.string.alphanumeric({ length: 6, casing: "upper" }),
          qtyPurchased,
          qtyRemaining: qtyPurchased,
          costPerUnit,
          sellPerUnit: Math.ceil(
            costPerUnit * faker.number.float({ min: 1.1, max: 1.4 })
          ),
          expiryDate: addDays(
            createdAt,
            faker.number.int({ min: 365, max: 1095 })
          ),
          createdAt,
        } satisfies InsertPurchaseItem;
      });

    const subtotal = items.reduce(
      (sum, item) => sum + item.qtyPurchased * item.costPerUnit,
      0
    );
    const discount = faker.number.int({
      min: 0,
      max: Math.floor(subtotal * 0.02),
    });
    const totalAmount = subtotal - discount;

    purchasesData.push({
      id: purchaseId,
      companyId: company.id,
      companyInvoiceNo,
      subtotal,
      discount,
      totalAmount,
      paidAmount: faker.datatype.boolean(0.8)
        ? totalAmount
        : faker.number.int({ min: 0, max: totalAmount - 1 }),
      note: null,
      createdBy: faker.helpers.arrayElement(users).id,
      createdAt,
    });
    purchaseItemsData.push(...items);
  }

  const purchases = await insertChunkedReturning(purchasesData, (chunk) =>
    db.insert(PurchaseTable).values(chunk).returning()
  );
  const purchaseItems = await insertChunkedReturning(
    purchaseItemsData,
    (chunk) => db.insert(PurchaseItemTable).values(chunk).returning()
  );

  console.log(`✅ ${purchases.length} Purchases seeded`);
  console.log(`✅ ${purchaseItems.length} Purchase items seeded`);

  return { purchases, purchaseItems };
}

export async function seedPurchaseReturns(
  db: DatabaseType,
  {
    purchases,
    purchaseItems,
    users,
  }: {
    purchases: Array<PurchaseDataModel>;
    purchaseItems: Array<PurchaseItemDataModel>;
    users: Array<UserDataModel>;
  }
): Promise<{
  purchaseReturns: Array<PurchaseReturnDataModel>;
  purchaseReturnItems: Array<PurchaseReturnItemDataModel>;
}> {
  console.log("🌱 Seeding purchase returns...");

  const returnsData: Array<InsertPurchaseReturn> = [];
  const returnItemsData: Array<InsertPurchaseReturnItem> = [];
  const changedBatches = new Set<PurchaseItemDataModel>();

  for (let i = 0; i < seedConfigs.targets.purchaseReturns; i++) {
    const purchase = faker.helpers.arrayElement(purchases);
    const candidates = purchaseItems.filter(
      (item) => item.purchaseId === purchase.id && item.qtyRemaining > 0
    );
    if (candidates.length === 0) continue;

    const returnId = crypto.randomUUID();
    const createdAt = faker.date.between({
      from: purchase.createdAt,
      to: new Date(),
    });

    const lines = faker.helpers
      .arrayElements(candidates, {
        min: 1,
        max: Math.min(2, candidates.length),
      })
      .map((batch) => {
        const qty = faker.number.int({
          min: 1,
          max: Math.max(1, Math.floor(batch.qtyRemaining / 4)),
        });
        batch.qtyRemaining -= qty;
        changedBatches.add(batch);

        return {
          id: crypto.randomUUID(),
          purchaseReturnId: returnId,
          purchaseItemId: batch.id,
          qty,
          unitCost: batch.costPerUnit,
          createdAt,
        } satisfies InsertPurchaseReturnItem;
      });

    returnsData.push({
      id: returnId,
      companyId: purchase.companyId,
      purchaseId: purchase.id,
      totalAmount: lines.reduce(
        (sum, line) => sum + line.qty * line.unitCost,
        0
      ),
      reason: faker.helpers.arrayElement(RETURN_REASONS),
      createdBy: faker.helpers.arrayElement(users).id,
      createdAt,
    });
    returnItemsData.push(...lines);
  }

  const purchaseReturns = await insertChunkedReturning(returnsData, (chunk) =>
    db.insert(PurchaseReturnTable).values(chunk).returning()
  );
  const purchaseReturnItems = await insertChunkedReturning(
    returnItemsData,
    (chunk) => db.insert(PurchaseReturnItemTable).values(chunk).returning()
  );

  await updatePurchaseItemStock(db, [...changedBatches]);

  console.log(`✅ ${purchaseReturns.length} Purchase returns seeded`);
  console.log(`✅ ${purchaseReturnItems.length} Purchase return items seeded`);

  return { purchaseReturns, purchaseReturnItems };
}

export async function updatePurchaseItemStock(
  db: DatabaseType,
  batches: Array<PurchaseItemDataModel>
): Promise<void> {
  for (const batch of batches) {
    await db
      .update(PurchaseItemTable)
      .set({ qtyRemaining: batch.qtyRemaining })
      .where(eq(PurchaseItemTable.id, batch.id));
  }
}
