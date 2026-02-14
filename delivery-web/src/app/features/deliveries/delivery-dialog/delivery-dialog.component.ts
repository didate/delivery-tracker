import { Component, inject, signal, OnInit, OnChanges, SimpleChanges, input, output, computed } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormArray, FormGroup } from '@angular/forms';

import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { Delivery, CreateDeliveryDto, CreateDeliveryItemDto } from '../models/delivery.model';
import { Customer } from '../../customers/models/customer.model';
import { Driver } from '../../drivers/models/driver.model';
import { Product } from '../../products/models/product.model';
import { CustomerService } from '../../customers/services/customer.service';
import { DriverService } from '../../drivers/services/driver.service';
import { ProductService } from '../../products/services/product.service';

export interface DeliveryDialogData {
  delivery?: Delivery;
  mode: 'create' | 'edit';
}

export interface DeliveryDialogResult {
  action: 'save';
  data: CreateDeliveryDto;
}

interface ItemFormGroup {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

@Component({
  selector: 'app-delivery-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ModalComponent,
    CurrencyPipe,
  ],
  template: `
    <app-modal
      [isOpen]="isOpen()"
      [title]="mode() === 'edit' ? 'Edit Delivery' : 'New Delivery'"
      maxWidth="700px"
      (close)="onCancel()">

      <form [formGroup]="deliveryForm" class="space-y-6">
        <!-- Delivery Information -->
        <div>
          <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">Delivery Information</h3>

          <div class="grid grid-cols-2 gap-4">
            <!-- Customer -->
            <div>
              <label for="customerId" class="block text-sm font-medium text-gray-700 mb-1">Customer *</label>
              <select
                id="customerId"
                formControlName="customerId"
                (change)="onCustomerChange($any($event.target).value)"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                [class.border-red-500]="deliveryForm.controls.customerId.invalid && deliveryForm.controls.customerId.touched">
                <option [ngValue]="null">Select a customer</option>
                @for (option of customerOptions(); track option.value) {
                  <option [ngValue]="option.value">{{ option.label }}</option>
                }
              </select>
              @if (deliveryForm.controls.customerId.hasError('required') && deliveryForm.controls.customerId.touched) {
                <p class="mt-1 text-sm text-red-600">Customer is required</p>
              }
            </div>

            <!-- Driver -->
            <div>
              <label for="driverId" class="block text-sm font-medium text-gray-700 mb-1">Driver (Optional)</label>
              <select
                id="driverId"
                formControlName="driverId"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
                <option [ngValue]="null">Not assigned</option>
                @for (option of driverOptions(); track option.value) {
                  <option [ngValue]="option.value">{{ option.label }}</option>
                }
              </select>
            </div>

            <!-- Delivery Date -->
            <div>
              <label for="deliveryDate" class="block text-sm font-medium text-gray-700 mb-1">Delivery Date *</label>
              <input
                id="deliveryDate"
                type="date"
                formControlName="deliveryDate"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                [class.border-red-500]="deliveryForm.controls.deliveryDate.invalid && deliveryForm.controls.deliveryDate.touched" />
              @if (deliveryForm.controls.deliveryDate.hasError('required') && deliveryForm.controls.deliveryDate.touched) {
                <p class="mt-1 text-sm text-red-600">Delivery date is required</p>
              }
            </div>

            <!-- Notes -->
            <div>
              <label for="notes" class="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
              <textarea
                id="notes"
                formControlName="notes"
                rows="1"
                placeholder="Add notes..."
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              </textarea>
            </div>
          </div>
        </div>

        <hr class="border-gray-200" />

        <!-- Items Section -->
        <div>
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wide">Items</h3>
            <button
              type="button"
              (click)="addItem()"
              class="px-3 py-1.5 text-blue-600 hover:bg-blue-50 font-medium rounded-lg transition-colors flex items-center gap-1 text-sm">
              <i class="pi pi-plus"></i>
              Add Item
            </button>
          </div>

          @if (itemsFormArray.length === 0) {
            <div class="text-center py-8 bg-gray-50 rounded-lg text-gray-500">
              <p>No items added yet. Click "Add Item" to add products to this delivery.</p>
            </div>
          } @else {
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead class="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th class="px-3 py-2 text-left font-semibold text-gray-700">Product</th>
                    <th class="px-3 py-2 text-left font-semibold text-gray-700 w-24">Quantity</th>
                    <th class="px-3 py-2 text-left font-semibold text-gray-700 w-32">Unit Price</th>
                    <th class="px-3 py-2 text-left font-semibold text-gray-700 w-24">Total</th>
                    <th class="px-3 py-2 w-12"></th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  @for (item of itemsFormArray.controls; track $index; let i = $index) {
                    <tr>
                      <td class="px-3 py-2">
                        <select
                          [formControl]="getItemControl(i, 'productId')"
                          (change)="onProductChange(i, $any($event.target).value)"
                          class="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm">
                          <option value="">Select product</option>
                          @for (product of productOptions(); track product.value) {
                            <option [value]="product.value">{{ product.label }}</option>
                          }
                        </select>
                      </td>
                      <td class="px-3 py-2">
                        <input
                          type="number"
                          [formControl]="getItemControl(i, 'quantity')"
                          (input)="updateItemTotal(i)"
                          min="1"
                          class="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-center" />
                      </td>
                      <td class="px-3 py-2">
                        <div class="relative">
                          <span class="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                          <input
                            type="number"
                            [formControl]="getItemControl(i, 'unitPrice')"
                            (input)="updateItemTotal(i)"
                            min="0"
                            step="0.01"
                            class="w-full pl-6 pr-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" />
                        </div>
                      </td>
                      <td class="px-3 py-2 font-medium text-gray-900">
                        {{ getItemValue(i, 'totalPrice') | currency }}
                      </td>
                      <td class="px-3 py-2">
                        <button
                          type="button"
                          (click)="removeItem(i)"
                          class="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove item">
                          <i class="pi pi-trash text-sm"></i>
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <div class="flex justify-end mt-4 px-4 py-3 bg-gray-50 rounded-lg">
              <strong class="text-gray-900">Total Amount: {{ grandTotal() | currency }}</strong>
            </div>
          }
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            (click)="onCancel()"
            class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium rounded-lg transition-colors">
            Cancel
          </button>
          <button
            type="button"
            (click)="onSave()"
            [disabled]="deliveryForm.invalid || itemsFormArray.length === 0 || isSaving()"
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
export class DeliveryDialogComponent implements OnInit, OnChanges {
  private readonly fb = inject(FormBuilder);
  private readonly customerService = inject(CustomerService);
  private readonly driverService = inject(DriverService);
  private readonly productService = inject(ProductService);

  isOpen = input<boolean>(false);
  mode = input<'create' | 'edit'>('create');
  delivery = input<Delivery | null>(null);

  save = output<DeliveryDialogResult>();
  cancel = output<void>();

  readonly isSaving = signal(false);
  readonly customers = signal<Customer[]>([]);
  readonly drivers = signal<Driver[]>([]);
  readonly products = signal<Product[]>([]);

  readonly customerOptions = computed(() =>
    this.customers().map(c => ({ label: c.name, value: c.id }))
  );

  readonly driverOptions = computed(() =>
    this.drivers().map(d => ({ label: `${d.firstName} ${d.lastName}`, value: d.id }))
  );

  readonly productOptions = computed(() =>
    this.products().map(p => ({ label: p.name, value: p.id }))
  );

  readonly deliveryForm = this.fb.nonNullable.group({
    customerId: [null as number | null, [Validators.required]],
    driverId: [null as number | null],
    deliveryDate: ['', [Validators.required]],
    notes: [''],
    items: this.fb.array<FormGroup>([])
  });

  get itemsFormArray(): FormArray {
    return this.deliveryForm.get('items') as FormArray;
  }

  readonly grandTotal = computed(() => {
    let total = 0;
    for (let i = 0; i < this.itemsFormArray.length; i++) {
      total += this.getItemValue(i, 'totalPrice') || 0;
    }
    return total;
  });

  ngOnInit(): void {
    this.loadCustomers();
    this.loadDrivers();
    this.loadProducts();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] || changes['delivery']) {
      this.initForm();
    }
  }

  private initForm(): void {
    const deliveryData = this.delivery();
    if (deliveryData) {
      this.deliveryForm.patchValue({
        customerId: deliveryData.customerId,
        driverId: deliveryData.driverId,
        deliveryDate: this.formatDateForInput(new Date(deliveryData.deliveryDate)),
        notes: deliveryData.notes || ''
      });

      // Clear existing items and add delivery items
      while (this.itemsFormArray.length) {
        this.itemsFormArray.removeAt(0);
      }

      deliveryData.items.forEach(item => {
        this.itemsFormArray.push(this.createItemFormGroup({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice
        }));
      });
    } else {
      this.deliveryForm.reset({
        customerId: null,
        driverId: null,
        deliveryDate: this.formatDateForInput(new Date()),
        notes: ''
      });
      while (this.itemsFormArray.length) {
        this.itemsFormArray.removeAt(0);
      }
    }
  }

  private loadCustomers(): void {
    this.customerService.getCustomers({ size: 1000, active: true }).subscribe({
      next: (response) => {
        this.customers.set(response.data);
      }
    });
  }

  private loadDrivers(): void {
    this.driverService.getDrivers({ size: 1000, active: true }).subscribe({
      next: (response) => {
        this.drivers.set(response.data);
      }
    });
  }

  private loadProducts(): void {
    this.productService.getProducts({ size: 1000, active: true }).subscribe({
      next: (response) => {
        this.products.set(response.data);
      }
    });
  }

  private createItemFormGroup(item?: Partial<ItemFormGroup>): FormGroup {
    return this.fb.group({
      productId: [item?.productId || '', Validators.required],
      productName: [item?.productName || ''],
      quantity: [item?.quantity || 1, [Validators.required, Validators.min(1)]],
      unitPrice: [item?.unitPrice || 0, [Validators.required, Validators.min(0)]],
      totalPrice: [item?.totalPrice || 0]
    });
  }

  addItem(): void {
    this.itemsFormArray.push(this.createItemFormGroup());
  }

  removeItem(index: number): void {
    this.itemsFormArray.removeAt(index);
  }

  getItemControl(index: number, controlName: string): any {
    return this.itemsFormArray.at(index).get(controlName);
  }

  getItemValue(index: number, controlName: string): any {
    return this.itemsFormArray.at(index).get(controlName)?.value;
  }

  onCustomerChange(customerId: string): void {
    const customerIdNum = Number(customerId);
    const customer = this.customers().find(c => c.id === customerIdNum);
    if (customer && customer.driverId && !this.deliveryForm.value.driverId) {
      this.deliveryForm.patchValue({ driverId: customer.driverId });
    }
  }

  onProductChange(index: number, productId: string): void {
    const product = this.products().find(p => p.id === productId);
    if (product) {
      const itemGroup = this.itemsFormArray.at(index);
      itemGroup.patchValue({
        productName: product.name,
        unitPrice: product.price
      });
      this.updateItemTotal(index);
    }
  }

  updateItemTotal(index: number): void {
    const itemGroup = this.itemsFormArray.at(index);
    const quantity = itemGroup.get('quantity')?.value || 0;
    const unitPrice = itemGroup.get('unitPrice')?.value || 0;
    itemGroup.patchValue({ totalPrice: quantity * unitPrice });
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onSave(): void {
    if (this.deliveryForm.invalid || this.itemsFormArray.length === 0) {
      this.deliveryForm.markAllAsTouched();
      return;
    }

    const formValue = this.deliveryForm.getRawValue();

    const items: CreateDeliveryItemDto[] = this.itemsFormArray.controls.map(control => ({
      productId: control.get('productId')?.value,
      quantity: control.get('quantity')?.value,
      unitPrice: control.get('unitPrice')?.value
    }));

    const deliveryData: CreateDeliveryDto = {
      customerId: formValue.customerId!,
      driverId: formValue.driverId,
      deliveryDate: formValue.deliveryDate,
      notes: formValue.notes || null,
      items
    };

    const result: DeliveryDialogResult = {
      action: 'save',
      data: deliveryData
    };

    this.save.emit(result);
  }

  private formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
