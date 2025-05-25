import type {
  ApiResponse,
  AddFundsRequest,
  WithdrawFundsRequest,
  BalanceResponse,
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
