import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { IProductReturn, NewProductReturn } from '../product-return.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IProductReturn for edit and NewProductReturnFormGroupInput for create.
 */
type ProductReturnFormGroupInput = IProductReturn | PartialWithRequiredKeyOf<NewProductReturn>;

type ProductReturnFormDefaults = Pick<NewProductReturn, 'id'>;

type ProductReturnFormGroupContent = {
  id: FormControl<IProductReturn['id'] | NewProductReturn['id']>;
  returnDate: FormControl<IProductReturn['returnDate']>;
  reason: FormControl<IProductReturn['reason']>;
  notes: FormControl<IProductReturn['notes']>;
  customer: FormControl<IProductReturn['customer']>;
  delivery: FormControl<IProductReturn['delivery']>;
};

export type ProductReturnFormGroup = FormGroup<ProductReturnFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class ProductReturnFormService {
  createProductReturnFormGroup(productReturn?: ProductReturnFormGroupInput): ProductReturnFormGroup {
    const productReturnRawValue = {
      ...this.getFormDefaults(),
      ...(productReturn ?? { id: null }),
    };
    return new FormGroup<ProductReturnFormGroupContent>({
      id: new FormControl(
        { value: productReturnRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      returnDate: new FormControl(productReturnRawValue.returnDate, {
        validators: [Validators.required],
      }),
      reason: new FormControl(productReturnRawValue.reason, {
        validators: [Validators.required],
      }),
      notes: new FormControl(productReturnRawValue.notes),
      customer: new FormControl(productReturnRawValue.customer, {
        validators: [Validators.required],
      }),
      delivery: new FormControl(productReturnRawValue.delivery),
    });
  }

  getProductReturn(form: ProductReturnFormGroup): IProductReturn | NewProductReturn {
    return form.getRawValue() as IProductReturn | NewProductReturn;
  }

  resetForm(form: ProductReturnFormGroup, productReturn: ProductReturnFormGroupInput): void {
    const productReturnRawValue = { ...this.getFormDefaults(), ...productReturn };
    form.reset({
      ...productReturnRawValue,
      id: { value: productReturnRawValue.id, disabled: true },
    });
  }

  private getFormDefaults(): ProductReturnFormDefaults {
    return {
      id: null,
    };
  }
}
