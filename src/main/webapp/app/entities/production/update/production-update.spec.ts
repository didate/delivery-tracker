import { beforeEach, describe, expect, it, vitest } from 'vitest';
import { HttpResponse } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Subject, from, of } from 'rxjs';

import { IProduct } from 'app/entities/product/product.model';
import { ProductService } from 'app/entities/product/service/product.service';
import { IProductionSite } from 'app/entities/production-site/production-site.model';
import { ProductionSiteService } from 'app/entities/production-site/service/production-site.service';
import { TenantService } from 'app/entities/tenant/service/tenant.service';
import { ITenant } from 'app/entities/tenant/tenant.model';
import { IProduction } from '../production.model';
import { ProductionService } from '../service/production.service';

import { ProductionFormService } from './production-form.service';
import { ProductionUpdate } from './production-update';

describe('Production Management Update Component', () => {
  let comp: ProductionUpdate;
  let fixture: ComponentFixture<ProductionUpdate>;
  let activatedRoute: ActivatedRoute;
  let productionFormService: ProductionFormService;
  let productionService: ProductionService;
  let tenantService: TenantService;
  let productService: ProductService;
  let productionSiteService: ProductionSiteService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: {
            params: from([{}]),
          },
        },
      ],
    });

    fixture = TestBed.createComponent(ProductionUpdate);
    activatedRoute = TestBed.inject(ActivatedRoute);
    productionFormService = TestBed.inject(ProductionFormService);
    productionService = TestBed.inject(ProductionService);
    tenantService = TestBed.inject(TenantService);
    productService = TestBed.inject(ProductService);
    productionSiteService = TestBed.inject(ProductionSiteService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call Tenant query and add missing value', () => {
      const production: IProduction = { id: 21928 };
      const tenant: ITenant = { id: 2662 };
      production.tenant = tenant;

      const tenantCollection: ITenant[] = [{ id: 2662 }];
      vitest.spyOn(tenantService, 'query').mockReturnValue(of(new HttpResponse({ body: tenantCollection })));
      const additionalTenants = [tenant];
      const expectedCollection: ITenant[] = [...additionalTenants, ...tenantCollection];
      vitest.spyOn(tenantService, 'addTenantToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ production });
      comp.ngOnInit();

      expect(tenantService.query).toHaveBeenCalled();
      expect(tenantService.addTenantToCollectionIfMissing).toHaveBeenCalledWith(
        tenantCollection,
        ...additionalTenants.map(i => expect.objectContaining(i) as typeof i),
      );
      expect(comp.tenantsSharedCollection()).toEqual(expectedCollection);
    });

    it('should call Product query and add missing value', () => {
      const production: IProduction = { id: 21928 };
      const product: IProduct = { id: 21536 };
      production.product = product;

      const productCollection: IProduct[] = [{ id: 21536 }];
      vitest.spyOn(productService, 'query').mockReturnValue(of(new HttpResponse({ body: productCollection })));
      const additionalProducts = [product];
      const expectedCollection: IProduct[] = [...additionalProducts, ...productCollection];
      vitest.spyOn(productService, 'addProductToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ production });
      comp.ngOnInit();

      expect(productService.query).toHaveBeenCalled();
      expect(productService.addProductToCollectionIfMissing).toHaveBeenCalledWith(
        productCollection,
        ...additionalProducts.map(i => expect.objectContaining(i) as typeof i),
      );
      expect(comp.productsSharedCollection()).toEqual(expectedCollection);
    });

    it('should call ProductionSite query and add missing value', () => {
      const production: IProduction = { id: 21928 };
      const productionSite: IProductionSite = { id: 20528 };
      production.productionSite = productionSite;

      const productionSiteCollection: IProductionSite[] = [{ id: 20528 }];
      vitest.spyOn(productionSiteService, 'query').mockReturnValue(of(new HttpResponse({ body: productionSiteCollection })));
      const additionalProductionSites = [productionSite];
      const expectedCollection: IProductionSite[] = [...additionalProductionSites, ...productionSiteCollection];
      vitest.spyOn(productionSiteService, 'addProductionSiteToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ production });
      comp.ngOnInit();

      expect(productionSiteService.query).toHaveBeenCalled();
      expect(productionSiteService.addProductionSiteToCollectionIfMissing).toHaveBeenCalledWith(
        productionSiteCollection,
        ...additionalProductionSites.map(i => expect.objectContaining(i) as typeof i),
      );
      expect(comp.productionSitesSharedCollection()).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const production: IProduction = { id: 21928 };
      const tenant: ITenant = { id: 2662 };
      production.tenant = tenant;
      const product: IProduct = { id: 21536 };
      production.product = product;
      const productionSite: IProductionSite = { id: 20528 };
      production.productionSite = productionSite;

      activatedRoute.data = of({ production });
      comp.ngOnInit();

      expect(comp.tenantsSharedCollection()).toContainEqual(tenant);
      expect(comp.productsSharedCollection()).toContainEqual(product);
      expect(comp.productionSitesSharedCollection()).toContainEqual(productionSite);
      expect(comp.production).toEqual(production);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IProduction>>();
      const production = { id: 25690 };
      vitest.spyOn(productionFormService, 'getProduction').mockReturnValue(production);
      vitest.spyOn(productionService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ production });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(new HttpResponse({ body: production }));
      saveSubject.complete();

      // THEN
      expect(productionFormService.getProduction).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(productionService.update).toHaveBeenCalledWith(expect.objectContaining(production));
      expect(comp.isSaving()).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IProduction>>();
      const production = { id: 25690 };
      vitest.spyOn(productionFormService, 'getProduction').mockReturnValue({ id: null });
      vitest.spyOn(productionService, 'create').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ production: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(new HttpResponse({ body: production }));
      saveSubject.complete();

      // THEN
      expect(productionFormService.getProduction).toHaveBeenCalled();
      expect(productionService.create).toHaveBeenCalled();
      expect(comp.isSaving()).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IProduction>>();
      const production = { id: 25690 };
      vitest.spyOn(productionService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ production });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(productionService.update).toHaveBeenCalled();
      expect(comp.isSaving()).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareTenant', () => {
      it('should forward to tenantService', () => {
        const entity = { id: 2662 };
        const entity2 = { id: 17495 };
        vitest.spyOn(tenantService, 'compareTenant');
        comp.compareTenant(entity, entity2);
        expect(tenantService.compareTenant).toHaveBeenCalledWith(entity, entity2);
      });
    });

    describe('compareProduct', () => {
      it('should forward to productService', () => {
        const entity = { id: 21536 };
        const entity2 = { id: 11926 };
        vitest.spyOn(productService, 'compareProduct');
        comp.compareProduct(entity, entity2);
        expect(productService.compareProduct).toHaveBeenCalledWith(entity, entity2);
      });
    });

    describe('compareProductionSite', () => {
      it('should forward to productionSiteService', () => {
        const entity = { id: 20528 };
        const entity2 = { id: 9041 };
        vitest.spyOn(productionSiteService, 'compareProductionSite');
        comp.compareProductionSite(entity, entity2);
        expect(productionSiteService.compareProductionSite).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
