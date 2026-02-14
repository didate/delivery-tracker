import { Component, inject, signal, input, output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { Driver, CreateDriverDto, UpdateDriverDto } from '../models/driver.model';
import { ProductionSite } from '../models/production-site.model';
import { ProductionSiteService } from '../services/production-site.service';

export interface DriverDialogData {
  driver?: Driver;
  mode: 'create' | 'edit';
}

export interface DriverDialogResult {
  action: 'save';
  data: CreateDriverDto | UpdateDriverDto;
}

@Component({
  selector: 'app-driver-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent],
  template: `
    <app-modal
      [isOpen]="isOpen()"
      [title]="mode() === 'edit' ? 'Edit Driver' : 'Add Driver'"
      maxWidth="700px"
      (close)="onCancel()">

      <form [formGroup]="driverForm" (ngSubmit)="onSave()" class="space-y-4">
        <!-- Row 1: Code, First Name, Last Name -->
        <div class="grid grid-cols-3 gap-4">
          <div>
            <label for="code" class="block text-sm font-medium text-gray-700 mb-1">Code</label>
            <input
              id="code"
              type="text"
              formControlName="code"
              placeholder="Driver code"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              [class.border-red-500]="driverForm.controls.code.invalid && driverForm.controls.code.touched" />
            @if (driverForm.controls.code.hasError('required') && driverForm.controls.code.touched) {
              <p class="mt-1 text-sm text-red-600">Code is required</p>
            }
          </div>

          <div>
            <label for="firstName" class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input
              id="firstName"
              type="text"
              formControlName="firstName"
              placeholder="First name"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              [class.border-red-500]="driverForm.controls.firstName.invalid && driverForm.controls.firstName.touched" />
            @if (driverForm.controls.firstName.hasError('required') && driverForm.controls.firstName.touched) {
              <p class="mt-1 text-sm text-red-600">First name is required</p>
            }
          </div>

          <div>
            <label for="lastName" class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input
              id="lastName"
              type="text"
              formControlName="lastName"
              placeholder="Last name"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              [class.border-red-500]="driverForm.controls.lastName.invalid && driverForm.controls.lastName.touched" />
            @if (driverForm.controls.lastName.hasError('required') && driverForm.controls.lastName.touched) {
              <p class="mt-1 text-sm text-red-600">Last name is required</p>
            }
          </div>
        </div>

        <!-- Row 2: Phone, Email -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              id="phone"
              type="text"
              formControlName="phone"
              placeholder="Phone number"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              [class.border-red-500]="driverForm.controls.phone.invalid && driverForm.controls.phone.touched" />
            @if (driverForm.controls.phone.hasError('required') && driverForm.controls.phone.touched) {
              <p class="mt-1 text-sm text-red-600">Phone is required</p>
            }
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              placeholder="Email address"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              [class.border-red-500]="driverForm.controls.email.invalid && driverForm.controls.email.touched" />
            @if (driverForm.controls.email.hasError('required') && driverForm.controls.email.touched) {
              <p class="mt-1 text-sm text-red-600">Email is required</p>
            }
            @if (driverForm.controls.email.hasError('email') && driverForm.controls.email.touched) {
              <p class="mt-1 text-sm text-red-600">Please enter a valid email</p>
            }
          </div>
        </div>

        <!-- Row 3: License Number, Vehicle Type, Vehicle Plate -->
        <div class="grid grid-cols-3 gap-4">
          <div>
            <label for="licenseNumber" class="block text-sm font-medium text-gray-700 mb-1">License Number</label>
            <input
              id="licenseNumber"
              type="text"
              formControlName="licenseNumber"
              placeholder="License number"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              [class.border-red-500]="driverForm.controls.licenseNumber.invalid && driverForm.controls.licenseNumber.touched" />
            @if (driverForm.controls.licenseNumber.hasError('required') && driverForm.controls.licenseNumber.touched) {
              <p class="mt-1 text-sm text-red-600">License number is required</p>
            }
          </div>

          <div>
            <label for="vehicleType" class="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
            <input
              id="vehicleType"
              type="text"
              formControlName="vehicleType"
              placeholder="Vehicle type"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              [class.border-red-500]="driverForm.controls.vehicleType.invalid && driverForm.controls.vehicleType.touched" />
            @if (driverForm.controls.vehicleType.hasError('required') && driverForm.controls.vehicleType.touched) {
              <p class="mt-1 text-sm text-red-600">Vehicle type is required</p>
            }
          </div>

          <div>
            <label for="vehiclePlate" class="block text-sm font-medium text-gray-700 mb-1">Vehicle Plate</label>
            <input
              id="vehiclePlate"
              type="text"
              formControlName="vehiclePlate"
              placeholder="Vehicle plate"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              [class.border-red-500]="driverForm.controls.vehiclePlate.invalid && driverForm.controls.vehiclePlate.touched" />
            @if (driverForm.controls.vehiclePlate.hasError('required') && driverForm.controls.vehiclePlate.touched) {
              <p class="mt-1 text-sm text-red-600">Vehicle plate is required</p>
            }
          </div>
        </div>

        <!-- Row 4: Production Site -->
        <div>
          <label for="productionSiteId" class="block text-sm font-medium text-gray-700 mb-1">Production Site</label>
          <div class="relative">
            <select
              id="productionSiteId"
              formControlName="productionSiteId"
              class="w-full appearance-none px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              [class.border-red-500]="driverForm.controls.productionSiteId.invalid && driverForm.controls.productionSiteId.touched">
              <option [ngValue]="null">Select a production site</option>
              @for (site of productionSites(); track site.id) {
                <option [ngValue]="site.id">{{ site.name }}</option>
              }
            </select>
            <i class="pi pi-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></i>
          </div>
          @if (driverForm.controls.productionSiteId.hasError('required') && driverForm.controls.productionSiteId.touched) {
            <p class="mt-1 text-sm text-red-600">Production site is required</p>
          }
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-6">
          <button
            type="button"
            (click)="onCancel()"
            class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium rounded-lg transition-colors">
            Cancel
          </button>
          <button
            type="submit"
            [disabled]="driverForm.invalid || isSaving()"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors flex items-center gap-2">
            @if (isSaving()) {
              <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            }
            {{ mode() === 'edit' ? 'Update' : 'Create' }}
          </button>
        </div>
      </form>
    </app-modal>
  `,
})
export class DriverDialogComponent implements OnInit, OnChanges {
  private readonly fb = inject(FormBuilder);
  private readonly productionSiteService = inject(ProductionSiteService);

  isOpen = input<boolean>(false);
  mode = input<'create' | 'edit'>('create');
  driver = input<Driver | null>(null);

  save = output<DriverDialogResult>();
  cancel = output<void>();

  readonly productionSites = signal<ProductionSite[]>([]);
  readonly isSaving = signal(false);

  readonly driverForm = this.fb.nonNullable.group({
    code: ['', [Validators.required]],
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    phone: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    licenseNumber: ['', [Validators.required]],
    vehicleType: ['', [Validators.required]],
    vehiclePlate: ['', [Validators.required]],
    productionSiteId: [null as number | null, [Validators.required]],
  });

  ngOnInit(): void {
    this.loadProductionSites();
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['driver'] || changes['isOpen']) {
      this.initForm();
    }
  }

  private loadProductionSites(): void {
    this.productionSiteService.getProductionSites().subscribe({
      next: (sites) => this.productionSites.set(sites),
      error: (err) => console.error('Failed to load production sites:', err)
    });
  }

  private initForm(): void {
    const driverData = this.driver();
    if (driverData) {
      this.driverForm.patchValue({
        code: driverData.code,
        firstName: driverData.firstName,
        lastName: driverData.lastName,
        phone: driverData.phone,
        email: driverData.email,
        licenseNumber: driverData.licenseNumber,
        vehicleType: driverData.vehicleType,
        vehiclePlate: driverData.vehiclePlate,
        productionSiteId: driverData.productionSiteId,
      });
    } else {
      this.driverForm.reset();
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onSave(): void {
    if (this.driverForm.invalid) {
      this.driverForm.markAllAsTouched();
      return;
    }

    const formValue = this.driverForm.getRawValue();

    const driverData: CreateDriverDto | UpdateDriverDto = {
      code: formValue.code,
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      phone: formValue.phone,
      email: formValue.email,
      licenseNumber: formValue.licenseNumber,
      vehicleType: formValue.vehicleType,
      vehiclePlate: formValue.vehiclePlate,
      productionSiteId: formValue.productionSiteId!,
    };

    const result: DriverDialogResult = {
      action: 'save',
      data: driverData,
    };

    this.save.emit(result);
  }
}
