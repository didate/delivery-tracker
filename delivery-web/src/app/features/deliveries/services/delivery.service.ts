import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { PaginatedResponse } from '../../../core/models/api-response.model';
import {
  Delivery,
  DeliveryItem,
  CreateDeliveryDto,
  UpdateDeliveryDto,
  CreateDeliveryItemDto,
  UpdateStatusDto,
  DeliveryListParams
} from '../models/delivery.model';

@Injectable({
  providedIn: 'root'
})
export class DeliveryService {
  private readonly api = inject(ApiService);
  private readonly basePath = '/api/deliveries';

  getDeliveries(params?: DeliveryListParams): Observable<PaginatedResponse<Delivery>> {
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
    if (params?.driverId !== undefined) {
      queryParams['driverId'] = params.driverId;
    }
    if (params?.startDate) {
      queryParams['startDate'] = params.startDate;
    }
    if (params?.endDate) {
      queryParams['endDate'] = params.endDate;
    }

    return this.api.get<PaginatedResponse<Delivery>>(this.basePath, queryParams);
  }

  getDelivery(id: number): Observable<Delivery> {
    return this.api.get<Delivery>(`${this.basePath}/${id}`);
  }

  createDelivery(delivery: CreateDeliveryDto): Observable<Delivery> {
    return this.api.post<Delivery>(this.basePath, delivery);
  }

  updateDelivery(id: number, delivery: UpdateDeliveryDto): Observable<Delivery> {
    return this.api.put<Delivery>(`${this.basePath}/${id}`, delivery);
  }

  deleteDelivery(id: number): Observable<void> {
    return this.api.delete<void>(`${this.basePath}/${id}`);
  }

  updateStatus(id: number, statusDto: UpdateStatusDto): Observable<Delivery> {
    return this.api.patch<Delivery>(`${this.basePath}/${id}/status`, statusDto);
  }

  addItem(deliveryId: number, item: CreateDeliveryItemDto): Observable<DeliveryItem> {
    return this.api.post<DeliveryItem>(`${this.basePath}/${deliveryId}/items`, item);
  }

  removeItem(deliveryId: number, itemId: number): Observable<void> {
    return this.api.delete<void>(`${this.basePath}/${deliveryId}/items/${itemId}`);
  }
}
