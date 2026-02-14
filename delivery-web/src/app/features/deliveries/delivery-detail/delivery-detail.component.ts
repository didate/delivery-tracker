import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import {
  Delivery,
  DeliveryItem,
  DeliveryStatus,
  DELIVERY_STATUS_OPTIONS,
  CreateDeliveryItemDto
} from '../models/delivery.model';
import { DeliveryService } from '../services/delivery.service';
import { AddItemDialogComponent, AddItemDialogResult } from './add-item-dialog.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ToastComponent } from '../../../shared/components/toast/toast.component';
import { ToastService } from '../../../shared/components/toast/toast.service';

@Component({
  selector: 'app-delivery-detail',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    CurrencyPipe,
    AddItemDialogComponent,
    ConfirmDialogComponent,
    ToastComponent,
  ],
  template: `
    <div class="max-w-7xl mx-auto">
      @if (isLoading()) {
        <div class="flex flex-col items-center justify-center py-16">
          <div class="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p class="mt-4 text-gray-500">Loading delivery...</p>
        </div>
      } @else if (error()) {
        <div class="flex flex-col items-center justify-center py-16">
          <i class="pi pi-exclamation-circle text-5xl text-red-500 mb-4"></i>
          <p class="text-gray-600 mb-4">{{ error() }}</p>
          <button
            (click)="loadDelivery()"
            class="px-4 py-2 text-blue-600 hover:bg-blue-50 font-medium rounded-lg transition-colors flex items-center gap-2">
            <i class="pi pi-refresh"></i>
            Retry
          </button>
        </div>
      } @else if (delivery()) {
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-4">
            <button
              (click)="goBack()"
              class="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Back to list">
              <i class="pi pi-arrow-left text-lg"></i>
            </button>
            <h1 class="text-2xl font-semibold text-gray-900">Delivery {{ delivery()!.code }}</h1>
            <span [class]="getStatusClasses(delivery()!.status)">
              {{ getStatusLabel(delivery()!.status) }}
            </span>
          </div>
          <div class="flex items-center gap-2">
            @if (canChangeStatus()) {
              <div class="relative">
                <button
                  (click)="toggleStatusMenu()"
                  class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2">
                  <i class="pi pi-arrows-h"></i>
                  Change Status
                </button>
                @if (statusMenuOpen()) {
                  <div class="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    @for (status of getAvailableStatuses(delivery()!.status); track status.value) {
                      <button
                        (click)="updateStatus(status.value)"
                        class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg">
                        {{ status.label }}
                      </button>
                    }
                  </div>
                }
              </div>
            }
            @if (delivery()!.status === 'PENDING') {
              <button
                (click)="confirmDelete()"
                class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2">
                <i class="pi pi-trash"></i>
                Delete
              </button>
            }
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <!-- Delivery Information Card -->
          <div class="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900">Delivery Information</h3>
            </div>
            <div class="p-6">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <span class="block text-xs font-medium text-gray-500 uppercase tracking-wider">Code</span>
                  <span class="block mt-1 text-base font-medium text-gray-900">{{ delivery()!.code }}</span>
                </div>
                <div>
                  <span class="block text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</span>
                  <span class="block mt-1 text-base font-medium text-gray-900">{{ delivery()!.customerName }}</span>
                </div>
                <div>
                  <span class="block text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</span>
                  <span class="block mt-1 text-base font-medium text-gray-900">
                    @if (delivery()!.driverName) {
                      {{ delivery()!.driverName }}
                    } @else {
                      <span class="text-gray-400 italic font-normal">Not assigned</span>
                    }
                  </span>
                </div>
                <div>
                  <span class="block text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Date</span>
                  <span class="block mt-1 text-base font-medium text-gray-900">{{ delivery()!.deliveryDate | date:'longDate' }}</span>
                </div>
                <div>
                  <span class="block text-xs font-medium text-gray-500 uppercase tracking-wider">Created Date</span>
                  <span class="block mt-1 text-base font-medium text-gray-900">{{ delivery()!.createdDate | date:'medium' }}</span>
                </div>
                <div>
                  <span class="block text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</span>
                  <span class="block mt-1 text-lg font-semibold text-green-600">{{ delivery()!.totalAmount | currency }}</span>
                </div>
              </div>
              @if (delivery()!.notes) {
                <hr class="my-4 border-gray-200" />
                <div>
                  <span class="block text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</span>
                  <p class="mt-2 text-gray-700 whitespace-pre-wrap">{{ delivery()!.notes }}</p>
                </div>
              }
            </div>
          </div>

          <!-- Items Card -->
          <div class="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900">Items</h3>
              @if (canEditItems()) {
                <button
                  (click)="openAddItemDialog()"
                  class="px-3 py-1.5 text-blue-600 hover:bg-blue-50 font-medium rounded-lg transition-colors flex items-center gap-1 text-sm">
                  <i class="pi pi-plus"></i>
                  Add Item
                </button>
              }
            </div>
            @if (delivery()!.items.length === 0) {
              <div class="flex flex-col items-center py-12 text-gray-400">
                <i class="pi pi-inbox text-5xl mb-2"></i>
                <p>No items in this delivery</p>
              </div>
            } @else {
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead class="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Product</th>
                      <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Quantity</th>
                      <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Unit Price</th>
                      <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Total</th>
                      <th class="px-4 py-3 w-12"></th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100">
                    @for (item of delivery()!.items; track item.id) {
                      <tr class="hover:bg-gray-50">
                        <td class="px-4 py-3 text-sm text-gray-900 font-medium">{{ item.productName }}</td>
                        <td class="px-4 py-3 text-sm text-gray-600">{{ item.quantity }}</td>
                        <td class="px-4 py-3 text-sm text-gray-600">{{ item.unitPrice | currency }}</td>
                        <td class="px-4 py-3 text-sm text-gray-900 font-medium">{{ item.totalPrice | currency }}</td>
                        <td class="px-4 py-3">
                          @if (canEditItems()) {
                            <button
                              (click)="confirmRemoveItem(item)"
                              class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Remove item">
                              <i class="pi pi-trash"></i>
                            </button>
                          }
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
              <div class="flex justify-end px-4 py-3 bg-gray-50 border-t border-gray-200">
                <strong class="text-gray-900">Total: {{ delivery()!.totalAmount | currency }}</strong>
              </div>
            }
          </div>
        </div>
      }
    </div>

    <!-- Add Item Dialog -->
    <app-add-item-dialog
      [isOpen]="addItemDialogOpen()"
      (add)="onAddItem($event)"
      (cancel)="closeAddItemDialog()">
    </app-add-item-dialog>

    <!-- Confirm Delete Delivery Dialog -->
    <app-confirm-dialog
      [isOpen]="confirmDeleteDialogOpen()"
      title="Delete Delivery"
      message="Are you sure you want to delete this delivery?"
      confirmText="Delete"
      cancelText="Cancel"
      (confirm)="onDeleteConfirm()"
      (cancel)="closeConfirmDeleteDialog()">
    </app-confirm-dialog>

    <!-- Confirm Remove Item Dialog -->
    <app-confirm-dialog
      [isOpen]="confirmRemoveItemDialogOpen()"
      title="Remove Item"
      [message]="'Are you sure you want to remove \\'' + (itemToRemove()?.productName || '') + '\\' from this delivery?'"
      confirmText="Remove"
      cancelText="Cancel"
      (confirm)="onRemoveItemConfirm()"
      (cancel)="closeConfirmRemoveItemDialog()">
    </app-confirm-dialog>

    <!-- Toast -->
    <app-toast></app-toast>
  `,
})
export class DeliveryDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly deliveryService = inject(DeliveryService);
  private readonly toastService = inject(ToastService);

  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly delivery = signal<Delivery | null>(null);

  readonly statusOptions = DELIVERY_STATUS_OPTIONS;
  readonly statusMenuOpen = signal(false);

  readonly addItemDialogOpen = signal(false);
  readonly confirmDeleteDialogOpen = signal(false);
  readonly confirmRemoveItemDialogOpen = signal(false);
  readonly itemToRemove = signal<DeliveryItem | null>(null);

  private deliveryId!: number;

  ngOnInit(): void {
    this.deliveryId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadDelivery();

    // Close status menu when clicking outside
    document.addEventListener('click', () => {
      this.statusMenuOpen.set(false);
    });
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

  getStatusClasses(status: DeliveryStatus): string {
    const baseClasses = 'px-3 py-1 rounded-full text-sm font-medium';
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

  toggleStatusMenu(): void {
    event?.stopPropagation();
    this.statusMenuOpen.update(open => !open);
  }

  updateStatus(newStatus: DeliveryStatus): void {
    this.statusMenuOpen.set(false);
    this.deliveryService.updateStatus(this.deliveryId, { status: newStatus }).subscribe({
      next: (updatedDelivery) => {
        this.delivery.set(updatedDelivery);
        this.toastService.success('Success', `Status updated to ${this.getStatusLabel(newStatus)}`);
      },
      error: (err) => {
        this.toastService.error('Error', err.message || 'Failed to update status');
      }
    });
  }

  openAddItemDialog(): void {
    this.addItemDialogOpen.set(true);
  }

  closeAddItemDialog(): void {
    this.addItemDialogOpen.set(false);
  }

  onAddItem(result: AddItemDialogResult): void {
    if (result.action === 'add') {
      this.deliveryService.addItem(this.deliveryId, result.data).subscribe({
        next: () => {
          this.toastService.success('Success', 'Item added successfully');
          this.closeAddItemDialog();
          this.loadDelivery();
        },
        error: (err) => {
          this.toastService.error('Error', err.message || 'Failed to add item');
        }
      });
    }
  }

  confirmRemoveItem(item: DeliveryItem): void {
    this.itemToRemove.set(item);
    this.confirmRemoveItemDialogOpen.set(true);
  }

  closeConfirmRemoveItemDialog(): void {
    this.confirmRemoveItemDialogOpen.set(false);
    this.itemToRemove.set(null);
  }

  onRemoveItemConfirm(): void {
    const item = this.itemToRemove();
    if (item) {
      this.deliveryService.removeItem(this.deliveryId, item.id).subscribe({
        next: () => {
          this.toastService.success('Success', 'Item removed successfully');
          this.closeConfirmRemoveItemDialog();
          this.loadDelivery();
        },
        error: (err) => {
          this.toastService.error('Error', err.message || 'Failed to remove item');
        }
      });
    }
  }

  confirmDelete(): void {
    this.confirmDeleteDialogOpen.set(true);
  }

  closeConfirmDeleteDialog(): void {
    this.confirmDeleteDialogOpen.set(false);
  }

  onDeleteConfirm(): void {
    this.deliveryService.deleteDelivery(this.deliveryId).subscribe({
      next: () => {
        this.toastService.success('Success', 'Delivery deleted successfully');
        this.router.navigate(['/deliveries']);
      },
      error: (err) => {
        this.toastService.error('Error', err.message || 'Failed to delete delivery');
      }
    });
  }
}
