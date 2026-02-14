import { HttpResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { DataUtils, FileLoadError } from 'app/core/util/data-util.service';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { ICustomer } from 'app/entities/customer/customer.model';
import { CustomerService } from 'app/entities/customer/service/customer.service';
import { IDelivery } from 'app/entities/delivery/delivery.model';
import { DeliveryService } from 'app/entities/delivery/service/delivery.service';
import { PaymentMethod } from 'app/entities/enumerations/payment-method.model';
import { TenantService } from 'app/entities/tenant/service/tenant.service';
import { ITenant } from 'app/entities/tenant/tenant.model';
import { AlertError } from 'app/shared/alert/alert-error';
import { AlertErrorModel } from 'app/shared/alert/alert-error.model';
import { TranslateDirective } from 'app/shared/language';
import { IPayment } from '../payment.model';
import { PaymentService } from '../service/payment.service';

import { PaymentFormGroup, PaymentFormService } from './payment-form.service';

@Component({
  selector: 'jhi-payment-update',
  templateUrl: './payment-update.html',
  imports: [TranslateDirective, TranslateModule, NgbModule, FontAwesomeModule, AlertError, ReactiveFormsModule],
})
export class PaymentUpdate implements OnInit {
  isSaving = signal(false);
  payment: IPayment | null = null;
  paymentMethodValues = Object.keys(PaymentMethod);

  tenantsSharedCollection = signal<ITenant[]>([]);
  customersSharedCollection = signal<ICustomer[]>([]);
  deliveriesSharedCollection = signal<IDelivery[]>([]);

  protected dataUtils = inject(DataUtils);
  protected eventManager = inject(EventManager);
  protected paymentService = inject(PaymentService);
  protected paymentFormService = inject(PaymentFormService);
  protected tenantService = inject(TenantService);
  protected customerService = inject(CustomerService);
  protected deliveryService = inject(DeliveryService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: PaymentFormGroup = this.paymentFormService.createPaymentFormGroup();

  compareTenant = (o1: ITenant | null, o2: ITenant | null): boolean => this.tenantService.compareTenant(o1, o2);

  compareCustomer = (o1: ICustomer | null, o2: ICustomer | null): boolean => this.customerService.compareCustomer(o1, o2);

  compareDelivery = (o1: IDelivery | null, o2: IDelivery | null): boolean => this.deliveryService.compareDelivery(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ payment }) => {
      this.payment = payment;
      if (payment) {
        this.updateForm(payment);
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
    const payment = this.paymentFormService.getPayment(this.editForm);
    if (payment.id === null) {
      this.subscribeToSaveResponse(this.paymentService.create(payment));
    } else {
      this.subscribeToSaveResponse(this.paymentService.update(payment));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IPayment>>): void {
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

  protected updateForm(payment: IPayment): void {
    this.payment = payment;
    this.paymentFormService.resetForm(this.editForm, payment);

    this.tenantsSharedCollection.set(
      this.tenantService.addTenantToCollectionIfMissing<ITenant>(this.tenantsSharedCollection(), payment.tenant),
    );
    this.customersSharedCollection.set(
      this.customerService.addCustomerToCollectionIfMissing<ICustomer>(this.customersSharedCollection(), payment.customer),
    );
    this.deliveriesSharedCollection.set(
      this.deliveryService.addDeliveryToCollectionIfMissing<IDelivery>(this.deliveriesSharedCollection(), payment.delivery),
    );
  }

  protected loadRelationshipsOptions(): void {
    this.tenantService
      .query()
      .pipe(map((res: HttpResponse<ITenant[]>) => res.body ?? []))
      .pipe(map((tenants: ITenant[]) => this.tenantService.addTenantToCollectionIfMissing<ITenant>(tenants, this.payment?.tenant)))
      .subscribe((tenants: ITenant[]) => this.tenantsSharedCollection.set(tenants));

    this.customerService
      .query()
      .pipe(map((res: HttpResponse<ICustomer[]>) => res.body ?? []))
      .pipe(
        map((customers: ICustomer[]) =>
          this.customerService.addCustomerToCollectionIfMissing<ICustomer>(customers, this.payment?.customer),
        ),
      )
      .subscribe((customers: ICustomer[]) => this.customersSharedCollection.set(customers));

    this.deliveryService
      .query()
      .pipe(map((res: HttpResponse<IDelivery[]>) => res.body ?? []))
      .pipe(
        map((deliveries: IDelivery[]) =>
          this.deliveryService.addDeliveryToCollectionIfMissing<IDelivery>(deliveries, this.payment?.delivery),
        ),
      )
      .subscribe((deliveries: IDelivery[]) => this.deliveriesSharedCollection.set(deliveries));
  }
}
