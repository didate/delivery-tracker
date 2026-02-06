import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormArray, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Delivery, CreateDeliveryDto, UpdateDeliveryDto, CreateDeliveryItemDto } from '../models/delivery.model';
import { Customer } from '../../customers/models/customer.model';
import { Driver } from '../../drivers/models/driver.model';
import { Product } from '../../products/models/product.model';
import { CustomerService } from '../../customers/services/customer.service';
import { DriverService } from '../../drivers/services/driver.service';
import { ProductService } from '../../products/services/product.service';

export interface DeliveryDialogData {
  delivery?: Delivery;
  mode: 'create' | 'edit';
}

export interface DeliveryDialogResult {
  action: 'save';
  data: CreateDeliveryDto;
}

interface ItemFormGroup {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

@Component({
  selector: 'app-delivery-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatTableModule,
    MatTooltipModule,
    CurrencyPipe,
  ],
  template: `
    <h2 mat-dialog-title>{{ isEditMode() ? 'Edit Delivery' : 'New Delivery' }}</h2>

    <mat-dialog-content>
      <form [formGroup]="deliveryForm" class="delivery-form">
        <div class="form-section">
          <h3>Delivery Information</h3>

          <div class="form-row two-columns">
            <mat-form-field appearance="outline">
              <mat-label>Customer</mat-label>
              <mat-select formControlName="customerId" (selectionChange)="onCustomerChange($event.value)">
                @for (customer of customers(); track customer.id) {
                  <mat-option [value]="customer.id">{{ customer.name }}</mat-option>
                }
              </mat-select>
              @if (deliveryForm.controls.customerId.hasError('required') && deliveryForm.controls.customerId.touched) {
                <mat-error>Customer is required</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Driver (Optional)</mat-label>
              <mat-select formControlName="driverId">
                <mat-option [value]="null">Not assigned</mat-option>
                @for (driver of drivers(); track driver.id) {
                  <mat-option [value]="driver.id">{{ driver.firstName }} {{ driver.lastName }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>

          <div class="form-row two-columns">
            <mat-form-field appearance="outline">
              <mat-label>Delivery Date</mat-label>
              <input matInput [matDatepicker]="picker" formControlName="deliveryDate">
              <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
              @if (deliveryForm.controls.deliveryDate.hasError('required') && deliveryForm.controls.deliveryDate.touched) {
                <mat-error>Delivery date is required</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Notes (Optional)</mat-label>
              <textarea matInput formControlName="notes" rows="1" placeholder="Add notes..."></textarea>
            </mat-form-field>
          </div>
        </div>

        <mat-divider></mat-divider>

        <div class="form-section">
          <div class="section-header">
            <h3>Items</h3>
            <button mat-button color="primary" type="button" (click)="addItem()">
              <mat-icon>add</mat-icon>
              Add Item
            </button>
          </div>

          @if (itemsFormArray.length === 0) {
            <div class="no-items">
              <p>No items added yet. Click "Add Item" to add products to this delivery.</p>
            </div>
          } @else {
            <div class="items-table-container">
              <table mat-table [dataSource]="itemsFormArray.controls" class="items-table">
                <ng-container matColumnDef="product">
                  <th mat-header-cell *matHeaderCellDef>Product</th>
                  <td mat-cell *matCellDef="let item; let i = index">
                    <mat-form-field appearance="outline" class="compact-field">
                      <mat-select [formControl]="getItemControl(i, 'productId')" (selectionChange)="onProductChange(i, $event.value)">
                        @for (product of products(); track product.id) {
                          <mat-option [value]="product.id">{{ product.name }}</mat-option>
                        }
                      </mat-select>
                    </mat-form-field>
                  </td>
                </ng-container>

                <ng-container matColumnDef="quantity">
                  <th mat-header-cell *matHeaderCellDef>Quantity</th>
                  <td mat-cell *matCellDef="let item; let i = index">
                    <mat-form-field appearance="outline" class="compact-field quantity-field">
                      <input matInput type="number" min="1" [formControl]="getItemControl(i, 'quantity')" (input)="updateItemTotal(i)">
                    </mat-form-field>
                  </td>
                </ng-container>

                <ng-container matColumnDef="unitPrice">
                  <th mat-header-cell *matHeaderCellDef>Unit Price</th>
                  <td mat-cell *matCellDef="let item; let i = index">
                    <mat-form-field appearance="outline" class="compact-field price-field">
                      <input matInput type="number" min="0" step="0.01" [formControl]="getItemControl(i, 'unitPrice')" (input)="updateItemTotal(i)">
                    </mat-form-field>
                  </td>
                </ng-container>

                <ng-container matColumnDef="totalPrice">
                  <th mat-header-cell *matHeaderCellDef>Total</th>
                  <td mat-cell *matCellDef="let item; let i = index">
                    {{ getItemValue(i, 'totalPrice') | currency }}
                  </td>
                </ng-container>

                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef></th>
                  <td mat-cell *matCellDef="let item; let i = index">
                    <button mat-icon-button color="warn" type="button" (click)="removeItem(i)" matTooltip="Remove item">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="itemColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: itemColumns;"></tr>
              </table>
            </div>

            <div class="total-row">
              <strong>Total Amount: {{ grandTotal() | currency }}</strong>
            </div>
          }
        </div>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button
        mat-raised-button
        color="primary"
        (click)="onSave()"
        [disabled]="deliveryForm.invalid || itemsFormArray.length === 0 || isSaving()">
        @if (isSaving()) {
          <mat-spinner diameter="20"></mat-spinner>
        } @else {
          {{ isEditMode() ? 'Update' : 'Create' }}
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .delivery-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 600px;
      padding-top: 8px;
    }

    .form-section {
      margin-bottom: 8px;
    }

    .form-section h3 {
      margin: 0 0 16px 0;
      color: #666;
      font-size: 14px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .section-header h3 {
      margin: 0;
    }

    .form-row {
      display: flex;
      gap: 16px;
    }

    .form-row.two-columns {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    mat-form-field {
      width: 100%;
    }

    .no-items {
      text-align: center;
      padding: 32px;
      color: #9e9e9e;
      background-color: #fafafa;
      border-radius: 4px;
    }

    .items-table-container {
      overflow-x: auto;
    }

    .items-table {
      width: 100%;
    }

    .compact-field {
      margin: 4px 0;
    }

    .compact-field ::ng-deep .mat-mdc-form-field-subscript-wrapper {
      display: none;
    }

    .quantity-field {
      width: 80px;
    }

    .price-field {
      width: 120px;
    }

    .total-row {
      display: flex;
      justify-content: flex-end;
      padding: 16px;
      background-color: #f5f5f5;
      border-radius: 4px;
      margin-top: 8px;
    }

    mat-dialog-content {
      max-height: 70vh;
      overflow-y: auto;
    }

    mat-dialog-actions {
      padding: 16px 0 0 0;
    }

    mat-spinner {
      display: inline-block;
    }

    mat-divider {
      margin: 16px 0;
    }
  `]
})
export class DeliveryDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<DeliveryDialogComponent>);
  readonly data = inject<DeliveryDialogData>(MAT_DIALOG_DATA);

  private readonly customerService = inject(CustomerService);
  private readonly driverService = inject(DriverService);
  private readonly productService = inject(ProductService);

  readonly isSaving = signal(false);
  readonly isEditMode = signal(false);
  readonly customers = signal<Customer[]>([]);
  readonly drivers = signal<Driver[]>([]);
  readonly products = signal<Product[]>([]);

  readonly itemColumns = ['product', 'quantity', 'unitPrice', 'totalPrice', 'actions'];

  readonly deliveryForm = this.fb.nonNullable.group({
    customerId: [null as number | null, [Validators.required]],
    driverId: [null as number | null],
    deliveryDate: [new Date(), [Validators.required]],
    notes: [''],
    items: this.fb.array<FormGroup>([])
  });

  get itemsFormArray(): FormArray {
    return this.deliveryForm.get('items') as FormArray;
  }

  readonly grandTotal = computed(() => {
    let total = 0;
    for (let i = 0; i < this.itemsFormArray.length; i++) {
      total += this.getItemValue(i, 'totalPrice') || 0;
    }
    return total;
  });

  ngOnInit(): void {
    this.isEditMode.set(this.data.mode === 'edit');
    this.loadCustomers();
    this.loadDrivers();
    this.loadProducts();

    if (this.data.delivery) {
      this.patchFormWithDelivery(this.data.delivery);
    }
  }

  private loadCustomers(): void {
    this.customerService.getCustomers({ size: 1000, active: true }).subscribe({
      next: (response) => {
        this.customers.set(response.data);
      }
    });
  }

  private loadDrivers(): void {
    this.driverService.getDrivers({ size: 1000, active: true }).subscribe({
      next: (response) => {
        this.drivers.set(response.data);
      }
    });
  }

  private loadProducts(): void {
    this.productService.getProducts({ size: 1000, active: true }).subscribe({
      next: (response) => {
        this.products.set(response.data);
      }
    });
  }

  private patchFormWithDelivery(delivery: Delivery): void {
    this.deliveryForm.patchValue({
      customerId: delivery.customerId,
      driverId: delivery.driverId,
      deliveryDate: new Date(delivery.deliveryDate),
      notes: delivery.notes || ''
    });

    // Add existing items
    delivery.items.forEach(item => {
      this.itemsFormArray.push(this.createItemFormGroup({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice
      }));
    });
  }

  private createItemFormGroup(item?: Partial<ItemFormGroup>): FormGroup {
    return this.fb.group({
      productId: [item?.productId || '', Validators.required],
      productName: [item?.productName || ''],
      quantity: [item?.quantity || 1, [Validators.required, Validators.min(1)]],
      unitPrice: [item?.unitPrice || 0, [Validators.required, Validators.min(0)]],
      totalPrice: [item?.totalPrice || 0]
    });
  }

  addItem(): void {
    this.itemsFormArray.push(this.createItemFormGroup());
  }

  removeItem(index: number): void {
    this.itemsFormArray.removeAt(index);
  }

  getItemControl(index: number, controlName: string): any {
    return this.itemsFormArray.at(index).get(controlName);
  }

  getItemValue(index: number, controlName: string): any {
    return this.itemsFormArray.at(index).get(controlName)?.value;
  }

  onCustomerChange(customerId: number): void {
    const customer = this.customers().find(c => c.id === customerId);
    if (customer && customer.driverId && !this.deliveryForm.value.driverId) {
      this.deliveryForm.patchValue({ driverId: customer.driverId });
    }
  }

  onProductChange(index: number, productId: string): void {
    const product = this.products().find(p => p.id === productId);
    if (product) {
      const itemGroup = this.itemsFormArray.at(index);
      itemGroup.patchValue({
        productName: product.name,
        unitPrice: product.price
      });
      this.updateItemTotal(index);
    }
  }

  updateItemTotal(index: number): void {
    const itemGroup = this.itemsFormArray.at(index);
    const quantity = itemGroup.get('quantity')?.value || 0;
    const unitPrice = itemGroup.get('unitPrice')?.value || 0;
    itemGroup.patchValue({ totalPrice: quantity * unitPrice });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.deliveryForm.invalid || this.itemsFormArray.length === 0) {
      this.deliveryForm.markAllAsTouched();
      return;
    }

    const formValue = this.deliveryForm.getRawValue();

    const items: CreateDeliveryItemDto[] = this.itemsFormArray.controls.map(control => ({
      productId: control.get('productId')?.value,
      quantity: control.get('quantity')?.value,
      unitPrice: control.get('unitPrice')?.value
    }));

    const deliveryData: CreateDeliveryDto = {
      customerId: formValue.customerId!,
      driverId: formValue.driverId,
      deliveryDate: this.formatDate(formValue.deliveryDate),
      notes: formValue.notes || null,
      items
    };

    const result: DeliveryDialogResult = {
      action: 'save',
      data: deliveryData
    };

    this.dialogRef.close(result);
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
