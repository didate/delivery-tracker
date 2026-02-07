import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';

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
    SelectModule,
    InputNumberModule,
    ButtonModule,
    CurrencyPipe,
  ],
  template: `
    <div class="dialog-content">
      <form [formGroup]="itemForm" class="item-form">
        <div class="field">
          <label for="product">Product</label>
          <p-select
            id="product"
            formControlName="productId"
            [options]="productOptions()"
            optionLabel="label"
            optionValue="value"
            placeholder="Select a product"
            [filter]="true"
            filterPlaceholder="Search products..."
            styleClass="w-full"
            (onChange)="onProductChange($event.value)"
          ></p-select>
          @if (itemForm.controls.productId.hasError('required') && itemForm.controls.productId.touched) {
            <small class="p-error">Product is required</small>
          }
        </div>

        <div class="form-row">
          <div class="field">
            <label for="quantity">Quantity</label>
            <p-inputNumber
              id="quantity"
              formControlName="quantity"
              [min]="1"
              [showButtons]="true"
              buttonLayout="horizontal"
              styleClass="w-full"
            ></p-inputNumber>
            @if (itemForm.controls.quantity.hasError('required') && itemForm.controls.quantity.touched) {
              <small class="p-error">Quantity is required</small>
            }
            @if (itemForm.controls.quantity.hasError('min')) {
              <small class="p-error">Minimum quantity is 1</small>
            }
          </div>

          <div class="field">
            <label for="unitPrice">Unit Price</label>
            <p-inputNumber
              id="unitPrice"
              formControlName="unitPrice"
              mode="currency"
              currency="USD"
              [min]="0"
              styleClass="w-full"
            ></p-inputNumber>
            @if (itemForm.controls.unitPrice.hasError('required') && itemForm.controls.unitPrice.touched) {
              <small class="p-error">Unit price is required</small>
            }
          </div>
        </div>

        <div class="total-preview">
          <span>Total:</span>
          <strong>{{ totalPrice() | currency }}</strong>
        </div>
      </form>

      <div class="dialog-actions">
        <p-button label="Cancel" severity="secondary" (onClick)="onCancel()"></p-button>
        <p-button label="Add Item" icon="pi pi-plus" (onClick)="onAdd()" [disabled]="itemForm.invalid"></p-button>
      </div>
    </div>
  `,
  styles: [`
    .dialog-content {
      min-width: 400px;
    }

    .item-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .field label {
      font-weight: 500;
      color: var(--text-color);
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .w-full {
      width: 100%;
    }

    .total-preview {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background-color: var(--surface-100);
      border-radius: 0.5rem;
      margin-top: 0.5rem;
    }

    .total-preview strong {
      font-size: 1.25rem;
      color: var(--green-500);
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid var(--surface-border);
    }
  `]
})
export class AddItemDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject<DynamicDialogRef<any>>(DynamicDialogRef);
  private readonly productService = inject(ProductService);

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
    this.dialogRef.close();
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

    this.dialogRef.close(result);
  }
}
