export type DeliveryStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface DeliveryItem {
  id: number;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Delivery {
  id: number;
  code: string;
  customerId: number;
  customerName: string;
  driverId: number | null;
  driverName: string | null;
  deliveryDate: string;
  status: DeliveryStatus;
  notes: string | null;
  totalAmount: number;
  items: DeliveryItem[];
  createdDate: string;
}

export interface CreateDeliveryDto {
  customerId: number;
  driverId?: number | null;
  deliveryDate: string;
  notes?: string | null;
  items: CreateDeliveryItemDto[];
}

export interface UpdateDeliveryDto {
  customerId?: number;
  driverId?: number | null;
  deliveryDate?: string;
  notes?: string | null;
}

export interface CreateDeliveryItemDto {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface UpdateStatusDto {
  status: DeliveryStatus;
}

export interface DeliveryListParams {
  page?: number;
  size?: number;
  status?: DeliveryStatus;
  customerId?: number;
  driverId?: number;
  startDate?: string;
  endDate?: string;
}

export const DELIVERY_STATUS_OPTIONS: { value: DeliveryStatus; label: string }[] = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export const DELIVERY_STATUS_COLORS: Record<DeliveryStatus, string> = {
  PENDING: '#ffc107',
  IN_PROGRESS: '#2196f3',
  COMPLETED: '#4caf50',
  CANCELLED: '#f44336',
};
