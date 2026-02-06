export enum PaymentMethod {
  CASH = 'CASH',
  CHECK = 'CHECK',
  BANK_TRANSFER = 'BANK_TRANSFER',
  MOBILE_MONEY = 'MOBILE_MONEY'
}

export interface Payment {
  id: number;
  code: string;
  customerId: number;
  customerName: string;
  amount: number;
  method: PaymentMethod;
  paymentDate: string;
  reference: string;
  notes: string;
  createdDate: string;
}

export interface CreatePaymentDto {
  customerId: number;
  amount: number;
  method: PaymentMethod;
  paymentDate: string;
  reference?: string;
  notes?: string;
}

export interface UpdatePaymentDto {
  customerId?: number;
  amount?: number;
  method?: PaymentMethod;
  paymentDate?: string;
  reference?: string;
  notes?: string;
}

export interface PaymentListParams {
  page?: number;
  size?: number;
  customerId?: number;
  method?: PaymentMethod;
  startDate?: string;
  endDate?: string;
}

export interface CustomerBalance {
  customerId: number;
  customerName: string;
  balance: number;
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.CASH]: 'Cash',
  [PaymentMethod.CHECK]: 'Check',
  [PaymentMethod.BANK_TRANSFER]: 'Bank Transfer',
  [PaymentMethod.MOBILE_MONEY]: 'Mobile Money'
};

export const PAYMENT_METHOD_ICONS: Record<PaymentMethod, string> = {
  [PaymentMethod.CASH]: 'payments',
  [PaymentMethod.CHECK]: 'receipt_long',
  [PaymentMethod.BANK_TRANSFER]: 'account_balance',
  [PaymentMethod.MOBILE_MONEY]: 'phone_android'
};
