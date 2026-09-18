export interface InvoiceRow {
  folioNum: string | null;
  folioSubNum: string | null;
  balanceCode: string | null;
  taxCode: string | null;

  billSeri1: string | null;
  billSeri2: string | null;

  billNumber1From: string | null;
  billNumber1To: string | null;
  billNumber2From: string | null;
  billNumber2To: string | null;

  billId: string | null;
  billInfor: string | null;

  companyName: string | null;
  address1: string | null;
  vatCode: string | null;
  guestName: string | null;

  totalAmount: number | null;
  subAmount: number | null;
  serviceCharge: number | null;
  taxAmount: number | null;

  printDate: string | null;
  printCashier: string | null;

  exRate: number | null;

  printSumaryFlag: number | null;
  postToGL: number | null;
  printStyle: number | null;

  billNote: string | null;

  invDate: string | null;
  arrivalDate: string | null;
  departureDate: string | null;

  roomCode: string | null;
  clientMail: string | null;
  taAddress3: string | null;

  modeOfPayment: string | null;

  // Không phải dữ liệu Smile.
  // User chọn riêng cho từng hóa đơn BANK TRANSFER.
  selectedBankCode: string | null;
  selectedAccountNumber: string | null;
}