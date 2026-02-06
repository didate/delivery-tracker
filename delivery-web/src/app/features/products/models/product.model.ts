export interface Product {
  id: string;
  code: string;
  name: string;
  description: string;
  price: number;
  active: boolean;
  createdDate: string;
  lastModifiedDate: string;
}

export interface CreateProductDto {
  code: string;
  name: string;
  description: string;
  price: number;
  active: boolean;
}

export interface UpdateProductDto {
  code?: string;
  name?: string;
  description?: string;
  active?: boolean;
}

export interface UpdatePriceDto {
  price: number;
}

export interface PriceHistory {
  id: string;
  productId: string;
  price: number;
  changedDate: string;
}

export interface ProductsQueryParams {
  page?: number;
  size?: number;
  active?: boolean;
}
