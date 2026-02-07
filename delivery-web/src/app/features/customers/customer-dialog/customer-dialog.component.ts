import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
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
    InputTextModule,
    ButtonModule,
    ToggleSwitchModule,
    ProgressSpinnerModule,
    TextareaModule,
    InputNumberModule,
  ],
  template: `
    <form [formGroup]="customerForm" class="customer-form">
      <div class="form-row">
        <div class="field full-width">
          <label for="code">Code</label>
          <input
            id="code"
            type="text"
            pInputText
            formControlName="code"
            placeholder="Enter customer code"
            class="w-full" />
          @if (customerForm.controls.code.hasError('required') && customerForm.controls.code.touched) {
            <small class="p-error">Code is required</small>
          }
        </div>
      </div>

      <div class="form-row">
        <div class="field full-width">
          <label for="name">Name</label>
          <input
            id="name"
            type="text"
            pInputText
            formControlName="name"
            placeholder="Enter customer name"
            class="w-full" />
          @if (customerForm.controls.name.hasError('required') && customerForm.controls.name.touched) {
            <small class="p-error">Name is required</small>
          }
        </div>
      </div>

      <div class="form-row two-columns">
        <div class="field">
          <label for="phone">Phone</label>
          <input
            id="phone"
            type="text"
            pInputText
            formControlName="phone"
            placeholder="Enter phone number"
            class="w-full" />
          @if (customerForm.controls.phone.hasError('required') && customerForm.controls.phone.touched) {
            <small class="p-error">Phone is required</small>
          }
        </div>

        <div class="field">
          <label for="email">Email</label>
          <input
            id="email"
            type="email"
            pInputText
            formControlName="email"
            placeholder="Enter email"
            class="w-full" />
          @if (customerForm.controls.email.hasError('required') && customerForm.controls.email.touched) {
            <small class="p-error">Email is required</small>
          }
          @if (customerForm.controls.email.hasError('email') && customerForm.controls.email.touched) {
            <small class="p-error">Please enter a valid email</small>
          }
        </div>
      </div>

      <div class="form-row">
        <div class="field full-width">
          <label for="address">Address</label>
          <textarea
            id="address"
            pTextarea
            formControlName="address"
            placeholder="Enter address"
            rows="2"
            class="w-full">
          </textarea>
        </div>
      </div>

      <div class="form-row two-columns">
        <div class="field">
          <label for="latitude">Latitude</label>
          <p-inputNumber
            id="latitude"
            formControlName="latitude"
            placeholder="e.g., 48.8566"
            [minFractionDigits]="0"
            [maxFractionDigits]="6"
            mode="decimal"
            [useGrouping]="false"
            styleClass="w-full">
          </p-inputNumber>
        </div>

        <div class="field">
          <label for="longitude">Longitude</label>
          <p-inputNumber
            id="longitude"
            formControlName="longitude"
            placeholder="e.g., 2.3522"
            [minFractionDigits]="0"
            [maxFractionDigits]="6"
            mode="decimal"
            [useGrouping]="false"
            styleClass="w-full">
          </p-inputNumber>
        </div>
      </div>

      <div class="form-row">
        <div class="field-checkbox">
          <p-toggleswitch formControlName="active"></p-toggleswitch>
          <label for="active">Active</label>
        </div>
      </div>
    </form>

    <div class="dialog-actions">
      <p-button
        label="Cancel"
        [text]="true"
        (onClick)="onCancel()">
      </p-button>
      <p-button
        [label]="isEditMode() ? 'Update' : 'Create'"
        (onClick)="onSave()"
        [disabled]="customerForm.invalid || isSaving()">
        @if (isSaving()) {
          <p-progressSpinner [style]="{width: '20px', height: '20px'}"></p-progressSpinner>
        }
      </p-button>
    </div>
  `,
  styles: [`
    .customer-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
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

    .field {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .field label {
      font-weight: 500;
    }

    .field-checkbox {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .full-width {
      width: 100%;
    }

    .w-full {
      width: 100%;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding-top: 24px;
      border-top: 1px solid var(--surface-border);
      margin-top: 16px;
    }

    .p-error {
      color: var(--red-500);
    }

    :host ::ng-deep .p-inputnumber {
      width: 100%;
    }

    :host ::ng-deep .p-inputnumber-input {
      width: 100%;
    }
  `]
})
export class CustomerDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(DynamicDialogRef);
  private readonly config = inject(DynamicDialogConfig);

  readonly isSaving = signal(false);
  readonly isEditMode = signal(false);

  get data(): CustomerDialogData {
    return this.config.data;
  }

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
