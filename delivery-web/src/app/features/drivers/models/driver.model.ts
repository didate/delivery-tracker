export interface Driver {
  id: number;
  code: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  licenseNumber: string;
  vehicleType: string;
  vehiclePlate: string;
  productionSiteId: number;
  productionSiteName: string;
  active: boolean;
  createdDate: string;
  lastModifiedDate: string;
}

export interface CreateDriverDto {
  code: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  licenseNumber: string;
  vehicleType: string;
  vehiclePlate: string;
  productionSiteId: number;
}

export interface UpdateDriverDto {
  code?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  licenseNumber?: string;
  vehicleType?: string;
  vehiclePlate?: string;
  productionSiteId?: number;
}

export interface DriverListParams {
  page?: number;
  size?: number;
  active?: boolean;
}
