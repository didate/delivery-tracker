import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { PaginatedResponse } from '../../../core/models/api-response.model';
import {
  Payment,
  CreatePaymentDto,
  UpdatePaymentDto,
  PaymentListParams,
  CustomerBalance
} from '../models/payment.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private readonly api = inject(ApiService);
  private readonly basePath = '/api/payments';

  getPayments(params?: PaymentListParams): Observable<PaginatedResponse<Payment>> {
    const queryParams: Record<string, string | number | boolean> = {};

    if (params?.page !== undefined) {
      queryParams['page'] = params.page;
    }
    if (params?.size !== undefined) {
      queryParams['size'] = params.size;
    }
    if (params?.customerId !== undefined) {
      queryParams['customerId'] = params.customerId;
    }
    if (params?.method) {
      queryParams['method'] = params.method;
    }
    if (params?.startDate) {
      queryParams['startDate'] = params.startDate;
    }
    if (params?.endDate) {
      queryParams['endDate'] = params.endDate;
    }

    return this.api.get<PaginatedResponse<Payment>>(this.basePath, queryParams);
  }

  getPayment(id: number): Observable<Payment> {
    return this.api.get<Payment>(`${this.basePath}/${id}`);
  }

  createPayment(payment: CreatePaymentDto): Observable<Payment> {
    return this.api.post<Payment>(this.basePath, payment);
  }

  updatePayment(id: number, payment: UpdatePaymentDto): Observable<Payment> {
    return this.api.put<Payment>(`${this.basePath}/${id}`, payment);
  }

  deletePayment(id: number): Observable<void> {
    return this.api.delete<void>(`${this.basePath}/${id}`);
  }

  getCustomerBalance(customerId: number): Observable<CustomerBalance> {
    return this.api.get<CustomerBalance>(`${this.basePath}/customer/${customerId}/balance`);
  }
}
