// Common TypeScript types for MoneyFlow

// Transaction Types
export type TransactionType = "INCOME" | "EXPENSE";
export type PaymentMethod = "CASH" | "CARD";

// Expense Categories
export const EXPENSE_CATEGORIES = [
  "생활비",
  "가족비",
  "휴가비",
  "유흥비",
  "정기결제비",
  "교통비",
  "기타",
] as const;

// Income Categories
export const INCOME_CATEGORIES = ["월급", "용돈", "기타"] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
export type IncomeCategory = (typeof INCOME_CATEGORIES)[number];
export type Category = ExpenseCategory | IncomeCategory;

// Installment Months
export const INSTALLMENT_MONTHS = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
] as const;
export type InstallmentMonth = (typeof INSTALLMENT_MONTHS)[number];

// Transaction Interface
export interface Transaction {
  id: number;
  userId: string;
  date: Date;
  type: TransactionType;
  category: Category;
  amount: number;
  method?: PaymentMethod | null;
  desc?: string | null;
  note?: string | null;
  isInstallment: boolean;
  installmentMonths: number;
  installmentFee: number;
  createdAt: Date;
  updatedAt: Date;
}

// Form Input Types
export interface TransactionFormInput {
  type: TransactionType;
  date: string;
  amount: number;
  category: string;
  desc?: string;
  method?: PaymentMethod;
  installmentMonths?: number;
  note?: string;
}

// Dashboard Summary Types
export interface MonthlySummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export interface CategorySummary {
  category: string;
  amount: number;
  percentage: number;
}
