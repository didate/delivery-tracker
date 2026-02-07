import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import {
  Payment,
  PaymentMethod,
  CreatePaymentDto,
  UpdatePaymentDto,
  PAYMENT_METHOD_LABELS
} from '../models/payment.model';
import { PaymentService } from '../services/payment.service';
import { CustomerService } from '../../customers/services/customer.service';
import { Customer } from '../../customers/models/customer.model';

export interface PaymentDialogData {
  mode: 'create' | 'edit';
  payment?: Payment;
}

@Component({
  selector: 'app-payment-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    TextareaModule,
    SelectModule,
    DatePickerModule,
    ProgressSpinnerModule
  ],
  template: `
    <form [formGroup]="paymentForm" class="payment-form">
      <div class="field">
        <label for="customerId">Customer <span class="required">*</span></label>
        <p-select
          id="customerId"
          formControlName="customerId"
          [options]="customerOptions()"
          [loading]="isLoadingCustomers()"
          [filter]="true"
          filterBy="label"
          placeholder="Select a customer"
          styleClass="w-full"
          [showClear]="true">
        </p-select>
        @if (paymentForm.controls.customerId.hasError('required') && paymentForm.controls.customerId.touched) {
          <small class="p-error">Customer is required</small>
        }
      </div>

      <div class="form-row">
        <div class="field half-width">
          <label for="amount">Amount <span class="required">*</span></label>
          <p-inputNumber
            id="amount"
            formControlName="amount"
            mode="currency"
            currency="USD"
            locale="en-US"
            [min]="0"
            placeholder="0.00"
            styleClass="w-full">
          </p-inputNumber>
          @if (paymentForm.controls.amount.hasError('required') && paymentForm.controls.amount.touched) {
            <small class="p-error">Amount is required</small>
          }
          @if (paymentForm.controls.amount.hasError('min') && paymentForm.controls.amount.touched) {
            <small class="p-error">Amount must be greater than 0</small>
          }
        </div>

        <div class="field half-width">
          <label for="method">Payment Method <span class="required">*</span></label>
          <p-select
            id="method"
            formControlName="method"
            [options]="paymentMethodOptions"
            placeholder="Select method"
            styleClass="w-full">
          </p-select>
          @if (paymentForm.controls.method.hasError('required') && paymentForm.controls.method.touched) {
            <small class="p-error">Payment method is required</small>
          }
        </div>
      </div>

      <div class="field">
        <label for="paymentDate">Payment Date <span class="required">*</span></label>
        <p-datepicker
          id="paymentDate"
          formControlName="paymentDate"
          [showIcon]="true"
          dateFormat="mm/dd/yy"
          placeholder="Select date"
          styleClass="w-full">
        </p-datepicker>
        @if (paymentForm.controls.paymentDate.hasError('required') && paymentForm.controls.paymentDate.touched) {
          <small class="p-error">Payment date is required</small>
        }
      </div>

      <div class="field">
        <label for="reference">Reference</label>
        <span class="p-input-icon-right w-full">
          <i class="pi pi-tag"></i>
          <input
            id="reference"
            type="text"
            pInputText
            formControlName="reference"
            placeholder="Check number, transaction ID, etc."
            class="w-full" />
        </span>
      </div>

      <div class="field">
        <label for="notes">Notes</label>
        <textarea
          id="notes"
          pTextarea
          formControlName="notes"
          placeholder="Additional notes..."
          rows="3"
          class="w-full">
        </textarea>
      </div>

      @if (errorMessage()) {
        <div class="error-message">{{ errorMessage() }}</div>
      }
    </form>

    <div class="dialog-footer">
      <p-button
        label="Cancel"
        [text]="true"
        (onClick)="onCancel()"
        [disabled]="isLoading()">
      </p-button>
      <p-button
        [label]="isEditMode ? 'Update' : 'Create'"
        (onClick)="onSubmit()"
        [disabled]="isLoading() || paymentForm.invalid"
        [loading]="isLoading()">
      </p-button>
    </div>
  `,
  styles: [`
    .payment-form {
      display: flex;
      flex-direction: column;
      padding-top: 8px;
    }

    .field {
      margin-bottom: 16px;
    }

    .field label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
    }

    .required {
      color: #f44336;
    }

    .form-row {
      display: flex;
      gap: 16px;
    }

    .half-width {
      flex: 1;
    }

    .w-full {
      width: 100%;
    }

    .p-error {
      color: #f44336;
      font-size: 12px;
      margin-top: 4px;
      display: block;
    }

    .error-message {
      color: #f44336;
      font-size: 12px;
      margin-top: 8px;
      padding: 8px;
      background-color: #ffebee;
      border-radius: 4px;
    }

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding-top: 16px;
      border-top: 1px solid #e0e0e0;
      margin-top: 8px;
    }
  `]
})
export class PaymentDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject<DynamicDialogRef<any>>(DynamicDialogRef);
  private readonly dialogConfig = inject(DynamicDialogConfig);
  private readonly paymentService = inject(PaymentService);
  private readonly customerService = inject(CustomerService);

  readonly isLoading = signal(false);
  readonly isLoadingCustomers = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly customers = signal<Customer[]>([]);
  readonly customerOptions = signal<{ label: string; value: number }[]>([]);

  readonly data: PaymentDialogData = this.dialogConfig.data;
  readonly isEditMode = this.data?.mode === 'edit';
  readonly paymentMethods = Object.values(PaymentMethod);
  readonly paymentMethodOptions = this.paymentMethods.map(method => ({
    label: PAYMENT_METHOD_LABELS[method],
    value: method
  }));

  readonly paymentForm = this.fb.nonNullable.group({
    customerId: [this.data?.payment?.customerId ?? null as number | null, [Validators.required]],
    amount: [this.data?.payment?.amount ?? 0, [Validators.required, Validators.min(0.01)]],
    method: [this.data?.payment?.method ?? PaymentMethod.CASH, [Validators.required]],
    paymentDate: [this.data?.payment?.paymentDate ? new Date(this.data.payment.paymentDate) : new Date(), [Validators.required]],
    reference: [this.data?.payment?.reference ?? ''],
    notes: [this.data?.payment?.notes ?? '']
  });

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.isLoadingCustomers.set(true);
    this.customerService.getCustomers({ size: 1000, active: true }).subscribe({
      next: (response) => {
        this.customers.set(response.data);
        this.customerOptions.set(
          response.data.map(customer => ({
            label: `${customer.name} (${customer.code})`,
            value: customer.id
          }))
        );
        this.isLoadingCustomers.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.message || 'Failed to load customers');
        this.isLoadingCustomers.set(false);
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  onSubmit(): void {
    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const formValue = this.paymentForm.getRawValue();
    const paymentDate = formValue.paymentDate instanceof Date
      ? this.formatDate(formValue.paymentDate)
      : formValue.paymentDate;

    if (this.isEditMode && this.data.payment) {
      const updateDto: UpdatePaymentDto = {
        customerId: formValue.customerId!,
        amount: formValue.amount,
        method: formValue.method,
        paymentDate: paymentDate as string,
        reference: formValue.reference || undefined,
        notes: formValue.notes || undefined
      };

      this.paymentService.updatePayment(this.data.payment.id, updateDto).subscribe({
        next: (payment) => {
          this.isLoading.set(false);
          this.dialogRef.close(payment);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.message || 'Failed to update payment');
        }
      });
    } else {
      const createDto: CreatePaymentDto = {
        customerId: formValue.customerId!,
        amount: formValue.amount,
        method: formValue.method,
        paymentDate: paymentDate as string,
        reference: formValue.reference || undefined,
        notes: formValue.notes || undefined
      };

      this.paymentService.createPayment(createDto).subscribe({
        next: (payment) => {
          this.isLoading.set(false);
          this.dialogRef.close(payment);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.message || 'Failed to create payment');
        }
      });
    }
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
