import { Component, inject, signal, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';

import { Return, ReturnStatus } from './models/return.model';
import { ReturnService } from './services/return.service';
import { ReturnDialogComponent, ReturnDialogData, ReturnDialogResult } from './return-dialog/return-dialog.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-returns-list',
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
    MatSelectModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatChipsModule,
    MatMenuModule,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Returns</h1>
        <button mat-raised-button color="primary" (click)="openCreateDialog()">
          <mat-icon>add</mat-icon>
          Create Return
        </button>
      </div>

      <mat-card>
        <mat-card-content>
          <div class="filters-row">
            <mat-form-field appearance="outline" class="status-filter">
              <mat-label>Status</mat-label>
              <mat-select [(ngModel)]="statusFilter" (selectionChange)="onStatusFilterChange()">
                <mat-option [value]="null">All Statuses</mat-option>
                <mat-option value="PENDING">Pending</mat-option>
                <mat-option value="PROCESSED">Processed</mat-option>
                <mat-option value="REJECTED">Rejected</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          @if (isLoading()) {
            <div class="loading-container">
              <mat-spinner diameter="40"></mat-spinner>
              <p>Loading returns...</p>
            </div>
          } @else if (error()) {
            <div class="error-container">
              <mat-icon color="warn">error</mat-icon>
              <p>{{ error() }}</p>
              <button mat-button color="primary" (click)="loadReturns()">
                <mat-icon>refresh</mat-icon>
                Retry
              </button>
            </div>
          } @else {
            <div class="table-container">
              <table mat-table [dataSource]="dataSource" class="returns-table">

                <ng-container matColumnDef="code">
                  <th mat-header-cell *matHeaderCellDef>Code</th>
                  <td mat-cell *matCellDef="let return">{{ return.code }}</td>
                </ng-container>

                <ng-container matColumnDef="customerName">
                  <th mat-header-cell *matHeaderCellDef>Customer</th>
                  <td mat-cell *matCellDef="let return">{{ return.customerName }}</td>
                </ng-container>

                <ng-container matColumnDef="returnDate">
                  <th mat-header-cell *matHeaderCellDef>Return Date</th>
                  <td mat-cell *matCellDef="let return">{{ return.returnDate | date:'mediumDate' }}</td>
                </ng-container>

                <ng-container matColumnDef="totalValue">
                  <th mat-header-cell *matHeaderCellDef>Total Value</th>
                  <td mat-cell *matCellDef="let return">\${{ return.totalValue | number:'1.2-2' }}</td>
                </ng-container>

                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Status</th>
                  <td mat-cell *matCellDef="let return">
                    <span class="status-chip" [ngClass]="getStatusClass(return.status)">
                      {{ return.status }}
                    </span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="createdDate">
                  <th mat-header-cell *matHeaderCellDef>Created</th>
                  <td mat-cell *matCellDef="let return">{{ return.createdDate | date:'short' }}</td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Actions</th>
                  <td mat-cell *matCellDef="let return">
                    <button
                      mat-icon-button
                      color="primary"
                      (click)="viewDetails(return)"
                      matTooltip="View details">
                      <mat-icon>visibility</mat-icon>
                    </button>

                    @if (return.status === 'PENDING') {
                      <button
                        mat-icon-button
                        [matMenuTriggerFor]="statusMenu"
                        matTooltip="Change status">
                        <mat-icon>more_vert</mat-icon>
                      </button>
                      <mat-menu #statusMenu="matMenu">
                        <button mat-menu-item (click)="updateStatus(return, 'PROCESSED')">
                          <mat-icon class="status-icon-processed">check_circle</mat-icon>
                          <span>Process</span>
                        </button>
                        <button mat-menu-item (click)="updateStatus(return, 'REJECTED')">
                          <mat-icon class="status-icon-rejected">cancel</mat-icon>
                          <span>Reject</span>
                        </button>
                      </mat-menu>

                      <button
                        mat-icon-button
                        color="warn"
                        (click)="confirmDelete(return)"
                        matTooltip="Delete return">
                        <mat-icon>delete</mat-icon>
                      </button>
                    }
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

                <tr class="mat-row no-data-row" *matNoDataRow>
                  <td class="mat-cell" [attr.colspan]="displayedColumns.length">
                    @if (statusFilter) {
                      No returns found with status "{{ statusFilter }}"
                    } @else {
                      No returns found. Click "Create Return" to add one.
                    }
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

    <!-- Return Details Dialog Template -->
    <ng-template #detailsDialog let-data>
      <h2 mat-dialog-title>Return Details - {{ data.return.code }}</h2>
      <mat-dialog-content class="details-content">
        <div class="details-grid">
          <div class="detail-item">
            <span class="detail-label">Customer:</span>
            <span class="detail-value">{{ data.return.customerName }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Return Date:</span>
            <span class="detail-value">{{ data.return.returnDate | date:'mediumDate' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Status:</span>
            <span class="status-chip" [ngClass]="getStatusClass(data.return.status)">
              {{ data.return.status }}
            </span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Total Value:</span>
            <span class="detail-value total-value">\${{ data.return.totalValue | number:'1.2-2' }}</span>
          </div>
        </div>

        @if (data.return.notes) {
          <div class="notes-section">
            <span class="detail-label">Notes:</span>
            <p class="notes-text">{{ data.return.notes }}</p>
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
            @for (item of data.return.items; track item.id) {
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
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Close</button>
      </mat-dialog-actions>
    </ng-template>
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

    .status-filter {
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

    .error-container mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
    }

    .table-container {
      overflow-x: auto;
    }

    .returns-table {
      width: 100%;
    }

    .status-chip {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
    }

    .status-pending {
      background-color: #fff3e0;
      color: #f57c00;
    }

    .status-processed {
      background-color: #e8f5e9;
      color: #2e7d32;
    }

    .status-rejected {
      background-color: #ffebee;
      color: #c62828;
    }

    .status-icon-processed {
      color: #2e7d32;
    }

    .status-icon-rejected {
      color: #c62828;
    }

    .no-data-row td {
      text-align: center;
      padding: 48px;
      color: #9e9e9e;
    }

    mat-paginator {
      border-top: 1px solid #e0e0e0;
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
export class ReturnsListComponent implements OnInit, AfterViewInit {
  private readonly returnService = inject(ReturnService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('detailsDialog') detailsDialogTemplate: any;

  readonly displayedColumns = ['code', 'customerName', 'returnDate', 'totalValue', 'status', 'createdDate', 'actions'];

  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly returns = signal<Return[]>([]);
  readonly totalItems = signal(0);
  readonly currentPage = signal(0);
  readonly pageSize = signal(10);

  statusFilter: ReturnStatus | null = null;

  dataSource = new MatTableDataSource<Return>([]);

  ngOnInit(): void {
    this.loadReturns();
  }

  ngAfterViewInit(): void {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
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
        this.dataSource.data = response.data;
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

  onPageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadReturns();
  }

  getStatusClass(status: ReturnStatus): string {
    switch (status) {
      case 'PENDING':
        return 'status-pending';
      case 'PROCESSED':
        return 'status-processed';
      case 'REJECTED':
        return 'status-rejected';
      default:
        return '';
    }
  }

  openCreateDialog(): void {
    const dialogData: ReturnDialogData = {
      mode: 'create'
    };

    const dialogRef = this.dialog.open(ReturnDialogComponent, {
      width: '700px',
      maxHeight: '90vh',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe((result: ReturnDialogResult | undefined) => {
      if (result?.action === 'save') {
        this.returnService.createReturn(result.data as any).subscribe({
          next: () => {
            this.snackBar.open('Return created successfully', 'Close', { duration: 3000 });
            this.loadReturns();
          },
          error: (err) => {
            this.snackBar.open(err.message || 'Failed to create return', 'Close', { duration: 5000 });
          }
        });
      }
    });
  }

  viewDetails(returnItem: Return): void {
    // First fetch the full return with items
    this.returnService.getReturn(returnItem.id).subscribe({
      next: (fullReturn) => {
        this.dialog.open(this.detailsDialogTemplate, {
          width: '700px',
          maxHeight: '90vh',
          data: { return: fullReturn }
        });
      },
      error: (err) => {
        this.snackBar.open(err.message || 'Failed to load return details', 'Close', { duration: 5000 });
      }
    });
  }

  updateStatus(returnItem: Return, newStatus: ReturnStatus): void {
    const action = newStatus === 'PROCESSED' ? 'process' : 'reject';
    const dialogData: ConfirmDialogData = {
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} Return`,
      message: `Are you sure you want to ${action} return "${returnItem.code}"?`,
      confirmText: action.charAt(0).toUpperCase() + action.slice(1),
      cancelText: 'Cancel'
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.returnService.updateStatus(returnItem.id, { status: newStatus }).subscribe({
          next: () => {
            const message = newStatus === 'PROCESSED' ? 'Return processed successfully' : 'Return rejected';
            this.snackBar.open(message, 'Close', { duration: 3000 });
            this.loadReturns();
          },
          error: (err) => {
            this.snackBar.open(err.message || `Failed to ${action} return`, 'Close', { duration: 5000 });
          }
        });
      }
    });
  }

  confirmDelete(returnItem: Return): void {
    const dialogData: ConfirmDialogData = {
      title: 'Delete Return',
      message: `Are you sure you want to delete return "${returnItem.code}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel'
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.returnService.deleteReturn(returnItem.id).subscribe({
          next: () => {
            this.snackBar.open('Return deleted successfully', 'Close', { duration: 3000 });
            this.loadReturns();
          },
          error: (err) => {
            this.snackBar.open(err.message || 'Failed to delete return', 'Close', { duration: 5000 });
          }
        });
      }
    });
  }
}
