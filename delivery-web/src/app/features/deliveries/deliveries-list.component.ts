import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { MenuModule } from 'primeng/menu';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ConfirmationService, MessageService, MenuItem } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';

import {
  Delivery,
  DeliveryStatus,
  DELIVERY_STATUS_OPTIONS,
  DELIVERY_STATUS_COLORS
} from './models/delivery.model';
import { DeliveryService } from './services/delivery.service';
import { DeliveryDialogComponent } from './delivery-dialog/delivery-dialog.component';

@Component({
  selector: 'app-deliveries-list',
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
    TooltipModule,
    MenuModule,
    ProgressSpinnerModule,
    ConfirmDialogModule,
    ToastModule,
    DatePipe,
    CurrencyPipe,
  ],
  providers: [DialogService, ConfirmationService, MessageService],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Deliveries</h1>
        <p-button
          label="New Delivery"
          icon="pi pi-plus"
          (onClick)="openCreateDialog()">
        </p-button>
      </div>

      <p-card>
        <div class="filters-row">
          <div class="filter-field">
            <label for="statusFilter">Status</label>
            <p-select
              id="statusFilter"
              [options]="statusFilterOptions"
              [(ngModel)]="statusFilter"
              (onChange)="onFilterChange()"
              placeholder="All Statuses"
              [showClear]="true"
              optionLabel="label"
              optionValue="value"
              styleClass="w-full">
            </p-select>
          </div>

          <div class="filter-field">
            <label for="startDate">Start Date</label>
            <p-datepicker
              id="startDate"
              [(ngModel)]="startDateFilter"
              (onSelect)="onFilterChange()"
              (onClear)="onFilterChange()"
              [showClear]="true"
              dateFormat="mm/dd/yy"
              placeholder="Select start date"
              styleClass="w-full">
            </p-datepicker>
          </div>

          <div class="filter-field">
            <label for="endDate">End Date</label>
            <p-datepicker
              id="endDate"
              [(ngModel)]="endDateFilter"
              (onSelect)="onFilterChange()"
              (onClear)="onFilterChange()"
              [showClear]="true"
              dateFormat="mm/dd/yy"
              placeholder="Select end date"
              styleClass="w-full">
            </p-datepicker>
          </div>

          <div class="clear-filters-container">
            <p-button
              label="Clear Filters"
              icon="pi pi-times"
              [text]="true"
              (onClick)="clearFilters()">
            </p-button>
          </div>
        </div>

        @if (isLoading()) {
          <div class="loading-container">
            <p-progressSpinner strokeWidth="4" [style]="{ width: '40px', height: '40px' }"></p-progressSpinner>
            <p>Loading deliveries...</p>
          </div>
        } @else if (error()) {
          <div class="error-container">
            <i class="pi pi-exclamation-circle error-icon"></i>
            <p>{{ error() }}</p>
            <p-button
              label="Retry"
              icon="pi pi-refresh"
              [text]="true"
              (onClick)="loadDeliveries()">
            </p-button>
          </div>
        } @else {
          <p-table
            [value]="deliveries()"
            [paginator]="true"
            [rows]="pageSize()"
            [totalRecords]="totalItems()"
            [lazy]="true"
            (onLazyLoad)="onLazyLoad($event)"
            [rowsPerPageOptions]="[5, 10, 25, 50]"
            [showCurrentPageReport]="true"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
            [tableStyle]="{ 'min-width': '70rem' }"
            styleClass="p-datatable-striped"
            [rowHover]="true">

            <ng-template pTemplate="header">
              <tr>
                <th>Code</th>
                <th>Customer</th>
                <th>Driver</th>
                <th>Delivery Date</th>
                <th>Status</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </ng-template>

            <ng-template pTemplate="body" let-delivery>
              <tr class="clickable-row" (click)="viewDetails(delivery)">
                <td>{{ delivery.code }}</td>
                <td>{{ delivery.customerName }}</td>
                <td>
                  @if (delivery.driverName) {
                    <span class="driver-badge">{{ delivery.driverName }}</span>
                  } @else {
                    <span class="no-driver">Not assigned</span>
                  }
                </td>
                <td>{{ delivery.deliveryDate | date:'mediumDate' }}</td>
                <td>
                  <p-tag
                    [value]="getStatusLabel(delivery.status)"
                    [severity]="getStatusSeverity(delivery.status)">
                  </p-tag>
                </td>
                <td>{{ delivery.totalAmount | currency }}</td>
                <td (click)="$event.stopPropagation()">
                  <p-button
                    icon="pi pi-eye"
                    [rounded]="true"
                    [text]="true"
                    severity="info"
                    pTooltip="View details"
                    (onClick)="viewDetails(delivery)">
                  </p-button>
                  <p-button
                    icon="pi pi-arrows-h"
                    [rounded]="true"
                    [text]="true"
                    pTooltip="Change status"
                    [disabled]="delivery.status === 'COMPLETED' || delivery.status === 'CANCELLED'"
                    (onClick)="statusMenu.toggle($event); selectedDelivery = delivery">
                  </p-button>
                  <p-menu
                    #statusMenu
                    [model]="getStatusMenuItems(delivery)"
                    [popup]="true">
                  </p-menu>
                  <p-button
                    icon="pi pi-trash"
                    [rounded]="true"
                    [text]="true"
                    severity="danger"
                    pTooltip="Delete delivery"
                    [disabled]="delivery.status !== 'PENDING'"
                    (onClick)="confirmDelete(delivery)">
                  </p-button>
                </td>
              </tr>
            </ng-template>

            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="7" class="empty-message">
                  No deliveries found. Click "New Delivery" to create one.
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

    .filters-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
      flex-wrap: wrap;
      align-items: flex-end;
    }

    .filter-field {
      display: flex;
      flex-direction: column;
      gap: 4px;
      width: 180px;
    }

    .filter-field label {
      font-size: 12px;
      font-weight: 500;
      color: #666;
    }

    .clear-filters-container {
      margin-left: auto;
      display: flex;
      align-items: flex-end;
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

    .clickable-row {
      cursor: pointer;
    }

    .driver-badge {
      background-color: #e3f2fd;
      color: #1976d2;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
    }

    .no-driver {
      color: #9e9e9e;
      font-style: italic;
      font-size: 12px;
    }

    .empty-message {
      text-align: center;
      padding: 48px;
      color: #9e9e9e;
    }

    :host ::ng-deep .p-datatable .p-datatable-tbody > tr:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }

    :host ::ng-deep .p-card .p-card-body {
      padding: 16px;
    }
  `]
})
export class DeliveriesListComponent implements OnInit {
  private readonly deliveryService = inject(DeliveryService);
  private readonly dialogService = inject(DialogService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);

  private dialogRef: DynamicDialogRef<any> | undefined;

  readonly statusOptions = DELIVERY_STATUS_OPTIONS;
  readonly statusColors = DELIVERY_STATUS_COLORS;
  readonly statusFilterOptions = [
    ...DELIVERY_STATUS_OPTIONS
  ];

  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly deliveries = signal<Delivery[]>([]);
  readonly totalItems = signal(0);
  readonly currentPage = signal(0);
  readonly pageSize = signal(10);

  statusFilter: DeliveryStatus | null = null;
  startDateFilter: Date | null = null;
  endDateFilter: Date | null = null;
  selectedDelivery: Delivery | null = null;

  ngOnInit(): void {
    this.loadDeliveries();
  }

  loadDeliveries(): void {
    this.isLoading.set(true);
    this.error.set(null);

    const params: Record<string, unknown> = {
      page: this.currentPage(),
      size: this.pageSize(),
    };

    if (this.statusFilter) {
      params['status'] = this.statusFilter;
    }
    if (this.startDateFilter) {
      params['startDate'] = this.formatDate(this.startDateFilter);
    }
    if (this.endDateFilter) {
      params['endDate'] = this.formatDate(this.endDateFilter);
    }

    this.deliveryService.getDeliveries(params as Parameters<typeof this.deliveryService.getDeliveries>[0]).subscribe({
      next: (response) => {
        this.deliveries.set(response.data);
        this.totalItems.set(response.total);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Failed to load deliveries');
        this.isLoading.set(false);
      }
    });
  }

  onFilterChange(): void {
    this.currentPage.set(0);
    this.loadDeliveries();
  }

  clearFilters(): void {
    this.statusFilter = null;
    this.startDateFilter = null;
    this.endDateFilter = null;
    this.currentPage.set(0);
    this.loadDeliveries();
  }

  onLazyLoad(event: any): void {
    const page = event.first / event.rows;
    this.currentPage.set(page);
    this.pageSize.set(event.rows);
    this.loadDeliveries();
  }

  getStatusSeverity(status: DeliveryStatus): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined {
    const severityMap: Record<DeliveryStatus, 'success' | 'info' | 'warn' | 'danger'> = {
      PENDING: 'warn',
      IN_PROGRESS: 'info',
      COMPLETED: 'success',
      CANCELLED: 'danger',
    };
    return severityMap[status];
  }

  getStatusLabel(status: DeliveryStatus): string {
    const option = this.statusOptions.find(s => s.value === status);
    return option?.label || status;
  }

  getAvailableStatuses(currentStatus: DeliveryStatus): { value: DeliveryStatus; label: string }[] {
    const statusFlow: Record<DeliveryStatus, DeliveryStatus[]> = {
      PENDING: ['IN_PROGRESS', 'CANCELLED'],
      IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
      COMPLETED: [],
      CANCELLED: [],
    };

    const available = statusFlow[currentStatus] || [];
    return this.statusOptions.filter(s => available.includes(s.value));
  }

  getStatusMenuItems(delivery: Delivery): MenuItem[] {
    return this.getAvailableStatuses(delivery.status).map(status => ({
      label: status.label,
      command: () => this.updateStatus(delivery, status.value)
    }));
  }

  viewDetails(delivery: Delivery): void {
    this.router.navigate(['/deliveries', delivery.id]);
  }

  openCreateDialog(): void {
    this.dialogRef = this.dialogService.open(DeliveryDialogComponent, {
      header: 'New Delivery',
      width: '700px',
      modal: true,
      data: {
        mode: 'create'
      }
    }) ?? undefined;

    this.dialogRef?.onClose.subscribe((result: any) => {
      if (result?.action === 'save') {
        this.deliveryService.createDelivery(result.data).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Delivery created successfully'
            });
            this.loadDeliveries();
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: err.message || 'Failed to create delivery'
            });
          }
        });
      }
    });
  }

  updateStatus(delivery: Delivery, newStatus: DeliveryStatus): void {
    this.deliveryService.updateStatus(delivery.id, { status: newStatus }).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Delivery status updated to ${this.getStatusLabel(newStatus)}`
        });
        this.loadDeliveries();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.message || 'Failed to update status'
        });
      }
    });
  }

  confirmDelete(delivery: Delivery): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete delivery "${delivery.code}"?`,
      header: 'Delete Delivery',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.deliveryService.deleteDelivery(delivery.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Delivery deleted successfully'
            });
            this.loadDeliveries();
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: err.message || 'Failed to delete delivery'
            });
          }
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
