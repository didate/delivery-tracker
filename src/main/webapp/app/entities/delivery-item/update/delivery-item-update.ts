import { HttpResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { IDelivery } from 'app/entities/delivery/delivery.model';
import { DeliveryService } from 'app/entities/delivery/service/delivery.service';
import { IProduct } from 'app/entities/product/product.model';
import { ProductService } from 'app/entities/product/service/product.service';
import { AlertError } from 'app/shared/alert/alert-error';
import { TranslateDirective } from 'app/shared/language';
import { IDeliveryItem } from '../delivery-item.model';
import { DeliveryItemService } from '../service/delivery-item.service';

import { DeliveryItemFormGroup, DeliveryItemFormService } from './delivery-item-form.service';

@Component({
  selector: 'jhi-delivery-item-update',
  templateUrl: './delivery-item-update.html',
  imports: [TranslateDirective, TranslateModule, NgbModule, FontAwesomeModule, AlertError, ReactiveFormsModule],
})
export class DeliveryItemUpdate implements OnInit {
  isSaving = signal(false);
  deliveryItem: IDeliveryItem | null = null;

  deliveriesSharedCollection = signal<IDelivery[]>([]);
  productsSharedCollection = signal<IProduct[]>([]);

  protected deliveryItemService = inject(DeliveryItemService);
  protected deliveryItemFormService = inject(DeliveryItemFormService);
  protected deliveryService = inject(DeliveryService);
  protected productService = inject(ProductService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: DeliveryItemFormGroup = this.deliveryItemFormService.createDeliveryItemFormGroup();

  compareDelivery = (o1: IDelivery | null, o2: IDelivery | null): boolean => this.deliveryService.compareDelivery(o1, o2);

  compareProduct = (o1: IProduct | null, o2: IProduct | null): boolean => this.productService.compareProduct(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ deliveryItem }) => {
      this.deliveryItem = deliveryItem;
      if (deliveryItem) {
        this.updateForm(deliveryItem);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    globalThis.history.back();
  }

  save(): void {
    this.isSaving.set(true);
    const deliveryItem = this.deliveryItemFormService.getDeliveryItem(this.editForm);
    if (deliveryItem.id === null) {
      this.subscribeToSaveResponse(this.deliveryItemService.create(deliveryItem));
    } else {
      this.subscribeToSaveResponse(this.deliveryItemService.update(deliveryItem));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IDeliveryItem>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: () => this.onSaveSuccess(),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveSuccess(): void {
    this.previousState();
  }

  protected onSaveError(): void {
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSaving.set(false);
  }

  protected updateForm(deliveryItem: IDeliveryItem): void {
    this.deliveryItem = deliveryItem;
    this.deliveryItemFormService.resetForm(this.editForm, deliveryItem);

    this.deliveriesSharedCollection.set(
      this.deliveryService.addDeliveryToCollectionIfMissing<IDelivery>(this.deliveriesSharedCollection(), deliveryItem.delivery),
    );
    this.productsSharedCollection.set(
      this.productService.addProductToCollectionIfMissing<IProduct>(this.productsSharedCollection(), deliveryItem.product),
    );
  }

  protected loadRelationshipsOptions(): void {
    this.deliveryService
      .query()
      .pipe(map((res: HttpResponse<IDelivery[]>) => res.body ?? []))
      .pipe(
        map((deliveries: IDelivery[]) =>
          this.deliveryService.addDeliveryToCollectionIfMissing<IDelivery>(deliveries, this.deliveryItem?.delivery),
        ),
      )
      .subscribe((deliveries: IDelivery[]) => this.deliveriesSharedCollection.set(deliveries));

    this.productService
      .query()
      .pipe(map((res: HttpResponse<IProduct[]>) => res.body ?? []))
      .pipe(
        map((products: IProduct[]) => this.productService.addProductToCollectionIfMissing<IProduct>(products, this.deliveryItem?.product)),
      )
      .subscribe((products: IProduct[]) => this.productsSharedCollection.set(products));
  }
}
