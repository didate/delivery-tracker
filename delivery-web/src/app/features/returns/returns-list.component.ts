import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { MenuModule } from 'primeng/menu';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService, MenuItem } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';

import { Return, ReturnStatus } from './models/return.model';
import { ReturnService } from './services/return.service';
import { ReturnDialogComponent } from './return-dialog/return-dialog.component';

interface StatusOption {
  label: string;
  value: ReturnStatus | null;
}

@Component({
  selector: 'app-returns-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    TagModule,
    SelectModule,
    CardModule,
    TooltipModule,
    MenuModule,
    DialogModule,
    ProgressSpinnerModule,
    ConfirmDialogModule,
    ToastModule,
  ],
  providers: [ConfirmationService, MessageService, DialogService],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Returns</h1>
        <p-button
          label="Create Return"
          icon="pi pi-plus"
          (onClick)="openCreateDialog()">
        </p-button>
      </div>

      <p-card>
        <div class="filters-row">
          <p-select
            [options]="statusOptions"
            [(ngModel)]="statusFilter"
            (onChange)="onStatusFilterChange()"
            placeholder="All Statuses"
            [showClear]="true"
            styleClass="status-filter">
          </p-select>
        </div>

        @if (isLoading()) {
          <div class="loading-container">
            <p-progressSpinner [style]="{width: '40px', height: '40px'}"></p-progressSpinner>
            <p>Loading returns...</p>
          </div>
        } @else if (error()) {
          <div class="error-container">
            <i class="pi pi-exclamation-circle error-icon"></i>
            <p>{{ error() }}</p>
            <p-button
              label="Retry"
              icon="pi pi-refresh"
              [outlined]="true"
              (onClick)="loadReturns()">
            </p-button>
          </div>
        } @else {
          <p-table
            [value]="returns()"
            [paginator]="true"
            [rows]="pageSize()"
            [totalRecords]="totalItems()"
            [lazy]="true"
            (onLazyLoad)="onLazyLoad($event)"
            [rowsPerPageOptions]="[5, 10, 25, 50]"
            [showCurrentPageReport]="true"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
            styleClass="returns-table">

            <ng-template pTemplate="header">
              <tr>
                <th>Code</th>
                <th>Customer</th>
                <th>Return Date</th>
                <th>Total Value</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </ng-template>

            <ng-template pTemplate="body" let-return>
              <tr>
                <td>{{ return.code }}</td>
                <td>{{ return.customerName }}</td>
                <td>{{ return.returnDate | date:'mediumDate' }}</td>
                <td>\${{ return.totalValue | number:'1.2-2' }}</td>
                <td>
                  <p-tag
                    [value]="return.status"
                    [severity]="getStatusSeverity(return.status)">
                  </p-tag>
                </td>
                <td>{{ return.createdDate | date:'short' }}</td>
                <td>
                  <p-button
                    icon="pi pi-eye"
                    [rounded]="true"
                    [text]="true"
                    (onClick)="viewDetails(return)"
                    pTooltip="View details">
                  </p-button>

                  @if (return.status === 'PENDING') {
                    <p-button
                      icon="pi pi-ellipsis-v"
                      [rounded]="true"
                      [text]="true"
                      (onClick)="menu.toggle($event)"
                      pTooltip="Change status">
                    </p-button>
                    <p-menu #menu [popup]="true" [model]="getStatusMenuItems(return)"></p-menu>

                    <p-button
                      icon="pi pi-trash"
                      [rounded]="true"
                      [text]="true"
                      severity="danger"
                      (onClick)="confirmDelete(return)"
                      pTooltip="Delete return">
                    </p-button>
                  }
                </td>
              </tr>
            </ng-template>

            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="7" class="no-data-cell">
                  @if (statusFilter) {
                    No returns found with status "{{ statusFilter }}"
                  } @else {
                    No returns found. Click "Create Return" to add one.
                  }
                </td>
              </tr>
            </ng-template>
          </p-table>
        }
      </p-card>
    </div>

    <!-- Return Details Dialog -->
    <p-dialog
      [(visible)]="detailsDialogVisible"
      [header]="'Return Details - ' + (selectedReturn?.code || '')"
      [modal]="true"
      [style]="{width: '700px'}"
      [maximizable]="true">

      @if (selectedReturn) {
        <div class="details-content">
          <div class="details-grid">
            <div class="detail-item">
              <span class="detail-label">Customer:</span>
              <span class="detail-value">{{ selectedReturn.customerName }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Return Date:</span>
              <span class="detail-value">{{ selectedReturn.returnDate | date:'mediumDate' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Status:</span>
              <p-tag
                [value]="selectedReturn.status"
                [severity]="getStatusSeverity(selectedReturn.status)">
              </p-tag>
            </div>
            <div class="detail-item">
              <span class="detail-label">Total Value:</span>
              <span class="detail-value total-value">\${{ selectedReturn.totalValue | number:'1.2-2' }}</span>
            </div>
          </div>

          @if (selectedReturn.notes) {
            <div class="notes-section">
              <span class="detail-label">Notes:</span>
              <p class="notes-text">{{ selectedReturn.notes }}</p>
            </div>
          }

          <h3>Items</h3>
          <table class="items-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Unit Value</th>
                <th>Total</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              @for (item of selectedReturn.items; track item.id) {
                <tr>
                  <td>{{ item.productName }}</td>
                  <td>{{ item.quantity }}</td>
                  <td>\${{ item.unitValue | number:'1.2-2' }}</td>
                  <td>\${{ item.totalValue | number:'1.2-2' }}</td>
                  <td>{{ item.reason }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <ng-template pTemplate="footer">
        <p-button label="Close" [text]="true" (onClick)="detailsDialogVisible = false"></p-button>
      </ng-template>
    </p-dialog>

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

    .filters-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }

    :host ::ng-deep .status-filter {
      width: 200px;
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
      color: var(--red-500);
      margin-bottom: 16px;
    }

    :host ::ng-deep .returns-table {
      width: 100%;
    }

    .no-data-cell {
      text-align: center;
      padding: 48px;
      color: #9e9e9e;
    }

    /* Details dialog styles */
    .details-content {
      min-width: 500px;
    }

    .details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 24px;
    }

    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .detail-label {
      font-size: 12px;
      color: #666;
      font-weight: 500;
    }

    .detail-value {
      font-size: 14px;
    }

    .total-value {
      font-weight: 600;
      color: #2e7d32;
    }

    .notes-section {
      margin-bottom: 24px;
    }

    .notes-text {
      margin: 8px 0 0 0;
      padding: 12px;
      background-color: #f5f5f5;
      border-radius: 4px;
    }

    .items-table {
      width: 100%;
      border-collapse: collapse;
    }

    .items-table th,
    .items-table td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e0e0e0;
    }

    .items-table th {
      background-color: #f5f5f5;
      font-weight: 500;
      font-size: 12px;
      text-transform: uppercase;
      color: #666;
    }

    h3 {
      margin: 0 0 16px 0;
      font-size: 16px;
      font-weight: 500;
    }
  `]
})
export class ReturnsListComponent implements OnInit {
  private readonly returnService = inject(ReturnService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly dialogService = inject(DialogService);

  private dialogRef: DynamicDialogRef<any> | undefined;

  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly returns = signal<Return[]>([]);
  readonly totalItems = signal(0);
  readonly currentPage = signal(0);
  readonly pageSize = signal(10);

  statusFilter: ReturnStatus | null = null;
  detailsDialogVisible = false;
  selectedReturn: Return | null = null;

  readonly statusOptions: StatusOption[] = [
    { label: 'Pending', value: 'PENDING' },
    { label: 'Processed', value: 'PROCESSED' },
    { label: 'Rejected', value: 'REJECTED' }
  ];

  ngOnInit(): void {
    this.loadReturns();
  }

  loadReturns(): void {
    this.isLoading.set(true);
    this.error.set(null);

    const params = {
      page: this.currentPage(),
      size: this.pageSize(),
      status: this.statusFilter || undefined
    };

    this.returnService.getReturns(params).subscribe({
      next: (response) => {
        this.returns.set(response.data);
        this.totalItems.set(response.total);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Failed to load returns');
        this.isLoading.set(false);
      }
    });
  }

  onStatusFilterChange(): void {
    this.currentPage.set(0);
    this.loadReturns();
  }

  onLazyLoad(event: any): void {
    this.currentPage.set(Math.floor(event.first / event.rows));
    this.pageSize.set(event.rows);
    this.loadReturns();
  }

  getStatusSeverity(status: ReturnStatus): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined {
    switch (status) {
      case 'PENDING':
        return 'warn';
      case 'PROCESSED':
        return 'success';
      case 'REJECTED':
        return 'danger';
      default:
        return undefined;
    }
  }

  getStatusMenuItems(returnItem: Return): MenuItem[] {
    return [
      {
        label: 'Process',
        icon: 'pi pi-check-circle',
        command: () => this.updateStatus(returnItem, 'PROCESSED')
      },
      {
        label: 'Reject',
        icon: 'pi pi-times-circle',
        command: () => this.updateStatus(returnItem, 'REJECTED')
      }
    ];
  }

  openCreateDialog(): void {
    this.dialogRef = this.dialogService.open(ReturnDialogComponent, {
      header: 'Create Return',
      width: '700px',
      modal: true,
      data: {
        mode: 'create'
      }
    }) ?? undefined;

    this.dialogRef?.onClose.subscribe((result: any) => {
      if (result?.action === 'save') {
        this.returnService.createReturn(result.data).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Return created successfully'
            });
            this.loadReturns();
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: err.message || 'Failed to create return'
            });
          }
        });
      }
    });
  }

  viewDetails(returnItem: Return): void {
    this.returnService.getReturn(returnItem.id).subscribe({
      next: (fullReturn) => {
        this.selectedReturn = fullReturn;
        this.detailsDialogVisible = true;
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.message || 'Failed to load return details'
        });
      }
    });
  }

  updateStatus(returnItem: Return, newStatus: ReturnStatus): void {
    const action = newStatus === 'PROCESSED' ? 'process' : 'reject';

    this.confirmationService.confirm({
      message: `Are you sure you want to ${action} return "${returnItem.code}"?`,
      header: `${action.charAt(0).toUpperCase() + action.slice(1)} Return`,
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.returnService.updateStatus(returnItem.id, { status: newStatus }).subscribe({
          next: () => {
            const message = newStatus === 'PROCESSED' ? 'Return processed successfully' : 'Return rejected';
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: message
            });
            this.loadReturns();
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: err.message || `Failed to ${action} return`
            });
          }
        });
      }
    });
  }

  confirmDelete(returnItem: Return): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete return "${returnItem.code}"? This action cannot be undone.`,
      header: 'Delete Return',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.returnService.deleteReturn(returnItem.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Return deleted successfully'
            });
            this.loadReturns();
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: err.message || 'Failed to delete return'
            });
          }
        });
      }
    });
  }
}
