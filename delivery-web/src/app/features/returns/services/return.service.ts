import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { PaginatedResponse } from '../../../core/models/api-response.model';
import {
  Return,
  ReturnItem,
  CreateReturnDto,
  UpdateReturnDto,
  UpdateReturnStatusDto,
  AddReturnItemDto,
  ReturnListParams
} from '../models/return.model';

@Injectable({
  providedIn: 'root'
})
export class ReturnService {
  private readonly api = inject(ApiService);
  private readonly basePath = '/api/returns';

  getReturns(params?: ReturnListParams): Observable<PaginatedResponse<Return>> {
    const queryParams: Record<string, string | number | boolean> = {};

    if (params?.page !== undefined) {
      queryParams['page'] = params.page;
    }
    if (params?.size !== undefined) {
      queryParams['size'] = params.size;
    }
    if (params?.status) {
      queryParams['status'] = params.status;
    }
    if (params?.customerId !== undefined) {
      queryParams['customerId'] = params.customerId;
    }

    return this.api.get<PaginatedResponse<Return>>(this.basePath, queryParams);
  }

  getReturn(id: number): Observable<Return> {
    return this.api.get<Return>(`${this.basePath}/${id}`);
  }

  createReturn(returnData: CreateReturnDto): Observable<Return> {
    return this.api.post<Return>(this.basePath, returnData);
  }

  updateReturn(id: number, returnData: UpdateReturnDto): Observable<Return> {
    return this.api.put<Return>(`${this.basePath}/${id}`, returnData);
  }

  deleteReturn(id: number): Observable<void> {
    return this.api.delete<void>(`${this.basePath}/${id}`);
  }

  updateStatus(id: number, statusData: UpdateReturnStatusDto): Observable<Return> {
    return this.api.patch<Return>(`${this.basePath}/${id}/status`, statusData);
  }

  addItem(returnId: number, item: AddReturnItemDto): Observable<ReturnItem> {
    return this.api.post<ReturnItem>(`${this.basePath}/${returnId}/items`, item);
  }

  removeItem(returnId: number, itemId: number): Observable<void> {
    return this.api.delete<void>(`${this.basePath}/${returnId}/items/${itemId}`);
  }
}
