import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';

import { Customer, CreateCustomerDto } from './models/customer.model';
import { CustomerService } from './services/customer.service';
import { CustomerDialogComponent, CustomerDialogResult } from './customer-dialog/customer-dialog.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { ToastComponent } from '../../shared/components/toast/toast.component';
import { ToastService } from '../../shared/components/toast/toast.service';

@Component({
  selector: 'app-customers-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CustomerDialogComponent,
    ConfirmDialogComponent,
    ToastComponent,
  ],
  template: `
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-semibold text-gray-900">Customers</h1>
        <button
          (click)="openCreateDialog()"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2">
          <i class="pi pi-plus"></i>
          Add Customer
        </button>
      </div>

      <!-- Main Card -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <!-- Search -->
        <div class="p-4 border-b border-gray-100">
          <div class="relative max-w-md">
            <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              [(ngModel)]="searchValue"
              (ngModelChange)="onSearchChange($event)"
              placeholder="Search by name, code, email..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
        </div>

        @if (isLoading()) {
          <div class="flex flex-col items-center justify-center py-16">
            <div class="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p class="mt-4 text-gray-500">Loading customers...</p>
          </div>
        } @else if (error()) {
          <div class="flex flex-col items-center justify-center py-16">
            <i class="pi pi-exclamation-circle text-5xl text-red-500 mb-4"></i>
            <p class="text-gray-600 mb-4">{{ error() }}</p>
            <button
              (click)="loadCustomers()"
              class="px-4 py-2 text-blue-600 hover:bg-blue-50 font-medium rounded-lg transition-colors flex items-center gap-2">
              <i class="pi pi-refresh"></i>
              Retry
            </button>
          </div>
        } @else {
          <!-- Table -->
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Code</th>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Phone</th>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Driver</th>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                @for (customer of customers(); track customer.id) {
                  <tr class="hover:bg-gray-50">
                    <td class="px-4 py-3 text-sm text-gray-900">{{ customer.code }}</td>
                    <td class="px-4 py-3 text-sm text-gray-900 font-medium">{{ customer.name }}</td>
                    <td class="px-4 py-3 text-sm text-gray-600">{{ customer.phone }}</td>
                    <td class="px-4 py-3 text-sm text-gray-600">{{ customer.email }}</td>
                    <td class="px-4 py-3 text-sm">
                      @if (customer.driverName) {
                        <span class="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                          {{ customer.driverName }}
                        </span>
                      } @else {
                        <span class="text-gray-400 italic text-xs">Not assigned</span>
                      }
                    </td>
                    <td class="px-4 py-3 text-sm">
                      <div class="flex items-center gap-2">
                        <label class="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            [checked]="customer.active"
                            (change)="toggleActive(customer)"
                            class="sr-only peer">
                          <div class="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                        <span class="text-xs" [class]="customer.active ? 'text-green-600' : 'text-gray-400'">
                          {{ customer.active ? 'Active' : 'Inactive' }}
                        </span>
                      </div>
                    </td>
                    <td class="px-4 py-3 text-sm">
                      <div class="flex items-center gap-1">
                        <button
                          (click)="openEditDialog(customer)"
                          class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit customer">
                          <i class="pi pi-pencil"></i>
                        </button>
                        <button
                          (click)="confirmDelete(customer)"
                          class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete customer">
                          <i class="pi pi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="7" class="px-4 py-16 text-center text-gray-500">
                      @if (searchValue) {
                        No customers found matching "{{ searchValue }}"
                      } @else {
                        No customers found. Click "Add Customer" to create one.
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          @if (totalItems() > pageSize()) {
            <div class="flex items-center justify-between px-4 py-3 border-t border-gray-200">
              <div class="text-sm text-gray-600">
                Showing {{ (currentPage() * pageSize()) + 1 }} to {{ Math.min((currentPage() + 1) * pageSize(), totalItems()) }} of {{ totalItems() }} entries
              </div>
              <div class="flex items-center gap-2">
                <button
                  (click)="goToPage(currentPage() - 1)"
                  [disabled]="currentPage() === 0"
                  class="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors">
                  Previous
                </button>
                @for (page of getPageNumbers(); track page) {
                  <button
                    (click)="goToPage(page)"
                    class="px-3 py-1 text-sm rounded-lg transition-colors"
                    [class]="currentPage() === page ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'">
                    {{ page + 1 }}
                  </button>
                }
                <button
                  (click)="goToPage(currentPage() + 1)"
                  [disabled]="currentPage() >= getTotalPages() - 1"
                  class="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors">
                  Next
                </button>
              </div>
            </div>
          }
        }
      </div>
    </div>

    <!-- Customer Dialog -->
    <app-customer-dialog
      [isOpen]="dialogOpen()"
      [mode]="dialogMode()"
      [customer]="selectedCustomer()"
      (save)="onDialogSave($event)"
      (cancel)="closeDialog()">
    </app-customer-dialog>

    <!-- Confirm Delete Dialog -->
    <app-confirm-dialog
      [isOpen]="confirmDialogOpen()"
      title="Delete Customer"
      [message]="'Are you sure you want to delete customer \\'' + (customerToDelete()?.name || '') + '\\'?'"
      confirmText="Delete"
      cancelText="Cancel"
      (confirm)="onDeleteConfirm()"
      (cancel)="closeConfirmDialog()">
    </app-confirm-dialog>

    <!-- Toast -->
    <app-toast></app-toast>
  `,
})
export class CustomersListComponent implements OnInit {
  private readonly customerService = inject(CustomerService);
  private readonly toastService = inject(ToastService);

