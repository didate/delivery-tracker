import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ProductionSite } from '../models/production-site.model';

@Injectable({
  providedIn: 'root'
})
export class ProductionSiteService {
  private readonly api = inject(ApiService);
  private readonly basePath = '/api/production-sites';

  getProductionSites(): Observable<ProductionSite[]> {
    return this.api.get<ProductionSite[]>(this.basePath);
  }

  getProductionSite(id: number): Observable<ProductionSite> {
    return this.api.get<ProductionSite>(`${this.basePath}/${id}`);
  }
}
