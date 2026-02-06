import { Component, inject, signal, OnInit, ViewChild } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatMenuModule } from '@angular/material/menu';

import {
  Delivery,
  DeliveryStatus,
  DELIVERY_STATUS_OPTIONS,
  DELIVERY_STATUS_COLORS
} from './models/delivery.model';
import { DeliveryService } from './services/delivery.service';
import { DeliveryDialogComponent, DeliveryDialogData, DeliveryDialogResult } from './delivery-dialog/delivery-dialog.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-deliveries-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatChipsModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatMenuModule,
    DatePipe,
    CurrencyPipe,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Deliveries</h1>
        <button mat-raised-button color="primary" (click)="openCreateDialog()">
          <mat-icon>add</mat-icon>
          New Delivery
        </button>
      </div>

      <mat-card>
        <mat-card-content>
          <div class="filters-row">
            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Status</mat-label>
              <mat-select [(ngModel)]="statusFilter" (selectionChange)="onFilterChange()">
                <mat-option [value]="null">All Statuses</mat-option>
                @for (status of statusOptions; track status.value) {
                  <mat-option [value]="status.value">{{ status.label }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Start Date</mat-label>
              <input matInput [matDatepicker]="startPicker" [(ngModel)]="startDateFilter" (dateChange)="onFilterChange()">
              <mat-datepicker-toggle matIconSuffix [for]="startPicker"></mat-datepicker-toggle>
              <mat-datepicker #startPicker></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>End Date</mat-label>
              <input matInput [matDatepicker]="endPicker" [(ngModel)]="endDateFilter" (dateChange)="onFilterChange()">
              <mat-datepicker-toggle matIconSuffix [for]="endPicker"></mat-datepicker-toggle>
              <mat-datepicker #endPicker></mat-datepicker>
            </mat-form-field>

            <button mat-button color="primary" (click)="clearFilters()" class="clear-filters-btn">
              <mat-icon>clear</mat-icon>
              Clear Filters
            </button>
          </div>

          @if (isLoading()) {
            <div class="loading-container">
              <mat-spinner diameter="40"></mat-spinner>
              <p>Loading deliveries...</p>
            </div>
          } @else if (error()) {
            <div class="error-container">
              <mat-icon color="warn">error</mat-icon>
              <p>{{ error() }}</p>
              <button mat-button color="primary" (click)="loadDeliveries()">
                <mat-icon>refresh</mat-icon>
                Retry
              </button>
            </div>
          } @else {
            <div class="table-container">
              <table mat-table [dataSource]="dataSource" class="deliveries-table">

                <ng-container matColumnDef="code">
                  <th mat-header-cell *matHeaderCellDef>Code</th>
                  <td mat-cell *matCellDef="let delivery">{{ delivery.code }}</td>
                </ng-container>

                <ng-container matColumnDef="customer">
                  <th mat-header-cell *matHeaderCellDef>Customer</th>
                  <td mat-cell *matCellDef="let delivery">{{ delivery.customerName }}</td>
                </ng-container>

                <ng-container matColumnDef="driver">
                  <th mat-header-cell *matHeaderCellDef>Driver</th>
                  <td mat-cell *matCellDef="let delivery">
                    @if (delivery.driverName) {
                      <span class="driver-badge">{{ delivery.driverName }}</span>
                    } @else {
                      <span class="no-driver">Not assigned</span>
                    }
                  </td>
                </ng-container>

                <ng-container matColumnDef="deliveryDate">
                  <th mat-header-cell *matHeaderCellDef>Delivery Date</th>
                  <td mat-cell *matCellDef="let delivery">{{ delivery.deliveryDate | date:'mediumDate' }}</td>
                </ng-container>

                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Status</th>
                  <td mat-cell *matCellDef="let delivery">
                    <span class="status-chip" [style.background-color]="getStatusColor(delivery.status)">
                      {{ getStatusLabel(delivery.status) }}
                    </span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="totalAmount">
                  <th mat-header-cell *matHeaderCellDef>Total</th>
                  <td mat-cell *matCellDef="let delivery">{{ delivery.totalAmount | currency }}</td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Actions</th>
                  <td mat-cell *matCellDef="let delivery">
                    <button
                      mat-icon-button
                      color="primary"
                      (click)="viewDetails(delivery)"
                      matTooltip="View details">
                      <mat-icon>visibility</mat-icon>
                    </button>
                    <button
                      mat-icon-button
                      [matMenuTriggerFor]="statusMenu"
                      matTooltip="Change status"
                      [disabled]="delivery.status === 'COMPLETED' || delivery.status === 'CANCELLED'">
                      <mat-icon>swap_horiz</mat-icon>
                    </button>
                    <mat-menu #statusMenu="matMenu">
                      @for (status of getAvailableStatuses(delivery.status); track status.value) {
                        <button mat-menu-item (click)="updateStatus(delivery, status.value)">
                          <span class="status-menu-item" [style.color]="getStatusColor(status.value)">
                            {{ status.label }}
                          </span>
                        </button>
                      }
                    </mat-menu>
                    <button
                      mat-icon-button
                      color="warn"
                      (click)="confirmDelete(delivery)"
                      matTooltip="Delete delivery"
                      [disabled]="delivery.status !== 'PENDING'">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="clickable-row" (click)="viewDetails(row)"></tr>

                <tr class="mat-row no-data-row" *matNoDataRow>
                  <td class="mat-cell" [attr.colspan]="displayedColumns.length">
                    No deliveries found. Click "New Delivery" to create one.
                  </td>
                </tr>
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

    .filters-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
      flex-wrap: wrap;
      align-items: center;
    }

    .filter-field {
      width: 180px;
    }

    .clear-filters-btn {
      margin-left: auto;
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

    .table-container {
      overflow-x: auto;
    }

    .deliveries-table {
      width: 100%;
    }

    .clickable-row {
      cursor: pointer;
    }

    .clickable-row:hover {
      background-color: rgba(0, 0, 0, 0.04);
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

    .status-chip {
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 500;
      color: white;
      text-transform: uppercase;
    }

    .status-menu-item {
      font-weight: 500;
    }

    .no-data-row td {
      text-align: center;
      padding: 48px;
      color: #9e9e9e;
    }

    mat-paginator {
      border-top: 1px solid #e0e0e0;
    }
  `]
})
export class DeliveriesListComponent implements OnInit {
  private readonly deliveryService = inject(DeliveryService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  readonly displayedColumns = ['code', 'customer', 'driver', 'deliveryDate', 'status', 'totalAmount', 'actions'];
  readonly statusOptions = DELIVERY_STATUS_OPTIONS;
  readonly statusColors = DELIVERY_STATUS_COLORS;

  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly deliveries = signal<Delivery[]>([]);
  readonly totalItems = signal(0);
  readonly currentPage = signal(0);
  readonly pageSize = signal(10);

  statusFilter: DeliveryStatus | null = null;
  startDateFilter: Date | null = null;
  endDateFilter: Date | null = null;

  dataSource = new MatTableDataSource<Delivery>([]);

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
        this.dataSource.data = response.data;
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

  onPageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadDeliveries();
  }

  getStatusColor(status: DeliveryStatus): string {
    return this.statusColors[status] || '#9e9e9e';
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

  viewDetails(delivery: Delivery): void {
    this.router.navigate(['/deliveries', delivery.id]);
  }

  openCreateDialog(): void {
    const dialogData: DeliveryDialogData = {
      mode: 'create'
    };

    const dialogRef = this.dialog.open(DeliveryDialogComponent, {
      width: '700px',
      maxHeight: '90vh',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe((result: DeliveryDialogResult | undefined) => {
      if (result?.action === 'save') {
        this.deliveryService.createDelivery(result.data).subscribe({
          next: () => {
            this.snackBar.open('Delivery created successfully', 'Close', { duration: 3000 });
            this.loadDeliveries();
          },
          error: (err) => {
            this.snackBar.open(err.message || 'Failed to create delivery', 'Close', { duration: 5000 });
          }
        });
      }
    });
  }

  updateStatus(delivery: Delivery, newStatus: DeliveryStatus): void {
    this.deliveryService.updateStatus(delivery.id, { status: newStatus }).subscribe({
      next: () => {
        this.snackBar.open(`Delivery status updated to ${this.getStatusLabel(newStatus)}`, 'Close', { duration: 3000 });
        this.loadDeliveries();
      },
      error: (err) => {
        this.snackBar.open(err.message || 'Failed to update status', 'Close', { duration: 5000 });
      }
    });
  }

  confirmDelete(delivery: Delivery): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Delivery',
        message: `Are you sure you want to delete delivery "${delivery.code}"?`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.deliveryService.deleteDelivery(delivery.id).subscribe({
          next: () => {
            this.snackBar.open('Delivery deleted successfully', 'Close', { duration: 3000 });
            this.loadDeliveries();
          },
          error: (err) => {
            this.snackBar.open(err.message || 'Failed to delete delivery', 'Close', { duration: 5000 });
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
