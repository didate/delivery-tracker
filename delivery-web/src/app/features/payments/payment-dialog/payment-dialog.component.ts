import { Component, inject, signal, input, output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ModalComponent } from '../../../shared/components/modal/modal.component';
import {
  Payment,
  PaymentMethod,
  CreatePaymentDto,
  UpdatePaymentDto,
  PAYMENT_METHOD_LABELS
} from '../models/payment.model';
import { CustomerService } from '../../customers/services/customer.service';
import { Customer } from '../../customers/models/customer.model';

export interface PaymentDialogData {
  mode: 'create' | 'edit';
  payment?: Payment;
}

export interface PaymentDialogResult {
  action: 'save';
  data: CreatePaymentDto | UpdatePaymentDto;
}

@Component({
  selector: 'app-payment-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent],
  template: `
    <app-modal
      [isOpen]="isOpen()"
      [title]="mode() === 'edit' ? 'Edit Payment' : 'Create Payment'"
      maxWidth="550px"
      (close)="onCancel()">

      <form [formGroup]="paymentForm" (ngSubmit)="onSubmit()" class="space-y-4">
        <!-- Customer -->
        <div>
          <label for="customerId" class="block text-sm font-medium text-gray-700 mb-1">
            Customer <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <select
              id="customerId"
              formControlName="customerId"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
              [class.border-red-500]="paymentForm.controls.customerId.invalid && paymentForm.controls.customerId.touched">
              <option [ngValue]="null">Select a customer</option>
              @for (option of customerOptions(); track option.value) {
                <option [ngValue]="option.value">{{ option.label }}</option>
              }
            </select>
            <i class="pi pi-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-sm"></i>
            @if (isLoadingCustomers()) {
              <div class="absolute right-10 top-1/2 -translate-y-1/2">
                <div class="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
            }
          </div>
          @if (paymentForm.controls.customerId.hasError('required') && paymentForm.controls.customerId.touched) {
            <p class="mt-1 text-sm text-red-600">Customer is required</p>
          }
        </div>

        <!-- Amount and Payment Method -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="amount" class="block text-sm font-medium text-gray-700 mb-1">
              Amount <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                id="amount"
                type="number"
                formControlName="amount"
                step="0.01"
                min="0"
                placeholder="0.00"
                class="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                [class.border-red-500]="paymentForm.controls.amount.invalid && paymentForm.controls.amount.touched" />
            </div>
            @if (paymentForm.controls.amount.hasError('required') && paymentForm.controls.amount.touched) {
              <p class="mt-1 text-sm text-red-600">Amount is required</p>
            }
            @if (paymentForm.controls.amount.hasError('min') && paymentForm.controls.amount.touched) {
              <p class="mt-1 text-sm text-red-600">Amount must be greater than 0</p>
            }
          </div>

          <div>
            <label for="method" class="block text-sm font-medium text-gray-700 mb-1">
              Payment Method <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <select
                id="method"
                formControlName="method"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                [class.border-red-500]="paymentForm.controls.method.invalid && paymentForm.controls.method.touched">
                <option [ngValue]="null">Select method</option>
                @for (option of paymentMethodOptions; track option.value) {
                  <option [ngValue]="option.value">{{ option.label }}</option>
                }
              </select>
              <i class="pi pi-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-sm"></i>
            </div>
            @if (paymentForm.controls.method.hasError('required') && paymentForm.controls.method.touched) {
              <p class="mt-1 text-sm text-red-600">Payment method is required</p>
            }
          </div>
        </div>

        <!-- Payment Date -->
        <div>
          <label for="paymentDate" class="block text-sm font-medium text-gray-700 mb-1">
            Payment Date <span class="text-red-500">*</span>
          </label>
          <input
            id="paymentDate"
            type="date"
            formControlName="paymentDate"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            [class.border-red-500]="paymentForm.controls.paymentDate.invalid && paymentForm.controls.paymentDate.touched" />
          @if (paymentForm.controls.paymentDate.hasError('required') && paymentForm.controls.paymentDate.touched) {
            <p class="mt-1 text-sm text-red-600">Payment date is required</p>
          }
        </div>

        <!-- Reference -->
        <div>
          <label for="reference" class="block text-sm font-medium text-gray-700 mb-1">Reference</label>
          <div class="relative">
            <i class="pi pi-tag absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input
              id="reference"
              type="text"
              formControlName="reference"
              placeholder="Check number, transaction ID, etc."
              class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
        </div>

        <!-- Notes -->
        <div>
          <label for="notes" class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            id="notes"
            formControlName="notes"
            placeholder="Additional notes..."
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          </textarea>
        </div>

        @if (errorMessage()) {
          <div class="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {{ errorMessage() }}
          </div>
        }

        <!-- Actions -->
        <div class="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-6">
          <button
            type="button"
            (click)="onCancel()"
            [disabled]="isLoading()"
            class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 font-medium rounded-lg transition-colors">
            Cancel
          </button>
          <button
            type="submit"
            [disabled]="isLoading() || paymentForm.invalid"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors flex items-center gap-2">
            @if (isLoading()) {
              <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            }
            {{ mode() === 'edit' ? 'Update' : 'Create' }}
          </button>
        </div>
      </form>
    </app-modal>
  `,
})
export class PaymentDialogComponent implements OnInit, OnChanges {
  private readonly fb = inject(FormBuilder);
  private readonly customerService = inject(CustomerService);

