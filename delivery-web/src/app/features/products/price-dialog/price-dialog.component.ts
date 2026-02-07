import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { DividerModule } from 'primeng/divider';
import { Product, PriceHistory } from '../models/product.model';
import { ProductService } from '../services/product.service';

export interface PriceDialogData {
  product: Product;
}

@Component({
  selector: 'app-price-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputNumberModule,
    ButtonModule,
    ProgressSpinnerModule,
    TableModule,
    DividerModule,
    CurrencyPipe,
    DatePipe
  ],
  template: `
    <div class="dialog-content">
      <div class="current-price">
        <span class="label">Current Price:</span>
        <span class="value">{{ data.product.price | currency }}</span>
      </div>

      <form [formGroup]="priceForm" class="price-form">
        <div class="field">
          <label for="price">New Price</label>
          <p-inputNumber
            id="price"
            formControlName="price"
            mode="currency"
            currency="USD"
            [min]="0"
            styleClass="w-full">
          </p-inputNumber>
          @if (priceForm.controls.price.hasError('required') && priceForm.controls.price.touched) {
            <small class="p-error">Price is required</small>
          }
          @if (priceForm.controls.price.hasError('min')) {
            <small class="p-error">Price must be positive</small>
          }
        </div>

        @if (errorMessage()) {
          <div class="error-message">{{ errorMessage() }}</div>
        }
      </form>

      <p-divider></p-divider>

      <div class="price-history-section">
        <h3>Price History</h3>
        @if (isLoadingHistory()) {
          <div class="loading-container">
            <p-progressSpinner [style]="{width: '30px', height: '30px'}"></p-progressSpinner>
          </div>
        } @else if (priceHistory().length > 0) {
          <p-table [value]="priceHistory()" styleClass="p-datatable-sm">
            <ng-template pTemplate="header">
              <tr>
                <th>Price</th>
                <th>Changed Date</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-row>
              <tr>
                <td>{{ row.price | currency }}</td>
                <td>{{ row.changedDate | date:'medium' }}</td>
              </tr>
            </ng-template>
          </p-table>
        } @else {
          <p class="no-history">No price history available</p>
        }
      </div>

      <div class="dialog-actions">
        <p-button
          label="Cancel"
          severity="secondary"
          (onClick)="onCancel()"
          [disabled]="isLoading()">
        </p-button>
        <p-button
          label="Update Price"
          icon="pi pi-check"
          (onClick)="onSubmit()"
          [disabled]="isLoading() || priceForm.invalid"
          [loading]="isLoading()">
        </p-button>
      </div>
    </div>
  `,
  styles: [`
    .dialog-content {
      min-width: 400px;
    }

    .current-price {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
      padding: 12px;
      background-color: var(--surface-100);
      border-radius: 4px;
    }

    .current-price .label {
      font-weight: 500;
      color: var(--text-color-secondary);
    }

    .current-price .value {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--primary-color);
    }

    .price-form {
      display: flex;
      flex-direction: column;
      padding-top: 8px;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .field label {
      font-weight: 500;
    }

    .w-full {
      width: 100%;
    }

    .error-message {
      color: var(--red-500);
      font-size: 12px;
      margin-top: 8px;
    }

    .price-history-section h3 {
      margin: 16px 0 8px 0;
      font-size: 14px;
      font-weight: 500;
      color: var(--text-color-secondary);
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 24px;
    }

    .no-history {
      text-align: center;
      color: var(--text-color-secondary);
      padding: 16px;
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
export class PriceDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(DynamicDialogRef);
  private readonly dialogConfig = inject(DynamicDialogConfig);
  private readonly productService = inject(ProductService);

  readonly data: PriceDialogData = this.dialogConfig.data;

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

  private loadPriceHistory(): void {
    this.isLoadingHistory.set(true);
    this.productService.getPriceHistory(this.data.product.id).subscribe({
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
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.priceForm.invalid) {
      this.priceForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const newPrice = this.priceForm.controls.price.value;

    this.productService.updatePrice(this.data.product.id, { price: newPrice }).subscribe({
      next: (product) => {
        this.isLoading.set(false);
        this.dialogRef.close(product);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message || 'Failed to update price');
      }
    });
  }
}
