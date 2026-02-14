import { Component, inject, signal, input, output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormArray, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { Return, CreateReturnDto, UpdateReturnDto, CreateReturnItemDto } from '../models/return.model';
import { Customer } from '../../customers/models/customer.model';
import { Product } from '../../products/models/product.model';
import { CustomerService } from '../../customers/services/customer.service';
import { ProductService } from '../../products/services/product.service';

export interface ReturnDialogData {
  returnData?: Return;
  mode: 'create' | 'edit';
}

export interface ReturnDialogResult {
  action: 'save';
  data: CreateReturnDto | UpdateReturnDto;
}

interface CustomerOption {
  label: string;
  value: number;
}

interface ProductOption {
  label: string;
  value: string;
  price: number;
}

@Component({
  selector: 'app-return-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent],
  template: `
    <app-modal
      [isOpen]="isOpen()"
      [title]="mode() === 'edit' ? 'Edit Return' : 'Create Return'"
      maxWidth="700px"
      (close)="onCancel()">

      <form [formGroup]="returnForm" (ngSubmit)="onSave()" class="space-y-4">
        <!-- Customer and Return Date -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="customerId" class="block text-sm font-medium text-gray-700 mb-1">Customer *</label>
            <div class="relative">
              <select
                id="customerId"
                formControlName="customerId"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                [class.border-red-500]="returnForm.controls.customerId.invalid && returnForm.controls.customerId.touched">
                <option [ngValue]="null">Select customer</option>
                @for (option of customerOptions(); track option.value) {
                  <option [ngValue]="option.value">{{ option.label }}</option>
                }
              </select>
              <i class="pi pi-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-sm"></i>
            </div>
            @if (returnForm.controls.customerId.hasError('required') && returnForm.controls.customerId.touched) {
              <p class="mt-1 text-sm text-red-600">Customer is required</p>
            }
          </div>

          <div>
            <label for="returnDate" class="block text-sm font-medium text-gray-700 mb-1">Return Date *</label>
            <input
              id="returnDate"
              type="date"
              formControlName="returnDate"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              [class.border-red-500]="returnForm.controls.returnDate.invalid && returnForm.controls.returnDate.touched" />
            @if (returnForm.controls.returnDate.hasError('required') && returnForm.controls.returnDate.touched) {
              <p class="mt-1 text-sm text-red-600">Return date is required</p>
            }
          </div>
        </div>

        <!-- Notes -->
        <div>
          <label for="notes" class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            id="notes"
            formControlName="notes"
            rows="2"
            placeholder="Enter notes (optional)"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          </textarea>
        </div>

        @if (!isEditMode()) {
          <!-- Divider -->
          <div class="border-t border-gray-200 pt-4">
            <!-- Items Section -->
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-semibold text-gray-900">Return Items</h3>
              <button
                type="button"
                (click)="addItem()"
                class="px-3 py-1.5 text-blue-600 hover:bg-blue-50 font-medium rounded-lg transition-colors flex items-center gap-1 text-sm">
                <i class="pi pi-plus"></i>
                Add Item
              </button>
            </div>

            @if (items.length === 0) {
              <div class="text-center py-6 bg-gray-50 rounded-lg text-gray-500 text-sm italic">
                No items added yet. Click "Add Item" to add products to this return.
              </div>
            }

            <div formArrayName="items" class="space-y-4">
              @for (item of items.controls; track $index; let i = $index) {
                <div class="border border-gray-200 rounded-lg p-4" [formGroupName]="i">
                  <div class="flex items-center justify-between mb-3">
                    <span class="text-sm font-medium text-gray-600">Item {{ i + 1 }}</span>
                    <button
                      type="button"
                      (click)="removeItem(i)"
                      class="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Remove item">
                      <i class="pi pi-trash text-sm"></i>
                    </button>
                  </div>

                  <div class="grid grid-cols-12 gap-3 mb-3">
                    <!-- Product -->
                    <div class="col-span-5">
                      <label class="block text-xs font-medium text-gray-600 mb-1">Product *</label>
                      <div class="relative">
                        <select
                          formControlName="productId"
                          (change)="onProductChange(i)"
                          class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                          [class.border-red-500]="getItemControl(i, 'productId').invalid && getItemControl(i, 'productId').touched">
                          <option [ngValue]="null">Select product</option>
                          @for (option of productOptions(); track option.value) {
                            <option [ngValue]="option.value">{{ option.label }}</option>
                          }
                        </select>
                        <i class="pi pi-chevron-down absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs"></i>
                      </div>
                      @if (getItemControl(i, 'productId').hasError('required') && getItemControl(i, 'productId').touched) {
                        <p class="mt-0.5 text-xs text-red-600">Required</p>
                      }
                    </div>

                    <!-- Quantity -->
                    <div class="col-span-2">
                      <label class="block text-xs font-medium text-gray-600 mb-1">Qty *</label>
                      <input
                        type="number"
                        formControlName="quantity"
                        min="1"
                        (input)="calculateItemTotal(i)"
                        class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        [class.border-red-500]="getItemControl(i, 'quantity').invalid && getItemControl(i, 'quantity').touched" />
                      @if (getItemControl(i, 'quantity').hasError('required') && getItemControl(i, 'quantity').touched) {
                        <p class="mt-0.5 text-xs text-red-600">Required</p>
                      }
                      @if (getItemControl(i, 'quantity').hasError('min') && getItemControl(i, 'quantity').touched) {
                        <p class="mt-0.5 text-xs text-red-600">Min 1</p>
                      }
                    </div>

                    <!-- Unit Value -->
                    <div class="col-span-3">
                      <label class="block text-xs font-medium text-gray-600 mb-1">Unit Value *</label>
                      <div class="relative">
                        <span class="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                        <input
                          type="number"
                          formControlName="unitValue"
                          min="0"
                          step="0.01"
                          (input)="calculateItemTotal(i)"
                          class="w-full pl-6 pr-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          [class.border-red-500]="getItemControl(i, 'unitValue').invalid && getItemControl(i, 'unitValue').touched" />
                      </div>
                      @if (getItemControl(i, 'unitValue').hasError('required') && getItemControl(i, 'unitValue').touched) {
                        <p class="mt-0.5 text-xs text-red-600">Required</p>
                      }
                    </div>

                    <!-- Item Total -->
                    <div class="col-span-2 flex flex-col justify-end">
                      <div class="bg-blue-50 rounded-lg px-2 py-1.5 text-center">
                        <span class="text-xs text-gray-500 block">Total</span>
                        <span class="text-sm font-semibold text-blue-600">\${{ getItemTotal(i) | number:'1.2-2' }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Reason -->
                  <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">Reason *</label>
                    <input
                      type="text"
                      formControlName="reason"
                      placeholder="Enter reason for return"
                      class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      [class.border-red-500]="getItemControl(i, 'reason').invalid && getItemControl(i, 'reason').touched" />
                    @if (getItemControl(i, 'reason').hasError('required') && getItemControl(i, 'reason').touched) {
                      <p class="mt-0.5 text-xs text-red-600">Reason is required</p>
                    }
                  </div>
                </div>
              }
            </div>

            @if (items.length > 0) {
              <div class="flex justify-end mt-4">
                <div class="bg-green-50 rounded-lg px-4 py-3 flex items-center gap-4">
                  <span class="text-sm font-medium text-gray-700">Grand Total:</span>
                  <span class="text-xl font-bold text-green-600">\${{ getGrandTotal() | number:'1.2-2' }}</span>
                </div>
              </div>
            }
          </div>
        }

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
            [disabled]="returnForm.invalid || isSaving() || (!isEditMode() && items.length === 0)"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors flex items-center gap-2">
            @if (isSaving()) {
              <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            }
            {{ isEditMode() ? 'Update' : 'Create' }}
          </button>
        </div>
      </form>
    </app-modal>
  `,
})
export class ReturnDialogComponent implements OnInit, OnChanges {
  private readonly fb = inject(FormBuilder);
  private readonly customerService = inject(CustomerService);
  private readonly productService = inject(ProductService);

  isOpen = input<boolean>(false);
  mode = input<'create' | 'edit'>('create');
  returnData = input<Return | null>(null);

  save = output<ReturnDialogResult>();
  cancel = output<void>();

  readonly isSaving = signal(false);
  readonly isEditMode = signal(false);
  readonly customers = signal<Customer[]>([]);
  readonly products = signal<Product[]>([]);
  readonly customerOptions = signal<CustomerOption[]>([]);
  readonly productOptions = signal<ProductOption[]>([]);

  readonly returnForm = this.fb.nonNullable.group({
    customerId: [null as number | null, [Validators.required]],
    returnDate: ['', [Validators.required]],
    notes: [''],
    items: this.fb.array<FormGroup>([]),
  });

  get items(): FormArray {
    return this.returnForm.controls.items;
  }

  ngOnInit(): void {
    this.loadCustomers();
    this.loadProducts();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['mode'] || changes['isOpen']) {
      this.isEditMode.set(this.mode() === 'edit');
    }

    if (changes['returnData'] || changes['isOpen']) {
      this.initForm();
    }
  }

  private initForm(): void {
    const data = this.returnData();
    if (data) {
      const returnDate = typeof data.returnDate === 'string'
        ? data.returnDate.split('T')[0]
        : '';

      this.returnForm.patchValue({
        customerId: data.customerId,
        returnDate: returnDate,
        notes: data.notes || '',
      });
    } else {
      const today = new Date().toISOString().split('T')[0];
      this.returnForm.reset({
        customerId: null,
        returnDate: today,
        notes: '',
      });
      this.items.clear();
    }
  }

  private loadCustomers(): void {
    this.customerService.getCustomers({ size: 1000, active: true }).subscribe({
      next: (response) => {
        this.customers.set(response.data);
        this.customerOptions.set(
          response.data.map(c => ({
            label: `${c.name} (${c.code})`,
            value: c.id
          }))
        );
      },
      error: (err) => {
        console.error('Failed to load customers:', err);
      }
    });
  }

  private loadProducts(): void {
    this.productService.getProducts({ size: 1000, active: true }).subscribe({
      next: (response) => {
        this.products.set(response.data);
        this.productOptions.set(
          response.data.map(p => ({
            label: `${p.name} (${p.code})`,
            value: p.id,
            price: p.price
          }))
        );
      },
      error: (err) => {
        console.error('Failed to load products:', err);
      }
    });
  }

  addItem(): void {
    const itemGroup = this.fb.group({
      productId: [null as string | null, [Validators.required]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      reason: ['', [Validators.required]],
      unitValue: [0, [Validators.required, Validators.min(0)]],
    });

    this.items.push(itemGroup);
  }

  removeItem(index: number): void {
    this.items.removeAt(index);
  }

  getItemControl(index: number, controlName: string) {
    return (this.items.at(index) as FormGroup).controls[controlName];
  }

  onProductChange(index: number): void {
    const itemGroup = this.items.at(index) as FormGroup;
    const productId = itemGroup.get('productId')?.value;
    const productOption = this.productOptions().find(p => p.value === productId);

    if (productOption) {
      itemGroup.patchValue({ unitValue: productOption.price });
    }
  }

  calculateItemTotal(index: number): void {
    // This triggers change detection for the template
  }

  getItemTotal(index: number): number {
    const itemGroup = this.items.at(index) as FormGroup;
    const quantity = itemGroup.get('quantity')?.value || 0;
    const unitValue = itemGroup.get('unitValue')?.value || 0;
    return quantity * unitValue;
  }

  getGrandTotal(): number {
    let total = 0;
    for (let i = 0; i < this.items.length; i++) {
      total += this.getItemTotal(i);
    }
    return total;
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onSave(): void {
    if (this.returnForm.invalid) {
      this.returnForm.markAllAsTouched();
      return;
    }

    const formValue = this.returnForm.getRawValue();
    const returnDate = formValue.returnDate;

    if (this.isEditMode()) {
      const updateData: UpdateReturnDto = {
        customerId: formValue.customerId!,
        returnDate: returnDate,
        notes: formValue.notes || undefined,
      };

      const result: ReturnDialogResult = {
        action: 'save',
        data: updateData,
      };

      this.save.emit(result);
    } else {
      const items: CreateReturnItemDto[] = formValue.items.map((item: Record<string, unknown>) => ({
        productId: item['productId'] as string,
        quantity: item['quantity'] as number,
        reason: item['reason'] as string,
        unitValue: item['unitValue'] as number,
      }));

      const createData: CreateReturnDto = {
        customerId: formValue.customerId!,
        returnDate: returnDate,
        notes: formValue.notes || undefined,
        items,
      };

      const result: ReturnDialogResult = {
        action: 'save',
        data: createData,
      };

      this.save.emit(result);
    }
  }
}
