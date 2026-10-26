import { implement, ORPCError } from "@orpc/server";
import { and, asc, desc, eq, gt, inArray, sql, type SQL } from "drizzle-orm";
import type { BatchItem } from "drizzle-orm/batch";

import { API_MESSAGES } from "@/constants/apiMessage";
import {
  CustomerTable,
  MedicineTable,
  PurchaseItemTable,
  SaleInvoiceTable,
  SaleItemTable,
  SaleTable,
  type InsertCustomer,
  type InsertSale,
  type InsertSaleItem,
  type SaleDataModel,
} from "@/db/schemas";
import { buildPaginateOptions, buildPaginationMeta } from "@/db/utils";
import { apiResponse } from "@/lib/apiResponse";
import {
  authMiddleware,
  userPermissionMiddleware,
} from "@/oRPC/middleware/auth.middleware";
import { errorMiddleware } from "@/oRPC/middleware/error.middleware";
import type { ORPCContext } from "@/types/orpc.types";

import { reserveInvoice } from "../invoiceResolver";
import { saleContract } from "./sale.contract";

export const saleImpl = implement(saleContract)
  .$context<ORPCContext>()
  .use(authMiddleware)
  .use(errorMiddleware);

export const listSaleProcedure = saleImpl.list
  .use(
    userPermissionMiddleware([
      { level: "system", resource: "sale", action: "manage" },
      { level: "system", resource: "sale", action: "list" },
    ])
  )
  .handler(async ({ context, input }) => {
    const { customerId, unpaidOnly, filter, ...paginateInput } = input;

    const { where, page, offset, limit } = buildPaginateOptions(
      {
        invoiceNo: SaleInvoiceTable.number,
        customerName: CustomerTable.name,
        customerPhone: CustomerTable.phone,
        createdAt: SaleTable.createdAt,
      },
      {
        ...paginateInput,
        filter:
          filter?.from || filter?.to
            ? { createdAt: { from: filter.from, to: filter.to } }
            : undefined,
      }
    );

    const whereSql: Array<SQL> = [];

    if (customerId) {
      whereSql.push(eq(SaleTable.customerId, customerId));
    }

    if (unpaidOnly) {
      whereSql.push(sql`${SaleTable.totalAmount} > ${SaleTable.paidAmount}`);
    }

    if (where) {
      whereSql.push(where);
    }

    const itemCounts = context.db
      .select({
        saleId: SaleItemTable.saleId,
        itemCount: sql<number>`COUNT(*)`.as("item_count"),
      })
      .from(SaleItemTable)
      .groupBy(SaleItemTable.saleId)
      .as("sale_item_counts");

    const [totalCountResult, sales] = await Promise.all([
      context.db
        .select({ count: sql<number>`COUNT(*)` })
        .from(SaleTable)
        .innerJoin(
          SaleInvoiceTable,
          eq(SaleInvoiceTable.id, SaleTable.invoiceId)
        )
        .leftJoin(CustomerTable, eq(SaleTable.customerId, CustomerTable.id))
        .where(and(...whereSql)),
      context.db
        .select({
          id: SaleTable.id,
          invoiceNo: SaleInvoiceTable.number,
          customer: {
            id: CustomerTable.id,
            name: CustomerTable.name,
            phone: CustomerTable.phone,
          },
          itemCount: sql<number>`COALESCE(${itemCounts.itemCount}, 0)`,
          subtotal: SaleTable.subtotal,
          discount: SaleTable.discount,
          totalAmount: SaleTable.totalAmount,
          paidAmount: SaleTable.paidAmount,
          createdAt: SaleTable.createdAt,
        })
        .from(SaleTable)
        .innerJoin(
          SaleInvoiceTable,
          eq(SaleInvoiceTable.id, SaleTable.invoiceId)
        )
        .leftJoin(CustomerTable, eq(SaleTable.customerId, CustomerTable.id))
        .leftJoin(itemCounts, eq(itemCounts.saleId, SaleTable.id))
        .where(and(...whereSql))
        .orderBy(desc(SaleTable.createdAt))
        .limit(limit)
        .offset(offset),
    ]);

    const totalCount = Number(totalCountResult[0]?.count ?? 0);

    return apiResponse(API_MESSAGES.SALE.GET_ALL, {
      meta: buildPaginationMeta(totalCount, sales.length, page, limit),
      data: sales.map((sale) => ({
        ...sale,
        itemCount: Number(sale.itemCount),
      })),
    });
  });

