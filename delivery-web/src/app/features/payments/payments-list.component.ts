import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  Payment,
  PaymentMethod,
  CreatePaymentDto,
  PAYMENT_METHOD_LABELS
} from './models/payment.model';
import { PaymentService } from './services/payment.service';
import { PaymentDialogComponent, PaymentDialogResult } from './payment-dialog/payment-dialog.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { ToastComponent } from '../../shared/components/toast/toast.component';
import { ToastService } from '../../shared/components/toast/toast.service';

@Component({
  selector: 'app-payments-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PaymentDialogComponent,
    ConfirmDialogComponent,
    ToastComponent,
    CurrencyPipe,
    DatePipe
  ],
  template: `
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-semibold text-gray-900">Payments</h1>
        <button
          (click)="openCreateDialog()"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2">
          <i class="pi pi-plus"></i>
          Add Payment
        </button>
      </div>

      <!-- Main Card -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <!-- Filters -->
        <div class="p-4 border-b border-gray-100">
          <div class="flex flex-wrap items-end gap-4">
            <!-- Payment Method Filter -->
            <div class="flex flex-col gap-2">
              <label for="methodFilter" class="text-sm font-medium text-gray-700">Payment Method</label>
              <div class="relative">
                <select
                  id="methodFilter"
                  [(ngModel)]="methodFilter"
                  (ngModelChange)="onFilterChange()"
                  class="w-44 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white">
                  <option [ngValue]="null">All Methods</option>
                  @for (option of paymentMethodOptions; track option.value) {
                    <option [ngValue]="option.value">{{ option.label }}</option>
                  }
                </select>
                <i class="pi pi-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-sm"></i>
              </div>
            </div>

            <!-- Start Date Filter -->
            <div class="flex flex-col gap-2">
              <label for="startDate" class="text-sm font-medium text-gray-700">Start Date</label>
              <input
                id="startDate"
                type="date"
                [(ngModel)]="startDateStr"
                (ngModelChange)="onDateFilterChange()"
                class="w-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Select start date" />
            </div>

            <!-- End Date Filter -->
            <div class="flex flex-col gap-2">
              <label for="endDate" class="text-sm font-medium text-gray-700">End Date</label>
              <input
                id="endDate"
                type="date"
                [(ngModel)]="endDateStr"
                (ngModelChange)="onDateFilterChange()"
                class="w-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Select end date" />
            </div>

            @if (methodFilter || startDateStr || endDateStr) {
              <button
                (click)="clearFilters()"
                class="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2 text-sm">
                <i class="pi pi-times"></i>
                Clear Filters
              </button>
            }
          </div>
        </div>

        @if (isLoading()) {
          <div class="flex flex-col items-center justify-center py-16">
            <div class="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p class="mt-4 text-gray-500">Loading payments...</p>
          </div>
        } @else if (error()) {
          <div class="flex flex-col items-center justify-center py-16">
            <i class="pi pi-exclamation-triangle text-5xl text-red-500 mb-4"></i>
            <p class="text-gray-600 mb-4">{{ error() }}</p>
            <button
              (click)="loadPayments()"
              class="px-4 py-2 text-blue-600 hover:bg-blue-50 font-medium rounded-lg transition-colors flex items-center gap-2">
              <i class="pi pi-refresh"></i>
              Retry
            </button>
          </div>
        } @else if (payments().length === 0) {
          <div class="flex flex-col items-center justify-center py-16 text-gray-500">
            <i class="pi pi-credit-card text-5xl mb-4"></i>
            <p>No payments found</p>
            @if (methodFilter || startDateStr || endDateStr) {
              <p class="text-sm mt-2">Try adjusting your filters</p>
            } @else {
              <p class="text-sm mt-2">Click "Add Payment" to create one</p>
            }
          </div>
        } @else {
          <!-- Table -->
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Code</th>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Customer</th>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Method</th>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Payment Date</th>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Reference</th>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                @for (payment of payments(); track payment.id) {
                  <tr class="hover:bg-gray-50">
                    <td class="px-4 py-3 text-sm text-gray-900">{{ payment.code }}</td>
                    <td class="px-4 py-3 text-sm text-gray-900 font-medium">{{ payment.customerName }}</td>
                    <td class="px-4 py-3 text-sm text-green-600 font-semibold">{{ payment.amount | currency }}</td>
                    <td class="px-4 py-3 text-sm">
                      <span [class]="getMethodClasses(payment.method)" class="inline-flex items-center gap-1">
                        <i [class]="getMethodIcon(payment.method)"></i>
                        {{ getMethodLabel(payment.method) }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-600">{{ payment.paymentDate | date:'mediumDate' }}</td>
                    <td class="px-4 py-3 text-sm text-gray-500 max-w-[150px] truncate">{{ payment.reference || '-' }}</td>
                    <td class="px-4 py-3 text-sm">
                      <div class="flex items-center gap-1">
                        <button
                          (click)="openEditDialog(payment)"
                          class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit payment">
                          <i class="pi pi-pencil"></i>
                        </button>
                        <button
                          (click)="confirmDelete(payment)"
                          class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete payment">
                          <i class="pi pi-trash"></i>
                        </button>
                      </div>
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

    <!-- Payment Dialog -->
    <app-payment-dialog
      [isOpen]="dialogOpen()"
      [mode]="dialogMode()"
      [payment]="selectedPayment()"
      (save)="onDialogSave($event)"
      (cancel)="closeDialog()">
    </app-payment-dialog>

    <!-- Confirm Delete Dialog -->
    <app-confirm-dialog
      [isOpen]="confirmDialogOpen()"
      title="Delete Payment"
      [message]="'Are you sure you want to delete payment \\'' + (paymentToDelete()?.code || '') + '\\' for ' + (paymentToDelete()?.customerName || '') + '?'"
      confirmText="Delete"
      cancelText="Cancel"
      (confirm)="onDeleteConfirm()"
      (cancel)="closeConfirmDialog()">
    </app-confirm-dialog>

    <!-- Toast -->
    <app-toast></app-toast>
  `,
})
export class PaymentsListComponent implements OnInit {
  private readonly paymentService = inject(PaymentService);
  private readonly toastService = inject(ToastService);

