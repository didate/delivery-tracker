import { HttpResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { TenantService } from 'app/entities/tenant/service/tenant.service';
import { ITenant } from 'app/entities/tenant/tenant.model';
import { VehicleService } from 'app/entities/vehicle/service/vehicle.service';
import { IVehicle } from 'app/entities/vehicle/vehicle.model';
import { AlertError } from 'app/shared/alert/alert-error';
import { TranslateDirective } from 'app/shared/language';
import { IDriver } from '../driver.model';
import { DriverService } from '../service/driver.service';

import { DriverFormGroup, DriverFormService } from './driver-form.service';

@Component({
  selector: 'jhi-driver-update',
  templateUrl: './driver-update.html',
  imports: [TranslateDirective, TranslateModule, FontAwesomeModule, AlertError, ReactiveFormsModule],
})
export class DriverUpdate implements OnInit {
  isSaving = signal(false);
  driver: IDriver | null = null;

  tenantsSharedCollection = signal<ITenant[]>([]);
  vehiclesSharedCollection = signal<IVehicle[]>([]);

  protected driverService = inject(DriverService);
  protected driverFormService = inject(DriverFormService);
  protected tenantService = inject(TenantService);
  protected vehicleService = inject(VehicleService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: DriverFormGroup = this.driverFormService.createDriverFormGroup();

  compareTenant = (o1: ITenant | null, o2: ITenant | null): boolean => this.tenantService.compareTenant(o1, o2);

  compareVehicle = (o1: IVehicle | null, o2: IVehicle | null): boolean => this.vehicleService.compareVehicle(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ driver }) => {
      this.driver = driver;
      if (driver) {
        this.updateForm(driver);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    globalThis.history.back();
  }

  save(): void {
    this.isSaving.set(true);
    const driver = this.driverFormService.getDriver(this.editForm);
    if (driver.id === null) {
      this.subscribeToSaveResponse(this.driverService.create(driver));
    } else {
      this.subscribeToSaveResponse(this.driverService.update(driver));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IDriver>>): void {
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

  protected updateForm(driver: IDriver): void {
    this.driver = driver;
    this.driverFormService.resetForm(this.editForm, driver);

    this.tenantsSharedCollection.set(
      this.tenantService.addTenantToCollectionIfMissing<ITenant>(this.tenantsSharedCollection(), driver.tenant),
    );
    this.vehiclesSharedCollection.set(
      this.vehicleService.addVehicleToCollectionIfMissing<IVehicle>(this.vehiclesSharedCollection(), driver.vehicle),
    );
  }

  protected loadRelationshipsOptions(): void {
    this.tenantService
      .query()
      .pipe(map((res: HttpResponse<ITenant[]>) => res.body ?? []))
      .pipe(map((tenants: ITenant[]) => this.tenantService.addTenantToCollectionIfMissing<ITenant>(tenants, this.driver?.tenant)))
      .subscribe((tenants: ITenant[]) => this.tenantsSharedCollection.set(tenants));

    this.vehicleService
      .query()
      .pipe(map((res: HttpResponse<IVehicle[]>) => res.body ?? []))
      .pipe(map((vehicles: IVehicle[]) => this.vehicleService.addVehicleToCollectionIfMissing<IVehicle>(vehicles, this.driver?.vehicle)))
      .subscribe((vehicles: IVehicle[]) => this.vehiclesSharedCollection.set(vehicles));
  }
}
