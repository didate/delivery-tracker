import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product, CreateProductDto, UpdateProductDto } from './models/product.model';
import { ProductService } from './services/product.service';
import { ProductDialogComponent, ProductDialogResult } from './product-dialog/product-dialog.component';
import { PriceDialogComponent, PriceDialogResult } from './price-dialog/price-dialog.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { ToastComponent } from '../../shared/components/toast/toast.component';
import { ToastService } from '../../shared/components/toast/toast.service';

interface StatusOption {
  label: string;
  value: boolean | null;
}

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CurrencyPipe,
    ProductDialogComponent,
    PriceDialogComponent,
    ConfirmDialogComponent,
    ToastComponent
  ],
  template: `
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-semibold text-gray-900">Products</h1>
        <button
          (click)="openCreateDialog()"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2">
          <i class="pi pi-plus"></i>
          Add Product
        </button>
      </div>

      <!-- Main Card -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <!-- Filters -->
        <div class="p-4 border-b border-gray-100">
          <div class="flex gap-4">
            <select
              [(ngModel)]="activeFilter"
              (ngModelChange)="onFilterChange()"
              class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[150px]">
              @for (option of statusOptions; track option.value) {
                <option [ngValue]="option.value">{{ option.label }}</option>
              }
            </select>
          </div>
        </div>

        @if (isLoading()) {
          <div class="flex flex-col items-center justify-center py-16">
            <div class="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p class="mt-4 text-gray-500">Loading products...</p>
          </div>
        } @else if (error()) {
          <div class="flex flex-col items-center justify-center py-16">
            <i class="pi pi-exclamation-circle text-5xl text-red-500 mb-4"></i>
            <p class="text-gray-600 mb-4">{{ error() }}</p>
            <button
              (click)="loadProducts()"
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
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Price</th>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th class="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                @for (product of products(); track product.id) {
                  <tr class="hover:bg-gray-50">
                    <td class="px-4 py-3 text-sm text-gray-900">{{ product.code }}</td>
                    <td class="px-4 py-3 text-sm text-gray-900 font-medium">{{ product.name }}</td>
                    <td class="px-4 py-3 text-sm text-gray-600 max-w-[250px] truncate">{{ product.description || '-' }}</td>
                    <td class="px-4 py-3 text-sm text-blue-600 font-medium">{{ product.price | currency }}</td>
                    <td class="px-4 py-3 text-sm">
                      <span
                        class="px-2 py-1 rounded text-xs font-medium"
                        [class]="product.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                        {{ product.active ? 'Active' : 'Inactive' }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-sm">
                      <div class="flex items-center gap-1">
                        <button
                          (click)="openEditDialog(product)"
                          class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit product">
                          <i class="pi pi-pencil"></i>
                        </button>
                        <button
                          (click)="openPriceDialog(product)"
                          class="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Update price">
                          <i class="pi pi-dollar"></i>
                        </button>
                        <button
                          (click)="confirmDelete(product)"
                          class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete product">
                          <i class="pi pi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="6" class="px-4 py-16 text-center text-gray-500">
                      <i class="pi pi-box text-5xl text-gray-300 mb-4 block"></i>
                      No products found. Click "Add Product" to create one.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          @if (totalItems() > pageSize()) {
            <div class="flex items-center justify-between px-4 py-3 border-t border-gray-200">
              <div class="flex items-center gap-4">
                <span class="text-sm text-gray-600">
                  Showing {{ (currentPage() * pageSize()) + 1 }} to {{ Math.min((currentPage() + 1) * pageSize(), totalItems()) }} of {{ totalItems() }} entries
                </span>
                <select
                  [(ngModel)]="pageSizeValue"
                  (ngModelChange)="onPageSizeChange($event)"
                  class="px-2 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  @for (size of rowsPerPageOptions; track size) {
                    <option [value]="size">{{ size }} / page</option>
                  }
                </select>
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

    <!-- Product Dialog -->
    <app-product-dialog
      [isOpen]="productDialogOpen()"
      [mode]="productDialogMode()"
      [product]="selectedProduct()"
      (save)="onProductDialogSave($event)"
      (cancel)="closeProductDialog()">
    </app-product-dialog>

    <!-- Price Dialog -->
    <app-price-dialog
      [isOpen]="priceDialogOpen()"
      [product]="selectedProductForPrice()"
      (save)="onPriceDialogSave($event)"
      (cancel)="closePriceDialog()">
    </app-price-dialog>

    <!-- Confirm Delete Dialog -->
    <app-confirm-dialog
      [isOpen]="confirmDialogOpen()"
      title="Delete Product"
      [message]="'Are you sure you want to delete product \\'' + (productToDelete()?.name || '') + '\\'?'"
      confirmText="Delete"
      cancelText="Cancel"
      (confirm)="onDeleteConfirm()"
      (cancel)="closeConfirmDialog()">
    </app-confirm-dialog>

    <!-- Toast -->
    <app-toast></app-toast>
  `,
})
export class ProductsListComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly toastService = inject(ToastService);

  readonly Math = Math;

  readonly products = signal<Product[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly totalItems = signal(0);
  readonly currentPage = signal(0);
  readonly pageSize = signal(10);

  readonly productDialogOpen = signal(false);
  readonly productDialogMode = signal<'create' | 'edit'>('create');
  readonly selectedProduct = signal<Product | null>(null);

  readonly priceDialogOpen = signal(false);
  readonly selectedProductForPrice = signal<Product | null>(null);

  readonly confirmDialogOpen = signal(false);
  readonly productToDelete = signal<Product | null>(null);

  activeFilter: boolean | null = null;
  pageSizeValue = 10;
  readonly rowsPerPageOptions = [5, 10, 25, 50];

  readonly statusOptions: StatusOption[] = [
    { label: 'All', value: null },
    { label: 'Active', value: true },
    { label: 'Inactive', value: false }
  ];

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading.set(true);
    this.error.set(null);

    const params: Record<string, number | boolean> = {
      page: this.currentPage(),
      size: this.pageSize()
    };

    if (this.activeFilter !== null) {
      params['active'] = this.activeFilter;
    }

    this.productService.getProducts(params).subscribe({
      next: (response) => {
        this.products.set(response.data);
        this.totalItems.set(response.total);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Failed to load products');
        this.isLoading.set(false);
      }
    });
  }

  onFilterChange(): void {
    this.currentPage.set(0);
    this.loadProducts();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(0);
    this.loadProducts();
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadProducts();
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

  // Product Dialog
  openCreateDialog(): void {
    this.selectedProduct.set(null);
    this.productDialogMode.set('create');
    this.productDialogOpen.set(true);
  }

  openEditDialog(product: Product): void {
    this.selectedProduct.set(product);
    this.productDialogMode.set('edit');
    this.productDialogOpen.set(true);
  }

  closeProductDialog(): void {
    this.productDialogOpen.set(false);
    this.selectedProduct.set(null);
  }

  onProductDialogSave(result: ProductDialogResult): void {
    if (result.action === 'save') {
      if (this.productDialogMode() === 'create') {
        this.productService.createProduct(result.data as CreateProductDto).subscribe({
          next: () => {
            this.toastService.success('Success', 'Product created successfully');
            this.closeProductDialog();
            this.loadProducts();
          },
          error: (err) => {
            this.toastService.error('Error', err.message || 'Failed to create product');
          }
        });
      } else {
        const product = this.selectedProduct();
        if (product) {
          this.productService.updateProduct(product.id, result.data as UpdateProductDto).subscribe({
            next: () => {
              this.toastService.success('Success', 'Product updated successfully');
              this.closeProductDialog();
              this.loadProducts();
            },
            error: (err) => {
              this.toastService.error('Error', err.message || 'Failed to update product');
            }
          });
        }
      }
    }
  }

  // Price Dialog
  openPriceDialog(product: Product): void {
    this.selectedProductForPrice.set(product);
    this.priceDialogOpen.set(true);
  }

  closePriceDialog(): void {
    this.priceDialogOpen.set(false);
    this.selectedProductForPrice.set(null);
  }

  onPriceDialogSave(result: PriceDialogResult): void {
    if (result.action === 'save') {
      const product = this.selectedProductForPrice();
      if (product) {
        this.productService.updatePrice(product.id, { price: result.price }).subscribe({
          next: () => {
            this.toastService.success('Success', 'Price updated successfully');
            this.closePriceDialog();
            this.loadProducts();
          },
          error: (err) => {
            this.toastService.error('Error', err.message || 'Failed to update price');
          }
        });
      }
    }
  }

  // Delete Confirmation
  confirmDelete(product: Product): void {
    this.productToDelete.set(product);
    this.confirmDialogOpen.set(true);
  }

  closeConfirmDialog(): void {
    this.confirmDialogOpen.set(false);
    this.productToDelete.set(null);
  }

  onDeleteConfirm(): void {
    const product = this.productToDelete();
    if (product) {
      this.productService.deleteProduct(product.id).subscribe({
        next: () => {
          this.toastService.success('Success', 'Product deleted successfully');
          this.closeConfirmDialog();
          this.loadProducts();
        },
        error: (err) => {
          this.toastService.error('Error', err.message || 'Failed to delete product');
        }
      });
    }
  }
}
