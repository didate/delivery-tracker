import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse, ApiErrorResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  get<T>(path: string, params?: Record<string, string | number | boolean>): Observable<T> {
    const httpParams = this.buildParams(params);
    return this.http.get<T>(`${this.baseUrl}${path}`, { params: httpParams })
      .pipe(catchError(this.handleError));
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${path}`, body)
      .pipe(catchError(this.handleError));
  }

  put<T>(path: string, body: unknown): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${path}`, body)
      .pipe(catchError(this.handleError));
  }

  patch<T>(path: string, body: unknown): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}${path}`, body)
      .pipe(catchError(this.handleError));
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${path}`)
      .pipe(catchError(this.handleError));
  }

  private buildParams(params?: Record<string, string | number | boolean>): HttpParams {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }
    return httpParams;
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const apiError: ApiErrorResponse = {
      error: error.error?.error || 'Unknown Error',
      message: error.error?.message || error.message || 'An unexpected error occurred',
      statusCode: error.status,
      timestamp: new Date().toISOString(),
      path: error.url || undefined
    };

    console.error('API Error:', apiError);
    return throwError(() => apiError);
  }
}
