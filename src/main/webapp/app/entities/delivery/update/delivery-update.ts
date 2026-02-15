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
import { IDriver } from 'app/entities/driver/driver.model';
import { DriverService } from 'app/entities/driver/service/driver.service';
import { DeliveryStatus } from 'app/entities/enumerations/delivery-status.model';
import { AlertError } from 'app/shared/alert/alert-error';
import { AlertErrorModel } from 'app/shared/alert/alert-error.model';
import { TranslateDirective } from 'app/shared/language';
import { IDelivery } from '../delivery.model';
import { DeliveryService } from '../service/delivery.service';

import { DeliveryFormGroup, DeliveryFormService } from './delivery-form.service';

@Component({
  selector: 'jhi-delivery-update',
  templateUrl: './delivery-update.html',
  imports: [TranslateDirective, TranslateModule, FontAwesomeModule, AlertError, ReactiveFormsModule],
})
export class DeliveryUpdate implements OnInit {
  isSaving = signal(false);
  delivery: IDelivery | null = null;
  deliveryStatusValues = Object.keys(DeliveryStatus);

  customersSharedCollection = signal<ICustomer[]>([]);
  driversSharedCollection = signal<IDriver[]>([]);

  protected dataUtils = inject(DataUtils);
  protected eventManager = inject(EventManager);
  protected deliveryService = inject(DeliveryService);
  protected deliveryFormService = inject(DeliveryFormService);
  protected customerService = inject(CustomerService);
  protected driverService = inject(DriverService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: DeliveryFormGroup = this.deliveryFormService.createDeliveryFormGroup();

  compareCustomer = (o1: ICustomer | null, o2: ICustomer | null): boolean => this.customerService.compareCustomer(o1, o2);

  compareDriver = (o1: IDriver | null, o2: IDriver | null): boolean => this.driverService.compareDriver(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ delivery }) => {
      this.delivery = delivery;
      if (delivery) {
        this.updateForm(delivery);
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
    const delivery = this.deliveryFormService.getDelivery(this.editForm);
    if (delivery.id === null) {
      this.subscribeToSaveResponse(this.deliveryService.create(delivery));
    } else {
      this.subscribeToSaveResponse(this.deliveryService.update(delivery));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IDelivery>>): void {
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

  protected updateForm(delivery: IDelivery): void {
    this.delivery = delivery;
    this.deliveryFormService.resetForm(this.editForm, delivery);

    this.customersSharedCollection.set(
      this.customerService.addCustomerToCollectionIfMissing<ICustomer>(this.customersSharedCollection(), delivery.customer),
    );
    this.driversSharedCollection.set(
      this.driverService.addDriverToCollectionIfMissing<IDriver>(this.driversSharedCollection(), delivery.driver),
    );
  }

  protected loadRelationshipsOptions(): void {
    this.customerService
      .query()
      .pipe(map((res: HttpResponse<ICustomer[]>) => res.body ?? []))
      .pipe(
        map((customers: ICustomer[]) =>
          this.customerService.addCustomerToCollectionIfMissing<ICustomer>(customers, this.delivery?.customer),
        ),
      )
      .subscribe((customers: ICustomer[]) => this.customersSharedCollection.set(customers));

    this.driverService
      .query()
      .pipe(map((res: HttpResponse<IDriver[]>) => res.body ?? []))
      .pipe(map((drivers: IDriver[]) => this.driverService.addDriverToCollectionIfMissing<IDriver>(drivers, this.delivery?.driver)))
      .subscribe((drivers: IDriver[]) => this.driversSharedCollection.set(drivers));
  }
}
