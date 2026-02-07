import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormArray, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DividerModule } from 'primeng/divider';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';

import { Return, CreateReturnDto, UpdateReturnDto, CreateReturnItemDto } from '../models/return.model';
import { Customer } from '../../customers/models/customer.model';
import { Product } from '../../products/models/product.model';
import { CustomerService } from '../../customers/services/customer.service';
import { ProductService } from '../../products/services/product.service';

export interface ReturnDialogData {
  returnData?: Return;
  mode: 'create' | 'edit';
}

export interface ReturnDialogResult {
  action: 'save';
  data: CreateReturnDto | UpdateReturnDto;
}

interface CustomerOption {
  label: string;
  value: number;
}

interface ProductOption {
  label: string;
  value: string;
  price: number;
}

@Component({
  selector: 'app-return-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    Textarea,
    ButtonModule,
    SelectModule,
    DatePickerModule,
    InputNumberModule,
    ProgressSpinnerModule,
    DividerModule,
    CardModule,
    TooltipModule,
  ],
  template: `
    <form [formGroup]="returnForm" class="return-form">
      <div class="form-row two-columns">
        <div class="field">
          <label for="customerId">Customer *</label>
          <p-select
            id="customerId"
            formControlName="customerId"
            [options]="customerOptions()"
            placeholder="Select customer"
            [filter]="true"
            filterBy="label"
            [style]="{width: '100%'}">
          </p-select>
          @if (returnForm.controls.customerId.hasError('required') && returnForm.controls.customerId.touched) {
            <small class="p-error">Customer is required</small>
          }
        </div>

        <div class="field">
          <label for="returnDate">Return Date *</label>
          <p-datepicker
            id="returnDate"
            formControlName="returnDate"
            [showIcon]="true"
            [style]="{width: '100%'}"
            dateFormat="mm/dd/yy">
          </p-datepicker>
          @if (returnForm.controls.returnDate.hasError('required') && returnForm.controls.returnDate.touched) {
            <small class="p-error">Return date is required</small>
          }
        </div>
      </div>

      <div class="field">
        <label for="notes">Notes</label>
        <textarea
          pTextarea
          id="notes"
          formControlName="notes"
          rows="2"
          placeholder="Enter notes (optional)"
          class="full-width">
        </textarea>
      </div>

      @if (!isEditMode()) {
        <p-divider></p-divider>

        <div class="items-section">
          <div class="items-header">
            <h3>Return Items</h3>
            <p-button
              label="Add Item"
              icon="pi pi-plus"
              [text]="true"
              (onClick)="addItem()">
            </p-button>
          </div>

          @if (items.length === 0) {
            <p class="no-items-message">No items added yet. Click "Add Item" to add products to this return.</p>
          }

          <div formArrayName="items" class="items-list">
            @for (item of items.controls; track $index; let i = $index) {
              <p-card class="item-card" [formGroupName]="i">
                <div class="item-header">
                  <span class="item-number">Item {{ i + 1 }}</span>
                  <p-button
                    icon="pi pi-trash"
                    [rounded]="true"
                    [text]="true"
                    severity="danger"
                    (onClick)="removeItem(i)"
                    pTooltip="Remove item">
                  </p-button>
                </div>

                <div class="item-form-row">
                  <div class="field product-field">
                    <label>Product *</label>
                    <p-select
                      formControlName="productId"
                      [options]="productOptions()"
                      placeholder="Select product"
                      [filter]="true"
                      filterBy="label"
                      (onChange)="onProductChange(i)"
                      [style]="{width: '100%'}">
                    </p-select>
                    @if (getItemControl(i, 'productId').hasError('required') && getItemControl(i, 'productId').touched) {
                      <small class="p-error">Product is required</small>
                    }
                  </div>

                  <div class="field quantity-field">
                    <label>Quantity *</label>
                    <p-inputNumber
                      formControlName="quantity"
                      [min]="1"
                      [showButtons]="true"
                      (onInput)="calculateItemTotal(i)"
                      [style]="{width: '100%'}">
                    </p-inputNumber>
                    @if (getItemControl(i, 'quantity').hasError('required') && getItemControl(i, 'quantity').touched) {
                      <small class="p-error">Required</small>
                    }
                    @if (getItemControl(i, 'quantity').hasError('min') && getItemControl(i, 'quantity').touched) {
                      <small class="p-error">Min 1</small>
                    }
                  </div>

                  <div class="field price-field">
                    <label>Unit Value *</label>
                    <p-inputNumber
                      formControlName="unitValue"
                      [min]="0"
                      mode="currency"
                      currency="USD"
                      locale="en-US"
                      (onInput)="calculateItemTotal(i)"
                      [style]="{width: '100%'}">
                    </p-inputNumber>
                    @if (getItemControl(i, 'unitValue').hasError('required') && getItemControl(i, 'unitValue').touched) {
                      <small class="p-error">Required</small>
                    }
                  </div>
                </div>

                <div class="item-form-row">
                  <div class="field reason-field">
                    <label>Reason *</label>
                    <input
                      pInputText
                      formControlName="reason"
                      placeholder="Enter reason for return"
                      class="full-width">
                    @if (getItemControl(i, 'reason').hasError('required') && getItemControl(i, 'reason').touched) {
                      <small class="p-error">Reason is required</small>
                    }
                  </div>

                  <div class="item-total">
                    <span class="total-label">Total:</span>
                    <span class="total-value">\${{ getItemTotal(i) | number:'1.2-2' }}</span>
                  </div>
                </div>
              </p-card>
            }
          </div>

          @if (items.length > 0) {
            <div class="grand-total">
              <span class="grand-total-label">Grand Total:</span>
              <span class="grand-total-value">\${{ getGrandTotal() | number:'1.2-2' }}</span>
            </div>
          }
        </div>
      }
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
        [disabled]="returnForm.invalid || isSaving() || (!isEditMode() && items.length === 0)">
        @if (isSaving()) {
          <p-progressSpinner [style]="{width: '20px', height: '20px'}"></p-progressSpinner>
        }
      </p-button>
    </div>
  `,
  styles: [`
    .return-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 600px;
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

    .field {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .field label {
      font-weight: 500;
      font-size: 14px;
    }

    .full-width {
      width: 100%;
    }

    .p-error {
      color: var(--red-500);
    }

    .items-section {
      margin-top: 8px;
    }

    .items-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .items-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
    }

    .no-items-message {
      color: #9e9e9e;
      font-style: italic;
      text-align: center;
      padding: 24px;
      background-color: #f5f5f5;
      border-radius: 4px;
    }

    .items-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .item-card {
      margin-bottom: 0;
    }

    :host ::ng-deep .item-card .p-card-body {
      padding: 16px;
    }

    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .item-number {
      font-weight: 500;
      color: #666;
    }

    .item-form-row {
      display: flex;
      gap: 12px;
      align-items: flex-start;
      margin-bottom: 12px;
    }

    .item-form-row:last-child {
      margin-bottom: 0;
    }

    .product-field {
      flex: 2;
    }

    .quantity-field {
      flex: 0.7;
    }

    .price-field {
      flex: 1;
    }

    .reason-field {
      flex: 2;
    }

    .item-total {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      justify-content: center;
      min-width: 100px;
      padding: 8px;
      background-color: #e3f2fd;
      border-radius: 4px;
    }

    .total-label {
      font-size: 12px;
      color: #666;
    }

    .total-value {
      font-size: 16px;
      font-weight: 600;
      color: #1976d2;
    }

    .grand-total {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 16px;
      margin-top: 16px;
      padding: 16px;
      background-color: #e8f5e9;
      border-radius: 4px;
    }

    .grand-total-label {
      font-size: 16px;
      font-weight: 500;
    }

    .grand-total-value {
      font-size: 20px;
      font-weight: 700;
      color: #2e7d32;
    }

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #e0e0e0;
    }
  `]
})
export class ReturnDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(DynamicDialogRef<any>);
  private readonly dialogConfig = inject(DynamicDialogConfig);
  private readonly customerService = inject(CustomerService);
  private readonly productService = inject(ProductService);

  readonly isSaving = signal(false);
  readonly isEditMode = signal(false);
  readonly customers = signal<Customer[]>([]);
  readonly products = signal<Product[]>([]);
  readonly customerOptions = signal<CustomerOption[]>([]);
  readonly productOptions = signal<ProductOption[]>([]);

  readonly returnForm = this.fb.nonNullable.group({
    customerId: [null as number | null, [Validators.required]],
    returnDate: [new Date(), [Validators.required]],
    notes: [''],
    items: this.fb.array<FormGroup>([]),
  });

  get items(): FormArray {
    return this.returnForm.controls.items;
  }

  get data(): ReturnDialogData {
    return this.dialogConfig.data;
  }

  ngOnInit(): void {
    this.isEditMode.set(this.data.mode === 'edit');
    this.loadCustomers();
    this.loadProducts();

    if (this.data.returnData) {
      this.returnForm.patchValue({
        customerId: this.data.returnData.customerId,
        returnDate: new Date(this.data.returnData.returnDate),
        notes: this.data.returnData.notes,
      });
    }
  }

  private loadCustomers(): void {
    this.customerService.getCustomers({ size: 1000, active: true }).subscribe({
      next: (response) => {
        this.customers.set(response.data);
        this.customerOptions.set(
          response.data.map(c => ({
            label: `${c.name} (${c.code})`,
            value: c.id
          }))
        );
      },
      error: (err) => {
        console.error('Failed to load customers:', err);
      }
    });
  }

  private loadProducts(): void {
    this.productService.getProducts({ size: 1000, active: true }).subscribe({
      next: (response) => {
        this.products.set(response.data);
        this.productOptions.set(
          response.data.map(p => ({
            label: `${p.name} (${p.code})`,
            value: p.id,
            price: p.price
          }))
        );
      },
      error: (err) => {
        console.error('Failed to load products:', err);
      }
    });
  }

  addItem(): void {
    const itemGroup = this.fb.group({
      productId: [null as string | null, [Validators.required]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      reason: ['', [Validators.required]],
      unitValue: [0, [Validators.required, Validators.min(0)]],
    });

    this.items.push(itemGroup);
  }

  removeItem(index: number): void {
    this.items.removeAt(index);
  }

  getItemControl(index: number, controlName: string) {
    return (this.items.at(index) as FormGroup).controls[controlName];
  }

  onProductChange(index: number): void {
    const itemGroup = this.items.at(index) as FormGroup;
    const productId = itemGroup.get('productId')?.value;
    const productOption = this.productOptions().find(p => p.value === productId);

    if (productOption) {
      itemGroup.patchValue({ unitValue: productOption.price });
    }
  }

  calculateItemTotal(index: number): void {
    // This triggers change detection for the template
  }

  getItemTotal(index: number): number {
    const itemGroup = this.items.at(index) as FormGroup;
    const quantity = itemGroup.get('quantity')?.value || 0;
    const unitValue = itemGroup.get('unitValue')?.value || 0;
    return quantity * unitValue;
  }

  getGrandTotal(): number {
    let total = 0;
    for (let i = 0; i < this.items.length; i++) {
      total += this.getItemTotal(i);
    }
    return total;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.returnForm.invalid) {
      this.returnForm.markAllAsTouched();
      return;
    }

    const formValue = this.returnForm.getRawValue();
    const returnDate = formValue.returnDate;
    const formattedDate = returnDate instanceof Date
      ? returnDate.toISOString().split('T')[0]
      : returnDate;

    if (this.isEditMode()) {
      const updateData: UpdateReturnDto = {
        customerId: formValue.customerId!,
        returnDate: formattedDate,
        notes: formValue.notes || undefined,
      };

      const result: ReturnDialogResult = {
        action: 'save',
        data: updateData,
      };

      this.dialogRef.close(result);
    } else {
      const items: CreateReturnItemDto[] = formValue.items.map((item: Record<string, unknown>) => ({
        productId: item['productId'] as string,
        quantity: item['quantity'] as number,
        reason: item['reason'] as string,
        unitValue: item['unitValue'] as number,
      }));

      const createData: CreateReturnDto = {
        customerId: formValue.customerId!,
        returnDate: formattedDate,
        notes: formValue.notes || undefined,
        items,
      };

      const result: ReturnDialogResult = {
        action: 'save',
        data: createData,
      };

      this.dialogRef.close(result);
    }
  }
}
