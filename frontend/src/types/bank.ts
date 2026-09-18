export interface BankAccount {
  id: number;
  bankId: number;
  accountNumber: string;
  accountName: string | null;
  currency: string;
  active: boolean;
  sortOrder: number;
}

export interface Bank {
  id: number;
  bankCode: string;
  bankName: string;
  active: boolean;
  sortOrder: number;
  accounts: BankAccount[];
}