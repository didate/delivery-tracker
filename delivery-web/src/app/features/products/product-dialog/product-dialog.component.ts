import { Component, inject, signal, input, output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { Product, CreateProductDto, UpdateProductDto } from '../models/product.model';

export interface ProductDialogData {
  product?: Product;
  mode: 'create' | 'edit';
}

export interface ProductDialogResult {
  action: 'save';
  data: CreateProductDto | UpdateProductDto;
}

@Component({
  selector: 'app-product-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent],
  template: `
    <app-modal
      [isOpen]="isOpen()"
      [title]="mode() === 'edit' ? 'Edit Product' : 'Add Product'"
      maxWidth="500px"
      (close)="onCancel()">

      <form [formGroup]="productForm" (ngSubmit)="onSave()" class="space-y-4">
        <!-- Code -->
        <div>
          <label for="code" class="block text-sm font-medium text-gray-700 mb-1">Code</label>
          <input
            id="code"
            type="text"
            formControlName="code"
            placeholder="Enter product code"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            [class.border-red-500]="productForm.controls.code.invalid && productForm.controls.code.touched" />
          @if (productForm.controls.code.hasError('required') && productForm.controls.code.touched) {
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
            placeholder="Enter product name"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            [class.border-red-500]="productForm.controls.name.invalid && productForm.controls.name.touched" />
          @if (productForm.controls.name.hasError('required') && productForm.controls.name.touched) {
            <p class="mt-1 text-sm text-red-600">Name is required</p>
          }
        </div>

        <!-- Description -->
        <div>
          <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            id="description"
            formControlName="description"
            placeholder="Enter product description"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          </textarea>
        </div>

        <!-- Price (only for create mode) -->
        @if (mode() === 'create') {
          <div>
            <label for="price" class="block text-sm font-medium text-gray-700 mb-1">Price</label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                id="price"
                type="number"
                formControlName="price"
                placeholder="0.00"
                min="0"
                step="0.01"
                class="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                [class.border-red-500]="productForm.controls.price.invalid && productForm.controls.price.touched" />
            </div>
            @if (productForm.controls.price.hasError('required') && productForm.controls.price.touched) {
              <p class="mt-1 text-sm text-red-600">Price is required</p>
            }
            @if (productForm.controls.price.hasError('min') && productForm.controls.price.touched) {
              <p class="mt-1 text-sm text-red-600">Price must be positive</p>
            }
          </div>
        }

        <!-- Active -->
        <div class="flex items-center gap-3">
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" formControlName="active" class="sr-only peer">
            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
          <span class="text-sm font-medium text-gray-700">Active</span>
        </div>

        @if (errorMessage()) {
          <div class="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {{ errorMessage() }}
          </div>
        }

        <!-- Actions -->
        <div class="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-6">
          <button
            type="button"
            (click)="onCancel()"
            [disabled]="isSaving()"
            class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 font-medium rounded-lg transition-colors">
            Cancel
          </button>
          <button
            type="submit"
            [disabled]="productForm.invalid || isSaving()"
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
export class ProductDialogComponent implements OnInit, OnChanges {
  private readonly fb = inject(FormBuilder);

  isOpen = input<boolean>(false);
  mode = input<'create' | 'edit'>('create');
  product = input<Product | null>(null);

  save = output<ProductDialogResult>();
  cancel = output<void>();

  readonly isSaving = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly productForm = this.fb.nonNullable.group({
    code: ['', [Validators.required]],
    name: ['', [Validators.required]],
    description: [''],
    price: [0, [Validators.required, Validators.min(0)]],
    active: [true]
  });

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product'] || changes['isOpen']) {
      this.initForm();
    }
  }

  private initForm(): void {
    const productData = this.product();
    if (productData) {
      this.productForm.patchValue({
        code: productData.code,
        name: productData.name,
        description: productData.description,
        price: productData.price,
        active: productData.active
      });
    } else {
      this.productForm.reset({ price: 0, active: true });
    }
    this.errorMessage.set(null);
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onSave(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const formValue = this.productForm.getRawValue();

    let productData: CreateProductDto | UpdateProductDto;

    if (this.mode() === 'edit') {
      productData = {
        code: formValue.code,
        name: formValue.name,
        description: formValue.description,
        active: formValue.active
      } as UpdateProductDto;
    } else {
      productData = {
        code: formValue.code,
        name: formValue.name,
        description: formValue.description,
        price: formValue.price,
        active: formValue.active
      } as CreateProductDto;
    }

    const result: ProductDialogResult = {
      action: 'save',
      data: productData
    };

    this.save.emit(result);
  }
}
