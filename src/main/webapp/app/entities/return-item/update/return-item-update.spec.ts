import { beforeEach, describe, expect, it, vitest } from 'vitest';
import { HttpResponse } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Subject, from, of } from 'rxjs';

import { IProduct } from 'app/entities/product/product.model';
import { ProductService } from 'app/entities/product/service/product.service';
import { IProductReturn } from 'app/entities/product-return/product-return.model';
import { ProductReturnService } from 'app/entities/product-return/service/product-return.service';
import { IReturnItem } from '../return-item.model';
import { ReturnItemService } from '../service/return-item.service';

import { ReturnItemFormService } from './return-item-form.service';
import { ReturnItemUpdate } from './return-item-update';

describe('ReturnItem Management Update Component', () => {
  let comp: ReturnItemUpdate;
  let fixture: ComponentFixture<ReturnItemUpdate>;
  let activatedRoute: ActivatedRoute;
  let returnItemFormService: ReturnItemFormService;
  let returnItemService: ReturnItemService;
  let productReturnService: ProductReturnService;
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

    fixture = TestBed.createComponent(ReturnItemUpdate);
    activatedRoute = TestBed.inject(ActivatedRoute);
    returnItemFormService = TestBed.inject(ReturnItemFormService);
    returnItemService = TestBed.inject(ReturnItemService);
    productReturnService = TestBed.inject(ProductReturnService);
    productService = TestBed.inject(ProductService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call ProductReturn query and add missing value', () => {
      const returnItem: IReturnItem = { id: 12707 };
      const productReturn: IProductReturn = { id: 8123 };
      returnItem.productReturn = productReturn;

      const productReturnCollection: IProductReturn[] = [{ id: 8123 }];
      vitest.spyOn(productReturnService, 'query').mockReturnValue(of(new HttpResponse({ body: productReturnCollection })));
      const additionalProductReturns = [productReturn];
      const expectedCollection: IProductReturn[] = [...additionalProductReturns, ...productReturnCollection];
      vitest.spyOn(productReturnService, 'addProductReturnToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ returnItem });
      comp.ngOnInit();

      expect(productReturnService.query).toHaveBeenCalled();
      expect(productReturnService.addProductReturnToCollectionIfMissing).toHaveBeenCalledWith(
        productReturnCollection,
        ...additionalProductReturns.map(i => expect.objectContaining(i) as typeof i),
      );
      expect(comp.productReturnsSharedCollection()).toEqual(expectedCollection);
    });

    it('should call Product query and add missing value', () => {
      const returnItem: IReturnItem = { id: 12707 };
      const product: IProduct = { id: 21536 };
      returnItem.product = product;

      const productCollection: IProduct[] = [{ id: 21536 }];
      vitest.spyOn(productService, 'query').mockReturnValue(of(new HttpResponse({ body: productCollection })));
      const additionalProducts = [product];
      const expectedCollection: IProduct[] = [...additionalProducts, ...productCollection];
      vitest.spyOn(productService, 'addProductToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ returnItem });
      comp.ngOnInit();

      expect(productService.query).toHaveBeenCalled();
      expect(productService.addProductToCollectionIfMissing).toHaveBeenCalledWith(
        productCollection,
        ...additionalProducts.map(i => expect.objectContaining(i) as typeof i),
      );
      expect(comp.productsSharedCollection()).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const returnItem: IReturnItem = { id: 12707 };
      const productReturn: IProductReturn = { id: 8123 };
      returnItem.productReturn = productReturn;
      const product: IProduct = { id: 21536 };
      returnItem.product = product;

      activatedRoute.data = of({ returnItem });
      comp.ngOnInit();

      expect(comp.productReturnsSharedCollection()).toContainEqual(productReturn);
      expect(comp.productsSharedCollection()).toContainEqual(product);
      expect(comp.returnItem).toEqual(returnItem);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IReturnItem>>();
      const returnItem = { id: 28210 };
      vitest.spyOn(returnItemFormService, 'getReturnItem').mockReturnValue(returnItem);
      vitest.spyOn(returnItemService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ returnItem });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(new HttpResponse({ body: returnItem }));
      saveSubject.complete();

      // THEN
      expect(returnItemFormService.getReturnItem).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(returnItemService.update).toHaveBeenCalledWith(expect.objectContaining(returnItem));
      expect(comp.isSaving()).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IReturnItem>>();
      const returnItem = { id: 28210 };
      vitest.spyOn(returnItemFormService, 'getReturnItem').mockReturnValue({ id: null });
      vitest.spyOn(returnItemService, 'create').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ returnItem: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(new HttpResponse({ body: returnItem }));
      saveSubject.complete();

      // THEN
      expect(returnItemFormService.getReturnItem).toHaveBeenCalled();
      expect(returnItemService.create).toHaveBeenCalled();
      expect(comp.isSaving()).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IReturnItem>>();
      const returnItem = { id: 28210 };
      vitest.spyOn(returnItemService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ returnItem });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(returnItemService.update).toHaveBeenCalled();
      expect(comp.isSaving()).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareProductReturn', () => {
      it('should forward to productReturnService', () => {
        const entity = { id: 8123 };
        const entity2 = { id: 20976 };
        vitest.spyOn(productReturnService, 'compareProductReturn');
        comp.compareProductReturn(entity, entity2);
        expect(productReturnService.compareProductReturn).toHaveBeenCalledWith(entity, entity2);
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
  });
});
