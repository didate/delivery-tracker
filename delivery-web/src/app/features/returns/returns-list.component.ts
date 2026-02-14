import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Return, ReturnStatus, CreateReturnDto } from './models/return.model';
import { ReturnService } from './services/return.service';
import { ReturnDialogComponent, ReturnDialogResult } from './return-dialog/return-dialog.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { ToastComponent } from '../../shared/components/toast/toast.component';
import { ToastService } from '../../shared/components/toast/toast.service';
import { ModalComponent } from '../../shared/components/modal/modal.component';

interface StatusOption {
  label: string;
  value: ReturnStatus | null;
}

@Component({
  selector: 'app-returns-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReturnDialogComponent,
    ConfirmDialogComponent,
    ToastComponent,
    ModalComponent,
  ],
  template: `
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-semibold text-gray-900">Returns</h1>
        <button
          (click)="openCreateDialog()"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2">
          <i class="pi pi-plus"></i>
          Create Return
        </button>
      </div>

      <!-- Main Card -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <!-- Filters -->
        <div class="p-4 border-b border-gray-100">
          <div class="flex items-center gap-4">
            <div class="relative">
              <select
                [(ngModel)]="statusFilter"
                (ngModelChange)="onStatusFilterChange()"
                class="w-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white">
                <option [ngValue]="null">All Statuses</option>
                @for (option of statusOptions; track option.value) {
                  <option [ngValue]="option.value">{{ option.label }}</option>
                }
              </select>
              <i class="pi pi-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-sm"></i>
            </div>
            @if (statusFilter) {
              <button
                (click)="clearFilter()"
                class="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2 text-sm">
                <i class="pi pi-times"></i>
                Clear Filter
              </button>
            }
          </div>
        </div>

        @if (isLoading()) {
          <div class="flex flex-col items-center justify-center py-16">
            <div class="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p class="mt-4 text-gray-500">Loading returns...</p>
          </div>
        } @else if (error()) {
          <div class="flex flex-col items-center justify-center py-16">
            <i class="pi pi-exclamation-circle text-5xl text-red-500 mb-4"></i>
            <p class="text-gray-600 mb-4">{{ error() }}</p>
            <button
              (click)="loadReturns()"
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
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Return Date</th>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Total Value</th>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Created</th>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                @for (returnItem of returns(); track returnItem.id) {
                  <tr class="hover:bg-gray-50">
                    <td class="px-4 py-3 text-sm text-gray-900">{{ returnItem.code }}</td>
                    <td class="px-4 py-3 text-sm text-gray-900 font-medium">{{ returnItem.customerName }}</td>
                    <td class="px-4 py-3 text-sm text-gray-600">{{ returnItem.returnDate | date:'mediumDate' }}</td>
                    <td class="px-4 py-3 text-sm text-green-600 font-semibold">\${{ returnItem.totalValue | number:'1.2-2' }}</td>
                    <td class="px-4 py-3 text-sm">
                      <span [class]="getStatusClasses(returnItem.status)">
                        {{ returnItem.status }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-500">{{ returnItem.createdDate | date:'short' }}</td>
                    <td class="px-4 py-3 text-sm">
                      <div class="flex items-center gap-1">
                        <button
                          (click)="viewDetails(returnItem)"
                          class="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View details">
                          <i class="pi pi-eye"></i>
                        </button>

                        @if (returnItem.status === 'PENDING') {
                          <div class="relative">
                            <button
                              (click)="toggleStatusMenu(returnItem)"
                              class="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Change status">
                              <i class="pi pi-ellipsis-v"></i>
                            </button>
                            @if (activeStatusMenu()?.id === returnItem.id) {
                              <div class="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                                <button
                                  (click)="updateStatus(returnItem, 'PROCESSED')"
                                  class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                                  <i class="pi pi-check-circle text-green-600"></i>
                                  Process
                                </button>
                                <button
                                  (click)="updateStatus(returnItem, 'REJECTED')"
                                  class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                                  <i class="pi pi-times-circle text-red-600"></i>
                                  Reject
                                </button>
                              </div>
                            }
                          </div>

                          <button
                            (click)="confirmDelete(returnItem)"
                            class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete return">
                            <i class="pi pi-trash"></i>
                          </button>
                        }
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="7" class="px-4 py-16 text-center text-gray-500">
                      @if (statusFilter) {
                        No returns found with status "{{ statusFilter }}"
                      } @else {
                        No returns found. Click "Create Return" to add one.
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

    <!-- Return Details Modal -->
    <app-modal
      [isOpen]="detailsDialogVisible()"
      [title]="'Return Details - ' + (selectedReturn()?.code || '')"
      maxWidth="700px"
      (close)="closeDetailsDialog()">
      @if (selectedReturn(); as returnData) {
        <div class="space-y-6">
          <!-- Details Grid -->
          <div class="grid grid-cols-2 gap-6">
            <div>
              <span class="text-xs text-gray-500 font-medium uppercase">Customer</span>
              <p class="text-gray-900 mt-1">{{ returnData.customerName }}</p>
            </div>
            <div>
              <span class="text-xs text-gray-500 font-medium uppercase">Return Date</span>
              <p class="text-gray-900 mt-1">{{ returnData.returnDate | date:'mediumDate' }}</p>
            </div>
            <div>
              <span class="text-xs text-gray-500 font-medium uppercase">Status</span>
              <p class="mt-1">
                <span [class]="getStatusClasses(returnData.status)">
                  {{ returnData.status }}
                </span>
              </p>
            </div>
            <div>
              <span class="text-xs text-gray-500 font-medium uppercase">Total Value</span>
              <p class="text-green-600 font-semibold mt-1">\${{ returnData.totalValue | number:'1.2-2' }}</p>
            </div>
          </div>

          @if (returnData.notes) {
            <div>
              <span class="text-xs text-gray-500 font-medium uppercase">Notes</span>
              <p class="mt-2 p-3 bg-gray-50 rounded-lg text-gray-700 text-sm">{{ returnData.notes }}</p>
            </div>
          }

          <!-- Items Table -->
          <div>
            <h3 class="text-sm font-semibold text-gray-900 mb-3">Items</h3>
            <div class="border border-gray-200 rounded-lg overflow-hidden">
              <table class="w-full">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Product</th>
                    <th class="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Quantity</th>
                    <th class="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Unit Value</th>
                    <th class="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Total</th>
                    <th class="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Reason</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  @for (item of returnData.items; track item.id) {
                    <tr>
                      <td class="px-4 py-3 text-sm text-gray-900">{{ item.productName }}</td>
                      <td class="px-4 py-3 text-sm text-gray-600">{{ item.quantity }}</td>
                      <td class="px-4 py-3 text-sm text-gray-600">\${{ item.unitValue | number:'1.2-2' }}</td>
                      <td class="px-4 py-3 text-sm text-gray-900 font-medium">\${{ item.totalValue | number:'1.2-2' }}</td>
                      <td class="px-4 py-3 text-sm text-gray-600">{{ item.reason }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

          <!-- Close button -->
          <div class="flex justify-end pt-4 border-t border-gray-200">
            <button
              (click)="closeDetailsDialog()"
              class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium rounded-lg transition-colors">
              Close
            </button>
          </div>
        </div>
      }
    </app-modal>

    <!-- Return Dialog -->
    <app-return-dialog
      [isOpen]="dialogOpen()"
      [mode]="dialogMode()"
      (save)="onDialogSave($event)"
      (cancel)="closeDialog()">
    </app-return-dialog>

    <!-- Confirm Delete Dialog -->
    <app-confirm-dialog
      [isOpen]="confirmDialogOpen()"
      title="Delete Return"
      [message]="'Are you sure you want to delete return \\'' + (returnToDelete()?.code || '') + '\\'? This action cannot be undone.'"
      confirmText="Delete"
      cancelText="Cancel"
      (confirm)="onDeleteConfirm()"
      (cancel)="closeConfirmDialog()">
    </app-confirm-dialog>

    <!-- Confirm Status Change Dialog -->
    <app-confirm-dialog
      [isOpen]="confirmStatusDialogOpen()"
      [title]="statusChangeAction() === 'PROCESSED' ? 'Process Return' : 'Reject Return'"
      [message]="'Are you sure you want to ' + (statusChangeAction() === 'PROCESSED' ? 'process' : 'reject') + ' return \\'' + (returnToUpdateStatus()?.code || '') + '\\'?'"
      [confirmText]="statusChangeAction() === 'PROCESSED' ? 'Process' : 'Reject'"
      cancelText="Cancel"
      (confirm)="onStatusChangeConfirm()"
      (cancel)="closeStatusConfirmDialog()">
    </app-confirm-dialog>

    <!-- Toast -->
    <app-toast></app-toast>
  `,
})
export class ReturnsListComponent implements OnInit {
  private readonly returnService = inject(ReturnService);
  private readonly toastService = inject(ToastService);

