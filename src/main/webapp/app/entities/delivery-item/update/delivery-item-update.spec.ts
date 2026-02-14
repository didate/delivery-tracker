import { beforeEach, describe, expect, it, vitest } from 'vitest';
import { HttpResponse } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Subject, from, of } from 'rxjs';

import { IDelivery } from 'app/entities/delivery/delivery.model';
import { DeliveryService } from 'app/entities/delivery/service/delivery.service';
import { IProduct } from 'app/entities/product/product.model';
import { ProductService } from 'app/entities/product/service/product.service';
import { IDeliveryItem } from '../delivery-item.model';
import { DeliveryItemService } from '../service/delivery-item.service';

import { DeliveryItemFormService } from './delivery-item-form.service';
import { DeliveryItemUpdate } from './delivery-item-update';

describe('DeliveryItem Management Update Component', () => {
  let comp: DeliveryItemUpdate;
  let fixture: ComponentFixture<DeliveryItemUpdate>;
  let activatedRoute: ActivatedRoute;
  let deliveryItemFormService: DeliveryItemFormService;
  let deliveryItemService: DeliveryItemService;
  let deliveryService: DeliveryService;
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

    fixture = TestBed.createComponent(DeliveryItemUpdate);
    activatedRoute = TestBed.inject(ActivatedRoute);
    deliveryItemFormService = TestBed.inject(DeliveryItemFormService);
    deliveryItemService = TestBed.inject(DeliveryItemService);
    deliveryService = TestBed.inject(DeliveryService);
    productService = TestBed.inject(ProductService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call Delivery query and add missing value', () => {
      const deliveryItem: IDeliveryItem = { id: 12510 };
      const delivery: IDelivery = { id: 16325 };
      deliveryItem.delivery = delivery;

      const deliveryCollection: IDelivery[] = [{ id: 16325 }];
      vitest.spyOn(deliveryService, 'query').mockReturnValue(of(new HttpResponse({ body: deliveryCollection })));
      const additionalDeliveries = [delivery];
      const expectedCollection: IDelivery[] = [...additionalDeliveries, ...deliveryCollection];
      vitest.spyOn(deliveryService, 'addDeliveryToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ deliveryItem });
      comp.ngOnInit();

      expect(deliveryService.query).toHaveBeenCalled();
      expect(deliveryService.addDeliveryToCollectionIfMissing).toHaveBeenCalledWith(
        deliveryCollection,
        ...additionalDeliveries.map(i => expect.objectContaining(i) as typeof i),
      );
      expect(comp.deliveriesSharedCollection()).toEqual(expectedCollection);
    });

    it('should call Product query and add missing value', () => {
      const deliveryItem: IDeliveryItem = { id: 12510 };
      const product: IProduct = { id: 21536 };
      deliveryItem.product = product;

      const productCollection: IProduct[] = [{ id: 21536 }];
      vitest.spyOn(productService, 'query').mockReturnValue(of(new HttpResponse({ body: productCollection })));
      const additionalProducts = [product];
      const expectedCollection: IProduct[] = [...additionalProducts, ...productCollection];
      vitest.spyOn(productService, 'addProductToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ deliveryItem });
      comp.ngOnInit();

      expect(productService.query).toHaveBeenCalled();
      expect(productService.addProductToCollectionIfMissing).toHaveBeenCalledWith(
        productCollection,
        ...additionalProducts.map(i => expect.objectContaining(i) as typeof i),
      );
      expect(comp.productsSharedCollection()).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const deliveryItem: IDeliveryItem = { id: 12510 };
      const delivery: IDelivery = { id: 16325 };
      deliveryItem.delivery = delivery;
      const product: IProduct = { id: 21536 };
      deliveryItem.product = product;

      activatedRoute.data = of({ deliveryItem });
      comp.ngOnInit();

      expect(comp.deliveriesSharedCollection()).toContainEqual(delivery);
      expect(comp.productsSharedCollection()).toContainEqual(product);
      expect(comp.deliveryItem).toEqual(deliveryItem);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IDeliveryItem>>();
      const deliveryItem = { id: 16562 };
      vitest.spyOn(deliveryItemFormService, 'getDeliveryItem').mockReturnValue(deliveryItem);
      vitest.spyOn(deliveryItemService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ deliveryItem });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(new HttpResponse({ body: deliveryItem }));
      saveSubject.complete();

      // THEN
      expect(deliveryItemFormService.getDeliveryItem).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(deliveryItemService.update).toHaveBeenCalledWith(expect.objectContaining(deliveryItem));
      expect(comp.isSaving()).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IDeliveryItem>>();
      const deliveryItem = { id: 16562 };
      vitest.spyOn(deliveryItemFormService, 'getDeliveryItem').mockReturnValue({ id: null });
      vitest.spyOn(deliveryItemService, 'create').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ deliveryItem: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(new HttpResponse({ body: deliveryItem }));
      saveSubject.complete();

      // THEN
      expect(deliveryItemFormService.getDeliveryItem).toHaveBeenCalled();
      expect(deliveryItemService.create).toHaveBeenCalled();
      expect(comp.isSaving()).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IDeliveryItem>>();
      const deliveryItem = { id: 16562 };
      vitest.spyOn(deliveryItemService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ deliveryItem });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(deliveryItemService.update).toHaveBeenCalled();
      expect(comp.isSaving()).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareDelivery', () => {
      it('should forward to deliveryService', () => {
        const entity = { id: 16325 };
        const entity2 = { id: 9797 };
        vitest.spyOn(deliveryService, 'compareDelivery');
        comp.compareDelivery(entity, entity2);
        expect(deliveryService.compareDelivery).toHaveBeenCalledWith(entity, entity2);
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
