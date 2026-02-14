import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Driver, CreateDriverDto } from './models/driver.model';
import { DriverService } from './services/driver.service';
import { DriverDialogComponent, DriverDialogResult } from './driver-dialog/driver-dialog.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { ToastComponent } from '../../shared/components/toast/toast.component';
import { ToastService } from '../../shared/components/toast/toast.service';

interface StatusOption {
  label: string;
  value: boolean | null;
}

@Component({
  selector: 'app-drivers-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DriverDialogComponent,
    ConfirmDialogComponent,
    ToastComponent,
  ],
  template: `
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-semibold text-gray-900">Drivers</h1>
        <button
          (click)="openCreateDialog()"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2">
          <i class="pi pi-plus"></i>
          Add Driver
        </button>
      </div>

      <!-- Main Card -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <!-- Filters -->
        <div class="p-4 border-b border-gray-100">
          <div class="flex items-center gap-4">
            <div class="relative">
              <select
                [(ngModel)]="activeFilter"
                (ngModelChange)="onFilterChange()"
                class="appearance-none px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-w-[150px]">
                @for (option of statusOptions; track option.value) {
                  <option [ngValue]="option.value">{{ option.label }}</option>
                }
              </select>
              <i class="pi pi-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></i>
            </div>
          </div>
        </div>

        @if (loading()) {
          <div class="flex flex-col items-center justify-center py-16">
            <div class="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p class="mt-4 text-gray-500">Loading drivers...</p>
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
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Vehicle</th>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Production Site</th>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                @for (driver of drivers(); track driver.id) {
                  <tr class="hover:bg-gray-50">
                    <td class="px-4 py-3 text-sm text-gray-900">{{ driver.code }}</td>
                    <td class="px-4 py-3 text-sm text-gray-900 font-medium">{{ driver.firstName }} {{ driver.lastName }}</td>
                    <td class="px-4 py-3 text-sm text-gray-600">{{ driver.phone }}</td>
                    <td class="px-4 py-3 text-sm text-gray-600">{{ driver.vehicleType }} - {{ driver.vehiclePlate }}</td>
                    <td class="px-4 py-3 text-sm">
                      @if (driver.productionSiteName) {
                        <span class="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                          {{ driver.productionSiteName }}
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
                            [checked]="driver.active"
                            (change)="toggleActive(driver)"
                            class="sr-only peer">
                          <div class="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                        <span class="text-xs" [class]="driver.active ? 'text-green-600' : 'text-gray-400'">
                          {{ driver.active ? 'Active' : 'Inactive' }}
                        </span>
                      </div>
                    </td>
                    <td class="px-4 py-3 text-sm">
                      <div class="flex items-center gap-1">
                        <button
                          (click)="openEditDialog(driver)"
                          class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit driver">
                          <i class="pi pi-pencil"></i>
                        </button>
                        <button
                          (click)="confirmDelete(driver)"
                          class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete driver">
                          <i class="pi pi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="7" class="px-4 py-16 text-center text-gray-500">
                      No drivers found.
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

    <!-- Driver Dialog -->
    <app-driver-dialog
      [isOpen]="dialogOpen()"
      [mode]="dialogMode()"
      [driver]="selectedDriver()"
      (save)="onDialogSave($event)"
      (cancel)="closeDialog()">
    </app-driver-dialog>

    <!-- Confirm Delete Dialog -->
    <app-confirm-dialog
      [isOpen]="confirmDialogOpen()"
      title="Delete Driver"
      [message]="'Are you sure you want to delete driver \\'' + (driverToDelete()?.firstName || '') + ' ' + (driverToDelete()?.lastName || '') + '\\'?'"
      confirmText="Delete"
      cancelText="Cancel"
      (confirm)="onDeleteConfirm()"
      (cancel)="closeConfirmDialog()">
    </app-confirm-dialog>

    <!-- Toast -->
    <app-toast></app-toast>
  `,
})
export class DriversListComponent implements OnInit {
  private readonly driverService = inject(DriverService);
  private readonly toastService = inject(ToastService);

