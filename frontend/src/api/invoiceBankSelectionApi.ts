export interface InvoiceBankSelection {
  billId: string | null;
  folioNum: string | null;
  billNumber: string | null;
  bankCode: string;
  accountNumber: string;
}

export async function getInvoiceBankSelections():
  Promise<InvoiceBankSelection[]> {

  const response = await fetch(
    "/api/invoice-bank-selections"
  );

  if (!response.ok) {
    throw new Error(
      "Không tải được dữ liệu Bank đã lưu"
    );
  }

  return response.json();
}

export async function saveInvoiceBankSelections(
  items: InvoiceBankSelection[]
): Promise<void> {

  const response = await fetch(
    "/api/invoice-bank-selections",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(items),
    }
  );

  if (!response.ok) {
    throw new Error(
      "Không lưu được Bank/Account"
    );
  }
}