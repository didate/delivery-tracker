import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Driver } from './models/driver.model';
import { DriverService } from './services/driver.service';
import { DriverDialogComponent, DriverDialogData } from './driver-dialog/driver-dialog.component';

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
    TableModule,
    ButtonModule,
    CardModule,
    SelectModule,
    TagModule,
    TooltipModule,
    ProgressSpinnerModule,
    ToastModule
  ],
  providers: [DialogService, MessageService],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Drivers</h1>
        <p-button label="Add Driver" icon="pi pi-plus" (onClick)="openAddDialog()"></p-button>
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

        @if (loading()) {
          <div class="loading-container">
            <p-progressSpinner [style]="{width: '40px', height: '40px'}"></p-progressSpinner>
          </div>
        } @else {
          <p-table
            [value]="drivers()"
            [paginator]="true"
            [rows]="pageSize()"
            [totalRecords]="totalItems()"
            [lazy]="true"
            (onLazyLoad)="onLazyLoad($event)"
            [rowsPerPageOptions]="[10, 25, 50]"
            [showCurrentPageReport]="true"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
            [tableStyle]="{'min-width': '75rem'}">

            <ng-template pTemplate="header">
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Vehicle</th>
                <th>Production Site</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </ng-template>

            <ng-template pTemplate="body" let-driver>
              <tr>
                <td>{{ driver.code }}</td>
                <td>{{ driver.firstName }} {{ driver.lastName }}</td>
                <td>{{ driver.phone }}</td>
                <td>{{ driver.vehicleType }} - {{ driver.vehiclePlate }}</td>
                <td>{{ driver.productionSiteName }}</td>
                <td>
                  <p-tag
                    [value]="driver.active ? 'Active' : 'Inactive'"
                    [severity]="driver.active ? 'success' : 'danger'">
                  </p-tag>
                </td>
                <td>
                  <p-button
                    icon="pi pi-pencil"
                    [rounded]="true"
                    [text]="true"
                    pTooltip="Edit"
                    (onClick)="openEditDialog(driver)">
                  </p-button>
                  @if (driver.active) {
                    <p-button
                      icon="pi pi-toggle-off"
                      [rounded]="true"
                      [text]="true"
                      pTooltip="Deactivate"
                      (onClick)="toggleActive(driver)">
                    </p-button>
                  } @else {
                    <p-button
                      icon="pi pi-toggle-on"
                      [rounded]="true"
                      [text]="true"
                      pTooltip="Activate"
                      (onClick)="toggleActive(driver)">
                    </p-button>
                  }
                  <p-button
                    icon="pi pi-trash"
                    [rounded]="true"
                    [text]="true"
                    severity="danger"
                    pTooltip="Delete"
                    (onClick)="deleteDriver(driver)">
                  </p-button>
                </td>
              </tr>
            </ng-template>

            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="7" class="no-data">No drivers found</td>
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
      margin-bottom: 16px;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      padding: 48px;
    }

    .no-data {
      text-align: center;
      padding: 24px;
      color: rgba(0, 0, 0, 0.54);
    }
  `]
})
export class DriversListComponent implements OnInit {
  private readonly driverService = inject(DriverService);
  private readonly dialogService = inject(DialogService);
  private readonly messageService = inject(MessageService);

  private dialogRef: DynamicDialogRef | undefined;

  readonly loading = signal(false);
  readonly drivers = signal<Driver[]>([]);
  readonly totalItems = signal(0);
  readonly pageSize = signal(10);
  readonly pageIndex = signal(0);

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
      page: this.pageIndex(),
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
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load drivers'
        });
      }
    });
  }

  onFilterChange(): void {
    this.pageIndex.set(0);
    this.loadDrivers();
  }

  onLazyLoad(event: any): void {
    this.pageIndex.set(event.first / event.rows);
    this.pageSize.set(event.rows);
    this.loadDrivers();
  }

  openAddDialog(): void {
    const dialogData: DriverDialogData = { mode: 'create' };
    this.dialogRef = this.dialogService.open(DriverDialogComponent, {
      header: 'Add Driver',
      width: '700px',
      data: dialogData
    }) ?? undefined;

    this.dialogRef?.onClose.subscribe((result) => {
      if (result) {
        this.loadDrivers();
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Driver created successfully'
        });
      }
    });
  }

  openEditDialog(driver: Driver): void {
    const dialogData: DriverDialogData = { mode: 'edit', driver };
    this.dialogRef = this.dialogService.open(DriverDialogComponent, {
      header: 'Edit Driver',
      width: '700px',
      data: dialogData
    }) ?? undefined;

    this.dialogRef?.onClose.subscribe((result) => {
      if (result) {
        this.loadDrivers();
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Driver updated successfully'
        });
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
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Driver ${status} successfully`
        });
      },
      error: (err) => {
        console.error('Failed to toggle driver status:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update driver status'
        });
      }
    });
  }

  deleteDriver(driver: Driver): void {
    if (confirm(`Are you sure you want to delete driver ${driver.firstName} ${driver.lastName}?`)) {
      this.driverService.deleteDriver(driver.id).subscribe({
        next: () => {
          this.loadDrivers();
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Driver deleted successfully'
          });
        },
        error: (err) => {
          console.error('Failed to delete driver:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete driver'
          });
        }
      });
    }
  }
}
