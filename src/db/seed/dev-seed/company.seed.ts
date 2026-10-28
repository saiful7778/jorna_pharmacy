import { faker } from "@faker-js/faker";

import type { DatabaseType } from "../../clients/drizzle-client";
import type {
  PurchaseDataModel,
  UserDataModel,
  CompanyDataModel,
  InsertCompany,
  InsertCompanyPayment,
} from "../../schemas";
import { CompanyPaymentTable, CompanyTable } from "../../schemas";
import {
  daysAgo,
  insertChunked,
  insertChunkedReturning,
  splitAmount,
} from "../seed-utils";
import { seedConfigs } from "../seed.config";

export async function seedCompanies(
  db: DatabaseType
): Promise<Array<CompanyDataModel>> {
  console.log("🌱 Seeding companies...");

  const companiesData: Array<InsertCompany> = Array.from(
    { length: seedConfigs.targets.companies },
    () => ({
      name: faker.company.name(),
      phone: faker.phone.number(),
      address: faker.location.streetAddress(),
      note: faker.datatype.boolean(0.3) ? faker.lorem.sentence() : null,
      isActive: faker.datatype.boolean(0.9),
      deletedAt: faker.datatype.boolean(0.1)
        ? daysAgo(faker.number.int({ min: 0, max: 14 }))
        : null,
    })
  );

  const companies = await insertChunkedReturning(companiesData, (chunk) =>
    db.insert(CompanyTable).values(chunk).returning()
  );

  console.log(`✅ ${companies.length} companies seeded`);

  return companies;
}

export async function seedCompanyPayments(
  db: DatabaseType,
  {
    companies,
    purchases,
    users,
  }: {
    companies: Array<CompanyDataModel>;
    purchases: Array<PurchaseDataModel>;
    users: Array<UserDataModel>;
  }
): Promise<void> {
  console.log("🌱 Seeding company payments...");

  const paymentsData: Array<InsertCompanyPayment> = [];

  for (const purchase of purchases) {
    if (purchase.paidAmount === 0) continue;

    for (const amount of splitAmount(purchase.paidAmount)) {
      paymentsData.push({
        companyId: purchase.companyId,
        purchaseId: purchase.id,
        amount,
        note: null,
        createdBy: faker.helpers.arrayElement(users).id,
        createdAt: faker.date.between({
          from: purchase.createdAt,
          to: purchase.deletedAt ?? new Date(),
        }),
        deletedAt: purchase.deletedAt,
      });
    }
  }

  for (const company of companies) {
    if (!faker.datatype.boolean(0.3)) continue;

    paymentsData.push({
      companyId: company.id,
      purchaseId: null,
      amount: faker.number.int({ min: 1000, max: 5000 }),
      note: "On-account payment",
      createdBy: faker.helpers.arrayElement(users).id,
      createdAt: faker.date.between({
        from: daysAgo(90),
        to: company.deletedAt ?? new Date(),
      }),
      deletedAt: company.deletedAt,
    });
  }

  await insertChunked(paymentsData, (chunk) =>
    db.insert(CompanyPaymentTable).values(chunk)
  );

  console.log(`✅ ${paymentsData.length} Company payments seeded`);
}