  isOpen = input<boolean>(false);
  mode = input<'create' | 'edit'>('create');
  payment = input<Payment | null>(null);

  save = output<PaymentDialogResult>();
  cancel = output<void>();

  readonly isLoading = signal(false);
  readonly isLoadingCustomers = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly customers = signal<Customer[]>([]);
  readonly customerOptions = signal<{ label: string; value: number }[]>([]);

  readonly paymentMethods = Object.values(PaymentMethod);
  readonly paymentMethodOptions = this.paymentMethods.map(method => ({
    label: PAYMENT_METHOD_LABELS[method],
    value: method
  }));

  readonly paymentForm = this.fb.nonNullable.group({
    customerId: [null as number | null, [Validators.required]],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    method: [null as PaymentMethod | null, [Validators.required]],
    paymentDate: ['', [Validators.required]],
    reference: [''],
    notes: ['']
  });

  ngOnInit(): void {
    this.loadCustomers();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['payment'] || changes['isOpen']) {
      this.initForm();
    }
  }

  private initForm(): void {
    const paymentData = this.payment();
    if (paymentData) {
      const paymentDate = typeof paymentData.paymentDate === 'string'
        ? paymentData.paymentDate.split('T')[0]
        : '';

      this.paymentForm.patchValue({
        customerId: paymentData.customerId,
        amount: paymentData.amount,
        method: paymentData.method,
        paymentDate: paymentDate,
        reference: paymentData.reference || '',
        notes: paymentData.notes || ''
      });
    } else {
      const today = new Date().toISOString().split('T')[0];
      this.paymentForm.reset({
        customerId: null,
        amount: 0,
        method: PaymentMethod.CASH,
        paymentDate: today,
        reference: '',
        notes: ''
      });
    }
    this.errorMessage.set(null);
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
    this.cancel.emit();
  }

  onSubmit(): void {
    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      return;
    }

    const formValue = this.paymentForm.getRawValue();

    const data: CreatePaymentDto | UpdatePaymentDto = {
      customerId: formValue.customerId!,
      amount: formValue.amount,
      method: formValue.method!,
      paymentDate: formValue.paymentDate,
      reference: formValue.reference || undefined,
      notes: formValue.notes || undefined
    };

    const result: PaymentDialogResult = {
      action: 'save',
      data: data
    };

    this.save.emit(result);
  }
}