export const saleStatsProcedure = saleImpl.stats
  .use(
    userPermissionMiddleware([
      { level: "system", resource: "sale", action: "manage" },
      { level: "system", resource: "sale", action: "list" },
    ])
  )
  .handler(async ({ context, input }) => {
    const { where } = buildPaginateOptions(
      { createdAt: SaleTable.createdAt },
      {
        filter: input.filter,
      }
    );

    const [totals] = await context.db
      .select({
        saleCount: sql<number>`COUNT(*)`,
        totalRevenue: sql<number>`COALESCE(SUM(${SaleTable.totalAmount}), 0)`,
        totalPaid: sql<number>`COALESCE(SUM(${SaleTable.paidAmount}), 0)`,
      })
      .from(SaleTable)
      .where(where);

    const totalRevenue = Number(totals?.totalRevenue ?? 0);
    const totalPaid = Number(totals?.totalPaid ?? 0);
    const dueAmount = totalRevenue - totalPaid;

    return apiResponse(API_MESSAGES.SALE.GET_STATS, {
      saleCount: Number(totals?.saleCount ?? 0),
      totalRevenue,
      totalPaid,
      dueAmount,
    });
  });

export const saleCreateProcedure = saleImpl.create
  .use(
    userPermissionMiddleware([
      { level: "system", resource: "sale", action: "manage" },
      { level: "system", resource: "sale", action: "create" },
    ])
  )
  .handler(async ({ context, input }) => {
    let customerId: string | undefined = undefined;

    if (input.customerId) {
      const [existCustomer] = await context.db
        .select({ id: CustomerTable.id })
        .from(CustomerTable)
        .where(eq(CustomerTable.id, input.customerId))
        .limit(1);
      if (!existCustomer) {
        throw new ORPCError("NOT_FOUND", {
          message: API_MESSAGES.CUSTOMER.NOT_FOUND,
        });
      }
      customerId = existCustomer.id;
    } else {
      if (input.customerName) {
        const [newCustomer] = await context.db
          .insert(CustomerTable)
          .values({
            name: input.customerName,
            phone: input.customerPhone,
            address: input.customerAddress,
          } satisfies InsertCustomer)
          .returning({ id: CustomerTable.id });
        if (!newCustomer) {
          throw new ORPCError("INTERNAL_SERVER_ERROR", {
            message: API_MESSAGES.CUSTOMER.NOT_CREATE,
          });
        }
        customerId = newCustomer.id;
      }
    }

    const saleId = crypto.randomUUID();

    let subtotal = 0;
    let totalAmount = 0;
    const saleItems: Array<InsertSaleItem> = [];
    const stockUsage = new Map<string, number>();

    if (input.items.length > 0) {
      const medicineIds = [...new Set(input.items.map((i) => i.medicineId))];

      const [medicines, batches] = await Promise.all([
        context.db
          .select({
            id: MedicineTable.id,
            name: MedicineTable.name,
            genericName: MedicineTable.genericName,
            strength: MedicineTable.strength,
          })
          .from(MedicineTable)
          .where(
            and(
              eq(MedicineTable.isActive, true),
              inArray(MedicineTable.id, medicineIds)
            )
          ),
        context.db
          .select({
            id: PurchaseItemTable.id,
            medicineId: PurchaseItemTable.medicineId,
            qtyRemaining: PurchaseItemTable.qtyRemaining,
            sellPerUnit: PurchaseItemTable.sellPerUnit,
            costPerUnit: PurchaseItemTable.costPerUnit,
            expiryDate: PurchaseItemTable.expiryDate,
            createdAt: PurchaseItemTable.createdAt,
          })
          .from(PurchaseItemTable)
          .where(
            and(
              gt(PurchaseItemTable.qtyRemaining, 0),
              inArray(PurchaseItemTable.medicineId, medicineIds)
            )
          )
          .orderBy(
            sql`${PurchaseItemTable.expiryDate} IS NULL`,
            asc(PurchaseItemTable.expiryDate),
            asc(PurchaseItemTable.createdAt),
            asc(PurchaseItemTable.id)
          ),
      ]);

      const medicineMap = new Map(medicines.map((m) => [m.id, m]));
      const batchesByMedicine = new Map<string, typeof batches>();

      for (const batch of batches) {
        const medicineBatches = batchesByMedicine.get(batch.medicineId) ?? [];
        medicineBatches.push(batch);
        batchesByMedicine.set(batch.medicineId, medicineBatches);
      }

      const quantityByMedicine = new Map<string, number>();

      for (const inputItem of input.items) {
        quantityByMedicine.set(
          inputItem.medicineId,
          (quantityByMedicine.get(inputItem.medicineId) ?? 0) +
            inputItem.quantity
        );
      }

      for (const [medicineId, totalQty] of quantityByMedicine) {
        const medicine = medicineMap.get(medicineId);

        if (!medicine) {
          throw new ORPCError("NOT_FOUND", {
            message: API_MESSAGES.MEDICINE.NOT_FOUND,
          });
        }

        const medicineName = [
          medicine.name,
          medicine.genericName,
          medicine.strength,
        ]
          .filter(Boolean)
          .join(" - ");

        const availableBatches = [
          ...(batchesByMedicine.get(medicineId) ?? []),
        ].sort((a, b) => {
          const aExpiry = a.expiryDate?.getTime() ?? Infinity;
          const bExpiry = b.expiryDate?.getTime() ?? Infinity;

          if (aExpiry !== bExpiry) return aExpiry - bExpiry;

          const aCreated = a.createdAt.getTime();
          const bCreated = b.createdAt.getTime();

          if (aCreated !== bCreated) return aCreated - bCreated;

          return a.id.localeCompare(b.id);
        });

        const availableStock = availableBatches.reduce(
          (sum, batch) => sum + batch.qtyRemaining,
          0
        );

        // Check: stock must be >= aggregated quantity
        if (availableStock < totalQty) {
          throw new ORPCError("BAD_REQUEST", {
            message: `Insufficient stock for medicine ${medicineName}. Available: ${availableStock}, Requested: ${totalQty}`,
          });
        }

        let remainingQty = totalQty;

        for (const batch of availableBatches) {
          if (remainingQty <= 0) break;

          // Check: sellPerUnit must be positive
          if (batch.sellPerUnit <= 0) {
            throw new ORPCError("BAD_REQUEST", {
              message: `Invalid sell price for medicine ${medicineName}: ${batch.sellPerUnit}`,
            });
          }

          const qty = Math.min(batch.qtyRemaining, remainingQty);
          const lineTotal = batch.sellPerUnit * qty;

          remainingQty -= qty;
          subtotal += lineTotal;

          saleItems.push({
            saleId,
            medicineId,
            purchaseItemId: batch.id,
            qty,
            unitPrice: batch.sellPerUnit,
            unitCost: batch.costPerUnit,
            lineTotal,
          });

          stockUsage.set(batch.id, (stockUsage.get(batch.id) ?? 0) + qty);
        }
      }

      totalAmount = subtotal - input.discountAmount;
    } else {
      subtotal = input.totalAmount;
      totalAmount = input.totalAmount;
    }

    const invoice = await reserveInvoice(context.db, context.user.id);

    const statements: Array<BatchItem<"sqlite">> = [
      context.db
        .insert(SaleTable)
        .values({
          id: saleId,
          customerId,
          invoiceId: invoice.id,
          createdBy: context.user.id,
          subtotal,
          totalAmount,
          discount: input.discountAmount,
          paidAmount: input.paidAmount,
        } satisfies InsertSale)
        .returning(),
    ];

    if (saleItems.length > 0) {
      statements.push(
        context.db.insert(SaleItemTable).values(saleItems).returning()
      );
    }

    for (const [purchaseItemId, qty] of stockUsage) {
      statements.push(
        context.db
          .update(PurchaseItemTable)
          .set({
            qtyRemaining: sql`${PurchaseItemTable.qtyRemaining} - ${qty}`,
          })
          .where(eq(PurchaseItemTable.id, purchaseItemId))
      );
    }

    const [saleResult] = await context.db.batch(
      statements as [BatchItem<"sqlite">, ...Array<BatchItem<"sqlite">>]
    );
    const newSale = (saleResult as Array<SaleDataModel> | undefined)?.[0];

    if (!newSale) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: API_MESSAGES.SALE.NOT_CREATE,
      });
    }

    return apiResponse(API_MESSAGES.SALE.CREATE, newSale);
  });
