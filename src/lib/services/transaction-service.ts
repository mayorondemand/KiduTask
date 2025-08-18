import { db } from "@/lib/db";
import { transaction } from "@/lib/db/schema";
import type {
  StatusEnum,
  TransactionDB,
  TransactionTypeEnum,
} from "@/lib/types";

import { desc, eq } from "drizzle-orm";

class TransactionService {
  async createTransaction(
    userId: string,
    amount: number,
    type: TransactionTypeEnum,
    description: string,
    status: StatusEnum,
    campaignId?: number,
  ): Promise<TransactionDB> {
    const result = await db
      .insert(transaction)
      .values({
        campaignId,
        userId,
        amount,
        type,
        description,
        status,
      })
      .returning();

    return result[0];
  }

  async updateTransaction(
    transactionId: number,
    status: StatusEnum,
  ): Promise<TransactionDB> {
    const result = await db
      .update(transaction)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(transaction.id, transactionId))
      .returning();

    return result[0];
  }

  async getTransactionById(
    transactionId: number,
  ): Promise<TransactionDB | null> {
    const result = await db
      .select()
      .from(transaction)
      .where(eq(transaction.id, transactionId))
      .limit(1);

    return result[0] || null;
  }

  async getUserTransactions(
    userId: string,
    limit: number = 50,
  ): Promise<TransactionDB[]> {
    return await db
      .select()
      .from(transaction)
      .where(eq(transaction.userId, userId))
      .orderBy(desc(transaction.createdAt))
      .limit(limit);
  }

  async getCampaignTransactions(campaignId: number): Promise<TransactionDB[]> {
    return await db
      .select()
      .from(transaction)
      .where(eq(transaction.campaignId, campaignId))
      .orderBy(desc(transaction.createdAt));
  }
}

export const transactionService = new TransactionService();
