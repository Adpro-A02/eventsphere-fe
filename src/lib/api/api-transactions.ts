import type {
  ApiResponse,
  AddFundsRequest,
  WithdrawFundsRequest,
  BalanceResponse,
  Transaction,
  CreateTransactionRequest,
  ProcessPaymentRequest,
} from "@/lib/types";
import apiTransactions from "@/libs/axios/apiTransactions";
import { AxiosResponse } from "axios";

function handleTransactionResponse<T>(
  response: AxiosResponse<ApiResponse<T>>,
): T {
  const { data } = response;

  if (!data.success) {
    throw new Error(data.message || "Transaction failed");
  }

  if (!data.data) {
    throw new Error("No transaction data received");
  }

  return data.data;
}

export async function addFunds(
  data: AddFundsRequest,
): Promise<BalanceResponse> {
  const response = await apiTransactions.post<ApiResponse<BalanceResponse>>(
    "/api/balance/add",
    data,
  );
  return handleTransactionResponse(response);
}

export async function withdrawFunds(
  data: WithdrawFundsRequest,
): Promise<BalanceResponse> {
  const response = await apiTransactions.post<ApiResponse<BalanceResponse>>(
    "/api/balance/withdraw",
    data,
  );
  return handleTransactionResponse(response);
}

export async function getUserBalance(userId: string): Promise<BalanceResponse> {
  const response = await apiTransactions.get<ApiResponse<BalanceResponse>>(
    `/api/users/${userId}/balance`,
  );
  return handleTransactionResponse(response);
}

export async function createTransaction(
  data: CreateTransactionRequest,
): Promise<Transaction> {
  const response = await apiTransactions.post<ApiResponse<Transaction>>(
    "/api/transactions",
    data,
  );
  return handleTransactionResponse(response);
}

export async function processPayment(
  transactionId: string,
  data?: ProcessPaymentRequest,
): Promise<Transaction> {
  const response = await apiTransactions.put<ApiResponse<Transaction>>(
    `/api/transactions/${transactionId}/process`,
    data || {},
  );
  return handleTransactionResponse(response);
}

export async function getTransaction(
  transactionId: string,
): Promise<Transaction> {
  const response = await apiTransactions.get<ApiResponse<Transaction>>(
    `/api/transactions/${transactionId}`,
  );
  return handleTransactionResponse(response);
}

export async function getUserTransactions(
  userId: string,
): Promise<Transaction[]> {
  const response = await apiTransactions.get<ApiResponse<Transaction[]>>(
    `/api/users/${userId}/transactions`,
  );
  return handleTransactionResponse(response);
}

export async function validatePayment(transactionId: string): Promise<boolean> {
  const response = await apiTransactions.get<ApiResponse<boolean>>(
    `/api/transactions/${transactionId}/validate`,
  );
  return handleTransactionResponse(response);
}

export async function refundTransaction(
  transactionId: string,
): Promise<Transaction> {
  const response = await apiTransactions.put<ApiResponse<Transaction>>(
    `/api/transactions/${transactionId}/refund`,
  );
  return handleTransactionResponse(response);
}

export async function getAllTransactions(): Promise<Transaction[]> {
  const response =
    await apiTransactions.get<ApiResponse<Transaction[]>>("/api/transactions");
  return handleTransactionResponse(response);
}

export async function deleteTransaction(transactionId: string): Promise<void> {
  const response = await apiTransactions.delete<ApiResponse<null>>(
    `/api/transactions/${transactionId}`,
  );

  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to delete transaction");
  }
}