  readonly Math = Math;

  readonly paymentMethods = Object.values(PaymentMethod);
  readonly paymentMethodOptions = this.paymentMethods.map(method => ({
    label: PAYMENT_METHOD_LABELS[method],
    value: method
  }));

  readonly payments = signal<Payment[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly totalItems = signal(0);
  readonly currentPage = signal(0);
  readonly pageSize = signal(10);

  readonly dialogOpen = signal(false);
  readonly dialogMode = signal<'create' | 'edit'>('create');
  readonly selectedPayment = signal<Payment | null>(null);

  readonly confirmDialogOpen = signal(false);
  readonly paymentToDelete = signal<Payment | null>(null);

  methodFilter: PaymentMethod | null = null;
  startDateStr: string = '';
  endDateStr: string = '';

  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments(): void {
    this.isLoading.set(true);
    this.error.set(null);

    const params: Record<string, number | string> = {
      page: this.currentPage(),
      size: this.pageSize()
    };

    if (this.methodFilter) {
      params['method'] = this.methodFilter;
    }
    if (this.startDateStr) {
      params['startDate'] = this.startDateStr;
    }
    if (this.endDateStr) {
      params['endDate'] = this.endDateStr;
    }

    this.paymentService.getPayments(params).subscribe({
      next: (response) => {
        this.payments.set(response.data);
        this.totalItems.set(response.total);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Failed to load payments');
        this.isLoading.set(false);
      }
    });
  }

  onFilterChange(): void {
    this.currentPage.set(0);
    this.loadPayments();
  }

  onDateFilterChange(): void {
    this.currentPage.set(0);
    this.loadPayments();
  }

  clearFilters(): void {
    this.methodFilter = null;
    this.startDateStr = '';
    this.endDateStr = '';
    this.currentPage.set(0);
    this.loadPayments();
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadPayments();
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

  getMethodLabel(method: PaymentMethod): string {
    return PAYMENT_METHOD_LABELS[method] || method;
  }

  getMethodIcon(method: PaymentMethod): string {
    const iconMap: Record<PaymentMethod, string> = {
      [PaymentMethod.CASH]: 'pi pi-money-bill',
      [PaymentMethod.CHECK]: 'pi pi-file',
      [PaymentMethod.BANK_TRANSFER]: 'pi pi-building',
      [PaymentMethod.MOBILE_MONEY]: 'pi pi-mobile'
    };
    return iconMap[method] || 'pi pi-credit-card';
  }

  getMethodClasses(method: PaymentMethod): string {
    const baseClasses = 'px-2 py-1 rounded text-xs font-medium';
    const colorMap: Record<PaymentMethod, string> = {
      [PaymentMethod.CASH]: 'bg-green-100 text-green-700',
      [PaymentMethod.CHECK]: 'bg-yellow-100 text-yellow-700',
      [PaymentMethod.BANK_TRANSFER]: 'bg-blue-100 text-blue-700',
      [PaymentMethod.MOBILE_MONEY]: 'bg-gray-100 text-gray-700'
    };
    return `${baseClasses} ${colorMap[method] || 'bg-gray-100 text-gray-700'}`;
  }

  openCreateDialog(): void {
    this.selectedPayment.set(null);
    this.dialogMode.set('create');
    this.dialogOpen.set(true);
  }

  openEditDialog(payment: Payment): void {
    this.selectedPayment.set(payment);
    this.dialogMode.set('edit');
    this.dialogOpen.set(true);
  }

  closeDialog(): void {
    this.dialogOpen.set(false);
    this.selectedPayment.set(null);
  }

  onDialogSave(result: PaymentDialogResult): void {
    if (result.action === 'save') {
      if (this.dialogMode() === 'create') {
        this.paymentService.createPayment(result.data as CreatePaymentDto).subscribe({
          next: () => {
            this.toastService.success('Success', 'Payment created successfully');
            this.closeDialog();
            this.loadPayments();
          },
          error: (err) => {
            this.toastService.error('Error', err.message || 'Failed to create payment');
          }
        });
      } else {
        const payment = this.selectedPayment();
        if (payment) {
          this.paymentService.updatePayment(payment.id, result.data).subscribe({
            next: () => {
              this.toastService.success('Success', 'Payment updated successfully');
              this.closeDialog();
              this.loadPayments();
            },
            error: (err) => {
              this.toastService.error('Error', err.message || 'Failed to update payment');
            }
          });
        }
      }
    }
  }

  confirmDelete(payment: Payment): void {
    this.paymentToDelete.set(payment);
    this.confirmDialogOpen.set(true);
  }

  closeConfirmDialog(): void {
    this.confirmDialogOpen.set(false);
    this.paymentToDelete.set(null);
  }

  onDeleteConfirm(): void {
    const payment = this.paymentToDelete();
    if (payment) {
      this.paymentService.deletePayment(payment.id).subscribe({
        next: () => {
          this.toastService.success('Success', 'Payment deleted successfully');
          this.closeConfirmDialog();
          this.loadPayments();
        },
        error: (err) => {
          this.toastService.error('Error', err.message || 'Failed to delete payment');
        }
      });
    }
  }
}
