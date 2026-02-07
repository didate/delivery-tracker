import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Product, CreateProductDto, UpdateProductDto } from '../models/product.model';
import { ProductService } from '../services/product.service';

export interface ProductDialogData {
  product?: Product;
}

@Component({
  selector: 'app-product-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    InputNumberModule,
    TextareaModule,
    ButtonModule,
    ToggleSwitchModule,
    ProgressSpinnerModule
  ],
  template: `
    <form [formGroup]="productForm" class="product-form">
      <div class="field">
        <label for="code">Code</label>
        <input id="code" type="text" pInputText formControlName="code" placeholder="Enter product code" class="w-full" />
        @if (productForm.controls.code.invalid && productForm.controls.code.touched) {
          <small class="p-error">Code is required</small>
        }
      </div>

      <div class="field">
        <label for="name">Name</label>
        <input id="name" type="text" pInputText formControlName="name" placeholder="Enter product name" class="w-full" />
        @if (productForm.controls.name.invalid && productForm.controls.name.touched) {
          <small class="p-error">Name is required</small>
        }
      </div>

      <div class="field">
        <label for="description">Description</label>
        <textarea id="description" pTextarea formControlName="description" placeholder="Enter product description" rows="3" class="w-full"></textarea>
      </div>

      @if (!isEditMode) {
        <div class="field">
          <label for="price">Price</label>
          <p-inputNumber
            id="price"
            formControlName="price"
            mode="currency"
            currency="USD"
            locale="en-US"
            [min]="0"
            placeholder="Enter price"
            styleClass="w-full">
          </p-inputNumber>
          @if (productForm.controls.price.invalid && productForm.controls.price.touched) {
            @if (productForm.controls.price.hasError('required')) {
              <small class="p-error">Price is required</small>
            }
            @if (productForm.controls.price.hasError('min')) {
              <small class="p-error">Price must be positive</small>
            }
          }
        </div>
      }

      <div class="field switch-field">
        <p-toggleswitch formControlName="active"></p-toggleswitch>
        <label>Active</label>
      </div>

      @if (errorMessage()) {
        <div class="error-message">{{ errorMessage() }}</div>
      }

      <div class="dialog-actions">
        <p-button label="Cancel" severity="secondary" [text]="true" (onClick)="onCancel()" [disabled]="isLoading()"></p-button>
        <p-button
          [label]="isEditMode ? 'Update' : 'Create'"
          (onClick)="onSubmit()"
          [disabled]="isLoading() || productForm.invalid"
          [loading]="isLoading()">
        </p-button>
      </div>
    </form>
  `,
  styles: [`
    .product-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 400px;
    }
    .field {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .field label {
      font-weight: 500;
    }
    .switch-field {
      flex-direction: row;
      align-items: center;
      gap: 12px;
    }
    .w-full {
      width: 100%;
    }
    .error-message {
      color: var(--red-500);
      font-size: 12px;
    }
    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid var(--surface-border);
    }
    :host ::ng-deep .p-inputnumber {
      width: 100%;
    }
    :host ::ng-deep .p-inputnumber-input {
      width: 100%;
    }
  `]
})
export class ProductDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject<DynamicDialogRef<any>>(DynamicDialogRef);
  private readonly dialogConfig = inject(DynamicDialogConfig);
  private readonly productService = inject(ProductService);

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly data: ProductDialogData = this.dialogConfig.data || {};
  readonly isEditMode = !!this.data?.product;

  readonly productForm = this.fb.nonNullable.group({
    code: [this.data?.product?.code ?? '', [Validators.required]],
    name: [this.data?.product?.name ?? '', [Validators.required]],
    description: [this.data?.product?.description ?? ''],
    price: [this.data?.product?.price ?? 0, [Validators.required, Validators.min(0)]],
    active: [this.data?.product?.active ?? true]
  });

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const formValue = this.productForm.getRawValue();

    if (this.isEditMode && this.data.product) {
      const updateDto: UpdateProductDto = {
        code: formValue.code,
        name: formValue.name,
        description: formValue.description,
        active: formValue.active
      };

      this.productService.updateProduct(this.data.product.id, updateDto).subscribe({
        next: (product) => {
          this.isLoading.set(false);
          this.dialogRef.close(product);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.message || 'Failed to update product');
        }
      });
    } else {
      const createDto: CreateProductDto = {
        code: formValue.code,
        name: formValue.name,
        description: formValue.description,
        price: formValue.price,
        active: formValue.active
      };

      this.productService.createProduct(createDto).subscribe({
        next: (product) => {
          this.isLoading.set(false);
          this.dialogRef.close(product);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.message || 'Failed to create product');
        }
      });
    }
  }
}
