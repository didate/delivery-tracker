import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { PaginatedResponse } from '../../../core/models/api-response.model';
import {
  Product,
  CreateProductDto,
  UpdateProductDto,
  UpdatePriceDto,
  PriceHistory,
  ProductsQueryParams
} from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly api = inject(ApiService);
  private readonly basePath = '/api/products';

  getProducts(params?: ProductsQueryParams): Observable<PaginatedResponse<Product>> {
    const queryParams: Record<string, string | number | boolean> = {};

    if (params?.page !== undefined) {
      queryParams['page'] = params.page;
    }
    if (params?.size !== undefined) {
      queryParams['size'] = params.size;
    }
    if (params?.active !== undefined) {
      queryParams['active'] = params.active;
    }

    return this.api.get<PaginatedResponse<Product>>(this.basePath, queryParams);
  }

  getProduct(id: string): Observable<Product> {
    return this.api.get<Product>(`${this.basePath}/${id}`);
  }

  createProduct(product: CreateProductDto): Observable<Product> {
    return this.api.post<Product>(this.basePath, product);
  }

  updateProduct(id: string, product: UpdateProductDto): Observable<Product> {
    return this.api.put<Product>(`${this.basePath}/${id}`, product);
  }

  deleteProduct(id: string): Observable<void> {
    return this.api.delete<void>(`${this.basePath}/${id}`);
  }

  updatePrice(id: string, priceDto: UpdatePriceDto): Observable<Product> {
    return this.api.put<Product>(`${this.basePath}/${id}/price`, priceDto);
  }

  getPriceHistory(id: string): Observable<PriceHistory[]> {
    return this.api.get<PriceHistory[]>(`${this.basePath}/${id}/price-history`);
  }
}
