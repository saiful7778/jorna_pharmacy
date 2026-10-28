import { clearAll } from "../clearAll";
import { seedPermission } from "../permission.seed";
import { seedRolePermission } from "../rolePermission.seed";
import { seedRoles } from "../roles.seed";
import { seedDbClient } from "../seed-db.client";
import { seedCompanies, seedCompanyPayments } from "./company.seed";
import { seedCustomerPayments, seedCustomers } from "./customer.seed";
import { seedMedicines } from "./medicine.seed";
import { seedPurchaseReturns, seedPurchases } from "./purchase.seed";
import { seedSales } from "./sale.seed";
import { seedSaleClosings } from "./saleClosing.seed";
import { seedUsers } from "./user.seed";

async function main() {
  console.log("🌱 Starting database seed...\n");

  const { db, dispose } = await seedDbClient();

  try {
    await clearAll(db);

    const roles = await seedRoles(db);
    const permissions = await seedPermission(db);
    const rolesAndPermissions = await seedRolePermission(
      db,
      roles,
      permissions
    );

    const users = await seedUsers(db, roles);

    const companies = await seedCompanies(db);
    const medicines = await seedMedicines(db, {
      companies,
    });
    const customers = await seedCustomers(db);

    const { purchases, purchaseItems } = await seedPurchases(db, {
      companies,
      medicines,
      users,
    });
    await seedCompanyPayments(db, { companies, purchases, users });

    const { sales, saleItems } = await seedSales(db, {
      customers,
      purchases,
      purchaseItems,
      users,
    });
    await seedCustomerPayments(db, { customers, sales, users });
    const saleClosings = await seedSaleClosings(db, { sales, users });

    const { purchaseReturns } = await seedPurchaseReturns(db, {
      purchases,
      purchaseItems,
      users,
    });

    console.log("\n📊 Seed Summary:");

    console.log(`Roles: ${roles.length}`);
    console.log(`Permissions: ${permissions.length}`);
    console.log(`Roles and Permissions: ${rolesAndPermissions.length}`);
    console.log(`Users: ${users.length}`);
    console.log(`companies: ${companies.length}`);
    console.log(`Medicines: ${medicines.length}`);
    console.log(`Customers: ${customers.length}`);
    console.log(`Purchases: ${purchases.length}`);
    console.log(`Purchase items: ${purchaseItems.length}`);
    console.log(`Purchase returns: ${purchaseReturns.length}`);
    console.log(`Sales: ${sales.length}`);
    console.log(`Sale items: ${saleItems.length}`);
    console.log(`Sale closings: ${saleClosings.length}`);

    console.log("\n🎉 Seed completed successfully!");
  } finally {
    await dispose();
  }
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  });
