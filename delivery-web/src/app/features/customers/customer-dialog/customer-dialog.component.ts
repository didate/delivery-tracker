import { Component, inject, signal, input, output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
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
  imports: [CommonModule, ReactiveFormsModule, ModalComponent],
  template: `
    <app-modal
      [isOpen]="isOpen()"
      [title]="mode() === 'edit' ? 'Edit Customer' : 'Add Customer'"
      maxWidth="500px"
      (close)="onCancel()">

      <form [formGroup]="customerForm" (ngSubmit)="onSave()" class="space-y-4">
        <!-- Code -->
        <div>
          <label for="code" class="block text-sm font-medium text-gray-700 mb-1">Code</label>
          <input
            id="code"
            type="text"
            formControlName="code"
            placeholder="Enter customer code"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            [class.border-red-500]="customerForm.controls.code.invalid && customerForm.controls.code.touched" />
          @if (customerForm.controls.code.hasError('required') && customerForm.controls.code.touched) {
            <p class="mt-1 text-sm text-red-600">Code is required</p>
          }
        </div>

        <!-- Name -->
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            id="name"
            type="text"
            formControlName="name"
            placeholder="Enter customer name"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            [class.border-red-500]="customerForm.controls.name.invalid && customerForm.controls.name.touched" />
          @if (customerForm.controls.name.hasError('required') && customerForm.controls.name.touched) {
            <p class="mt-1 text-sm text-red-600">Name is required</p>
          }
        </div>

        <!-- Phone & Email -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              id="phone"
              type="text"
              formControlName="phone"
              placeholder="Enter phone number"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              [class.border-red-500]="customerForm.controls.phone.invalid && customerForm.controls.phone.touched" />
            @if (customerForm.controls.phone.hasError('required') && customerForm.controls.phone.touched) {
              <p class="mt-1 text-sm text-red-600">Phone is required</p>
            }
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              placeholder="Enter email"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              [class.border-red-500]="customerForm.controls.email.invalid && customerForm.controls.email.touched" />
            @if (customerForm.controls.email.hasError('required') && customerForm.controls.email.touched) {
              <p class="mt-1 text-sm text-red-600">Email is required</p>
            }
            @if (customerForm.controls.email.hasError('email') && customerForm.controls.email.touched) {
              <p class="mt-1 text-sm text-red-600">Please enter a valid email</p>
            }
          </div>
        </div>

        <!-- Address -->
        <div>
          <label for="address" class="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <textarea
            id="address"
            formControlName="address"
            placeholder="Enter address"
            rows="2"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          </textarea>
        </div>

        <!-- Latitude & Longitude -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="latitude" class="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
            <input
              id="latitude"
              type="number"
              formControlName="latitude"
              placeholder="e.g., 48.8566"
              step="0.000001"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>

          <div>
            <label for="longitude" class="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
            <input
              id="longitude"
              type="number"
              formControlName="longitude"
              placeholder="e.g., 2.3522"
              step="0.000001"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
        </div>

        <!-- Active -->
        <div class="flex items-center gap-3">
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" formControlName="active" class="sr-only peer">
            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
          <span class="text-sm font-medium text-gray-700">Active</span>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-6">
          <button
            type="button"
            (click)="onCancel()"
            class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium rounded-lg transition-colors">
            Cancel
          </button>
          <button
            type="submit"
            [disabled]="customerForm.invalid || isSaving()"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors flex items-center gap-2">
            @if (isSaving()) {
              <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            }
            {{ mode() === 'edit' ? 'Update' : 'Create' }}
          </button>
        </div>
      </form>
    </app-modal>
  `,
})
export class CustomerDialogComponent implements OnInit, OnChanges {
  private readonly fb = inject(FormBuilder);

  isOpen = input<boolean>(false);
  mode = input<'create' | 'edit'>('create');
  customer = input<Customer | null>(null);

  save = output<CustomerDialogResult>();
  cancel = output<void>();

  readonly isSaving = signal(false);

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
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['customer'] || changes['isOpen']) {
      this.initForm();
    }
  }

  private initForm(): void {
    const customerData = this.customer();
    if (customerData) {
      this.customerForm.patchValue({
        code: customerData.code,
        name: customerData.name,
        phone: customerData.phone,
        email: customerData.email,
        address: customerData.address,
        latitude: customerData.latitude,
        longitude: customerData.longitude,
        active: customerData.active,
      });
    } else {
      this.customerForm.reset({ active: true });
    }
  }

  onCancel(): void {
    this.cancel.emit();
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

    this.save.emit(result);
  }
}
