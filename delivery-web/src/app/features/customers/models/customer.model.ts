export interface Customer {
  id: number;
  code: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  driverId: number | null;
  driverName: string | null;
  active: boolean;
  createdDate: string;
  lastModifiedDate: string;
}

export interface CreateCustomerDto {
  code: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  driverId?: number | null;
  active?: boolean;
}

export interface UpdateCustomerDto {
  code?: string;
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  latitude?: number | null;
  longitude?: number | null;
  driverId?: number | null;
  active?: boolean;
}

export interface AssignDriverDto {
  driverId: number | null;
}

export interface CustomerListParams {
  page?: number;
  size?: number;
  search?: string;
  active?: boolean;
}
