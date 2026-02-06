import { Component, inject, signal, computed, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Driver } from './models/driver.model';
import { DriverService } from './services/driver.service';
import { DriverDialogComponent, DriverDialogData } from './driver-dialog/driver-dialog.component';

@Component({
  selector: 'app-drivers-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Drivers</h1>
        <button mat-flat-button color="primary" (click)="openAddDialog()">
          <mat-icon>add</mat-icon>
          Add Driver
        </button>
      </div>

      <mat-card>
        <mat-card-content>
          <div class="filters">
            <mat-form-field appearance="outline">
              <mat-label>Status</mat-label>
              <mat-select [(value)]="activeFilter" (selectionChange)="onFilterChange()">
                <mat-option [value]="null">All</mat-option>
                <mat-option [value]="true">Active</mat-option>
                <mat-option [value]="false">Inactive</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          @if (loading()) {
            <div class="loading-container">
              <mat-spinner diameter="40"></mat-spinner>
            </div>
          } @else {
            <table mat-table [dataSource]="dataSource" class="drivers-table">
              <ng-container matColumnDef="code">
                <th mat-header-cell *matHeaderCellDef>Code</th>
                <td mat-cell *matCellDef="let driver">{{ driver.code }}</td>
              </ng-container>

              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Name</th>
                <td mat-cell *matCellDef="let driver">{{ driver.firstName }} {{ driver.lastName }}</td>
              </ng-container>

              <ng-container matColumnDef="phone">
                <th mat-header-cell *matHeaderCellDef>Phone</th>
                <td mat-cell *matCellDef="let driver">{{ driver.phone }}</td>
              </ng-container>

              <ng-container matColumnDef="vehicle">
                <th mat-header-cell *matHeaderCellDef>Vehicle</th>
                <td mat-cell *matCellDef="let driver">{{ driver.vehicleType }} - {{ driver.vehiclePlate }}</td>
              </ng-container>

              <ng-container matColumnDef="productionSite">
                <th mat-header-cell *matHeaderCellDef>Production Site</th>
                <td mat-cell *matCellDef="let driver">{{ driver.productionSiteName }}</td>
              </ng-container>

              <ng-container matColumnDef="active">
                <th mat-header-cell *matHeaderCellDef>Active</th>
                <td mat-cell *matCellDef="let driver">
                  <mat-chip [class.active-chip]="driver.active" [class.inactive-chip]="!driver.active">
                    {{ driver.active ? 'Active' : 'Inactive' }}
                  </mat-chip>
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let driver">
                  <button mat-icon-button matTooltip="Edit" (click)="openEditDialog(driver)">
                    <mat-icon>edit</mat-icon>
                  </button>
                  @if (driver.active) {
                    <button mat-icon-button matTooltip="Deactivate" (click)="toggleActive(driver)">
                      <mat-icon>toggle_off</mat-icon>
                    </button>
                  } @else {
                    <button mat-icon-button matTooltip="Activate" (click)="toggleActive(driver)">
                      <mat-icon>toggle_on</mat-icon>
                    </button>
                  }
                  <button mat-icon-button matTooltip="Delete" color="warn" (click)="deleteDriver(driver)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

              <tr class="mat-row" *matNoDataRow>
                <td class="mat-cell no-data" [attr.colspan]="displayedColumns.length">
                  No drivers found
                </td>
              </tr>
            </table>

            <mat-paginator
              [length]="totalItems()"
              [pageSize]="pageSize()"
              [pageIndex]="pageIndex()"
              [pageSizeOptions]="[10, 25, 50]"
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
      margin-bottom: 16px;
    }

    .filters mat-form-field {
      min-width: 150px;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 48px;
    }

    .drivers-table {
      width: 100%;
    }

    .no-data {
      text-align: center;
      padding: 24px;
      color: rgba(0, 0, 0, 0.54);
    }

    .active-chip {
      background-color: #c8e6c9 !important;
      color: #2e7d32 !important;
    }

    .inactive-chip {
      background-color: #ffcdd2 !important;
      color: #c62828 !important;
    }

    mat-chip {
      font-size: 12px;
    }
  `]
})
export class DriversListComponent implements OnInit, AfterViewInit {
  private readonly driverService = inject(DriverService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  readonly displayedColumns = ['code', 'name', 'phone', 'vehicle', 'productionSite', 'active', 'actions'];

  readonly loading = signal(false);
  readonly drivers = signal<Driver[]>([]);
  readonly totalItems = signal(0);
  readonly pageSize = signal(10);
  readonly pageIndex = signal(0);

  activeFilter: boolean | null = null;
  dataSource = new MatTableDataSource<Driver>([]);

  ngOnInit(): void {
    this.loadDrivers();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  loadDrivers(): void {
    this.loading.set(true);

    const params: Record<string, number | boolean> = {
      page: this.pageIndex(),
      size: this.pageSize()
    };

    if (this.activeFilter !== null) {
      params['active'] = this.activeFilter;
    }

    this.driverService.getDrivers(params).subscribe({
      next: (response) => {
        this.drivers.set(response.data);
        this.dataSource.data = response.data;
        this.totalItems.set(response.total);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load drivers:', err);
        this.loading.set(false);
        this.snackBar.open('Failed to load drivers', 'Close', { duration: 3000 });
      }
    });
  }

  onFilterChange(): void {
    this.pageIndex.set(0);
    this.loadDrivers();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadDrivers();
  }

  openAddDialog(): void {
    const dialogData: DriverDialogData = { mode: 'create' };
    const dialogRef = this.dialog.open(DriverDialogComponent, {
      data: dialogData,
      width: '700px'
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadDrivers();
        this.snackBar.open('Driver created successfully', 'Close', { duration: 3000 });
      }
    });
  }

  openEditDialog(driver: Driver): void {
    const dialogData: DriverDialogData = { mode: 'edit', driver };
    const dialogRef = this.dialog.open(DriverDialogComponent, {
      data: dialogData,
      width: '700px'
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadDrivers();
        this.snackBar.open('Driver updated successfully', 'Close', { duration: 3000 });
      }
    });
  }

  toggleActive(driver: Driver): void {
    const action = driver.active
      ? this.driverService.deactivateDriver(driver.id)
      : this.driverService.activateDriver(driver.id);

    action.subscribe({
      next: () => {
        this.loadDrivers();
        const status = driver.active ? 'deactivated' : 'activated';
        this.snackBar.open(`Driver ${status} successfully`, 'Close', { duration: 3000 });
      },
      error: (err) => {
        console.error('Failed to toggle driver status:', err);
        this.snackBar.open('Failed to update driver status', 'Close', { duration: 3000 });
      }
    });
  }

  deleteDriver(driver: Driver): void {
    if (confirm(`Are you sure you want to delete driver ${driver.firstName} ${driver.lastName}?`)) {
      this.driverService.deleteDriver(driver.id).subscribe({
        next: () => {
          this.loadDrivers();
          this.snackBar.open('Driver deleted successfully', 'Close', { duration: 3000 });
        },
        error: (err) => {
          console.error('Failed to delete driver:', err);
          this.snackBar.open('Failed to delete driver', 'Close', { duration: 3000 });
        }
      });
    }
  }
}
