import { HttpResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { DataUtils, FileLoadError } from 'app/core/util/data-util.service';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { VehicleType } from 'app/entities/enumerations/vehicle-type.model';
import { AlertError } from 'app/shared/alert/alert-error';
import { TranslateDirective } from 'app/shared/language';

import { VehicleService } from '../service/vehicle.service';
import { IVehicle } from '../vehicle.model';

import { VehicleFormGroup, VehicleFormService } from './vehicle-form.service';
import { AlertErrorModel } from 'app/shared/alert/alert-error.model';

@Component({
  selector: 'jhi-vehicle-update',
  templateUrl: './vehicle-update.html',
  imports: [TranslateDirective, TranslateModule, FontAwesomeModule, AlertError, ReactiveFormsModule],
})
export class VehicleUpdate implements OnInit {
  isSaving = signal(false);
  vehicle: IVehicle | null = null;
  vehicleTypeValues = Object.keys(VehicleType);

  protected dataUtils = inject(DataUtils);
  protected eventManager = inject(EventManager);
  protected vehicleService = inject(VehicleService);
  protected vehicleFormService = inject(VehicleFormService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: VehicleFormGroup = this.vehicleFormService.createVehicleFormGroup();

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ vehicle }) => {
      this.vehicle = vehicle;
      if (vehicle) {
        this.updateForm(vehicle);
      }
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
    const vehicle = this.vehicleFormService.getVehicle(this.editForm);
    if (vehicle.id === null) {
      this.subscribeToSaveResponse(this.vehicleService.create(vehicle));
    } else {
      this.subscribeToSaveResponse(this.vehicleService.update(vehicle));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IVehicle>>): void {
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

  protected updateForm(vehicle: IVehicle): void {
    this.vehicle = vehicle;
    this.vehicleFormService.resetForm(this.editForm, vehicle);
  }
}
