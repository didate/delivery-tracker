import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  Delivery,
  DeliveryStatus,
  DELIVERY_STATUS_OPTIONS,
  CreateDeliveryDto
} from './models/delivery.model';
import { DeliveryService } from './services/delivery.service';
import { DeliveryDialogComponent, DeliveryDialogResult } from './delivery-dialog/delivery-dialog.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { ToastComponent } from '../../shared/components/toast/toast.component';
import { ToastService } from '../../shared/components/toast/toast.service';

@Component({
  selector: 'app-deliveries-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DatePipe,
    CurrencyPipe,
    DeliveryDialogComponent,
    ConfirmDialogComponent,
    ToastComponent,
  ],
  template: `
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-semibold text-gray-900">Deliveries</h1>
        <button
          (click)="openCreateDialog()"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2">
          <i class="pi pi-plus"></i>
          New Delivery
        </button>
      </div>

      <!-- Main Card -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <!-- Filters -->
        <div class="p-4 border-b border-gray-100">
          <div class="flex flex-wrap gap-4 items-end">
            <div class="flex flex-col gap-1 w-44">
              <label for="statusFilter" class="text-xs font-medium text-gray-500">Status</label>
              <select
                id="statusFilter"
                [(ngModel)]="statusFilter"
                (ngModelChange)="onFilterChange()"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
                <option [ngValue]="null">All Statuses</option>
                @for (status of statusFilterOptions; track status.value) {
                  <option [ngValue]="status.value">{{ status.label }}</option>
                }
              </select>
            </div>

            <div class="flex flex-col gap-1 w-44">
              <label for="startDate" class="text-xs font-medium text-gray-500">Start Date</label>
              <input
                id="startDate"
                type="date"
                [(ngModel)]="startDateFilter"
                (ngModelChange)="onFilterChange()"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>

            <div class="flex flex-col gap-1 w-44">
              <label for="endDate" class="text-xs font-medium text-gray-500">End Date</label>
              <input
                id="endDate"
                type="date"
                [(ngModel)]="endDateFilter"
                (ngModelChange)="onFilterChange()"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>

            <div class="ml-auto">
              <button
                (click)="clearFilters()"
                class="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 font-medium rounded-lg transition-colors flex items-center gap-2">
                <i class="pi pi-times"></i>
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        @if (isLoading()) {
          <div class="flex flex-col items-center justify-center py-16">
            <div class="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p class="mt-4 text-gray-500">Loading deliveries...</p>
          </div>
        } @else if (error()) {
          <div class="flex flex-col items-center justify-center py-16">
            <i class="pi pi-exclamation-circle text-5xl text-red-500 mb-4"></i>
            <p class="text-gray-600 mb-4">{{ error() }}</p>
            <button
              (click)="loadDeliveries()"
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
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Customer</th>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Driver</th>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Delivery Date</th>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Total</th>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                @for (delivery of deliveries(); track delivery.id) {
                  <tr class="hover:bg-gray-50 cursor-pointer" (click)="viewDetails(delivery)">
                    <td class="px-4 py-3 text-sm text-gray-900">{{ delivery.code }}</td>
                    <td class="px-4 py-3 text-sm text-gray-900 font-medium">{{ delivery.customerName }}</td>
                    <td class="px-4 py-3 text-sm">
                      @if (delivery.driverName) {
                        <span class="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                          {{ delivery.driverName }}
                        </span>
                      } @else {
                        <span class="text-gray-400 italic text-xs">Not assigned</span>
                      }
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-600">{{ delivery.deliveryDate | date:'mediumDate' }}</td>
                    <td class="px-4 py-3 text-sm">
                      <span [class]="getStatusClasses(delivery.status)">
                        {{ getStatusLabel(delivery.status) }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-900 font-medium">{{ delivery.totalAmount | currency }}</td>
                    <td class="px-4 py-3 text-sm" (click)="$event.stopPropagation()">
                      <div class="flex items-center gap-1">
                        <button
                          (click)="viewDetails(delivery)"
                          class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View details">
                          <i class="pi pi-eye"></i>
                        </button>
                        <div class="relative">
                          <button
                            (click)="toggleStatusMenu(delivery)"
                            [disabled]="delivery.status === 'COMPLETED' || delivery.status === 'CANCELLED'"
                            class="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Change status">
                            <i class="pi pi-arrows-h"></i>
                          </button>
                          @if (statusMenuOpen() && selectedDelivery()?.id === delivery.id) {
                            <div class="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                              @for (status of getAvailableStatuses(delivery.status); track status.value) {
                                <button
                                  (click)="updateStatus(delivery, status.value)"
                                  class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg">
                                  {{ status.label }}
                                </button>
                              }
                            </div>
                          }
                        </div>
                        <button
                          (click)="confirmDelete(delivery)"
                          [disabled]="delivery.status !== 'PENDING'"
                          class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete delivery">
                          <i class="pi pi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="7" class="px-4 py-16 text-center text-gray-500">
                      No deliveries found. Click "New Delivery" to create one.
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
                <select
                  [(ngModel)]="pageSizeValue"
                  (ngModelChange)="onPageSizeChange($event)"
                  class="px-2 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  @for (size of [5, 10, 25, 50]; track size) {
                    <option [ngValue]="size">{{ size }}</option>
                  }
                </select>
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

    <!-- Delivery Dialog -->
    <app-delivery-dialog
      [isOpen]="dialogOpen()"
      mode="create"
      (save)="onDialogSave($event)"
      (cancel)="closeDialog()">
    </app-delivery-dialog>

    <!-- Confirm Delete Dialog -->
    <app-confirm-dialog
      [isOpen]="confirmDialogOpen()"
      title="Delete Delivery"
      [message]="'Are you sure you want to delete delivery \\'' + (deliveryToDelete()?.code || '') + '\\'?'"
      confirmText="Delete"
      cancelText="Cancel"
      (confirm)="onDeleteConfirm()"
      (cancel)="closeConfirmDialog()">
    </app-confirm-dialog>

    <!-- Toast -->
    <app-toast></app-toast>
  `,
})
export class DeliveriesListComponent implements OnInit {
  private readonly deliveryService = inject(DeliveryService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  readonly Math = Math;

  readonly statusOptions = DELIVERY_STATUS_OPTIONS;
  readonly statusFilterOptions = [...DELIVERY_STATUS_OPTIONS];

  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly deliveries = signal<Delivery[]>([]);
  readonly totalItems = signal(0);
  readonly currentPage = signal(0);
  readonly pageSize = signal(10);

  readonly dialogOpen = signal(false);
  readonly confirmDialogOpen = signal(false);
  readonly deliveryToDelete = signal<Delivery | null>(null);
  readonly statusMenuOpen = signal(false);
  readonly selectedDelivery = signal<Delivery | null>(null);

  statusFilter: DeliveryStatus | null = null;
  startDateFilter: string | null = null;
  endDateFilter: string | null = null;
  pageSizeValue = 10;

  ngOnInit(): void {
    this.loadDeliveries();
    // Close status menu when clicking outside
    document.addEventListener('click', () => {
      this.statusMenuOpen.set(false);
    });
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
      params['startDate'] = this.startDateFilter;
    }
    if (this.endDateFilter) {
      params['endDate'] = this.endDateFilter;
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

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadDeliveries();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(0);
    this.loadDeliveries();
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

  getStatusClasses(status: DeliveryStatus): string {
    const baseClasses = 'px-2 py-1 rounded text-xs font-medium';
    switch (status) {
      case 'PENDING':
        return `${baseClasses} bg-yellow-100 text-yellow-700`;
      case 'IN_PROGRESS':
        return `${baseClasses} bg-blue-100 text-blue-700`;
      case 'COMPLETED':
        return `${baseClasses} bg-green-100 text-green-700`;
      case 'CANCELLED':
        return `${baseClasses} bg-red-100 text-red-700`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-700`;
    }
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

  toggleStatusMenu(delivery: Delivery): void {
    event?.stopPropagation();
    if (this.selectedDelivery()?.id === delivery.id && this.statusMenuOpen()) {
      this.statusMenuOpen.set(false);
    } else {
      this.selectedDelivery.set(delivery);
      this.statusMenuOpen.set(true);
    }
  }

  viewDetails(delivery: Delivery): void {
    this.router.navigate(['/deliveries', delivery.id]);
  }

  openCreateDialog(): void {
    this.dialogOpen.set(true);
  }

  closeDialog(): void {
    this.dialogOpen.set(false);
  }

  onDialogSave(result: DeliveryDialogResult): void {
    if (result.action === 'save') {
      this.deliveryService.createDelivery(result.data).subscribe({
        next: () => {
          this.toastService.success('Success', 'Delivery created successfully');
          this.closeDialog();
          this.loadDeliveries();
        },
        error: (err) => {
          this.toastService.error('Error', err.message || 'Failed to create delivery');
        }
      });
    }
  }

  updateStatus(delivery: Delivery, newStatus: DeliveryStatus): void {
    this.statusMenuOpen.set(false);
    this.deliveryService.updateStatus(delivery.id, { status: newStatus }).subscribe({
      next: () => {
        this.toastService.success('Success', `Delivery status updated to ${this.getStatusLabel(newStatus)}`);
        this.loadDeliveries();
      },
      error: (err) => {
        this.toastService.error('Error', err.message || 'Failed to update status');
      }
    });
  }

  confirmDelete(delivery: Delivery): void {
    this.deliveryToDelete.set(delivery);
    this.confirmDialogOpen.set(true);
  }

  closeConfirmDialog(): void {
    this.confirmDialogOpen.set(false);
    this.deliveryToDelete.set(null);
  }

  onDeleteConfirm(): void {
    const delivery = this.deliveryToDelete();
    if (delivery) {
      this.deliveryService.deleteDelivery(delivery.id).subscribe({
        next: () => {
          this.toastService.success('Success', 'Delivery deleted successfully');
          this.closeConfirmDialog();
          this.loadDeliveries();
        },
        error: (err) => {
          this.toastService.error('Error', err.message || 'Failed to delete delivery');
        }
      });
    }
  }
}
