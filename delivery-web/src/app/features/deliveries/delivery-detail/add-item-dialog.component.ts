import { Component, inject, signal, OnInit, OnChanges, SimpleChanges, input, output, computed } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { CreateDeliveryItemDto } from '../models/delivery.model';
import { Product } from '../../products/models/product.model';
import { ProductService } from '../../products/services/product.service';

export interface AddItemDialogResult {
  action: 'add';
  data: CreateDeliveryItemDto;
}

@Component({
  selector: 'app-add-item-dialog',
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
      title="Add Item"
      maxWidth="450px"
      (close)="onCancel()">

      <form [formGroup]="itemForm" class="space-y-4">
        <!-- Product -->
        <div>
          <label for="product" class="block text-sm font-medium text-gray-700 mb-1">Product</label>
          <select
            id="product"
            formControlName="productId"
            (change)="onProductChange($any($event.target).value)"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            [class.border-red-500]="itemForm.controls.productId.invalid && itemForm.controls.productId.touched">
            <option value="">Select a product</option>
            @for (product of productOptions(); track product.value) {
              <option [value]="product.value">{{ product.label }}</option>
            }
          </select>
          @if (itemForm.controls.productId.hasError('required') && itemForm.controls.productId.touched) {
            <p class="mt-1 text-sm text-red-600">Product is required</p>
          }
        </div>

        <!-- Quantity & Unit Price -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="quantity" class="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
            <input
              id="quantity"
              type="number"
              formControlName="quantity"
              min="1"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              [class.border-red-500]="itemForm.controls.quantity.invalid && itemForm.controls.quantity.touched" />
            @if (itemForm.controls.quantity.hasError('required') && itemForm.controls.quantity.touched) {
              <p class="mt-1 text-sm text-red-600">Quantity is required</p>
            }
            @if (itemForm.controls.quantity.hasError('min')) {
              <p class="mt-1 text-sm text-red-600">Minimum quantity is 1</p>
            }
          </div>

          <div>
            <label for="unitPrice" class="block text-sm font-medium text-gray-700 mb-1">Unit Price</label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                id="unitPrice"
                type="number"
                formControlName="unitPrice"
                min="0"
                step="0.01"
                class="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                [class.border-red-500]="itemForm.controls.unitPrice.invalid && itemForm.controls.unitPrice.touched" />
            </div>
            @if (itemForm.controls.unitPrice.hasError('required') && itemForm.controls.unitPrice.touched) {
              <p class="mt-1 text-sm text-red-600">Unit price is required</p>
            }
          </div>
        </div>

        <!-- Total Preview -->
        <div class="flex justify-between items-center px-4 py-3 bg-gray-50 rounded-lg">
          <span class="text-gray-600">Total:</span>
          <strong class="text-lg text-green-600">{{ totalPrice() | currency }}</strong>
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
            (click)="onAdd()"
            [disabled]="itemForm.invalid"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors flex items-center gap-2">
            <i class="pi pi-plus"></i>
            Add Item
          </button>
        </div>
      </form>
    </app-modal>
  `,
})
export class AddItemDialogComponent implements OnInit, OnChanges {
  private readonly fb = inject(FormBuilder);
  private readonly productService = inject(ProductService);

  isOpen = input<boolean>(false);

  add = output<AddItemDialogResult>();
  cancel = output<void>();

  readonly products = signal<Product[]>([]);
  readonly productOptions = computed(() =>
    this.products().map(p => ({
      label: `${p.name} - $${p.price.toFixed(2)}`,
      value: p.id
    }))
  );

  readonly itemForm = this.fb.nonNullable.group({
    productId: ['', [Validators.required]],
    quantity: [1, [Validators.required, Validators.min(1)]],
    unitPrice: [0, [Validators.required, Validators.min(0)]]
  });

  readonly totalPrice = computed(() => {
    const quantity = this.itemForm.value.quantity || 0;
    const unitPrice = this.itemForm.value.unitPrice || 0;
    return quantity * unitPrice;
  });

  ngOnInit(): void {
    this.loadProducts();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen()) {
      this.itemForm.reset({
        productId: '',
        quantity: 1,
        unitPrice: 0
      });
    }
  }

  private loadProducts(): void {
    this.productService.getProducts({ size: 1000, active: true }).subscribe({
      next: (response) => {
        this.products.set(response.data);
      }
    });
  }

  onProductChange(productId: string): void {
    const product = this.products().find(p => p.id === productId);
    if (product) {
      this.itemForm.patchValue({ unitPrice: product.price });
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onAdd(): void {
    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      return;
    }

    const formValue = this.itemForm.getRawValue();

    const itemData: CreateDeliveryItemDto = {
      productId: formValue.productId,
      quantity: formValue.quantity,
      unitPrice: formValue.unitPrice
    };

    const result: AddItemDialogResult = {
      action: 'add',
      data: itemData
    };

    this.add.emit(result);
  }
}
