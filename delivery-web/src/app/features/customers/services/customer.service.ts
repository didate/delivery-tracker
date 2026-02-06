import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { PaginatedResponse } from '../../../core/models/api-response.model';
import {
  Customer,
  CreateCustomerDto,
  UpdateCustomerDto,
  AssignDriverDto,
  CustomerListParams
} from '../models/customer.model';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private readonly api = inject(ApiService);
  private readonly basePath = '/api/customers';

  getCustomers(params?: CustomerListParams): Observable<PaginatedResponse<Customer>> {
    const queryParams: Record<string, string | number | boolean> = {};

    if (params?.page !== undefined) {
      queryParams['page'] = params.page;
    }
    if (params?.size !== undefined) {
      queryParams['size'] = params.size;
    }
    if (params?.search) {
      queryParams['search'] = params.search;
    }
    if (params?.active !== undefined) {
      queryParams['active'] = params.active;
    }

    return this.api.get<PaginatedResponse<Customer>>(this.basePath, queryParams);
  }

  getCustomer(id: number): Observable<Customer> {
    return this.api.get<Customer>(`${this.basePath}/${id}`);
  }

  createCustomer(customer: CreateCustomerDto): Observable<Customer> {
    return this.api.post<Customer>(this.basePath, customer);
  }

  updateCustomer(id: number, customer: UpdateCustomerDto): Observable<Customer> {
    return this.api.put<Customer>(`${this.basePath}/${id}`, customer);
  }

  deleteCustomer(id: number): Observable<void> {
    return this.api.delete<void>(`${this.basePath}/${id}`);
  }

  assignDriver(customerId: number, driverData: AssignDriverDto): Observable<Customer> {
    return this.api.patch<Customer>(`${this.basePath}/${customerId}/driver`, driverData);
  }

  toggleActive(id: number, active: boolean): Observable<Customer> {
    return this.api.put<Customer>(`${this.basePath}/${id}`, { active });
  }
}
