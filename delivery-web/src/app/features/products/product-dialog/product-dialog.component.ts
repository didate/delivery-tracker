import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
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
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule
  ],
  template: `
    <h2 mat-dialog-title>{{ isEditMode ? 'Edit Product' : 'Create Product' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="productForm" class="product-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Code</mat-label>
          <input matInput formControlName="code" placeholder="Enter product code">
          @if (productForm.controls.code.hasError('required')) {
            <mat-error>Code is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Name</mat-label>
          <input matInput formControlName="name" placeholder="Enter product name">
          @if (productForm.controls.name.hasError('required')) {
            <mat-error>Name is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" placeholder="Enter product description" rows="3"></textarea>
        </mat-form-field>

        @if (!isEditMode) {
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Price</mat-label>
            <input matInput type="number" formControlName="price" placeholder="Enter price" min="0" step="0.01">
            @if (productForm.controls.price.hasError('required')) {
              <mat-error>Price is required</mat-error>
            }
            @if (productForm.controls.price.hasError('min')) {
              <mat-error>Price must be positive</mat-error>
            }
          </mat-form-field>
        }

        <div class="toggle-container">
          <mat-slide-toggle formControlName="active">Active</mat-slide-toggle>
        </div>

        @if (errorMessage()) {
          <div class="error-message">{{ errorMessage() }}</div>
        }
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close [disabled]="isLoading()">Cancel</button>
      <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="isLoading() || productForm.invalid">
        @if (isLoading()) {
          <mat-spinner diameter="20"></mat-spinner>
        } @else {
          {{ isEditMode ? 'Update' : 'Create' }}
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .product-form {
      display: flex;
      flex-direction: column;
      min-width: 400px;
      padding-top: 16px;
    }
    .full-width {
      width: 100%;
    }
    .toggle-container {
      margin: 16px 0;
    }
    .error-message {
      color: #f44336;
      font-size: 12px;
      margin-top: 8px;
    }
    mat-dialog-content {
      max-height: 70vh;
    }
  `]
})
export class ProductDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<ProductDialogComponent>);
  private readonly productService = inject(ProductService);
  readonly data = inject<ProductDialogData>(MAT_DIALOG_DATA);

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly isEditMode = !!this.data?.product;

  readonly productForm = this.fb.nonNullable.group({
    code: [this.data?.product?.code ?? '', [Validators.required]],
    name: [this.data?.product?.name ?? '', [Validators.required]],
    description: [this.data?.product?.description ?? ''],
    price: [this.data?.product?.price ?? 0, [Validators.required, Validators.min(0)]],
    active: [this.data?.product?.active ?? true]
  });

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
