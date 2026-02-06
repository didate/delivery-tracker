import { Component, inject, signal, computed, OnInit, ViewChild, AfterViewInit } from '@angular/core';
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
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { debounceTime, Subject } from 'rxjs';

import { Customer, CreateCustomerDto } from './models/customer.model';
import { CustomerService } from './services/customer.service';
import { CustomerDialogComponent, CustomerDialogData, CustomerDialogResult } from './customer-dialog/customer-dialog.component';

@Component({
  selector: 'app-customers-list',
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
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatChipsModule,
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Customers</h1>
        <button mat-raised-button color="primary" (click)="openCreateDialog()">
          <mat-icon>add</mat-icon>
          Add Customer
        </button>
      </div>

      <mat-card>
        <mat-card-content>
          <div class="filters-row">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Search</mat-label>
              <input
                matInput
                [(ngModel)]="searchValue"
                (ngModelChange)="onSearchChange($event)"
                placeholder="Search by name, code, email...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>
          </div>

          @if (isLoading()) {
            <div class="loading-container">
              <mat-spinner diameter="40"></mat-spinner>
              <p>Loading customers...</p>
            </div>
          } @else if (error()) {
            <div class="error-container">
              <mat-icon color="warn">error</mat-icon>
              <p>{{ error() }}</p>
              <button mat-button color="primary" (click)="loadCustomers()">
                <mat-icon>refresh</mat-icon>
                Retry
              </button>
            </div>
          } @else {
            <div class="table-container">
              <table mat-table [dataSource]="dataSource" class="customers-table">

                <ng-container matColumnDef="code">
                  <th mat-header-cell *matHeaderCellDef>Code</th>
                  <td mat-cell *matCellDef="let customer">{{ customer.code }}</td>
                </ng-container>

                <ng-container matColumnDef="name">
                  <th mat-header-cell *matHeaderCellDef>Name</th>
                  <td mat-cell *matCellDef="let customer">{{ customer.name }}</td>
                </ng-container>

                <ng-container matColumnDef="phone">
                  <th mat-header-cell *matHeaderCellDef>Phone</th>
                  <td mat-cell *matCellDef="let customer">{{ customer.phone }}</td>
                </ng-container>

                <ng-container matColumnDef="email">
                  <th mat-header-cell *matHeaderCellDef>Email</th>
                  <td mat-cell *matCellDef="let customer">{{ customer.email }}</td>
                </ng-container>

                <ng-container matColumnDef="driver">
                  <th mat-header-cell *matHeaderCellDef>Driver</th>
                  <td mat-cell *matCellDef="let customer">
                    @if (customer.driverName) {
                      <span class="driver-badge">{{ customer.driverName }}</span>
                    } @else {
                      <span class="no-driver">Not assigned</span>
                    }
                  </td>
                </ng-container>

                <ng-container matColumnDef="active">
                  <th mat-header-cell *matHeaderCellDef>Status</th>
                  <td mat-cell *matCellDef="let customer">
                    <mat-slide-toggle
                      [checked]="customer.active"
                      (change)="toggleActive(customer)"
                      color="primary"
                      [matTooltip]="customer.active ? 'Deactivate customer' : 'Activate customer'">
                    </mat-slide-toggle>
                    <span class="status-label" [class.active]="customer.active">
                      {{ customer.active ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Actions</th>
                  <td mat-cell *matCellDef="let customer">
                    <button
                      mat-icon-button
                      color="primary"
                      (click)="openEditDialog(customer)"
                      matTooltip="Edit customer">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button
                      mat-icon-button
                      color="warn"
                      (click)="confirmDelete(customer)"
                      matTooltip="Delete customer">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

                <tr class="mat-row no-data-row" *matNoDataRow>
                  <td class="mat-cell" [attr.colspan]="displayedColumns.length">
                    @if (searchValue) {
                      No customers found matching "{{ searchValue }}"
                    } @else {
                      No customers found. Click "Add Customer" to create one.
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

    .search-field {
      width: 300px;
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

    .customers-table {
      width: 100%;
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

    .status-label {
      margin-left: 8px;
      font-size: 12px;
      color: #9e9e9e;
    }

    .status-label.active {
      color: #4caf50;
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
export class CustomersListComponent implements OnInit, AfterViewInit {
  private readonly customerService = inject(CustomerService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  readonly displayedColumns = ['code', 'name', 'phone', 'email', 'driver', 'active', 'actions'];

  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly customers = signal<Customer[]>([]);
  readonly totalItems = signal(0);
  readonly currentPage = signal(0);
  readonly pageSize = signal(10);

  searchValue = '';
  private readonly searchSubject = new Subject<string>();

  dataSource = new MatTableDataSource<Customer>([]);

  ngOnInit(): void {
    this.loadCustomers();

    this.searchSubject.pipe(
      debounceTime(300)
    ).subscribe(() => {
      this.currentPage.set(0);
      this.loadCustomers();
    });
  }

  ngAfterViewInit(): void {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  loadCustomers(): void {
    this.isLoading.set(true);
    this.error.set(null);

    const params = {
      page: this.currentPage(),
      size: this.pageSize(),
      search: this.searchValue || undefined
    };

    this.customerService.getCustomers(params).subscribe({
      next: (response) => {
        this.customers.set(response.data);
        this.dataSource.data = response.data;
        this.totalItems.set(response.total);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Failed to load customers');
        this.isLoading.set(false);
      }
    });
  }

  onSearchChange(value: string): void {
    this.searchSubject.next(value);
  }

  onPageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadCustomers();
  }

  openCreateDialog(): void {
    const dialogData: CustomerDialogData = {
      mode: 'create'
    };

    const dialogRef = this.dialog.open(CustomerDialogComponent, {
      width: '500px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe((result: CustomerDialogResult | undefined) => {
      if (result?.action === 'save') {
        this.customerService.createCustomer(result.data as CreateCustomerDto).subscribe({
          next: () => {
            this.snackBar.open('Customer created successfully', 'Close', { duration: 3000 });
            this.loadCustomers();
          },
          error: (err) => {
            this.snackBar.open(err.message || 'Failed to create customer', 'Close', { duration: 5000 });
          }
        });
      }
    });
  }

  openEditDialog(customer: Customer): void {
    const dialogData: CustomerDialogData = {
      mode: 'edit',
      customer
    };

    const dialogRef = this.dialog.open(CustomerDialogComponent, {
      width: '500px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe((result: CustomerDialogResult | undefined) => {
      if (result?.action === 'save') {
        this.customerService.updateCustomer(customer.id, result.data).subscribe({
          next: () => {
            this.snackBar.open('Customer updated successfully', 'Close', { duration: 3000 });
            this.loadCustomers();
          },
          error: (err) => {
            this.snackBar.open(err.message || 'Failed to update customer', 'Close', { duration: 5000 });
          }
        });
      }
    });
  }

  toggleActive(customer: Customer): void {
    const newActiveState = !customer.active;

    this.customerService.toggleActive(customer.id, newActiveState).subscribe({
      next: () => {
        const message = newActiveState ? 'Customer activated' : 'Customer deactivated';
        this.snackBar.open(message, 'Close', { duration: 3000 });
        this.loadCustomers();
      },
      error: (err) => {
        this.snackBar.open(err.message || 'Failed to update customer status', 'Close', { duration: 5000 });
      }
    });
  }

  confirmDelete(customer: Customer): void {
    const confirmed = confirm(`Are you sure you want to delete customer "${customer.name}"?`);

    if (confirmed) {
      this.customerService.deleteCustomer(customer.id).subscribe({
        next: () => {
          this.snackBar.open('Customer deleted successfully', 'Close', { duration: 3000 });
          this.loadCustomers();
        },
        error: (err) => {
          this.snackBar.open(err.message || 'Failed to delete customer', 'Close', { duration: 5000 });
        }
      });
    }
  }
}
