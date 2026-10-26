import { and, eq, like } from "drizzle-orm";

import { API_MESSAGES } from "@/constants/apiMessage";
import type { DatabaseType } from "@/db/clients/drizzle-client";
import { CustomerTable, type InsertCustomer } from "@/db/schemas";
import { escapeLike } from "@/db/utils/escapeLike";

export async function resolveCustomer(
  db: DatabaseType,
  {
    id,
    name,
    phone,
    address,
  }: {
    id: string | undefined;
    name: string | undefined;
    phone?: string | undefined;
    address?: string | undefined;
  }
): Promise<
  { success: true; id: string } | { success: false; message: string }
> {
  if (id) {
    const [existCustomer] = await db
      .select({ id: CustomerTable.id })
      .from(CustomerTable)
      .where(and(eq(CustomerTable.isActive, true), eq(CustomerTable.id, id)))
      .limit(1);
    if (!existCustomer) {
      return { success: false, message: API_MESSAGES.CUSTOMER.NOT_FOUND };
    }
    return { success: true, id: existCustomer.id };
  }

  if (!name) {
    return { success: false, message: API_MESSAGES.CUSTOMER.NOT_CREATE };
  }

  const customerWhere = [
    eq(CustomerTable.isActive, true),
    like(CustomerTable.name, `%${escapeLike(name)}%`),
  ];

  if (phone) {
    customerWhere.push(like(CustomerTable.phone, `%${escapeLike(phone)}%`));
  }

  const [existCustomer] = await db
    .select({ id: CustomerTable.id })
    .from(CustomerTable)
    .where(and(...customerWhere))
    .limit(1);

  if (existCustomer) {
    return { success: true, id: existCustomer.id };
  }

  const [newCustomer] = await db
    .insert(CustomerTable)
    .values({
      name,
      phone,
      address,
    } satisfies InsertCustomer)
    .returning({ id: CustomerTable.id });

  if (!newCustomer) {
    return { success: false, message: API_MESSAGES.CUSTOMER.NOT_CREATE };
  }

  return { success: true, id: newCustomer.id };
}
