import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormArray, FormGroup } from '@angular/forms';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { TableModule } from 'primeng/table';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

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
    InputTextModule,
    TextareaModule,
    InputNumberModule,
    ButtonModule,
    SelectModule,
    DatePickerModule,
    TableModule,
    DividerModule,
    TooltipModule,
    ProgressSpinnerModule,
    CurrencyPipe,
  ],
  template: `
    <div class="delivery-dialog">
      <form [formGroup]="deliveryForm" class="delivery-form">
        <div class="form-section">
          <h3>Delivery Information</h3>

          <div class="form-row two-columns">
            <div class="form-field">
              <label for="customerId">Customer *</label>
              <p-select
                id="customerId"
                formControlName="customerId"
                [options]="customerOptions()"
                (onChange)="onCustomerChange($event.value)"
                placeholder="Select a customer"
                optionLabel="label"
                optionValue="value"
                [filter]="true"
                filterPlaceholder="Search customers"
                styleClass="w-full"
                [class.ng-invalid]="deliveryForm.controls.customerId.invalid && deliveryForm.controls.customerId.touched">
              </p-select>
              @if (deliveryForm.controls.customerId.hasError('required') && deliveryForm.controls.customerId.touched) {
                <small class="p-error">Customer is required</small>
              }
            </div>

            <div class="form-field">
              <label for="driverId">Driver (Optional)</label>
              <p-select
                id="driverId"
                formControlName="driverId"
                [options]="driverOptions()"
                placeholder="Not assigned"
                optionLabel="label"
                optionValue="value"
                [filter]="true"
                filterPlaceholder="Search drivers"
                [showClear]="true"
                styleClass="w-full">
              </p-select>
            </div>
          </div>

          <div class="form-row two-columns">
            <div class="form-field">
              <label for="deliveryDate">Delivery Date *</label>
              <p-datepicker
                id="deliveryDate"
                formControlName="deliveryDate"
                dateFormat="mm/dd/yy"
                [showIcon]="true"
                styleClass="w-full"
                [class.ng-invalid]="deliveryForm.controls.deliveryDate.invalid && deliveryForm.controls.deliveryDate.touched">
              </p-datepicker>
              @if (deliveryForm.controls.deliveryDate.hasError('required') && deliveryForm.controls.deliveryDate.touched) {
                <small class="p-error">Delivery date is required</small>
              }
            </div>

            <div class="form-field">
              <label for="notes">Notes (Optional)</label>
              <textarea
                pTextarea
                id="notes"
                formControlName="notes"
                rows="1"
                placeholder="Add notes..."
                class="w-full">
              </textarea>
            </div>
          </div>
        </div>

        <p-divider></p-divider>

        <div class="form-section">
          <div class="section-header">
            <h3>Items</h3>
            <p-button
              label="Add Item"
              icon="pi pi-plus"
              [text]="true"
              (onClick)="addItem()">
            </p-button>
          </div>

          @if (itemsFormArray.length === 0) {
            <div class="no-items">
              <p>No items added yet. Click "Add Item" to add products to this delivery.</p>
            </div>
          } @else {
            <p-table [value]="itemsFormArray.controls" styleClass="p-datatable-sm">
              <ng-template pTemplate="header">
                <tr>
                  <th>Product</th>
                  <th style="width: 100px">Quantity</th>
                  <th style="width: 130px">Unit Price</th>
                  <th style="width: 100px">Total</th>
                  <th style="width: 60px"></th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-item let-i="rowIndex">
                <tr>
                  <td>
                    <p-select
                      [formControl]="getItemControl(i, 'productId')"
                      [options]="productOptions()"
                      (onChange)="onProductChange(i, $event.value)"
                      placeholder="Select product"
                      optionLabel="label"
                      optionValue="value"
                      [filter]="true"
                      filterPlaceholder="Search products"
                      styleClass="w-full compact-dropdown">
                    </p-select>
                  </td>
                  <td>
                    <p-inputNumber
                      [formControl]="getItemControl(i, 'quantity')"
                      (onInput)="updateItemTotal(i)"
                      [min]="1"
                      [showButtons]="true"
                      buttonLayout="horizontal"
                      spinnerMode="horizontal"
                      inputStyleClass="compact-input"
                      styleClass="compact-spinner">
                    </p-inputNumber>
                  </td>
                  <td>
                    <p-inputNumber
                      [formControl]="getItemControl(i, 'unitPrice')"
                      (onInput)="updateItemTotal(i)"
                      mode="currency"
                      currency="USD"
                      [min]="0"
                      inputStyleClass="compact-input">
                    </p-inputNumber>
                  </td>
                  <td class="total-cell">
                    {{ getItemValue(i, 'totalPrice') | currency }}
                  </td>
                  <td>
                    <p-button
                      icon="pi pi-trash"
                      [rounded]="true"
                      [text]="true"
                      severity="danger"
                      pTooltip="Remove item"
                      (onClick)="removeItem(i)">
                    </p-button>
                  </td>
                </tr>
              </ng-template>
            </p-table>

            <div class="total-row">
              <strong>Total Amount: {{ grandTotal() | currency }}</strong>
            </div>
          }
        </div>
      </form>

      <div class="dialog-footer">
        <p-button
          label="Cancel"
          [text]="true"
          (onClick)="onCancel()">
        </p-button>
        <p-button
          [label]="isEditMode() ? 'Update' : 'Create'"
          (onClick)="onSave()"
          [disabled]="deliveryForm.invalid || itemsFormArray.length === 0 || isSaving()"
          [loading]="isSaving()">
        </p-button>
      </div>
    </div>
  `,
  styles: [`
    .delivery-dialog {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .delivery-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 600px;
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

    .form-field {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .form-field label {
      font-size: 12px;
      font-weight: 500;
      color: #666;
    }

    .w-full {
      width: 100%;
    }

    .no-items {
      text-align: center;
      padding: 32px;
      color: #9e9e9e;
      background-color: #fafafa;
      border-radius: 4px;
    }

    .total-row {
      display: flex;
      justify-content: flex-end;
      padding: 16px;
      background-color: #f5f5f5;
      border-radius: 4px;
      margin-top: 8px;
    }

    .total-cell {
      font-weight: 500;
    }

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding-top: 16px;
      border-top: 1px solid #e0e0e0;
    }

    .p-error {
      color: var(--red-500);
      font-size: 12px;
    }

    :host ::ng-deep .compact-dropdown .p-select {
      height: 36px;
    }

    :host ::ng-deep .compact-input {
      height: 36px;
      width: 100%;
    }

    :host ::ng-deep .compact-spinner {
      width: 100%;
    }

    :host ::ng-deep .compact-spinner .p-inputnumber-input {
      width: 50px;
      text-align: center;
    }

    :host ::ng-deep .p-datatable .p-datatable-tbody > tr > td {
      padding: 8px;
      vertical-align: middle;
    }

    :host ::ng-deep .p-datatable .p-datatable-thead > tr > th {
      padding: 8px;
    }
  `]
})
export class DeliveryDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject<DynamicDialogRef<any>>(DynamicDialogRef);
  private readonly config = inject(DynamicDialogConfig);

  private readonly customerService = inject(CustomerService);
  private readonly driverService = inject(DriverService);
  private readonly productService = inject(ProductService);

  readonly isSaving = signal(false);
  readonly isEditMode = signal(false);
  readonly customers = signal<Customer[]>([]);
  readonly drivers = signal<Driver[]>([]);
  readonly products = signal<Product[]>([]);

  readonly customerOptions = computed(() =>
    this.customers().map(c => ({ label: c.name, value: c.id }))
  );

  readonly driverOptions = computed(() =>
    this.drivers().map(d => ({ label: `${d.firstName} ${d.lastName}`, value: d.id }))
  );

  readonly productOptions = computed(() =>
    this.products().map(p => ({ label: p.name, value: p.id }))
  );

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

  get data(): DeliveryDialogData {
    return this.config.data;
  }

  readonly grandTotal = computed(() => {
    let total = 0;
    for (let i = 0; i < this.itemsFormArray.length; i++) {
      total += this.getItemValue(i, 'totalPrice') || 0;
    }
    return total;
  });

  ngOnInit(): void {
    this.isEditMode.set(this.data?.mode === 'edit');
    this.loadCustomers();
    this.loadDrivers();
    this.loadProducts();

    if (this.data?.delivery) {
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
