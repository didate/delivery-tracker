import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

import {
  Payment,
  PaymentMethod,
  CreatePaymentDto,
  UpdatePaymentDto,
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHOD_ICONS
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
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatAutocompleteModule
  ],
  template: `
    <h2 mat-dialog-title>{{ isEditMode ? 'Edit Payment' : 'Create Payment' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="paymentForm" class="payment-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Customer</mat-label>
          <mat-select formControlName="customerId" [disabled]="isLoadingCustomers()">
            @if (isLoadingCustomers()) {
              <mat-option disabled>Loading customers...</mat-option>
            } @else {
              @for (customer of customers(); track customer.id) {
                <mat-option [value]="customer.id">
                  {{ customer.name }} ({{ customer.code }})
                </mat-option>
              }
            }
          </mat-select>
          @if (paymentForm.controls.customerId.hasError('required') && paymentForm.controls.customerId.touched) {
            <mat-error>Customer is required</mat-error>
          }
        </mat-form-field>

        <div class="form-row">
          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Amount</mat-label>
            <input matInput type="number" formControlName="amount" placeholder="0.00" min="0" step="0.01">
            <span matTextPrefix>$&nbsp;</span>
            @if (paymentForm.controls.amount.hasError('required') && paymentForm.controls.amount.touched) {
              <mat-error>Amount is required</mat-error>
            }
            @if (paymentForm.controls.amount.hasError('min') && paymentForm.controls.amount.touched) {
              <mat-error>Amount must be greater than 0</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Payment Method</mat-label>
            <mat-select formControlName="method">
              @for (method of paymentMethods; track method) {
                <mat-option [value]="method">
                  <mat-icon class="method-icon">{{ getMethodIcon(method) }}</mat-icon>
                  {{ getMethodLabel(method) }}
                </mat-option>
              }
            </mat-select>
            @if (paymentForm.controls.method.hasError('required') && paymentForm.controls.method.touched) {
              <mat-error>Payment method is required</mat-error>
            }
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Payment Date</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="paymentDate">
          <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
          @if (paymentForm.controls.paymentDate.hasError('required') && paymentForm.controls.paymentDate.touched) {
            <mat-error>Payment date is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Reference</mat-label>
          <input matInput formControlName="reference" placeholder="Check number, transaction ID, etc.">
          <mat-icon matSuffix>tag</mat-icon>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Notes</mat-label>
          <textarea matInput formControlName="notes" placeholder="Additional notes..." rows="3"></textarea>
        </mat-form-field>

        @if (errorMessage()) {
          <div class="error-message">{{ errorMessage() }}</div>
        }
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close [disabled]="isLoading()">Cancel</button>
      <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="isLoading() || paymentForm.invalid">
        @if (isLoading()) {
          <mat-spinner diameter="20"></mat-spinner>
        } @else {
          {{ isEditMode ? 'Update' : 'Create' }}
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .payment-form {
      display: flex;
      flex-direction: column;
      min-width: 450px;
      padding-top: 16px;
    }

    .full-width {
      width: 100%;
    }

    .form-row {
      display: flex;
      gap: 16px;
    }

    .half-width {
      flex: 1;
    }

    .method-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      margin-right: 8px;
      vertical-align: middle;
    }

    .error-message {
      color: #f44336;
      font-size: 12px;
      margin-top: 8px;
      padding: 8px;
      background-color: #ffebee;
      border-radius: 4px;
    }

    mat-dialog-content {
      max-height: 70vh;
    }
  `]
})
export class PaymentDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<PaymentDialogComponent>);
  private readonly paymentService = inject(PaymentService);
  private readonly customerService = inject(CustomerService);
  readonly data = inject<PaymentDialogData>(MAT_DIALOG_DATA);

  readonly isLoading = signal(false);
  readonly isLoadingCustomers = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly customers = signal<Customer[]>([]);

  readonly isEditMode = this.data?.mode === 'edit';
  readonly paymentMethods = Object.values(PaymentMethod);

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
        this.isLoadingCustomers.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.message || 'Failed to load customers');
        this.isLoadingCustomers.set(false);
      }
    });
  }

  getMethodLabel(method: PaymentMethod): string {
    return PAYMENT_METHOD_LABELS[method] || method;
  }

  getMethodIcon(method: PaymentMethod): string {
    return PAYMENT_METHOD_ICONS[method] || 'payment';
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
