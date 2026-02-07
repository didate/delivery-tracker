import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

import {
  Payment,
  PaymentMethod,
  PAYMENT_METHOD_LABELS
} from './models/payment.model';
import { PaymentService } from './services/payment.service';
import { PaymentDialogComponent } from './payment-dialog/payment-dialog.component';

@Component({
  selector: 'app-payments-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    TagModule,
    SelectModule,
    DatePickerModule,
    CardModule,
    ProgressSpinnerModule,
    TooltipModule,
    ConfirmDialogModule,
    ToastModule,
    CurrencyPipe,
    DatePipe
  ],
  providers: [DialogService, ConfirmationService, MessageService],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Payments</h1>
        <p-button label="Add Payment" icon="pi pi-plus" (onClick)="openCreateDialog()"></p-button>
      </div>

      <p-card>
        <div class="filters">
          <div class="filter-field">
            <label for="methodFilter">Payment Method</label>
            <p-select
              id="methodFilter"
              [options]="paymentMethodOptions"
              [(ngModel)]="methodFilter"
              (onChange)="onFilterChange()"
              placeholder="All Methods"
              [showClear]="true"
              styleClass="w-full">
            </p-select>
          </div>

          <div class="filter-field date-field">
            <label for="startDate">Start Date</label>
            <p-datepicker
              id="startDate"
              [(ngModel)]="startDate"
              (onSelect)="onFilterChange()"
              (onClear)="onFilterChange()"
              [showIcon]="true"
              [showClear]="true"
              dateFormat="mm/dd/yy"
              placeholder="Select start date">
            </p-datepicker>
          </div>

          <div class="filter-field date-field">
            <label for="endDate">End Date</label>
            <p-datepicker
              id="endDate"
              [(ngModel)]="endDate"
              (onSelect)="onFilterChange()"
              (onClear)="onFilterChange()"
              [showIcon]="true"
              [showClear]="true"
              dateFormat="mm/dd/yy"
              placeholder="Select end date">
            </p-datepicker>
          </div>

          @if (methodFilter || startDate || endDate) {
            <div class="filter-field clear-button">
              <p-button
                label="Clear Filters"
                icon="pi pi-times"
                [text]="true"
                (onClick)="clearFilters()">
              </p-button>
            </div>
          }
        </div>

        @if (isLoading()) {
          <div class="loading-container">
            <p-progressSpinner [style]="{width: '40px', height: '40px'}"></p-progressSpinner>
            <p>Loading payments...</p>
          </div>
        } @else if (error()) {
          <div class="error-container">
            <i class="pi pi-exclamation-triangle error-icon"></i>
            <p>{{ error() }}</p>
            <p-button label="Retry" icon="pi pi-refresh" (onClick)="loadPayments()"></p-button>
          </div>
        } @else if (payments().length === 0) {
          <div class="empty-state">
            <i class="pi pi-credit-card empty-icon"></i>
            <p>No payments found</p>
            @if (methodFilter || startDate || endDate) {
              <p class="empty-hint">Try adjusting your filters</p>
            } @else {
              <p class="empty-hint">Click "Add Payment" to create one</p>
            }
          </div>
        } @else {
          <p-table
            [value]="payments()"
            [paginator]="true"
            [rows]="pageSize()"
            [totalRecords]="totalItems()"
            [lazy]="true"
            (onLazyLoad)="onLazyLoad($event)"
            [rowsPerPageOptions]="[5, 10, 25, 50]"
            [showCurrentPageReport]="true"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
            [tableStyle]="{'min-width': '75rem'}">

            <ng-template pTemplate="header">
              <tr>
                <th>Code</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Payment Date</th>
                <th>Reference</th>
                <th>Actions</th>
              </tr>
            </ng-template>

            <ng-template pTemplate="body" let-payment>
              <tr>
                <td>{{ payment.code }}</td>
                <td>{{ payment.customerName }}</td>
                <td class="amount-cell">{{ payment.amount | currency }}</td>
                <td>
                  <p-tag
                    [value]="getMethodLabel(payment.method)"
                    [severity]="getMethodSeverity(payment.method)"
                    [icon]="getMethodPrimeIcon(payment.method)">
                  </p-tag>
                </td>
                <td>{{ payment.paymentDate | date:'mediumDate' }}</td>
                <td class="reference-cell">{{ payment.reference || '-' }}</td>
                <td>
                  <div class="action-buttons">
                    <p-button
                      icon="pi pi-pencil"
                      [rounded]="true"
                      [text]="true"
                      severity="info"
                      pTooltip="Edit"
                      (onClick)="openEditDialog(payment)">
                    </p-button>
                    <p-button
                      icon="pi pi-trash"
                      [rounded]="true"
                      [text]="true"
                      severity="danger"
                      pTooltip="Delete"
                      (onClick)="confirmDelete(payment)">
                    </p-button>
                  </div>
                </td>
              </tr>
            </ng-template>
          </p-table>
        }
      </p-card>
    </div>

    <p-confirmDialog></p-confirmDialog>
    <p-toast></p-toast>
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
      align-items: flex-end;
    }

    .filter-field {
      display: flex;
      flex-direction: column;
      gap: 8px;
      min-width: 180px;
    }

    .filter-field label {
      font-weight: 500;
      font-size: 14px;
    }

    .date-field {
      min-width: 160px;
    }

    .clear-button {
      min-width: auto;
      align-self: flex-end;
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

    .error-icon {
      font-size: 48px;
      color: #f44336;
      margin-bottom: 16px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px;
      color: #999;
    }

    .empty-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }

    .empty-hint {
      font-size: 14px;
      margin-top: 8px;
    }

    .amount-cell {
      font-weight: 600;
      color: #2e7d32;
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
  `]
})
export class PaymentsListComponent implements OnInit {
  private readonly paymentService = inject(PaymentService);
  private readonly dialogService = inject(DialogService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  private dialogRef: DynamicDialogRef<any> | undefined;

  readonly paymentMethods = Object.values(PaymentMethod);
  readonly paymentMethodOptions = this.paymentMethods.map(method => ({
    label: PAYMENT_METHOD_LABELS[method],
    value: method
  }));

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

  onLazyLoad(event: TableLazyLoadEvent): void {
    const first = event.first ?? 0;
    const rows = event.rows ?? 10;
    this.currentPage.set(Math.floor(first / rows));
    this.pageSize.set(rows);
    this.loadPayments();
  }

  getMethodLabel(method: PaymentMethod): string {
    return PAYMENT_METHOD_LABELS[method] || method;
  }

  getMethodPrimeIcon(method: PaymentMethod): string {
    const iconMap: Record<PaymentMethod, string> = {
      [PaymentMethod.CASH]: 'pi pi-money-bill',
      [PaymentMethod.CHECK]: 'pi pi-file',
      [PaymentMethod.BANK_TRANSFER]: 'pi pi-building',
      [PaymentMethod.MOBILE_MONEY]: 'pi pi-mobile'
    };
    return iconMap[method] || 'pi pi-credit-card';
  }

  getMethodSeverity(method: PaymentMethod): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined {
    const severityMap: Record<PaymentMethod, 'success' | 'info' | 'warn' | 'danger' | 'secondary'> = {
      [PaymentMethod.CASH]: 'success',
      [PaymentMethod.CHECK]: 'warn',
      [PaymentMethod.BANK_TRANSFER]: 'info',
      [PaymentMethod.MOBILE_MONEY]: 'secondary'
    };
    return severityMap[method] || 'info';
  }

  openCreateDialog(): void {
    this.dialogRef = this.dialogService.open(PaymentDialogComponent, {
      header: 'Create Payment',
      width: '550px',
      modal: true,
      data: { mode: 'create' }
    }) ?? undefined;

    this.dialogRef?.onClose.subscribe((result) => {
      if (result) {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Payment created successfully'
        });
        this.loadPayments();
      }
    });
  }

  openEditDialog(payment: Payment): void {
    this.dialogRef = this.dialogService.open(PaymentDialogComponent, {
      header: 'Edit Payment',
      width: '550px',
      modal: true,
      data: { mode: 'edit', payment }
    }) ?? undefined;

    this.dialogRef?.onClose.subscribe((result) => {
      if (result) {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Payment updated successfully'
        });
        this.loadPayments();
      }
    });
  }

  confirmDelete(payment: Payment): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete payment "${payment.code}" for ${payment.customerName}?`,
      header: 'Delete Payment',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.deletePayment(payment);
      }
    });
  }

  private deletePayment(payment: Payment): void {
    this.paymentService.deletePayment(payment.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Payment deleted successfully'
        });
        this.loadPayments();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.message || 'Failed to delete payment'
        });
      }
    });
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
