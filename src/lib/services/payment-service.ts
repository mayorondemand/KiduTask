import { db } from "@/lib/db";
import { BadRequestError, NotAuthorizedError } from "@/lib/error-handler";
import type { TransactionDB } from "@/lib/types";
import axios from "axios";
import { transactionService } from "./transaction-service";
import { userService } from "./user-service";

export type InitiatePaymentParams = {
  amount: number;
  name: string;
  email: string;
  txRef: TransactionDB["id"];
  currency?: string;
};

export interface FlutterWaveInitResponse {
  status: "success" | string;
  message: string;
  data: { link: string };
}

export interface FlutterwaveEvent {
  event: string;
  data: {
    id: number;
    tx_ref: string;
    flw_ref: string;
    device_fingerprint: string;
    amount: number;
    currency: string;
    charged_amount: number;
    app_fee: number;
    merchant_fee: number;
    processor_response: string;
    auth_model: string;
    ip: string;
    narration: string;
    status: string;
    payment_type: string;
    created_at: string;
    account_id: number;
    customer: {
      id: number;
      name: string;
      phone_number: string;
      email: string;
      created_at: string;
    };
    card: {
      first_6digits: string;
      last_4digits: string;
      issuer: string;
      country: string;
      type: string;
      expiry: string;
    };
  };
}

export interface FlutterwaveVerifyResponse
  extends Omit<FlutterwaveEvent, "event"> {
  status: string;
  message: string;
}

export interface PaymentServiceBase {
  initiatePayment(
    params: InitiatePaymentParams,
  ): Promise<FlutterWaveInitResponse | undefined>;
  verifySignature(request: Request): void;
  verifyTransaction(
    transactionId: number,
  ): Promise<FlutterwaveVerifyResponse | undefined>;
  parseAndValidateEvent(rawBody: string): {
    event: FlutterwaveEvent;
    parsedTransaction: number;
    amount: number;
    flwId: number;
  };
  commitApprovedDeposit(transaction: TransactionDB): Promise<void>;
}

export class FlutterwavePaymentService implements PaymentServiceBase {
  private flutterwaveBase =
    process.env.FLW_BASE_URL || "https://api.flutterwave.com/v3";

  private getSecretKey(): string {
    const key = process.env.FLW_SECRET_KEY;
    if (!key) throw new Error("FLW_SECRET_KEY is not set");
    return key;
  }

  private getWebhookSecret(): string {
    const secret = process.env.FLW_WEBHOOK_SECRET;
    if (!secret) throw new Error("FLW_WEBHOOK_SECRET is not set");
    return secret;
  }

  private getRedirectUrl(): string | undefined {
    return `${process.env.BETTER_AUTH_URL}/wallet?success=true`;
  }

  async initiatePayment(params: InitiatePaymentParams) {
    const { amount, name, email, txRef, currency = "NGN" } = params;
    const redirectUrl = this.getRedirectUrl();
    try {
      const response = await axios.post<FlutterWaveInitResponse>(
        `${this.flutterwaveBase}/payments`,
        {
          tx_ref: txRef,
          amount,
          currency,
          redirect_url: redirectUrl,
          customer: { email, name },
        },
        {
          headers: {
            Authorization: `Bearer ${this.getSecretKey()}`,
            "Content-Type": "application/json",
          },
        },
      );
      if (response.data.status !== "success") {
        throw new Error("Flutter Wave Error", {
          cause: response,
        });
      }
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  verifySignature(request: Request) {
    const signature = request.headers.get("verif-hash");
    const secret = this.getWebhookSecret();
    if (signature !== secret) {
      throw new NotAuthorizedError("Invalid Signature");
    }
  }

  async verifyTransaction(transactionId: number) {
    const response = await axios.get<FlutterwaveVerifyResponse>(
      `${this.flutterwaveBase}/transactions/${transactionId}/verify`,
      {
        headers: {
          Authorization: `Bearer ${this.getSecretKey()}`,
          "Content-Type": "application/json",
        },
      },
    );
    return response.data;
  }

  parseAndValidateEvent(rawBody: string) {
    const event: FlutterwaveEvent = JSON.parse(rawBody);
    const parsedTransaction = Number(event?.data?.tx_ref);
    const amount = Number(event?.data?.amount);
    const flwId = Number(event?.data?.id);
    if (!parsedTransaction || Number.isNaN(parsedTransaction) || !flwId) {
      throw new BadRequestError(
        "Invalid webhook payload: missing tx_ref or id",
      );
    }
    return { event, parsedTransaction, amount, flwId };
  }

  async commitApprovedDeposit(initialTransaction: TransactionDB) {
    await db.transaction(async (trx) => {
      await userService.incrementUserBalance(
        trx,
        initialTransaction.userId,
        initialTransaction.amount,
      );
      await transactionService.updateTransaction(
        initialTransaction.id,
        "approved",
        trx,
      );
    });
  }
}

export const paymentService: PaymentServiceBase =
  new FlutterwavePaymentService();
