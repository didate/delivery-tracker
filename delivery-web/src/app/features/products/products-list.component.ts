import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule, TablePageEvent } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SelectModule } from 'primeng/select';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Product } from './models/product.model';
import { ProductService } from './services/product.service';
import { ProductDialogComponent } from './product-dialog/product-dialog.component';
import { PriceDialogComponent } from './price-dialog/price-dialog.component';

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
    TableModule,
    ButtonModule,
    CardModule,
    SelectModule,
    ProgressSpinnerModule,
    TooltipModule,
    TagModule,
    ToastModule,
    CurrencyPipe
  ],
  providers: [DialogService, MessageService],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Products</h1>
        <p-button label="Add Product" icon="pi pi-plus" (onClick)="openCreateDialog()"></p-button>
      </div>

      <p-card>
        <div class="filters">
          <p-select
            [options]="statusOptions"
            [(ngModel)]="activeFilter"
            optionLabel="label"
            optionValue="value"
            placeholder="Status"
            (onChange)="onFilterChange()"
            [style]="{'min-width': '150px'}">
          </p-select>
        </div>

        @if (isLoading()) {
          <div class="loading-container">
            <p-progressSpinner [style]="{width: '40px', height: '40px'}"></p-progressSpinner>
          </div>
        } @else if (products().length === 0) {
          <div class="empty-state">
            <i class="pi pi-box" style="font-size: 48px; margin-bottom: 16px;"></i>
            <p>No products found</p>
          </div>
        } @else {
          <p-table
            [value]="products()"
            [paginator]="true"
            [rows]="pageSize()"
            [totalRecords]="totalItems()"
            [lazy]="true"
            [first]="first()"
            [rowsPerPageOptions]="[5, 10, 25, 50]"
            [showCurrentPageReport]="true"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
            (onPage)="onPageChange($event)"
            [tableStyle]="{'min-width': '60rem'}">

            <ng-template pTemplate="header">
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Description</th>
                <th>Price</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </ng-template>

            <ng-template pTemplate="body" let-product>
              <tr>
                <td>{{ product.code }}</td>
                <td>{{ product.name }}</td>
                <td class="description-cell">{{ product.description || '-' }}</td>
                <td class="price-cell">{{ product.price | currency }}</td>
                <td>
                  <p-tag
                    [value]="product.active ? 'Active' : 'Inactive'"
                    [severity]="product.active ? 'success' : 'danger'">
                  </p-tag>
                </td>
                <td>
                  <div class="action-buttons">
                    <p-button
                      icon="pi pi-pencil"
                      [rounded]="true"
                      [text]="true"
                      severity="info"
                      pTooltip="Edit"
                      (onClick)="openEditDialog(product)">
                    </p-button>
                    <p-button
                      icon="pi pi-dollar"
                      [rounded]="true"
                      [text]="true"
                      severity="help"
                      pTooltip="Update Price"
                      (onClick)="openPriceDialog(product)">
                    </p-button>
                    <p-button
                      icon="pi pi-trash"
                      [rounded]="true"
                      [text]="true"
                      severity="danger"
                      pTooltip="Delete"
                      (onClick)="deleteProduct(product)">
                    </p-button>
                  </div>
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
    .filters {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }
    .loading-container {
      display: flex;
      justify-content: center;
      padding: 48px;
    }
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px;
      color: #999;
    }
    .description-cell {
      max-width: 250px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .price-cell {
      font-weight: 500;
      color: var(--primary-color);
    }
    .action-buttons {
      display: flex;
      gap: 4px;
    }
  `]
})
export class ProductsListComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly dialogService = inject(DialogService);
  private readonly messageService = inject(MessageService);

  private dialogRef: DynamicDialogRef | undefined;

  readonly products = signal<Product[]>([]);
  readonly isLoading = signal(false);
  readonly totalItems = signal(0);
  readonly currentPage = signal(0);
  readonly pageSize = signal(10);
  readonly first = signal(0);

  activeFilter: boolean | null = null;

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
        this.isLoading.set(false);
        this.showError(err.message || 'Failed to load products');
      }
    });
  }

  onFilterChange(): void {
    this.currentPage.set(0);
    this.first.set(0);
    this.loadProducts();
  }

  onPageChange(event: TablePageEvent): void {
    this.first.set(event.first);
    this.currentPage.set(event.first / event.rows);
    this.pageSize.set(event.rows);
    this.loadProducts();
  }

  openCreateDialog(): void {
    this.dialogRef = this.dialogService.open(ProductDialogComponent, {
      header: 'Create Product',
      width: '500px',
      contentStyle: { overflow: 'auto' },
      data: {}
    }) ?? undefined;

    this.dialogRef?.onClose.subscribe((result) => {
      if (result) {
        this.showSuccess('Product created successfully');
        this.loadProducts();
      }
    });
  }

  openEditDialog(product: Product): void {
    this.dialogRef = this.dialogService.open(ProductDialogComponent, {
      header: 'Edit Product',
      width: '500px',
      contentStyle: { overflow: 'auto' },
      data: { product }
    }) ?? undefined;

    this.dialogRef?.onClose.subscribe((result) => {
      if (result) {
        this.showSuccess('Product updated successfully');
        this.loadProducts();
      }
    });
  }

  openPriceDialog(product: Product): void {
    this.dialogRef = this.dialogService.open(PriceDialogComponent, {
      header: 'Update Price',
      width: '500px',
      contentStyle: { overflow: 'auto' },
      data: { product }
    }) ?? undefined;

    this.dialogRef?.onClose.subscribe((result) => {
      if (result) {
        this.showSuccess('Price updated successfully');
        this.loadProducts();
      }
    });
  }

  deleteProduct(product: Product): void {
    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      this.productService.deleteProduct(product.id).subscribe({
        next: () => {
          this.showSuccess('Product deleted successfully');
          this.loadProducts();
        },
        error: (err) => {
          this.showError(err.message || 'Failed to delete product');
        }
      });
    }
  }

  private showSuccess(message: string): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: message,
      life: 3000
    });
  }

  private showError(message: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message,
      life: 5000
    });
  }
}
