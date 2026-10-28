import { faker } from "@faker-js/faker";

import type { DatabaseType } from "../../clients/drizzle-client";
import type {
  CustomerDataModel,
  InsertSale,
  InsertSaleInvoice,
  InsertSaleItem,
  PurchaseDataModel,
  PurchaseItemDataModel,
  SaleDataModel,
  SaleItemDataModel,
  UserDataModel,
} from "../../schemas";
import { SaleInvoiceTable, SaleItemTable, SaleTable } from "../../schemas";
import { daysAgo, insertChunkedReturning } from "../seed-utils";
import { seedConfigs } from "../seed.config";
import { updatePurchaseItemStock } from "./purchase.seed";

const SALE_WINDOW_DAYS = 90;
const WALK_IN_PROBABILITY = 0.4;
const FULL_PAYMENT_PROBABILITY = 0.7;
const SALE_DELETE_PROBABILITY = 0.05;
const MAX_ITEMS_PER_SALE = 4;
const MAX_QTY_PER_ITEM = 10;

export async function seedSales(
  db: DatabaseType,
  {
    customers,
    purchases,
    purchaseItems,
    users,
  }: {
    customers: Array<CustomerDataModel>;
    purchases: Array<PurchaseDataModel>;
    purchaseItems: Array<PurchaseItemDataModel>;
    users: Array<UserDataModel>;
  }
): Promise<{
  sales: Array<SaleDataModel>;
  saleItems: Array<SaleItemDataModel>;
}> {
  console.log("🌱 Seeding sales...");

  const now = new Date();
  const createdDates = Array.from({ length: seedConfigs.targets.sales }, () =>
    faker.date.between({ from: daysAgo(SALE_WINDOW_DAYS), to: now })
  ).sort((a, b) => a.getTime() - b.getTime());

  // Batches of deleted purchases can't be sold, and customers in the bin can't have sales
  const deletedPurchaseIds = new Set(
    purchases.filter((purchase) => purchase.deletedAt).map((p) => p.id)
  );
  const saleableBatches = purchaseItems.filter(
    (batch) => !deletedPurchaseIds.has(batch.purchaseId)
  );
  const activeCustomers = customers.filter((customer) => !customer.deletedAt);

  const salesData: Array<InsertSale> = [];
  const saleItemsData: Array<InsertSaleItem> = [];
  const invoicesData: Array<InsertSaleInvoice> = [];
  const changedBatches = new Set<PurchaseItemDataModel>();

  for (const [index, createdAt] of createdDates.entries()) {
    const saleId = crypto.randomUUID();
    const invoiceId = crypto.randomUUID();
    const lines: Array<InsertSaleItem> = [];
    const itemCount = faker.number.int({ min: 1, max: MAX_ITEMS_PER_SALE });
    // A deleted sale is returned to stock, so it never reduces batch quantities
    const deletedAt = faker.datatype.boolean(SALE_DELETE_PROBABILITY)
      ? faker.date.between({ from: createdAt, to: now })
      : null;

    for (let j = 0; j < itemCount; j++) {
      const stocked = saleableBatches.filter(
        (batch) =>
          batch.qtyRemaining > 0 &&
          !lines.some((line) => line.purchaseItemId === batch.id)
      );
      if (stocked.length === 0) break;

      const batch = faker.helpers.arrayElement(stocked);
      const qty = faker.number.int({
        min: 1,
        max: Math.min(batch.qtyRemaining, MAX_QTY_PER_ITEM),
      });
      if (!deletedAt) {
        batch.qtyRemaining -= qty;
        changedBatches.add(batch);
      }

      lines.push({
        id: crypto.randomUUID(),
        saleId,
        medicineId: batch.medicineId,
        purchaseItemId: batch.id,
        qty,
        unitPrice: batch.sellPerUnit,
        unitCost: batch.costPerUnit,
        lineTotal: qty * batch.sellPerUnit,
        createdAt,
      });
    }

    if (lines.length === 0) break;

    const customer =
      activeCustomers.length === 0 ||
      faker.datatype.boolean(WALK_IN_PROBABILITY)
        ? null
        : faker.helpers.arrayElement(activeCustomers);
    const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
    const discount = faker.number.int({
      min: 0,
      max: Math.floor(subtotal * 0.05),
    });
    const totalAmount = subtotal - discount;

    // Walk-in sales must be paid in full (see sale_walkInPaid_chk)
    const paidAmount =
      !customer || faker.datatype.boolean(FULL_PAYMENT_PROBABILITY)
        ? totalAmount
        : faker.number.int({ min: 0, max: totalAmount - 1 });

    invoicesData.push({
      id: invoiceId,
      number: String(index).padStart(4, "0"),
      isLinked: true,
      createdAt,
    });

    salesData.push({
      id: saleId,
      invoiceId,
      customerId: customer?.id ?? null,
      subtotal,
      discount,
      totalAmount,
      paidAmount,
      createdBy: faker.helpers.arrayElement(users).id,
      createdAt,
      deletedAt,
    });
    saleItemsData.push(...lines);
  }

  await insertChunkedReturning(invoicesData, (chunk) =>
    db.insert(SaleInvoiceTable).values(chunk).returning()
  );
  const sales = await insertChunkedReturning(salesData, (chunk) =>
    db.insert(SaleTable).values(chunk).returning()
  );
  const saleItems = await insertChunkedReturning(saleItemsData, (chunk) =>
    db.insert(SaleItemTable).values(chunk).returning()
  );

  await updatePurchaseItemStock(db, [...changedBatches]);

  console.log(`✅ ${sales.length} Sales seeded`);
  console.log(`✅ ${saleItems.length} Sale items seeded`);

  return { sales, saleItems };
}
