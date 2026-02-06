export type ReturnStatus = 'PENDING' | 'PROCESSED' | 'REJECTED';

export interface ReturnItem {
  id: number;
  productId: string;
  productName: string;
  quantity: number;
  reason: string;
  unitValue: number;
  totalValue: number;
}

export interface Return {
  id: number;
  code: string;
  customerId: number;
  customerName: string;
  returnDate: string;
  status: ReturnStatus;
  notes: string;
  totalValue: number;
  items: ReturnItem[];
  createdDate: string;
}

export interface CreateReturnItemDto {
  productId: string;
  quantity: number;
  reason: string;
  unitValue: number;
}

export interface CreateReturnDto {
  customerId: number;
  returnDate: string;
  notes?: string;
  items: CreateReturnItemDto[];
}

export interface UpdateReturnDto {
  customerId?: number;
  returnDate?: string;
  notes?: string;
}

export interface UpdateReturnStatusDto {
  status: ReturnStatus;
}

export interface AddReturnItemDto {
  productId: string;
  quantity: number;
  reason: string;
  unitValue: number;
}

export interface ReturnListParams {
  page?: number;
  size?: number;
  status?: ReturnStatus;
  customerId?: number;
}
