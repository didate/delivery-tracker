import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { PaginatedResponse } from '../../../core/models/api-response.model';
import { Driver, CreateDriverDto, UpdateDriverDto, DriverListParams } from '../models/driver.model';

@Injectable({
  providedIn: 'root'
})
export class DriverService {
  private readonly api = inject(ApiService);
  private readonly basePath = '/api/drivers';

  getDrivers(params?: DriverListParams): Observable<PaginatedResponse<Driver>> {
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

    return this.api.get<PaginatedResponse<Driver>>(this.basePath, queryParams);
  }

  getDriver(id: number): Observable<Driver> {
    return this.api.get<Driver>(`${this.basePath}/${id}`);
  }

  createDriver(driver: CreateDriverDto): Observable<Driver> {
    return this.api.post<Driver>(this.basePath, driver);
  }

  updateDriver(id: number, driver: UpdateDriverDto): Observable<Driver> {
    return this.api.put<Driver>(`${this.basePath}/${id}`, driver);
  }

  deleteDriver(id: number): Observable<void> {
    return this.api.delete<void>(`${this.basePath}/${id}`);
  }

  activateDriver(id: number): Observable<Driver> {
    return this.api.patch<Driver>(`${this.basePath}/${id}/activate`, {});
  }

  deactivateDriver(id: number): Observable<Driver> {
    return this.api.patch<Driver>(`${this.basePath}/${id}/deactivate`, {});
  }
}
