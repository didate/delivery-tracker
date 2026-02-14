import { Component, inject, signal, input, output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { Product, PriceHistory } from '../models/product.model';
import { ProductService } from '../services/product.service';

export interface PriceDialogData {
  product: Product;
}

export interface PriceDialogResult {
  action: 'save';
  price: number;
}

@Component({
  selector: 'app-price-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent, CurrencyPipe, DatePipe],
  template: `
    <app-modal
      [isOpen]="isOpen()"
      title="Update Price"
      maxWidth="500px"
      (close)="onCancel()">

      <div class="space-y-4">
        <!-- Current Price -->
        @if (product()) {
          <div class="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <span class="text-sm font-medium text-gray-500">Current Price:</span>
            <span class="text-lg font-semibold text-blue-600">{{ product()!.price | currency }}</span>
          </div>
        }

        <!-- New Price Form -->
        <form [formGroup]="priceForm" (ngSubmit)="onSubmit()">
          <div>
            <label for="price" class="block text-sm font-medium text-gray-700 mb-1">New Price</label>
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
                [class.border-red-500]="priceForm.controls.price.invalid && priceForm.controls.price.touched" />
            </div>
            @if (priceForm.controls.price.hasError('required') && priceForm.controls.price.touched) {
              <p class="mt-1 text-sm text-red-600">Price is required</p>
            }
            @if (priceForm.controls.price.hasError('min') && priceForm.controls.price.touched) {
              <p class="mt-1 text-sm text-red-600">Price must be positive</p>
            }
          </div>

          @if (errorMessage()) {
            <div class="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {{ errorMessage() }}
            </div>
          }
        </form>

        <!-- Divider -->
        <div class="border-t border-gray-200"></div>

        <!-- Price History -->
        <div>
          <h3 class="text-sm font-medium text-gray-500 mb-3">Price History</h3>

          @if (isLoadingHistory()) {
            <div class="flex justify-center py-6">
              <div class="w-6 h-6 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          } @else if (priceHistory().length > 0) {
            <div class="overflow-hidden border border-gray-200 rounded-lg">
              <table class="w-full text-sm">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-3 py-2 text-left font-medium text-gray-600">Price</th>
                    <th class="px-3 py-2 text-left font-medium text-gray-600">Changed Date</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  @for (row of priceHistory(); track row.id) {
                    <tr class="hover:bg-gray-50">
                      <td class="px-3 py-2 text-gray-900 font-medium">{{ row.price | currency }}</td>
                      <td class="px-3 py-2 text-gray-600">{{ row.changedDate | date:'medium' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          } @else {
            <p class="text-center text-gray-500 py-4">No price history available</p>
          }
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            (click)="onCancel()"
            [disabled]="isLoading()"
            class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 font-medium rounded-lg transition-colors">
            Cancel
          </button>
          <button
            type="button"
            (click)="onSubmit()"
            [disabled]="priceForm.invalid || isLoading()"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors flex items-center gap-2">
            @if (isLoading()) {
              <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            }
            <i class="pi pi-check"></i>
            Update Price
          </button>
        </div>
      </div>
    </app-modal>
  `,
})
export class PriceDialogComponent implements OnInit, OnChanges {
  private readonly fb = inject(FormBuilder);
  private readonly productService = inject(ProductService);

  isOpen = input<boolean>(false);
  product = input<Product | null>(null);

  save = output<PriceDialogResult>();
  cancel = output<void>();

  readonly isLoading = signal(false);
  readonly isLoadingHistory = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly priceHistory = signal<PriceHistory[]>([]);

  readonly priceForm = this.fb.nonNullable.group({
    price: [0, [Validators.required, Validators.min(0)]]
  });

  ngOnInit(): void {
    this.loadPriceHistory();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product'] || changes['isOpen']) {
      if (this.isOpen() && this.product()) {
        this.priceForm.reset({ price: 0 });
        this.errorMessage.set(null);
        this.loadPriceHistory();
      }
    }
  }

  private loadPriceHistory(): void {
    const productData = this.product();
    if (!productData) return;

    this.isLoadingHistory.set(true);
    this.productService.getPriceHistory(productData.id).subscribe({
      next: (history) => {
        this.priceHistory.set(history);
        this.isLoadingHistory.set(false);
      },
      error: () => {
        this.isLoadingHistory.set(false);
      }
    });
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onSubmit(): void {
    if (this.priceForm.invalid) {
      this.priceForm.markAllAsTouched();
      return;
    }

    const newPrice = this.priceForm.controls.price.value;

    const result: PriceDialogResult = {
      action: 'save',
      price: newPrice
    };

    this.save.emit(result);
  }
}
