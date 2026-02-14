import { beforeEach, describe, expect, it, vitest } from 'vitest';
import { HttpResponse } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Subject, from, of } from 'rxjs';

import { IProduct } from 'app/entities/product/product.model';
import { ProductService } from 'app/entities/product/service/product.service';
import { IPriceHistory } from '../price-history.model';
import { PriceHistoryService } from '../service/price-history.service';

import { PriceHistoryFormService } from './price-history-form.service';
import { PriceHistoryUpdate } from './price-history-update';

describe('PriceHistory Management Update Component', () => {
  let comp: PriceHistoryUpdate;
  let fixture: ComponentFixture<PriceHistoryUpdate>;
  let activatedRoute: ActivatedRoute;
  let priceHistoryFormService: PriceHistoryFormService;
  let priceHistoryService: PriceHistoryService;
  let productService: ProductService;

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

    fixture = TestBed.createComponent(PriceHistoryUpdate);
    activatedRoute = TestBed.inject(ActivatedRoute);
    priceHistoryFormService = TestBed.inject(PriceHistoryFormService);
    priceHistoryService = TestBed.inject(PriceHistoryService);
    productService = TestBed.inject(ProductService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call Product query and add missing value', () => {
      const priceHistory: IPriceHistory = { id: 8369 };
      const product: IProduct = { id: 21536 };
      priceHistory.product = product;

      const productCollection: IProduct[] = [{ id: 21536 }];
      vitest.spyOn(productService, 'query').mockReturnValue(of(new HttpResponse({ body: productCollection })));
      const additionalProducts = [product];
      const expectedCollection: IProduct[] = [...additionalProducts, ...productCollection];
      vitest.spyOn(productService, 'addProductToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ priceHistory });
      comp.ngOnInit();

      expect(productService.query).toHaveBeenCalled();
      expect(productService.addProductToCollectionIfMissing).toHaveBeenCalledWith(
        productCollection,
        ...additionalProducts.map(i => expect.objectContaining(i) as typeof i),
      );
      expect(comp.productsSharedCollection()).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const priceHistory: IPriceHistory = { id: 8369 };
      const product: IProduct = { id: 21536 };
      priceHistory.product = product;

      activatedRoute.data = of({ priceHistory });
      comp.ngOnInit();

      expect(comp.productsSharedCollection()).toContainEqual(product);
      expect(comp.priceHistory).toEqual(priceHistory);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IPriceHistory>>();
      const priceHistory = { id: 5381 };
      vitest.spyOn(priceHistoryFormService, 'getPriceHistory').mockReturnValue(priceHistory);
      vitest.spyOn(priceHistoryService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ priceHistory });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(new HttpResponse({ body: priceHistory }));
      saveSubject.complete();

      // THEN
      expect(priceHistoryFormService.getPriceHistory).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(priceHistoryService.update).toHaveBeenCalledWith(expect.objectContaining(priceHistory));
      expect(comp.isSaving()).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IPriceHistory>>();
      const priceHistory = { id: 5381 };
      vitest.spyOn(priceHistoryFormService, 'getPriceHistory').mockReturnValue({ id: null });
      vitest.spyOn(priceHistoryService, 'create').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ priceHistory: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(new HttpResponse({ body: priceHistory }));
      saveSubject.complete();

      // THEN
      expect(priceHistoryFormService.getPriceHistory).toHaveBeenCalled();
      expect(priceHistoryService.create).toHaveBeenCalled();
      expect(comp.isSaving()).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IPriceHistory>>();
      const priceHistory = { id: 5381 };
      vitest.spyOn(priceHistoryService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ priceHistory });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(priceHistoryService.update).toHaveBeenCalled();
      expect(comp.isSaving()).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareProduct', () => {
      it('should forward to productService', () => {
        const entity = { id: 21536 };
        const entity2 = { id: 11926 };
        vitest.spyOn(productService, 'compareProduct');
        comp.compareProduct(entity, entity2);
        expect(productService.compareProduct).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