  readonly Math = Math;

  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly returns = signal<Return[]>([]);
  readonly totalItems = signal(0);
  readonly currentPage = signal(0);
  readonly pageSize = signal(10);

  readonly dialogOpen = signal(false);
  readonly dialogMode = signal<'create' | 'edit'>('create');

  readonly confirmDialogOpen = signal(false);
  readonly returnToDelete = signal<Return | null>(null);

  readonly confirmStatusDialogOpen = signal(false);
  readonly returnToUpdateStatus = signal<Return | null>(null);
  readonly statusChangeAction = signal<ReturnStatus | null>(null);

  readonly detailsDialogVisible = signal(false);
  readonly selectedReturn = signal<Return | null>(null);
  readonly activeStatusMenu = signal<Return | null>(null);

  statusFilter: ReturnStatus | null = null;

  readonly statusOptions: StatusOption[] = [
    { label: 'Pending', value: 'PENDING' },
    { label: 'Processed', value: 'PROCESSED' },
    { label: 'Rejected', value: 'REJECTED' }
  ];

  ngOnInit(): void {
    this.loadReturns();

    // Close status menu when clicking outside
    document.addEventListener('click', (event) => {
      if (this.activeStatusMenu() && !(event.target as HTMLElement).closest('.relative')) {
        this.activeStatusMenu.set(null);
      }
    });
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

  clearFilter(): void {
    this.statusFilter = null;
    this.currentPage.set(0);
    this.loadReturns();
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadReturns();
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

  getStatusClasses(status: ReturnStatus): string {
    const baseClasses = 'px-2 py-1 rounded text-xs font-medium';
    switch (status) {
      case 'PENDING':
        return `${baseClasses} bg-yellow-100 text-yellow-700`;
      case 'PROCESSED':
        return `${baseClasses} bg-green-100 text-green-700`;
      case 'REJECTED':
        return `${baseClasses} bg-red-100 text-red-700`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-700`;
    }
  }

  toggleStatusMenu(returnItem: Return): void {
    if (this.activeStatusMenu()?.id === returnItem.id) {
      this.activeStatusMenu.set(null);
    } else {
      this.activeStatusMenu.set(returnItem);
    }
  }

  openCreateDialog(): void {
    this.dialogMode.set('create');
    this.dialogOpen.set(true);
  }

  closeDialog(): void {
    this.dialogOpen.set(false);
  }

  onDialogSave(result: ReturnDialogResult): void {
    if (result.action === 'save') {
      this.returnService.createReturn(result.data as CreateReturnDto).subscribe({
        next: () => {
          this.toastService.success('Success', 'Return created successfully');
          this.closeDialog();
          this.loadReturns();
        },
        error: (err) => {
          this.toastService.error('Error', err.message || 'Failed to create return');
        }
      });
    }
  }

  viewDetails(returnItem: Return): void {
    this.returnService.getReturn(returnItem.id).subscribe({
      next: (fullReturn) => {
        this.selectedReturn.set(fullReturn);
        this.detailsDialogVisible.set(true);
      },
      error: (err) => {
        this.toastService.error('Error', err.message || 'Failed to load return details');
      }
    });
  }

  closeDetailsDialog(): void {
    this.detailsDialogVisible.set(false);
    this.selectedReturn.set(null);
  }

  updateStatus(returnItem: Return, newStatus: ReturnStatus): void {
    this.activeStatusMenu.set(null);
    this.returnToUpdateStatus.set(returnItem);
    this.statusChangeAction.set(newStatus);
    this.confirmStatusDialogOpen.set(true);
  }

  closeStatusConfirmDialog(): void {
    this.confirmStatusDialogOpen.set(false);
    this.returnToUpdateStatus.set(null);
    this.statusChangeAction.set(null);
  }

  onStatusChangeConfirm(): void {
    const returnItem = this.returnToUpdateStatus();
    const newStatus = this.statusChangeAction();
    if (returnItem && newStatus) {
      this.returnService.updateStatus(returnItem.id, { status: newStatus }).subscribe({
        next: () => {
          const message = newStatus === 'PROCESSED' ? 'Return processed successfully' : 'Return rejected';
          this.toastService.success('Success', message);
          this.closeStatusConfirmDialog();
          this.loadReturns();
        },
        error: (err) => {
          const action = newStatus === 'PROCESSED' ? 'process' : 'reject';
          this.toastService.error('Error', err.message || `Failed to ${action} return`);
        }
      });
    }
  }

  confirmDelete(returnItem: Return): void {
    this.returnToDelete.set(returnItem);
    this.confirmDialogOpen.set(true);
  }

  closeConfirmDialog(): void {
    this.confirmDialogOpen.set(false);
    this.returnToDelete.set(null);
  }

  onDeleteConfirm(): void {
    const returnItem = this.returnToDelete();
    if (returnItem) {
      this.returnService.deleteReturn(returnItem.id).subscribe({
        next: () => {
          this.toastService.success('Success', 'Return deleted successfully');
          this.closeConfirmDialog();
          this.loadReturns();
        },
        error: (err) => {
          this.toastService.error('Error', err.message || 'Failed to delete return');
        }
      });
    }
  }
}
