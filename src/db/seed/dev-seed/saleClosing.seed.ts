import { faker } from "@faker-js/faker";

import type { DatabaseType } from "../../clients/drizzle-client";
import type {
  InsertSaleClosing,
  SaleClosingDataModel,
  SaleDataModel,
  UserDataModel,
} from "../../schemas";
import { SaleClosingTable } from "../../schemas";
import { addDays, insertChunkedReturning } from "../seed-utils";
import { seedConfigs } from "../seed.config";

const CLOSING_PERIOD_DAYS = 7;
const NOTE_PROBABILITY = 0.3;
const UNCOUNTED_PROBABILITY = 0.1;

export async function seedSaleClosings(
  db: DatabaseType,
  {
    sales,
    users,
  }: {
    sales: Array<SaleDataModel>;
    users: Array<UserDataModel>;
  }
): Promise<Array<SaleClosingDataModel>> {
  console.log("🌱 Seeding sale closings...");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const closingsData: Array<InsertSaleClosing> = [];
  let openingCash = 0;

  // Oldest first, so each closing's opening cash is the previous closing's cash
  for (
    let periodIndex = seedConfigs.targets.saleClosings - 1;
    periodIndex >= 0;
    periodIndex--
  ) {
    const periodEnd = addDays(today, -periodIndex * CLOSING_PERIOD_DAYS);
    const periodStart = addDays(periodEnd, -CLOSING_PERIOD_DAYS);

    const periodSales = sales.filter(
      (sale) =>
        !sale.deletedAt &&
        sale.createdAt >= periodStart &&
        sale.createdAt < periodEnd
    );
    const totalSales = periodSales.reduce(
      (sum, sale) => sum + sale.totalAmount,
      0
    );
    const cashReceived = periodSales.reduce(
      (sum, sale) => sum + sale.paidAmount,
      0
    );

    const totalExpenses = Math.floor(
      cashReceived * faker.number.float({ min: 0.05, max: 0.15 })
    );
    const totalSalary = Math.floor(
      cashReceived * faker.number.float({ min: 0.2, max: 0.35 })
    );
    const companyPaid = Math.floor(
      cashReceived * faker.number.float({ min: 0, max: 0.3 })
    );

    const expectedCash =
      openingCash + cashReceived - totalExpenses - totalSalary - companyPaid;
    const countedCash = faker.datatype.boolean(UNCOUNTED_PROBABILITY)
      ? null
      : expectedCash + faker.number.int({ min: -50, max: 50 });

    closingsData.push({
      periodStart,
      periodEnd,
      companyPaid,
      totalSales,
      openingCash,
      cashReceived,
      totalExpenses,
      totalSalary,
      countedCash,
      closedBy: faker.helpers.arrayElement(users).id,
      note: faker.datatype.boolean(NOTE_PROBABILITY)
        ? faker.lorem.sentence()
        : null,
    });

    openingCash = countedCash ?? expectedCash;
  }

  const saleClosings = await insertChunkedReturning(closingsData, (chunk) =>
    db.insert(SaleClosingTable).values(chunk).returning()
  );

  console.log(`✅ ${saleClosings.length} Sale closings seeded`);

  return saleClosings;
}
