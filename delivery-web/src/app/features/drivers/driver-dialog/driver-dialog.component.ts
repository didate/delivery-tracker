import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Driver, CreateDriverDto, UpdateDriverDto } from '../models/driver.model';
import { ProductionSite } from '../models/production-site.model';
import { DriverService } from '../services/driver.service';
import { ProductionSiteService } from '../services/production-site.service';

export interface DriverDialogData {
  driver?: Driver;
  mode: 'create' | 'edit';
}

@Component({
  selector: 'app-driver-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    SelectModule,
    ButtonModule,
    ProgressSpinnerModule
  ],
  template: `
    <form [formGroup]="form" class="driver-form">
      <div class="form-row">
        <div class="field">
          <label for="code">Code</label>
          <input id="code" type="text" pInputText formControlName="code" placeholder="Driver code" class="w-full">
          @if (form.get('code')?.hasError('required') && form.get('code')?.touched) {
            <small class="p-error">Code is required</small>
          }
        </div>

        <div class="field">
          <label for="firstName">First Name</label>
          <input id="firstName" type="text" pInputText formControlName="firstName" placeholder="First name" class="w-full">
          @if (form.get('firstName')?.hasError('required') && form.get('firstName')?.touched) {
            <small class="p-error">First name is required</small>
          }
        </div>

        <div class="field">
          <label for="lastName">Last Name</label>
          <input id="lastName" type="text" pInputText formControlName="lastName" placeholder="Last name" class="w-full">
          @if (form.get('lastName')?.hasError('required') && form.get('lastName')?.touched) {
            <small class="p-error">Last name is required</small>
          }
        </div>
      </div>

      <div class="form-row">
        <div class="field">
          <label for="phone">Phone</label>
          <input id="phone" type="text" pInputText formControlName="phone" placeholder="Phone number" class="w-full">
          @if (form.get('phone')?.hasError('required') && form.get('phone')?.touched) {
            <small class="p-error">Phone is required</small>
          }
        </div>

        <div class="field">
          <label for="email">Email</label>
          <input id="email" type="email" pInputText formControlName="email" placeholder="Email address" class="w-full">
          @if (form.get('email')?.hasError('required') && form.get('email')?.touched) {
            <small class="p-error">Email is required</small>
          }
          @if (form.get('email')?.hasError('email') && form.get('email')?.touched) {
            <small class="p-error">Invalid email format</small>
          }
        </div>
      </div>

      <div class="form-row">
        <div class="field">
          <label for="licenseNumber">License Number</label>
          <input id="licenseNumber" type="text" pInputText formControlName="licenseNumber" placeholder="License number" class="w-full">
          @if (form.get('licenseNumber')?.hasError('required') && form.get('licenseNumber')?.touched) {
            <small class="p-error">License number is required</small>
          }
        </div>

        <div class="field">
          <label for="vehicleType">Vehicle Type</label>
          <input id="vehicleType" type="text" pInputText formControlName="vehicleType" placeholder="Vehicle type" class="w-full">
          @if (form.get('vehicleType')?.hasError('required') && form.get('vehicleType')?.touched) {
            <small class="p-error">Vehicle type is required</small>
          }
        </div>

        <div class="field">
          <label for="vehiclePlate">Vehicle Plate</label>
          <input id="vehiclePlate" type="text" pInputText formControlName="vehiclePlate" placeholder="Vehicle plate" class="w-full">
          @if (form.get('vehiclePlate')?.hasError('required') && form.get('vehiclePlate')?.touched) {
            <small class="p-error">Vehicle plate is required</small>
          }
        </div>
      </div>

      <div class="form-row">
        <div class="field full-width">
          <label for="productionSiteId">Production Site</label>
          <p-select
            id="productionSiteId"
            formControlName="productionSiteId"
            [options]="productionSites()"
            optionLabel="name"
            optionValue="id"
            placeholder="Select a production site"
            [style]="{'width': '100%'}">
          </p-select>
          @if (form.get('productionSiteId')?.hasError('required') && form.get('productionSiteId')?.touched) {
            <small class="p-error">Production site is required</small>
          }
        </div>
      </div>
    </form>

    <div class="dialog-actions">
      <p-button label="Cancel" [text]="true" (onClick)="onCancel()"></p-button>
      <p-button
        [label]="data.mode === 'create' ? 'Create' : 'Save'"
        (onClick)="onSubmit()"
        [disabled]="form.invalid || saving()">
        @if (saving()) {
          <p-progressSpinner [style]="{width: '20px', height: '20px'}"></p-progressSpinner>
        }
      </p-button>
    </div>
  `,
  styles: [`
    .driver-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 500px;
    }

    .form-row {
      display: flex;
      gap: 16px;
    }

    .field {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .field label {
      font-weight: 500;
      margin-bottom: 4px;
    }

    .full-width {
      width: 100%;
    }

    .w-full {
      width: 100%;
    }

    .p-error {
      color: #f44336;
      font-size: 12px;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #e0e0e0;
    }
  `]
})
export class DriverDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject<DynamicDialogRef<any>>(DynamicDialogRef);
  private readonly config = inject(DynamicDialogConfig);
  private readonly driverService = inject(DriverService);
  private readonly productionSiteService = inject(ProductionSiteService);

  readonly data: DriverDialogData = this.config.data;
  readonly productionSites = signal<ProductionSite[]>([]);
  readonly saving = signal(false);

  form: FormGroup = this.fb.group({
    code: ['', Validators.required],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    phone: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    licenseNumber: ['', Validators.required],
    vehicleType: ['', Validators.required],
    vehiclePlate: ['', Validators.required],
    productionSiteId: [null, Validators.required]
  });

  ngOnInit(): void {
    this.loadProductionSites();

    if (this.data.mode === 'edit' && this.data.driver) {
      this.form.patchValue({
        code: this.data.driver.code,
        firstName: this.data.driver.firstName,
        lastName: this.data.driver.lastName,
        phone: this.data.driver.phone,
        email: this.data.driver.email,
        licenseNumber: this.data.driver.licenseNumber,
        vehicleType: this.data.driver.vehicleType,
        vehiclePlate: this.data.driver.vehiclePlate,
        productionSiteId: this.data.driver.productionSiteId
      });
    }
  }

  private loadProductionSites(): void {
    this.productionSiteService.getProductionSites().subscribe({
      next: (sites) => this.productionSites.set(sites),
      error: (err) => console.error('Failed to load production sites:', err)
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);

    const formValue = this.form.value;

    if (this.data.mode === 'create') {
      const createDto: CreateDriverDto = formValue;
      this.driverService.createDriver(createDto).subscribe({
        next: (driver) => {
          this.saving.set(false);
          this.dialogRef.close(driver);
        },
        error: (err) => {
          this.saving.set(false);
          console.error('Failed to create driver:', err);
        }
      });
    } else if (this.data.driver) {
      const updateDto: UpdateDriverDto = formValue;
      this.driverService.updateDriver(this.data.driver.id, updateDto).subscribe({
        next: (driver) => {
          this.saving.set(false);
          this.dialogRef.close(driver);
        },
        error: (err) => {
          this.saving.set(false);
          console.error('Failed to update driver:', err);
        }
      });
    }
  }
}
