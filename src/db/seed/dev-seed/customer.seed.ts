import { faker } from "@faker-js/faker";

import type { DatabaseType } from "../../clients/drizzle-client";
import type {
  CustomerDataModel,
  InsertCustomer,
  InsertCustomerPayment,
  SaleDataModel,
  UserDataModel,
} from "../../schemas";
import { CustomerPaymentTable, CustomerTable } from "../../schemas";
import {
  daysAgo,
  insertChunked,
  insertChunkedReturning,
  splitAmount,
} from "../seed-utils";
import { seedConfigs } from "../seed.config";

export async function seedCustomers(
  db: DatabaseType
): Promise<Array<CustomerDataModel>> {
  console.log("🌱 Seeding customers...");

  const customersData: Array<InsertCustomer> = Array.from(
    { length: seedConfigs.targets.customers },
    () => ({
      name: faker.person.fullName(),
      phone: faker.phone.number(),
      address: faker.location.streetAddress(),
      note: faker.datatype.boolean(0.2) ? faker.lorem.sentence() : null,
      isActive: faker.datatype.boolean(0.9),
    })
  );

  const customers = await insertChunkedReturning(customersData, (chunk) =>
    db.insert(CustomerTable).values(chunk).returning()
  );

  console.log(`✅ ${customers.length} Customers seeded`);

  return customers;
}

export async function seedCustomerPayments(
  db: DatabaseType,
  {
    customers,
    sales,
    users,
  }: {
    customers: Array<CustomerDataModel>;
    sales: Array<SaleDataModel>;
    users: Array<UserDataModel>;
  }
): Promise<void> {
  console.log("🌱 Seeding customer payments...");

  const paymentsData: Array<InsertCustomerPayment> = [];

  for (const sale of sales) {
    if (!sale.customerId || sale.paidAmount === 0) continue;

    for (const amount of splitAmount(sale.paidAmount)) {
      paymentsData.push({
        customerId: sale.customerId,
        saleId: sale.id,
        amount,
        note: null,
        createdBy: faker.helpers.arrayElement(users).id,
        createdAt: faker.date.between({
          from: sale.createdAt,
          to: new Date(),
        }),
      });
    }
  }

  for (const customer of customers) {
    if (!faker.datatype.boolean(0.3)) continue;

    paymentsData.push({
      customerId: customer.id,
      saleId: null,
      amount: faker.number.int({ min: 500, max: 3000 }),
      note: "Due collection",
      createdBy: faker.helpers.arrayElement(users).id,
      createdAt: daysAgo(faker.number.int({ min: 0, max: 90 })),
    });
  }

  await insertChunked(paymentsData, (chunk) =>
    db.insert(CustomerPaymentTable).values(chunk)
  );

  console.log(`✅ ${paymentsData.length} Customer payments seeded`);
}
