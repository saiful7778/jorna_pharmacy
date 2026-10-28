import { and, eq, isNull, like } from "drizzle-orm";

import { API_MESSAGES } from "@/constants/apiMessage";
import type { DatabaseType } from "@/db/clients/drizzle-client";
import { CompanyTable, type InsertCompany } from "@/db/schemas";
import { escapeLike } from "@/db/utils/escapeLike";

export async function resolveCompany(
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
    const [existCompany] = await db
      .select({ id: CompanyTable.id })
      .from(CompanyTable)
      .where(
        and(
          eq(CompanyTable.isActive, true),
          isNull(CompanyTable.deletedAt),
          eq(CompanyTable.id, id)
        )
      )
      .limit(1);
    if (!existCompany) {
      return { success: false, message: API_MESSAGES.COMPANY.NOT_FOUND };
    }
    return { success: true, id: existCompany.id };
  }

  if (!name) {
    return { success: false, message: API_MESSAGES.COMPANY.NOT_CREATE };
  }

  const companyWhere = [
    eq(CompanyTable.isActive, true),
    isNull(CompanyTable.deletedAt),
    like(CompanyTable.name, `%${escapeLike(name)}%`),
  ];

  if (phone) {
    companyWhere.push(like(CompanyTable.phone, `%${escapeLike(phone)}%`));
  }

  const [existCompany] = await db
    .select({ id: CompanyTable.id })
    .from(CompanyTable)
    .where(and(...companyWhere))
    .limit(1);

  if (existCompany) {
    return { success: true, id: existCompany.id };
  }

  const [newCompany] = await db
    .insert(CompanyTable)
    .values({
      name,
      phone,
      address,
    } satisfies InsertCompany)
    .returning({ id: CompanyTable.id });

  if (!newCompany) {
    return { success: false, message: API_MESSAGES.COMPANY.NOT_CREATE };
  }

  return { success: true, id: newCompany.id };
}
