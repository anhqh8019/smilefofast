import type { InvoiceRow } from "../types/invoice";

export async function getInvoices(
  fromDate: string,
  toDate: string
): Promise<InvoiceRow[]> {

  const params = new URLSearchParams({
    fromDate,
    toDate,
  });

  const response = await fetch(
    `/api/invoices?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error(
      `Không tải được hóa đơn. HTTP ${response.status}`
    );
  }

  const data = await response.json();

  return data.map((row: InvoiceRow) => ({
    ...row,
  selectedBankCode: null,
  selectedAccountNumber: null,
  }));
}