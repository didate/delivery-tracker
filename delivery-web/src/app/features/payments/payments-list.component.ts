import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import {
  Payment,
  PaymentMethod,
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHOD_ICONS
} from './models/payment.model';
import { PaymentService } from './services/payment.service';
import { PaymentDialogComponent, PaymentDialogData } from './payment-dialog/payment-dialog.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-payments-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    CurrencyPipe,
    DatePipe
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Payments</h1>
        <button mat-raised-button color="primary" (click)="openCreateDialog()">
          <mat-icon>add</mat-icon>
          Add Payment
        </button>
      </div>

      <mat-card>
        <mat-card-content>
          <div class="filters">
            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Payment Method</mat-label>
              <mat-select [(value)]="methodFilter" (selectionChange)="onFilterChange()">
                <mat-option [value]="null">All Methods</mat-option>
                @for (method of paymentMethods; track method) {
                  <mat-option [value]="method">
                    <mat-icon class="method-icon">{{ getMethodIcon(method) }}</mat-icon>
                    {{ getMethodLabel(method) }}
                  </mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="filter-field date-field">
              <mat-label>Start Date</mat-label>
              <input matInput [matDatepicker]="startPicker" [(ngModel)]="startDate" (dateChange)="onFilterChange()">
              <mat-datepicker-toggle matIconSuffix [for]="startPicker"></mat-datepicker-toggle>
              <mat-datepicker #startPicker></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline" class="filter-field date-field">
              <mat-label>End Date</mat-label>
              <input matInput [matDatepicker]="endPicker" [(ngModel)]="endDate" (dateChange)="onFilterChange()">
              <mat-datepicker-toggle matIconSuffix [for]="endPicker"></mat-datepicker-toggle>
              <mat-datepicker #endPicker></mat-datepicker>
            </mat-form-field>

            @if (methodFilter || startDate || endDate) {
              <button mat-button color="primary" (click)="clearFilters()">
                <mat-icon>clear</mat-icon>
                Clear Filters
              </button>
            }
          </div>

          @if (isLoading()) {
            <div class="loading-container">
              <mat-spinner diameter="40"></mat-spinner>
              <p>Loading payments...</p>
            </div>
          } @else if (error()) {
            <div class="error-container">
              <mat-icon color="warn">error</mat-icon>
              <p>{{ error() }}</p>
              <button mat-button color="primary" (click)="loadPayments()">
                <mat-icon>refresh</mat-icon>
                Retry
              </button>
            </div>
          } @else if (payments().length === 0) {
            <div class="empty-state">
              <mat-icon>payment</mat-icon>
              <p>No payments found</p>
              @if (methodFilter || startDate || endDate) {
                <p class="empty-hint">Try adjusting your filters</p>
              } @else {
                <p class="empty-hint">Click "Add Payment" to create one</p>
              }
            </div>
          } @else {
            <div class="table-container">
              <table mat-table [dataSource]="payments()">
                <ng-container matColumnDef="code">
                  <th mat-header-cell *matHeaderCellDef>Code</th>
                  <td mat-cell *matCellDef="let payment">{{ payment.code }}</td>
                </ng-container>

                <ng-container matColumnDef="customerName">
                  <th mat-header-cell *matHeaderCellDef>Customer</th>
                  <td mat-cell *matCellDef="let payment">{{ payment.customerName }}</td>
                </ng-container>

                <ng-container matColumnDef="amount">
                  <th mat-header-cell *matHeaderCellDef>Amount</th>
                  <td mat-cell *matCellDef="let payment" class="amount-cell">
                    {{ payment.amount | currency }}
                  </td>
                </ng-container>

                <ng-container matColumnDef="method">
                  <th mat-header-cell *matHeaderCellDef>Method</th>
                  <td mat-cell *matCellDef="let payment">
                    <span class="method-chip" [attr.data-method]="payment.method">
                      <mat-icon class="method-chip-icon">{{ getMethodIcon(payment.method) }}</mat-icon>
                      {{ getMethodLabel(payment.method) }}
                    </span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="paymentDate">
                  <th mat-header-cell *matHeaderCellDef>Payment Date</th>
                  <td mat-cell *matCellDef="let payment">
                    {{ payment.paymentDate | date:'mediumDate' }}
                  </td>
                </ng-container>

                <ng-container matColumnDef="reference">
                  <th mat-header-cell *matHeaderCellDef>Reference</th>
                  <td mat-cell *matCellDef="let payment" class="reference-cell">
                    {{ payment.reference || '-' }}
                  </td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Actions</th>
                  <td mat-cell *matCellDef="let payment">
                    <div class="action-buttons">
                      <button mat-icon-button color="primary" matTooltip="Edit" (click)="openEditDialog(payment)">
                        <mat-icon>edit</mat-icon>
                      </button>
                      <button mat-icon-button color="warn" matTooltip="Delete" (click)="confirmDelete(payment)">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </div>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
              </table>
            </div>

            <mat-paginator
              [length]="totalItems()"
              [pageSize]="pageSize()"
              [pageIndex]="currentPage()"
              [pageSizeOptions]="[5, 10, 25, 50]"
              (page)="onPageChange($event)"
              showFirstLastButtons>
            </mat-paginator>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 24px;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .page-header h1 {
      margin: 0;
    }

    .filters {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
      flex-wrap: wrap;
      align-items: center;
    }

    .filter-field {
      min-width: 180px;
    }

    .date-field {
      min-width: 160px;
    }

    .method-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      margin-right: 8px;
      vertical-align: middle;
    }

    .loading-container,
    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      text-align: center;
    }

    .error-container mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px;
      color: #999;
    }

    .empty-state mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
    }

    .empty-hint {
      font-size: 14px;
      margin-top: 8px;
    }

    .table-container {
      overflow-x: auto;
    }

    table {
      width: 100%;
    }

    .amount-cell {
      font-weight: 600;
      color: #2e7d32;
    }

    .method-chip {
      display: inline-flex;
      align-items: center;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 500;
      background-color: #e3f2fd;
      color: #1565c0;
    }

    .method-chip[data-method="CASH"] {
      background-color: #e8f5e9;
      color: #2e7d32;
    }

    .method-chip[data-method="CHECK"] {
      background-color: #fff3e0;
      color: #e65100;
    }

    .method-chip[data-method="BANK_TRANSFER"] {
      background-color: #e3f2fd;
      color: #1565c0;
    }

    .method-chip[data-method="MOBILE_MONEY"] {
      background-color: #f3e5f5;
      color: #7b1fa2;
    }

    .method-chip-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
      margin-right: 4px;
    }

    .reference-cell {
      max-width: 150px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .action-buttons {
      display: flex;
      gap: 4px;
    }

    mat-paginator {
      margin-top: 16px;
      border-top: 1px solid #e0e0e0;
    }
  `]
})
export class PaymentsListComponent implements OnInit {
  private readonly paymentService = inject(PaymentService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly displayedColumns = ['code', 'customerName', 'amount', 'method', 'paymentDate', 'reference', 'actions'];
  readonly paymentMethods = Object.values(PaymentMethod);

  readonly payments = signal<Payment[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly totalItems = signal(0);
  readonly currentPage = signal(0);
  readonly pageSize = signal(10);

  methodFilter: PaymentMethod | null = null;
  startDate: Date | null = null;
  endDate: Date | null = null;

  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments(): void {
    this.isLoading.set(true);
    this.error.set(null);

    const params: Record<string, number | string> = {
      page: this.currentPage(),
      size: this.pageSize()
    };

    if (this.methodFilter) {
      params['method'] = this.methodFilter;
    }
    if (this.startDate) {
      params['startDate'] = this.formatDate(this.startDate);
    }
    if (this.endDate) {
      params['endDate'] = this.formatDate(this.endDate);
    }

    this.paymentService.getPayments(params).subscribe({
      next: (response) => {
        this.payments.set(response.data);
        this.totalItems.set(response.total);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Failed to load payments');
        this.isLoading.set(false);
      }
    });
  }

  onFilterChange(): void {
    this.currentPage.set(0);
    this.loadPayments();
  }

  clearFilters(): void {
    this.methodFilter = null;
    this.startDate = null;
    this.endDate = null;
    this.currentPage.set(0);
    this.loadPayments();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadPayments();
  }

  getMethodLabel(method: PaymentMethod): string {
    return PAYMENT_METHOD_LABELS[method] || method;
  }

  getMethodIcon(method: PaymentMethod): string {
    return PAYMENT_METHOD_ICONS[method] || 'payment';
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(PaymentDialogComponent, {
      width: '550px',
      data: { mode: 'create' } as PaymentDialogData
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.showSuccess('Payment created successfully');
        this.loadPayments();
      }
    });
  }

  openEditDialog(payment: Payment): void {
    const dialogRef = this.dialog.open(PaymentDialogComponent, {
      width: '550px',
      data: { mode: 'edit', payment } as PaymentDialogData
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.showSuccess('Payment updated successfully');
        this.loadPayments();
      }
    });
  }

  confirmDelete(payment: Payment): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Payment',
        message: `Are you sure you want to delete payment "${payment.code}" for ${payment.customerName}?`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      } as ConfirmDialogData
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.deletePayment(payment);
      }
    });
  }

  private deletePayment(payment: Payment): void {
    this.paymentService.deletePayment(payment.id).subscribe({
      next: () => {
        this.showSuccess('Payment deleted successfully');
        this.loadPayments();
      },
      error: (err) => {
        this.showError(err.message || 'Failed to delete payment');
      }
    });
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }
}
