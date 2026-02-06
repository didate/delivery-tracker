import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

import {
  Delivery,
  DeliveryItem,
  DeliveryStatus,
  DELIVERY_STATUS_OPTIONS,
  DELIVERY_STATUS_COLORS,
  CreateDeliveryItemDto
} from '../models/delivery.model';
import { DeliveryService } from '../services/delivery.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { AddItemDialogComponent, AddItemDialogResult } from './add-item-dialog.component';

@Component({
  selector: 'app-delivery-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTableModule,
    MatDividerModule,
    MatMenuModule,
    MatTooltipModule,
    DatePipe,
    CurrencyPipe,
  ],
  template: `
    <div class="page-container">
      @if (isLoading()) {
        <div class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Loading delivery...</p>
        </div>
      } @else if (error()) {
        <div class="error-container">
          <mat-icon color="warn">error</mat-icon>
          <p>{{ error() }}</p>
          <button mat-button color="primary" (click)="loadDelivery()">
            <mat-icon>refresh</mat-icon>
            Retry
          </button>
        </div>
      } @else if (delivery()) {
        <div class="page-header">
          <div class="header-left">
            <button mat-icon-button (click)="goBack()" matTooltip="Back to list">
              <mat-icon>arrow_back</mat-icon>
            </button>
            <h1>Delivery {{ delivery()!.code }}</h1>
            <span class="status-chip" [style.background-color]="getStatusColor(delivery()!.status)">
              {{ getStatusLabel(delivery()!.status) }}
            </span>
          </div>
          <div class="header-actions">
            @if (canChangeStatus()) {
              <button mat-raised-button [matMenuTriggerFor]="statusMenu">
                <mat-icon>swap_horiz</mat-icon>
                Change Status
              </button>
              <mat-menu #statusMenu="matMenu">
                @for (status of getAvailableStatuses(delivery()!.status); track status.value) {
                  <button mat-menu-item (click)="updateStatus(status.value)">
                    <span [style.color]="getStatusColor(status.value)">
                      {{ status.label }}
                    </span>
                  </button>
                }
              </mat-menu>
            }
            @if (delivery()!.status === 'PENDING') {
              <button mat-raised-button color="warn" (click)="confirmDelete()">
                <mat-icon>delete</mat-icon>
                Delete
              </button>
            }
          </div>
        </div>

        <div class="content-grid">
          <mat-card class="info-card">
            <mat-card-header>
              <mat-card-title>Delivery Information</mat-card-title>
            </mat-card-header>
            <mat-card-content>
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
                <mat-divider></mat-divider>
                <div class="notes-section">
                  <span class="info-label">Notes</span>
                  <p class="notes-content">{{ delivery()!.notes }}</p>
                </div>
              }
            </mat-card-content>
          </mat-card>

          <mat-card class="items-card">
            <mat-card-header>
              <mat-card-title>Items</mat-card-title>
              @if (canEditItems()) {
                <button mat-button color="primary" (click)="openAddItemDialog()">
                  <mat-icon>add</mat-icon>
                  Add Item
                </button>
              }
            </mat-card-header>
            <mat-card-content>
              @if (delivery()!.items.length === 0) {
                <div class="no-items">
                  <mat-icon>inventory_2</mat-icon>
                  <p>No items in this delivery</p>
                </div>
              } @else {
                <table mat-table [dataSource]="delivery()!.items" class="items-table">
                  <ng-container matColumnDef="product">
                    <th mat-header-cell *matHeaderCellDef>Product</th>
                    <td mat-cell *matCellDef="let item">{{ item.productName }}</td>
                  </ng-container>

                  <ng-container matColumnDef="quantity">
                    <th mat-header-cell *matHeaderCellDef>Quantity</th>
                    <td mat-cell *matCellDef="let item">{{ item.quantity }}</td>
                  </ng-container>

                  <ng-container matColumnDef="unitPrice">
                    <th mat-header-cell *matHeaderCellDef>Unit Price</th>
                    <td mat-cell *matCellDef="let item">{{ item.unitPrice | currency }}</td>
                  </ng-container>

                  <ng-container matColumnDef="totalPrice">
                    <th mat-header-cell *matHeaderCellDef>Total</th>
                    <td mat-cell *matCellDef="let item">{{ item.totalPrice | currency }}</td>
                  </ng-container>

                  <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef></th>
                    <td mat-cell *matCellDef="let item">
                      @if (canEditItems()) {
                        <button
                          mat-icon-button
                          color="warn"
                          (click)="confirmRemoveItem(item)"
                          matTooltip="Remove item">
                          <mat-icon>delete</mat-icon>
                        </button>
                      }
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="itemColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: itemColumns;"></tr>
                </table>

                <div class="items-footer">
                  <strong>Total: {{ delivery()!.totalAmount | currency }}</strong>
                </div>
              }
            </mat-card-content>
          </mat-card>
        </div>
      }
    </div>
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

    .error-container mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
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

    .status-chip {
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 500;
      color: white;
      text-transform: uppercase;
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

    .info-card mat-card-header,
    .items-card mat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
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

    .no-items mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 8px;
    }

    .items-table {
      width: 100%;
    }

    .items-footer {
      display: flex;
      justify-content: flex-end;
      padding: 16px;
      background-color: #f5f5f5;
      border-radius: 0 0 4px 4px;
    }

    mat-divider {
      margin: 16px 0;
    }
  `]
})
export class DeliveryDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly deliveryService = inject(DeliveryService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly delivery = signal<Delivery | null>(null);

  readonly statusOptions = DELIVERY_STATUS_OPTIONS;
  readonly statusColors = DELIVERY_STATUS_COLORS;

  readonly itemColumns = ['product', 'quantity', 'unitPrice', 'totalPrice', 'actions'];

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
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Failed to load delivery');
        this.isLoading.set(false);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/deliveries']);
  }

  getStatusColor(status: DeliveryStatus): string {
    return this.statusColors[status] || '#9e9e9e';
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
        this.snackBar.open(`Status updated to ${this.getStatusLabel(newStatus)}`, 'Close', { duration: 3000 });
      },
      error: (err) => {
        this.snackBar.open(err.message || 'Failed to update status', 'Close', { duration: 5000 });
      }
    });
  }

  openAddItemDialog(): void {
    const dialogRef = this.dialog.open(AddItemDialogComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe((result: AddItemDialogResult | undefined) => {
      if (result?.action === 'add') {
        this.deliveryService.addItem(this.deliveryId, result.data).subscribe({
          next: () => {
            this.snackBar.open('Item added successfully', 'Close', { duration: 3000 });
            this.loadDelivery();
          },
          error: (err) => {
            this.snackBar.open(err.message || 'Failed to add item', 'Close', { duration: 5000 });
          }
        });
      }
    });
  }

  confirmRemoveItem(item: DeliveryItem): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Remove Item',
        message: `Are you sure you want to remove "${item.productName}" from this delivery?`,
        confirmText: 'Remove',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.deliveryService.removeItem(this.deliveryId, item.id).subscribe({
          next: () => {
            this.snackBar.open('Item removed successfully', 'Close', { duration: 3000 });
            this.loadDelivery();
          },
          error: (err) => {
            this.snackBar.open(err.message || 'Failed to remove item', 'Close', { duration: 5000 });
          }
        });
      }
    });
  }

  confirmDelete(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Delivery',
        message: `Are you sure you want to delete this delivery?`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.deliveryService.deleteDelivery(this.deliveryId).subscribe({
          next: () => {
            this.snackBar.open('Delivery deleted successfully', 'Close', { duration: 3000 });
            this.router.navigate(['/deliveries']);
          },
          error: (err) => {
            this.snackBar.open(err.message || 'Failed to delete delivery', 'Close', { duration: 5000 });
          }
        });
      }
    });
  }
}
