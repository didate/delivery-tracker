import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
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
    TableModule,
    ButtonModule,
    InputTextModule,
    CardModule,
    ToggleButtonModule,
    ToggleSwitchModule,
    ProgressSpinnerModule,
    TooltipModule,
    ToastModule,
  ],
  providers: [DialogService, MessageService],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Customers</h1>
        <p-button
          label="Add Customer"
          icon="pi pi-plus"
          (onClick)="openCreateDialog()">
        </p-button>
      </div>

      <p-card>
        <div class="filters-row">
          <span class="p-input-icon-right search-field">
            <i class="pi pi-search"></i>
            <input
              type="text"
              pInputText
              [(ngModel)]="searchValue"
              (ngModelChange)="onSearchChange($event)"
              placeholder="Search by name, code, email..." />
          </span>
        </div>

        @if (isLoading()) {
          <div class="loading-container">
            <p-progressSpinner [style]="{width: '40px', height: '40px'}"></p-progressSpinner>
            <p>Loading customers...</p>
          </div>
        } @else if (error()) {
          <div class="error-container">
            <i class="pi pi-exclamation-circle error-icon"></i>
            <p>{{ error() }}</p>
            <p-button
              label="Retry"
              icon="pi pi-refresh"
              [text]="true"
              (onClick)="loadCustomers()">
            </p-button>
          </div>
        } @else {
          <p-table
            [value]="customers()"
            [paginator]="true"
            [rows]="pageSize()"
            [totalRecords]="totalItems()"
            [lazy]="true"
            (onLazyLoad)="onLazyLoad($event)"
            [rowsPerPageOptions]="[5, 10, 25, 50]"
            [showCurrentPageReport]="true"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
            [tableStyle]="{'min-width': '60rem'}">

            <ng-template pTemplate="header">
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Driver</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </ng-template>

            <ng-template pTemplate="body" let-customer>
              <tr>
                <td>{{ customer.code }}</td>
                <td>{{ customer.name }}</td>
                <td>{{ customer.phone }}</td>
                <td>{{ customer.email }}</td>
                <td>
                  @if (customer.driverName) {
                    <span class="driver-badge">{{ customer.driverName }}</span>
                  } @else {
                    <span class="no-driver">Not assigned</span>
                  }
                </td>
                <td>
                  <p-toggleswitch
                    [(ngModel)]="customer.active"
                    (onChange)="toggleActive(customer)"
                    [pTooltip]="customer.active ? 'Deactivate customer' : 'Activate customer'">
                  </p-toggleswitch>
                  <span class="status-label" [class.active]="customer.active">
                    {{ customer.active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td>
                  <p-button
                    icon="pi pi-pencil"
                    [rounded]="true"
                    [text]="true"
                    severity="info"
                    (onClick)="openEditDialog(customer)"
                    pTooltip="Edit customer">
                  </p-button>
                  <p-button
                    icon="pi pi-trash"
                    [rounded]="true"
                    [text]="true"
                    severity="danger"
                    (onClick)="confirmDelete(customer)"
                    pTooltip="Delete customer">
                  </p-button>
                </td>
              </tr>
            </ng-template>

            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="7" class="no-data-cell">
                  @if (searchValue) {
                    No customers found matching "{{ searchValue }}"
                  } @else {
                    No customers found. Click "Add Customer" to create one.
                  }
                </td>
              </tr>
            </ng-template>
          </p-table>
        }
      </p-card>
    </div>
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

    .search-field {
      width: 300px;
    }

    .search-field input {
      width: 100%;
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

    .no-data-cell {
      text-align: center;
      padding: 48px;
      color: #9e9e9e;
    }
  `]
})
export class CustomersListComponent implements OnInit {
  private readonly customerService = inject(CustomerService);
  private readonly dialogService = inject(DialogService);
  private readonly messageService = inject(MessageService);

  private dialogRef: DynamicDialogRef<any> | undefined;

  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly customers = signal<Customer[]>([]);
  readonly totalItems = signal(0);
  readonly currentPage = signal(0);
  readonly pageSize = signal(10);

  searchValue = '';
  private readonly searchSubject = new Subject<string>();

  ngOnInit(): void {
    this.loadCustomers();

    this.searchSubject.pipe(
      debounceTime(300)
    ).subscribe(() => {
      this.currentPage.set(0);
      this.loadCustomers();
    });
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

  onLazyLoad(event: any): void {
    const page = event.first / event.rows;
    this.currentPage.set(page);
    this.pageSize.set(event.rows);
    this.loadCustomers();
  }

  openCreateDialog(): void {
    const dialogData: CustomerDialogData = {
      mode: 'create'
    };

    this.dialogRef = this.dialogService.open(CustomerDialogComponent, {
      header: 'Add Customer',
      width: '500px',
      data: dialogData
    }) ?? undefined;

    this.dialogRef?.onClose.subscribe((result: CustomerDialogResult | undefined) => {
      if (result?.action === 'save') {
        this.customerService.createCustomer(result.data as CreateCustomerDto).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Customer created successfully'
            });
            this.loadCustomers();
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: err.message || 'Failed to create customer'
            });
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

    this.dialogRef = this.dialogService.open(CustomerDialogComponent, {
      header: 'Edit Customer',
      width: '500px',
      data: dialogData
    }) ?? undefined;

    this.dialogRef?.onClose.subscribe((result: CustomerDialogResult | undefined) => {
      if (result?.action === 'save') {
        this.customerService.updateCustomer(customer.id, result.data).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Customer updated successfully'
            });
            this.loadCustomers();
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: err.message || 'Failed to update customer'
            });
          }
        });
      }
    });
  }

  toggleActive(customer: Customer): void {
    const newActiveState = customer.active;

    this.customerService.toggleActive(customer.id, newActiveState).subscribe({
      next: () => {
        const message = newActiveState ? 'Customer activated' : 'Customer deactivated';
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: message
        });
        this.loadCustomers();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.message || 'Failed to update customer status'
        });
      }
    });
  }

  confirmDelete(customer: Customer): void {
    const confirmed = confirm(`Are you sure you want to delete customer "${customer.name}"?`);

    if (confirmed) {
      this.customerService.deleteCustomer(customer.id).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Customer deleted successfully'
          });
          this.loadCustomers();
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err.message || 'Failed to delete customer'
          });
        }
      });
    }
  }
}
