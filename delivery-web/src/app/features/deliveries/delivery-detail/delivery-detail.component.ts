import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { MenuModule } from 'primeng/menu';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DividerModule } from 'primeng/divider';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ConfirmationService, MessageService, MenuItem } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';

import {
  Delivery,
  DeliveryItem,
  DeliveryStatus,
  DELIVERY_STATUS_OPTIONS,
  DELIVERY_STATUS_COLORS,
} from '../models/delivery.model';
import { DeliveryService } from '../services/delivery.service';
import { AddItemDialogComponent, AddItemDialogResult } from './add-item-dialog.component';

@Component({
  selector: 'app-delivery-detail',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    TableModule,
    TagModule,
    MenuModule,
    TooltipModule,
    ProgressSpinnerModule,
    DividerModule,
    ConfirmDialogModule,
    ToastModule,
    DatePipe,
    CurrencyPipe,
  ],
  providers: [DialogService, ConfirmationService, MessageService],
  template: `
    <div class="page-container">
      @if (isLoading()) {
        <div class="loading-container">
          <p-progressSpinner strokeWidth="4" [style]="{ width: '40px', height: '40px' }"></p-progressSpinner>
          <p>Loading delivery...</p>
        </div>
      } @else if (error()) {
        <div class="error-container">
          <i class="pi pi-exclamation-circle error-icon"></i>
          <p>{{ error() }}</p>
          <p-button
            label="Retry"
            icon="pi pi-refresh"
            [text]="true"
            (onClick)="loadDelivery()">
          </p-button>
        </div>
      } @else if (delivery()) {
        <div class="page-header">
          <div class="header-left">
            <p-button
              icon="pi pi-arrow-left"
              [rounded]="true"
              [text]="true"
              (onClick)="goBack()"
              pTooltip="Back to list">
            </p-button>
            <h1>Delivery {{ delivery()!.code }}</h1>
            <p-tag
              [value]="getStatusLabel(delivery()!.status)"
              [severity]="getStatusSeverity(delivery()!.status)">
            </p-tag>
          </div>
          <div class="header-actions">
            @if (canChangeStatus()) {
              <p-button
                label="Change Status"
                icon="pi pi-arrows-h"
                (onClick)="statusMenu.toggle($event)">
              </p-button>
              <p-menu
                #statusMenu
                [model]="statusMenuItems"
                [popup]="true">
              </p-menu>
            }
            @if (delivery()!.status === 'PENDING') {
              <p-button
                label="Delete"
                icon="pi pi-trash"
                severity="danger"
                (onClick)="confirmDelete()">
              </p-button>
            }
          </div>
        </div>

        <div class="content-grid">
          <p-card styleClass="info-card">
            <ng-template pTemplate="header">
              <div class="card-header">
                <h3>Delivery Information</h3>
              </div>
            </ng-template>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Code</span>
                <span class="info-value">{{ delivery()!.code }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Customer</span>
                <span class="info-value">{{ delivery()!.customerName }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Driver</span>
                <span class="info-value">
                  @if (delivery()!.driverName) {
                    {{ delivery()!.driverName }}
                  } @else {
                    <span class="no-value">Not assigned</span>
                  }
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">Delivery Date</span>
                <span class="info-value">{{ delivery()!.deliveryDate | date:'longDate' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Created Date</span>
                <span class="info-value">{{ delivery()!.createdDate | date:'medium' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Total Amount</span>
                <span class="info-value total-amount">{{ delivery()!.totalAmount | currency }}</span>
              </div>
            </div>
            @if (delivery()!.notes) {
              <p-divider></p-divider>
              <div class="notes-section">
                <span class="info-label">Notes</span>
                <p class="notes-content">{{ delivery()!.notes }}</p>
              </div>
            }
          </p-card>

          <p-card styleClass="items-card">
            <ng-template pTemplate="header">
              <div class="card-header">
                <h3>Items</h3>
                @if (canEditItems()) {
                  <p-button
                    label="Add Item"
                    icon="pi pi-plus"
                    [text]="true"
                    (onClick)="openAddItemDialog()">
                  </p-button>
                }
              </div>
            </ng-template>
            @if (delivery()!.items.length === 0) {
              <div class="no-items">
                <i class="pi pi-inbox"></i>
                <p>No items in this delivery</p>
              </div>
            } @else {
              <p-table [value]="delivery()!.items" styleClass="p-datatable-striped">
                <ng-template pTemplate="header">
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                    <th></th>
                  </tr>
                </ng-template>
                <ng-template pTemplate="body" let-item>
                  <tr>
                    <td>{{ item.productName }}</td>
                    <td>{{ item.quantity }}</td>
                    <td>{{ item.unitPrice | currency }}</td>
                    <td>{{ item.totalPrice | currency }}</td>
                    <td>
                      @if (canEditItems()) {
                        <p-button
                          icon="pi pi-trash"
                          [rounded]="true"
                          [text]="true"
                          severity="danger"
                          (onClick)="confirmRemoveItem(item)"
                          pTooltip="Remove item">
                        </p-button>
                      }
                    </td>
                  </tr>
                </ng-template>
              </p-table>

              <div class="items-footer">
                <strong>Total: {{ delivery()!.totalAmount | currency }}</strong>
              </div>
            }
          </p-card>
        </div>
      }
    </div>

    <p-confirmDialog></p-confirmDialog>
    <p-toast></p-toast>
  `,
  styles: [`
    .page-container {
      padding: 24px;
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

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .header-left h1 {
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 8px;
    }

    .content-grid {
      display: grid;
      grid-template-columns: 1fr 1.5fr;
      gap: 24px;
    }

    @media (max-width: 1024px) {
      .content-grid {
        grid-template-columns: 1fr;
      }
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid var(--surface-border);
    }

    .card-header h3 {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 600;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .info-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .info-value {
      font-size: 16px;
      font-weight: 500;
    }

    .info-value.total-amount {
      color: #4caf50;
      font-size: 18px;
    }

    .no-value {
      color: #9e9e9e;
      font-style: italic;
      font-weight: normal;
    }

    .notes-section {
      margin-top: 16px;
    }

    .notes-content {
      margin: 8px 0 0 0;
      white-space: pre-wrap;
    }

    .no-items {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 32px;
      color: #9e9e9e;
    }

    .no-items i {
      font-size: 48px;
      margin-bottom: 8px;
    }

    .items-footer {
      display: flex;
      justify-content: flex-end;
      padding: 16px;
      background-color: var(--surface-100);
      border-radius: 0 0 4px 4px;
    }

    :host ::ng-deep .p-card .p-card-body {
      padding: 16px;
    }

    :host ::ng-deep .info-card .p-card-header,
    :host ::ng-deep .items-card .p-card-header {
      padding: 0;
    }
  `]
})
export class DeliveryDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly deliveryService = inject(DeliveryService);
  private readonly dialogService = inject(DialogService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  private dialogRef: DynamicDialogRef<any> | undefined;

  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly delivery = signal<Delivery | null>(null);

  readonly statusOptions = DELIVERY_STATUS_OPTIONS;
  readonly statusColors = DELIVERY_STATUS_COLORS;

  statusMenuItems: MenuItem[] = [];

  private deliveryId!: number;

  ngOnInit(): void {
    this.deliveryId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadDelivery();
  }

  loadDelivery(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.deliveryService.getDelivery(this.deliveryId).subscribe({
      next: (delivery) => {
        this.delivery.set(delivery);
        this.updateStatusMenuItems();
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Failed to load delivery');
        this.isLoading.set(false);
      }
    });
  }

  private updateStatusMenuItems(): void {
    const currentStatus = this.delivery()?.status;
    if (currentStatus) {
      this.statusMenuItems = this.getAvailableStatuses(currentStatus).map(status => ({
        label: status.label,
        command: () => this.updateStatus(status.value)
      }));
    }
  }

  goBack(): void {
    this.router.navigate(['/deliveries']);
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

  canChangeStatus(): boolean {
    const status = this.delivery()?.status;
    return status === 'PENDING' || status === 'IN_PROGRESS';
  }

  canEditItems(): boolean {
    return this.delivery()?.status === 'PENDING';
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

  updateStatus(newStatus: DeliveryStatus): void {
    this.deliveryService.updateStatus(this.deliveryId, { status: newStatus }).subscribe({
      next: (updatedDelivery) => {
        this.delivery.set(updatedDelivery);
        this.updateStatusMenuItems();
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Status updated to ${this.getStatusLabel(newStatus)}`
        });
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

  openAddItemDialog(): void {
    this.dialogRef = this.dialogService.open(AddItemDialogComponent, {
      header: 'Add Item',
      width: '500px',
      modal: true
    }) ?? undefined;

    this.dialogRef?.onClose.subscribe((result: AddItemDialogResult | undefined) => {
      if (result?.action === 'add') {
        this.deliveryService.addItem(this.deliveryId, result.data).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Item added successfully'
            });
            this.loadDelivery();
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: err.message || 'Failed to add item'
            });
          }
        });
      }
    });
  }

  confirmRemoveItem(item: DeliveryItem): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to remove "${item.productName}" from this delivery?`,
      header: 'Remove Item',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Remove',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.deliveryService.removeItem(this.deliveryId, item.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Item removed successfully'
            });
            this.loadDelivery();
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: err.message || 'Failed to remove item'
            });
          }
        });
      }
    });
  }

  confirmDelete(): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this delivery?',
      header: 'Delete Delivery',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.deliveryService.deleteDelivery(this.deliveryId).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Delivery deleted successfully'
            });
            this.router.navigate(['/deliveries']);
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
}
