import { HttpResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { DataUtils, FileLoadError } from 'app/core/util/data-util.service';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { ICustomer } from 'app/entities/customer/customer.model';
import { CustomerService } from 'app/entities/customer/service/customer.service';
import { IDelivery } from 'app/entities/delivery/delivery.model';
import { DeliveryService } from 'app/entities/delivery/service/delivery.service';
import { ReturnReason } from 'app/entities/enumerations/return-reason.model';
import { AlertError } from 'app/shared/alert/alert-error';
import { AlertErrorModel } from 'app/shared/alert/alert-error.model';
import { TranslateDirective } from 'app/shared/language';
import { IProductReturn } from '../product-return.model';
import { ProductReturnService } from '../service/product-return.service';

import { ProductReturnFormGroup, ProductReturnFormService } from './product-return-form.service';

@Component({
  selector: 'jhi-product-return-update',
  templateUrl: './product-return-update.html',
  imports: [TranslateDirective, TranslateModule, FontAwesomeModule, AlertError, ReactiveFormsModule],
})
export class ProductReturnUpdate implements OnInit {
  isSaving = signal(false);
  productReturn: IProductReturn | null = null;
  returnReasonValues = Object.keys(ReturnReason);

  customersSharedCollection = signal<ICustomer[]>([]);
  deliveriesSharedCollection = signal<IDelivery[]>([]);

  protected dataUtils = inject(DataUtils);
  protected eventManager = inject(EventManager);
  protected productReturnService = inject(ProductReturnService);
  protected productReturnFormService = inject(ProductReturnFormService);
  protected customerService = inject(CustomerService);
  protected deliveryService = inject(DeliveryService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: ProductReturnFormGroup = this.productReturnFormService.createProductReturnFormGroup();

  compareCustomer = (o1: ICustomer | null, o2: ICustomer | null): boolean => this.customerService.compareCustomer(o1, o2);

  compareDelivery = (o1: IDelivery | null, o2: IDelivery | null): boolean => this.deliveryService.compareDelivery(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ productReturn }) => {
      this.productReturn = productReturn;
      if (productReturn) {
        this.updateForm(productReturn);
      }

      this.loadRelationshipsOptions();
    });
  }

  byteSize(base64String: string): string {
    return this.dataUtils.byteSize(base64String);
  }

  openFile(base64String: string, contentType: string | null | undefined): void {
    this.dataUtils.openFile(base64String, contentType);
  }

  setFileData(event: Event, field: string, isImage: boolean): void {
    this.dataUtils.loadFileToForm(event, this.editForm, field, isImage).subscribe({
      error: (err: FileLoadError) =>
        this.eventManager.broadcast(new EventWithContent<AlertErrorModel>('deliveryApp.error', { ...err, key: `error.file.${err.key}` })),
    });
  }

  previousState(): void {
    globalThis.history.back();
  }

  save(): void {
    this.isSaving.set(true);
    const productReturn = this.productReturnFormService.getProductReturn(this.editForm);
    if (productReturn.id === null) {
      this.subscribeToSaveResponse(this.productReturnService.create(productReturn));
    } else {
      this.subscribeToSaveResponse(this.productReturnService.update(productReturn));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IProductReturn>>): void {
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

  protected updateForm(productReturn: IProductReturn): void {
    this.productReturn = productReturn;
    this.productReturnFormService.resetForm(this.editForm, productReturn);

    this.customersSharedCollection.set(
      this.customerService.addCustomerToCollectionIfMissing<ICustomer>(this.customersSharedCollection(), productReturn.customer),
    );
    this.deliveriesSharedCollection.set(
      this.deliveryService.addDeliveryToCollectionIfMissing<IDelivery>(this.deliveriesSharedCollection(), productReturn.delivery),
    );
  }

  protected loadRelationshipsOptions(): void {
    this.customerService
      .query()
      .pipe(map((res: HttpResponse<ICustomer[]>) => res.body ?? []))
      .pipe(
        map((customers: ICustomer[]) =>
          this.customerService.addCustomerToCollectionIfMissing<ICustomer>(customers, this.productReturn?.customer),
        ),
      )
      .subscribe((customers: ICustomer[]) => this.customersSharedCollection.set(customers));

    this.deliveryService
      .query()
      .pipe(map((res: HttpResponse<IDelivery[]>) => res.body ?? []))
      .pipe(
        map((deliveries: IDelivery[]) =>
          this.deliveryService.addDeliveryToCollectionIfMissing<IDelivery>(deliveries, this.productReturn?.delivery),
        ),
      )
      .subscribe((deliveries: IDelivery[]) => this.deliveriesSharedCollection.set(deliveries));
  }
}