  readonly Math = Math;

  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly customers = signal<Customer[]>([]);
  readonly totalItems = signal(0);
  readonly currentPage = signal(0);
  readonly pageSize = signal(10);

  readonly dialogOpen = signal(false);
  readonly dialogMode = signal<'create' | 'edit'>('create');
  readonly selectedCustomer = signal<Customer | null>(null);

  readonly confirmDialogOpen = signal(false);
  readonly customerToDelete = signal<Customer | null>(null);

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

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadCustomers();
  }

  getTotalPages(): number {
    return Math.ceil(this.totalItems() / this.pageSize());
  }

  getPageNumbers(): number[] {
    const total = this.getTotalPages();
    const current = this.currentPage();
    const pages: number[] = [];

    let start = Math.max(0, current - 2);
    let end = Math.min(total - 1, current + 2);

    if (end - start < 4) {
      if (start === 0) {
        end = Math.min(total - 1, 4);
      } else if (end === total - 1) {
        start = Math.max(0, total - 5);
      }
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  openCreateDialog(): void {
    this.selectedCustomer.set(null);
    this.dialogMode.set('create');
    this.dialogOpen.set(true);
  }

  openEditDialog(customer: Customer): void {
    this.selectedCustomer.set(customer);
    this.dialogMode.set('edit');
    this.dialogOpen.set(true);
  }

  closeDialog(): void {
    this.dialogOpen.set(false);
    this.selectedCustomer.set(null);
  }

  onDialogSave(result: CustomerDialogResult): void {
    if (result.action === 'save') {
      if (this.dialogMode() === 'create') {
        this.customerService.createCustomer(result.data as CreateCustomerDto).subscribe({
          next: () => {
            this.toastService.success('Success', 'Customer created successfully');
            this.closeDialog();
            this.loadCustomers();
          },
          error: (err) => {
            this.toastService.error('Error', err.message || 'Failed to create customer');
          }
        });
      } else {
        const customer = this.selectedCustomer();
        if (customer) {
          this.customerService.updateCustomer(customer.id, result.data).subscribe({
            next: () => {
              this.toastService.success('Success', 'Customer updated successfully');
              this.closeDialog();
              this.loadCustomers();
            },
            error: (err) => {
              this.toastService.error('Error', err.message || 'Failed to update customer');
            }
          });
        }
      }
    }
  }

  toggleActive(customer: Customer): void {
    const newActiveState = !customer.active;

    this.customerService.toggleActive(customer.id, newActiveState).subscribe({
      next: () => {
        const message = newActiveState ? 'Customer activated' : 'Customer deactivated';
        this.toastService.success('Success', message);
        this.loadCustomers();
      },
      error: (err) => {
        this.toastService.error('Error', err.message || 'Failed to update customer status');
      }
    });
  }

  confirmDelete(customer: Customer): void {
    this.customerToDelete.set(customer);
    this.confirmDialogOpen.set(true);
  }

  closeConfirmDialog(): void {
    this.confirmDialogOpen.set(false);
    this.customerToDelete.set(null);
  }

  onDeleteConfirm(): void {
    const customer = this.customerToDelete();
    if (customer) {
      this.customerService.deleteCustomer(customer.id).subscribe({
        next: () => {
          this.toastService.success('Success', 'Customer deleted successfully');
          this.closeConfirmDialog();
          this.loadCustomers();
        },
        error: (err) => {
          this.toastService.error('Error', err.message || 'Failed to delete customer');
        }
      });
    }
  }
}
