import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormArray, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { MatCardModule } from '@angular/material/card';
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

@Component({
  selector: 'app-return-dialog',
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
    MatCardModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ isEditMode() ? 'Edit Return' : 'Create Return' }}</h2>

    <mat-dialog-content>
      <form [formGroup]="returnForm" class="return-form">
        <div class="form-row two-columns">
          <mat-form-field appearance="outline">
            <mat-label>Customer</mat-label>
            <mat-select formControlName="customerId" placeholder="Select customer">
              @for (customer of customers(); track customer.id) {
                <mat-option [value]="customer.id">{{ customer.name }} ({{ customer.code }})</mat-option>
              }
            </mat-select>
            @if (returnForm.controls.customerId.hasError('required') && returnForm.controls.customerId.touched) {
              <mat-error>Customer is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Return Date</mat-label>
            <input matInput [matDatepicker]="picker" formControlName="returnDate" placeholder="Select date">
            <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
            @if (returnForm.controls.returnDate.hasError('required') && returnForm.controls.returnDate.touched) {
              <mat-error>Return date is required</mat-error>
            }
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Notes</mat-label>
            <textarea matInput formControlName="notes" placeholder="Enter notes (optional)" rows="2"></textarea>
          </mat-form-field>
        </div>

        @if (!isEditMode()) {
          <mat-divider></mat-divider>

          <div class="items-section">
            <div class="items-header">
              <h3>Return Items</h3>
              <button mat-button color="primary" type="button" (click)="addItem()">
                <mat-icon>add</mat-icon>
                Add Item
              </button>
            </div>

            @if (items.length === 0) {
              <p class="no-items-message">No items added yet. Click "Add Item" to add products to this return.</p>
            }

            <div formArrayName="items" class="items-list">
              @for (item of items.controls; track $index; let i = $index) {
                <mat-card class="item-card" [formGroupName]="i">
                  <div class="item-header">
                    <span class="item-number">Item {{ i + 1 }}</span>
                    <button mat-icon-button color="warn" type="button" (click)="removeItem(i)" matTooltip="Remove item">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>

                  <div class="item-form-row">
                    <mat-form-field appearance="outline" class="product-field">
                      <mat-label>Product</mat-label>
                      <mat-select formControlName="productId" placeholder="Select product" (selectionChange)="onProductChange(i)">
                        @for (product of products(); track product.id) {
                          <mat-option [value]="product.id">{{ product.name }} ({{ product.code }})</mat-option>
                        }
                      </mat-select>
                      @if (getItemControl(i, 'productId').hasError('required') && getItemControl(i, 'productId').touched) {
                        <mat-error>Product is required</mat-error>
                      }
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="quantity-field">
                      <mat-label>Quantity</mat-label>
                      <input matInput type="number" formControlName="quantity" min="1" (input)="calculateItemTotal(i)">
                      @if (getItemControl(i, 'quantity').hasError('required') && getItemControl(i, 'quantity').touched) {
                        <mat-error>Qty required</mat-error>
                      }
                      @if (getItemControl(i, 'quantity').hasError('min') && getItemControl(i, 'quantity').touched) {
                        <mat-error>Min 1</mat-error>
                      }
                    </mat-form-field>

                    <mat-form-field appearance="outline" class="price-field">
                      <mat-label>Unit Value</mat-label>
                      <input matInput type="number" formControlName="unitValue" min="0" step="0.01" (input)="calculateItemTotal(i)">
                      <span matTextPrefix>$&nbsp;</span>
                      @if (getItemControl(i, 'unitValue').hasError('required') && getItemControl(i, 'unitValue').touched) {
                        <mat-error>Price required</mat-error>
                      }
                    </mat-form-field>
                  </div>

                  <div class="item-form-row">
                    <mat-form-field appearance="outline" class="reason-field">
                      <mat-label>Reason</mat-label>
                      <input matInput formControlName="reason" placeholder="Enter reason for return">
                      @if (getItemControl(i, 'reason').hasError('required') && getItemControl(i, 'reason').touched) {
                        <mat-error>Reason is required</mat-error>
                      }
                    </mat-form-field>

                    <div class="item-total">
                      <span class="total-label">Total:</span>
                      <span class="total-value">\${{ getItemTotal(i) | number:'1.2-2' }}</span>
                    </div>
                  </div>
                </mat-card>
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
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button
        mat-raised-button
        color="primary"
        (click)="onSave()"
        [disabled]="returnForm.invalid || isSaving() || (!isEditMode() && items.length === 0)">
        @if (isSaving()) {
          <mat-spinner diameter="20"></mat-spinner>
        } @else {
          {{ isEditMode() ? 'Update' : 'Create' }}
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .return-form {
      display: flex;
      flex-direction: column;
      gap: 8px;
      min-width: 600px;
      padding-top: 8px;
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

    .full-width {
      width: 100%;
    }

    mat-form-field {
      width: 100%;
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
  `]
})
export class ReturnDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<ReturnDialogComponent>);
  private readonly customerService = inject(CustomerService);
  private readonly productService = inject(ProductService);
  readonly data = inject<ReturnDialogData>(MAT_DIALOG_DATA);

  readonly isSaving = signal(false);
  readonly isEditMode = signal(false);
  readonly customers = signal<Customer[]>([]);
  readonly products = signal<Product[]>([]);

  readonly returnForm = this.fb.nonNullable.group({
    customerId: [null as number | null, [Validators.required]],
    returnDate: [new Date(), [Validators.required]],
    notes: [''],
    items: this.fb.array<FormGroup>([]),
  });

  get items(): FormArray {
    return this.returnForm.controls.items;
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
    const product = this.products().find(p => p.id === productId);

    if (product) {
      itemGroup.patchValue({ unitValue: product.price });
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
