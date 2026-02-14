import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { IReturnItem, NewReturnItem } from '../return-item.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IReturnItem for edit and NewReturnItemFormGroupInput for create.
 */
type ReturnItemFormGroupInput = IReturnItem | PartialWithRequiredKeyOf<NewReturnItem>;

type ReturnItemFormDefaults = Pick<NewReturnItem, 'id'>;

type ReturnItemFormGroupContent = {
  id: FormControl<IReturnItem['id'] | NewReturnItem['id']>;
  quantity: FormControl<IReturnItem['quantity']>;
  unitPrice: FormControl<IReturnItem['unitPrice']>;
  productReturn: FormControl<IReturnItem['productReturn']>;
  product: FormControl<IReturnItem['product']>;
};

export type ReturnItemFormGroup = FormGroup<ReturnItemFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class ReturnItemFormService {
  createReturnItemFormGroup(returnItem?: ReturnItemFormGroupInput): ReturnItemFormGroup {
    const returnItemRawValue = {
      ...this.getFormDefaults(),
      ...(returnItem ?? { id: null }),
    };
    return new FormGroup<ReturnItemFormGroupContent>({
      id: new FormControl(
        { value: returnItemRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      quantity: new FormControl(returnItemRawValue.quantity, {
        validators: [Validators.required],
      }),
      unitPrice: new FormControl(returnItemRawValue.unitPrice),
      productReturn: new FormControl(returnItemRawValue.productReturn, {
        validators: [Validators.required],
      }),
      product: new FormControl(returnItemRawValue.product, {
        validators: [Validators.required],
      }),
    });
  }

  getReturnItem(form: ReturnItemFormGroup): IReturnItem | NewReturnItem {
    return form.getRawValue() as IReturnItem | NewReturnItem;
  }

  resetForm(form: ReturnItemFormGroup, returnItem: ReturnItemFormGroupInput): void {
    const returnItemRawValue = { ...this.getFormDefaults(), ...returnItem };
    form.reset({
      ...returnItemRawValue,
      id: { value: returnItemRawValue.id, disabled: true },
    });
  }

  private getFormDefaults(): ReturnItemFormDefaults {
    return {
      id: null,
    };
  }
}
