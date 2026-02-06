import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Product } from './models/product.model';
import { ProductService } from './services/product.service';
import { ProductDialogComponent, ProductDialogData } from './product-dialog/product-dialog.component';
import { PriceDialogComponent, PriceDialogData } from './price-dialog/price-dialog.component';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule,
    CurrencyPipe
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Products</h1>
        <button mat-raised-button color="primary" (click)="openCreateDialog()">
          <mat-icon>add</mat-icon>
          Add Product
        </button>
      </div>

      <mat-card>
        <mat-card-content>
          <div class="filters">
            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Status</mat-label>
              <mat-select [(value)]="activeFilter" (selectionChange)="onFilterChange()">
                <mat-option [value]="null">All</mat-option>
                <mat-option [value]="true">Active</mat-option>
                <mat-option [value]="false">Inactive</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          @if (isLoading()) {
            <div class="loading-container">
              <mat-spinner diameter="40"></mat-spinner>
            </div>
          } @else if (products().length === 0) {
            <div class="empty-state">
              <mat-icon>inventory_2</mat-icon>
              <p>No products found</p>
            </div>
          } @else {
            <div class="table-container">
              <table mat-table [dataSource]="products()">
                <ng-container matColumnDef="code">
                  <th mat-header-cell *matHeaderCellDef>Code</th>
                  <td mat-cell *matCellDef="let product">{{ product.code }}</td>
                </ng-container>

                <ng-container matColumnDef="name">
                  <th mat-header-cell *matHeaderCellDef>Name</th>
                  <td mat-cell *matCellDef="let product">{{ product.name }}</td>
                </ng-container>

                <ng-container matColumnDef="description">
                  <th mat-header-cell *matHeaderCellDef>Description</th>
                  <td mat-cell *matCellDef="let product" class="description-cell">
                    {{ product.description || '-' }}
                  </td>
                </ng-container>

                <ng-container matColumnDef="price">
                  <th mat-header-cell *matHeaderCellDef>Price</th>
                  <td mat-cell *matCellDef="let product" class="price-cell">
                    {{ product.price | currency }}
                  </td>
                </ng-container>

                <ng-container matColumnDef="active">
                  <th mat-header-cell *matHeaderCellDef>Active</th>
                  <td mat-cell *matCellDef="let product">
                    <span [class]="product.active ? 'status-active' : 'status-inactive'">
                      {{ product.active ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Actions</th>
                  <td mat-cell *matCellDef="let product">
                    <div class="action-buttons">
                      <button mat-icon-button color="primary" matTooltip="Edit" (click)="openEditDialog(product)">
                        <mat-icon>edit</mat-icon>
                      </button>
                      <button mat-icon-button color="accent" matTooltip="Update Price" (click)="openPriceDialog(product)">
                        <mat-icon>attach_money</mat-icon>
                      </button>
                      <button mat-icon-button color="warn" matTooltip="Delete" (click)="deleteProduct(product)">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </div>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
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
    .filters {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }
    .filter-field {
      min-width: 150px;
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
    .empty-state mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
    }
    .table-container {
      overflow-x: auto;
    }
    table {
      width: 100%;
    }
    .description-cell {
      max-width: 250px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .price-cell {
      font-weight: 500;
      color: #1976d2;
    }
    .status-active {
      color: #4caf50;
      font-weight: 500;
    }
    .status-inactive {
      color: #f44336;
      font-weight: 500;
    }
    .action-buttons {
      display: flex;
      gap: 4px;
    }
    mat-paginator {
      margin-top: 16px;
    }
  `]
})
export class ProductsListComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly displayedColumns = ['code', 'name', 'description', 'price', 'active', 'actions'];

  readonly products = signal<Product[]>([]);
  readonly isLoading = signal(false);
  readonly totalItems = signal(0);
  readonly currentPage = signal(0);
  readonly pageSize = signal(10);

  activeFilter: boolean | null = null;

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
    this.loadProducts();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadProducts();
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(ProductDialogComponent, {
      width: '500px',
      data: {} as ProductDialogData
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.showSuccess('Product created successfully');
        this.loadProducts();
      }
    });
  }

  openEditDialog(product: Product): void {
    const dialogRef = this.dialog.open(ProductDialogComponent, {
      width: '500px',
      data: { product } as ProductDialogData
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.showSuccess('Product updated successfully');
        this.loadProducts();
      }
    });
  }

  openPriceDialog(product: Product): void {
    const dialogRef = this.dialog.open(PriceDialogComponent, {
      width: '500px',
      data: { product } as PriceDialogData
    });

    dialogRef.afterClosed().subscribe((result) => {
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
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }
}
