import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
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
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatDividerModule,
    CurrencyPipe,
    DatePipe
  ],
  template: `
    <h2 mat-dialog-title>Update Price - {{ data.product.name }}</h2>
    <mat-dialog-content>
      <div class="current-price">
        <span class="label">Current Price:</span>
        <span class="value">{{ data.product.price | currency }}</span>
      </div>

      <form [formGroup]="priceForm" class="price-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>New Price</mat-label>
          <input matInput type="number" formControlName="price" placeholder="Enter new price" min="0" step="0.01">
          @if (priceForm.controls.price.hasError('required')) {
            <mat-error>Price is required</mat-error>
          }
          @if (priceForm.controls.price.hasError('min')) {
            <mat-error>Price must be positive</mat-error>
          }
        </mat-form-field>

        @if (errorMessage()) {
          <div class="error-message">{{ errorMessage() }}</div>
        }
      </form>

      <mat-divider></mat-divider>

      <div class="price-history-section">
        <h3>Price History</h3>
        @if (isLoadingHistory()) {
          <div class="loading-container">
            <mat-spinner diameter="30"></mat-spinner>
          </div>
        } @else if (priceHistory().length > 0) {
          <table mat-table [dataSource]="priceHistory()" class="price-history-table">
            <ng-container matColumnDef="price">
              <th mat-header-cell *matHeaderCellDef>Price</th>
              <td mat-cell *matCellDef="let row">{{ row.price | currency }}</td>
            </ng-container>

            <ng-container matColumnDef="changedDate">
              <th mat-header-cell *matHeaderCellDef>Changed Date</th>
              <td mat-cell *matCellDef="let row">{{ row.changedDate | date:'medium' }}</td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        } @else {
          <p class="no-history">No price history available</p>
        }
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close [disabled]="isLoading()">Cancel</button>
      <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="isLoading() || priceForm.invalid">
        @if (isLoading()) {
          <mat-spinner diameter="20"></mat-spinner>
        } @else {
          Update Price
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .current-price {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
      padding: 12px;
      background-color: #f5f5f5;
      border-radius: 4px;
    }
    .current-price .label {
      font-weight: 500;
      color: #666;
    }
    .current-price .value {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1976d2;
    }
    .price-form {
      display: flex;
      flex-direction: column;
      min-width: 400px;
      padding-top: 8px;
    }
    .full-width {
      width: 100%;
    }
    .error-message {
      color: #f44336;
      font-size: 12px;
      margin-top: 8px;
    }
    mat-divider {
      margin: 16px 0;
    }
    .price-history-section h3 {
      margin: 16px 0 8px 0;
      font-size: 14px;
      font-weight: 500;
      color: #666;
    }
    .price-history-table {
      width: 100%;
    }
    .loading-container {
      display: flex;
      justify-content: center;
      padding: 24px;
    }
    .no-history {
      text-align: center;
      color: #999;
      padding: 16px;
    }
    mat-dialog-content {
      max-height: 70vh;
    }
  `]
})
export class PriceDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<PriceDialogComponent>);
  private readonly productService = inject(ProductService);
  readonly data = inject<PriceDialogData>(MAT_DIALOG_DATA);

  readonly isLoading = signal(false);
  readonly isLoadingHistory = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly priceHistory = signal<PriceHistory[]>([]);

  readonly displayedColumns = ['price', 'changedDate'];

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
