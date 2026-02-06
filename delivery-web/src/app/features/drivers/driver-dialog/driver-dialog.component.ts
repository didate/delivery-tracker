import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
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
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.mode === 'create' ? 'Add Driver' : 'Edit Driver' }}</h2>

    <mat-dialog-content>
      <form [formGroup]="form" class="driver-form">
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Code</mat-label>
            <input matInput formControlName="code" placeholder="Driver code">
            @if (form.get('code')?.hasError('required') && form.get('code')?.touched) {
              <mat-error>Code is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>First Name</mat-label>
            <input matInput formControlName="firstName" placeholder="First name">
            @if (form.get('firstName')?.hasError('required') && form.get('firstName')?.touched) {
              <mat-error>First name is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Last Name</mat-label>
            <input matInput formControlName="lastName" placeholder="Last name">
            @if (form.get('lastName')?.hasError('required') && form.get('lastName')?.touched) {
              <mat-error>Last name is required</mat-error>
            }
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Phone</mat-label>
            <input matInput formControlName="phone" placeholder="Phone number">
            @if (form.get('phone')?.hasError('required') && form.get('phone')?.touched) {
              <mat-error>Phone is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput formControlName="email" type="email" placeholder="Email address">
            @if (form.get('email')?.hasError('required') && form.get('email')?.touched) {
              <mat-error>Email is required</mat-error>
            }
            @if (form.get('email')?.hasError('email') && form.get('email')?.touched) {
              <mat-error>Invalid email format</mat-error>
            }
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>License Number</mat-label>
            <input matInput formControlName="licenseNumber" placeholder="License number">
            @if (form.get('licenseNumber')?.hasError('required') && form.get('licenseNumber')?.touched) {
              <mat-error>License number is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Vehicle Type</mat-label>
            <input matInput formControlName="vehicleType" placeholder="Vehicle type">
            @if (form.get('vehicleType')?.hasError('required') && form.get('vehicleType')?.touched) {
              <mat-error>Vehicle type is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Vehicle Plate</mat-label>
            <input matInput formControlName="vehiclePlate" placeholder="Vehicle plate">
            @if (form.get('vehiclePlate')?.hasError('required') && form.get('vehiclePlate')?.touched) {
              <mat-error>Vehicle plate is required</mat-error>
            }
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Production Site</mat-label>
            <mat-select formControlName="productionSiteId">
              @for (site of productionSites(); track site.id) {
                <mat-option [value]="site.id">{{ site.name }}</mat-option>
              }
            </mat-select>
            @if (form.get('productionSiteId')?.hasError('required') && form.get('productionSiteId')?.touched) {
              <mat-error>Production site is required</mat-error>
            }
          </mat-form-field>
        </div>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button
        mat-flat-button
        color="primary"
        (click)="onSubmit()"
        [disabled]="form.invalid || saving()">
        @if (saving()) {
          <mat-spinner diameter="20"></mat-spinner>
        } @else {
          {{ data.mode === 'create' ? 'Create' : 'Save' }}
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .driver-form {
      display: flex;
      flex-direction: column;
      gap: 8px;
      min-width: 500px;
    }

    .form-row {
      display: flex;
      gap: 16px;
    }

    .form-row mat-form-field {
      flex: 1;
    }

    .full-width {
      width: 100%;
    }

    mat-dialog-content {
      padding-top: 16px;
    }

    mat-spinner {
      display: inline-block;
    }
  `]
})
export class DriverDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<DriverDialogComponent>);
  private readonly driverService = inject(DriverService);
  private readonly productionSiteService = inject(ProductionSiteService);

  readonly data = inject<DriverDialogData>(MAT_DIALOG_DATA);
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
