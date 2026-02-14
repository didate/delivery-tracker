import { beforeEach, describe, expect, it, vitest } from 'vitest';
import { HttpResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, ActivatedRouteSnapshot, Router, convertToParamMap } from '@angular/router';

import { of } from 'rxjs';

import { IProductionSite } from '../production-site.model';
import { ProductionSiteService } from '../service/production-site.service';

import productionSiteResolve from './production-site-routing-resolve.service';

describe('ProductionSite routing resolve service', () => {
  let mockRouter: Router;
  let mockActivatedRouteSnapshot: ActivatedRouteSnapshot;
  let service: ProductionSiteService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({}),
            },
          },
        },
      ],
    });
    mockRouter = TestBed.inject(Router);
    vitest.spyOn(mockRouter, 'navigate');
    mockActivatedRouteSnapshot = TestBed.inject(ActivatedRoute).snapshot;
    service = TestBed.inject(ProductionSiteService);
  });

  describe('resolve', () => {
    it('should return IProductionSite returned by find', async () => {
      // GIVEN
      service.find = vitest.fn(id => of(new HttpResponse({ body: { id } })));
      mockActivatedRouteSnapshot.params = { id: 123 };

      // WHEN
      await new Promise<void>(resolve => {
        TestBed.runInInjectionContext(() => {
          productionSiteResolve(mockActivatedRouteSnapshot).subscribe({
            next(result) {
              // THEN
              expect(service.find).toHaveBeenCalledWith(123);
              expect(result).toEqual({ id: 123 });
              resolve();
            },
          });
        });
      });
    });

    it('should return null if id is not provided', async () => {
      // GIVEN
      service.find = vitest.fn();
      mockActivatedRouteSnapshot.params = {};

      // WHEN
      await new Promise<void>(resolve => {
        TestBed.runInInjectionContext(() => {
          productionSiteResolve(mockActivatedRouteSnapshot).subscribe({
            next(result) {
              // THEN
              expect(service.find).not.toHaveBeenCalled();
              expect(result).toEqual(null);
              resolve();
            },
          });
        });
      });
    });

    it('should route to 404 page if data not found in server', async () => {
      // GIVEN
      vitest.spyOn(service, 'find').mockReturnValue(of(new HttpResponse<IProductionSite>({ body: null })));
      mockActivatedRouteSnapshot.params = { id: 123 };

      // WHEN
      await new Promise<void>(resolve => {
        TestBed.runInInjectionContext(() => {
          productionSiteResolve(mockActivatedRouteSnapshot).subscribe({
            complete() {
              // THEN
              expect(service.find).toHaveBeenCalledWith(123);
              expect(mockRouter.navigate).toHaveBeenCalledWith(['404']);
              resolve();
            },
          });
        });
      });
    });
  });
});
