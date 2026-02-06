import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Customer, CreateCustomerDto, UpdateCustomerDto } from '../models/customer.model';

export interface CustomerDialogData {
  customer?: Customer;
  mode: 'create' | 'edit';
}

export interface CustomerDialogResult {
  action: 'save';
  data: CreateCustomerDto | UpdateCustomerDto;
}

@Component({
  selector: 'app-customer-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ isEditMode() ? 'Edit Customer' : 'Add Customer' }}</h2>

    <mat-dialog-content>
      <form [formGroup]="customerForm" class="customer-form">
        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Code</mat-label>
            <input matInput formControlName="code" placeholder="Enter customer code">
            @if (customerForm.controls.code.hasError('required') && customerForm.controls.code.touched) {
              <mat-error>Code is required</mat-error>
            }
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Name</mat-label>
            <input matInput formControlName="name" placeholder="Enter customer name">
            @if (customerForm.controls.name.hasError('required') && customerForm.controls.name.touched) {
              <mat-error>Name is required</mat-error>
            }
          </mat-form-field>
        </div>

        <div class="form-row two-columns">
          <mat-form-field appearance="outline">
            <mat-label>Phone</mat-label>
            <input matInput formControlName="phone" placeholder="Enter phone number">
            @if (customerForm.controls.phone.hasError('required') && customerForm.controls.phone.touched) {
              <mat-error>Phone is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput formControlName="email" type="email" placeholder="Enter email">
            @if (customerForm.controls.email.hasError('required') && customerForm.controls.email.touched) {
              <mat-error>Email is required</mat-error>
            }
            @if (customerForm.controls.email.hasError('email') && customerForm.controls.email.touched) {
              <mat-error>Please enter a valid email</mat-error>
            }
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Address</mat-label>
            <textarea matInput formControlName="address" placeholder="Enter address" rows="2"></textarea>
          </mat-form-field>
        </div>

        <div class="form-row two-columns">
          <mat-form-field appearance="outline">
            <mat-label>Latitude</mat-label>
            <input matInput formControlName="latitude" type="number" step="any" placeholder="e.g., 48.8566">
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Longitude</mat-label>
            <input matInput formControlName="longitude" type="number" step="any" placeholder="e.g., 2.3522">
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-slide-toggle formControlName="active" color="primary">
            Active
          </mat-slide-toggle>
        </div>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button
        mat-raised-button
        color="primary"
        (click)="onSave()"
        [disabled]="customerForm.invalid || isSaving()">
        @if (isSaving()) {
          <mat-spinner diameter="20"></mat-spinner>
        } @else {
          {{ isEditMode() ? 'Update' : 'Create' }}
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .customer-form {
      display: flex;
      flex-direction: column;
      gap: 8px;
      min-width: 400px;
      padding-top: 8px;
    }

    .form-row {
      display: flex;
      gap: 16px;
    }

    .form-row.two-columns {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .full-width {
      width: 100%;
    }

    mat-form-field {
      width: 100%;
    }

    mat-dialog-content {
      max-height: 70vh;
      overflow-y: auto;
    }

    mat-dialog-actions {
      padding: 16px 0 0 0;
    }

    mat-spinner {
      display: inline-block;
    }
  `]
})
export class CustomerDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<CustomerDialogComponent>);
  readonly data = inject<CustomerDialogData>(MAT_DIALOG_DATA);

  readonly isSaving = signal(false);
  readonly isEditMode = signal(false);

  readonly customerForm = this.fb.nonNullable.group({
    code: ['', [Validators.required]],
    name: ['', [Validators.required]],
    phone: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    address: [''],
    latitude: [null as number | null],
    longitude: [null as number | null],
    active: [true],
  });

  ngOnInit(): void {
    this.isEditMode.set(this.data.mode === 'edit');

    if (this.data.customer) {
      this.customerForm.patchValue({
        code: this.data.customer.code,
        name: this.data.customer.name,
        phone: this.data.customer.phone,
        email: this.data.customer.email,
        address: this.data.customer.address,
        latitude: this.data.customer.latitude,
        longitude: this.data.customer.longitude,
        active: this.data.customer.active,
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.customerForm.invalid) {
      this.customerForm.markAllAsTouched();
      return;
    }

    const formValue = this.customerForm.getRawValue();

    const customerData: CreateCustomerDto | UpdateCustomerDto = {
      code: formValue.code,
      name: formValue.name,
      phone: formValue.phone,
      email: formValue.email,
      address: formValue.address,
      latitude: formValue.latitude,
      longitude: formValue.longitude,
      active: formValue.active,
    };

    const result: CustomerDialogResult = {
      action: 'save',
      data: customerData,
    };

    this.dialogRef.close(result);
  }
}