  readonly Math = Math;

  readonly loading = signal(false);
  readonly drivers = signal<Driver[]>([]);
  readonly totalItems = signal(0);
  readonly currentPage = signal(0);
  readonly pageSize = signal(10);

  readonly dialogOpen = signal(false);
  readonly dialogMode = signal<'create' | 'edit'>('create');
  readonly selectedDriver = signal<Driver | null>(null);

  readonly confirmDialogOpen = signal(false);
  readonly driverToDelete = signal<Driver | null>(null);

  activeFilter: boolean | null = null;

  statusOptions: StatusOption[] = [
    { label: 'All', value: null },
    { label: 'Active', value: true },
    { label: 'Inactive', value: false }
  ];

  ngOnInit(): void {
    this.loadDrivers();
  }

  loadDrivers(): void {
    this.loading.set(true);

    const params: Record<string, number | boolean> = {
      page: this.currentPage(),
      size: this.pageSize()
    };

    if (this.activeFilter !== null) {
      params['active'] = this.activeFilter;
    }

    this.driverService.getDrivers(params).subscribe({
      next: (response) => {
        this.drivers.set(response.data);
        this.totalItems.set(response.total);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load drivers:', err);
        this.loading.set(false);
        this.toastService.error('Error', 'Failed to load drivers');
      }
    });
  }

  onFilterChange(): void {
    this.currentPage.set(0);
    this.loadDrivers();
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadDrivers();
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
    this.selectedDriver.set(null);
    this.dialogMode.set('create');
    this.dialogOpen.set(true);
  }

  openEditDialog(driver: Driver): void {
    this.selectedDriver.set(driver);
    this.dialogMode.set('edit');
    this.dialogOpen.set(true);
  }

  closeDialog(): void {
    this.dialogOpen.set(false);
    this.selectedDriver.set(null);
  }

  onDialogSave(result: DriverDialogResult): void {
    if (result.action === 'save') {
      if (this.dialogMode() === 'create') {
        this.driverService.createDriver(result.data as CreateDriverDto).subscribe({
          next: () => {
            this.toastService.success('Success', 'Driver created successfully');
            this.closeDialog();
            this.loadDrivers();
          },
          error: (err) => {
            this.toastService.error('Error', err.message || 'Failed to create driver');
          }
        });
      } else {
        const driver = this.selectedDriver();
        if (driver) {
          this.driverService.updateDriver(driver.id, result.data).subscribe({
            next: () => {
              this.toastService.success('Success', 'Driver updated successfully');
              this.closeDialog();
              this.loadDrivers();
            },
            error: (err) => {
              this.toastService.error('Error', err.message || 'Failed to update driver');
            }
          });
        }
      }
    }
  }

  toggleActive(driver: Driver): void {
    const action = driver.active
      ? this.driverService.deactivateDriver(driver.id)
      : this.driverService.activateDriver(driver.id);

    action.subscribe({
      next: () => {
        const status = driver.active ? 'deactivated' : 'activated';
        this.toastService.success('Success', `Driver ${status} successfully`);
        this.loadDrivers();
      },
      error: (err) => {
        console.error('Failed to toggle driver status:', err);
        this.toastService.error('Error', 'Failed to update driver status');
      }
    });
  }

  confirmDelete(driver: Driver): void {
    this.driverToDelete.set(driver);
    this.confirmDialogOpen.set(true);
  }

  closeConfirmDialog(): void {
    this.confirmDialogOpen.set(false);
    this.driverToDelete.set(null);
  }

  onDeleteConfirm(): void {
    const driver = this.driverToDelete();
    if (driver) {
      this.driverService.deleteDriver(driver.id).subscribe({
        next: () => {
          this.toastService.success('Success', 'Driver deleted successfully');
          this.closeConfirmDialog();
          this.loadDrivers();
        },
        error: (err) => {
          console.error('Failed to delete driver:', err);
          this.toastService.error('Error', 'Failed to delete driver');
        }
      });
    }
  }
}
