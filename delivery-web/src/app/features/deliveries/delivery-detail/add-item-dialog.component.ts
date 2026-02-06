import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

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
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    CurrencyPipe,
  ],
  template: `
    <h2 mat-dialog-title>Add Item</h2>

    <mat-dialog-content>
      <form [formGroup]="itemForm" class="item-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Product</mat-label>
          <mat-select formControlName="productId" (selectionChange)="onProductChange($event.value)">
            @for (product of products(); track product.id) {
              <mat-option [value]="product.id">
                {{ product.name }} - {{ product.price | currency }}
              </mat-option>
            }
          </mat-select>
          @if (itemForm.controls.productId.hasError('required') && itemForm.controls.productId.touched) {
            <mat-error>Product is required</mat-error>
          }
        </mat-form-field>

        <div class="form-row two-columns">
          <mat-form-field appearance="outline">
            <mat-label>Quantity</mat-label>
            <input matInput type="number" min="1" formControlName="quantity">
            @if (itemForm.controls.quantity.hasError('required') && itemForm.controls.quantity.touched) {
              <mat-error>Quantity is required</mat-error>
            }
            @if (itemForm.controls.quantity.hasError('min')) {
              <mat-error>Minimum quantity is 1</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Unit Price</mat-label>
            <input matInput type="number" min="0" step="0.01" formControlName="unitPrice">
            @if (itemForm.controls.unitPrice.hasError('required') && itemForm.controls.unitPrice.touched) {
              <mat-error>Unit price is required</mat-error>
            }
          </mat-form-field>
        </div>

        <div class="total-preview">
          <span>Total:</span>
          <strong>{{ totalPrice() | currency }}</strong>
        </div>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button
        mat-raised-button
        color="primary"
        (click)="onAdd()"
        [disabled]="itemForm.invalid">
        Add Item
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .item-form {
      display: flex;
      flex-direction: column;
      gap: 8px;
      min-width: 400px;
      padding-top: 8px;
    }

    .full-width {
      width: 100%;
    }

    .form-row.two-columns {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    mat-form-field {
      width: 100%;
    }

    .total-preview {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background-color: #f5f5f5;
      border-radius: 4px;
      margin-top: 8px;
    }

    .total-preview strong {
      font-size: 18px;
      color: #4caf50;
    }

    mat-dialog-content {
      max-height: 70vh;
      overflow-y: auto;
    }

    mat-dialog-actions {
      padding: 16px 0 0 0;
    }
  `]
})
export class AddItemDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<AddItemDialogComponent>);
  private readonly productService = inject(ProductService);

  readonly products = signal<Product[]>([]);

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
