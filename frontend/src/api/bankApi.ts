import type { Bank } from "../types/bank";

export async function getBanks(): Promise<Bank[]> {

  const response = await fetch("/api/banks");

  if (!response.ok) {
    throw new Error(
      `Không tải được danh sách ngân hàng. HTTP ${response.status}`
    );
  }

  return response.json();
}