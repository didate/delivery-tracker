import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { IDeliveryItem, NewDeliveryItem } from '../delivery-item.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IDeliveryItem for edit and NewDeliveryItemFormGroupInput for create.
 */
type DeliveryItemFormGroupInput = IDeliveryItem | PartialWithRequiredKeyOf<NewDeliveryItem>;

type DeliveryItemFormDefaults = Pick<NewDeliveryItem, 'id'>;

type DeliveryItemFormGroupContent = {
  id: FormControl<IDeliveryItem['id'] | NewDeliveryItem['id']>;
  quantity: FormControl<IDeliveryItem['quantity']>;
  unitPrice: FormControl<IDeliveryItem['unitPrice']>;
  totalPrice: FormControl<IDeliveryItem['totalPrice']>;
  delivery: FormControl<IDeliveryItem['delivery']>;
  product: FormControl<IDeliveryItem['product']>;
};

export type DeliveryItemFormGroup = FormGroup<DeliveryItemFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class DeliveryItemFormService {
  createDeliveryItemFormGroup(deliveryItem?: DeliveryItemFormGroupInput): DeliveryItemFormGroup {
    const deliveryItemRawValue = {
      ...this.getFormDefaults(),
      ...(deliveryItem ?? { id: null }),
    };
    return new FormGroup<DeliveryItemFormGroupContent>({
      id: new FormControl(
        { value: deliveryItemRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      quantity: new FormControl(deliveryItemRawValue.quantity, {
        validators: [Validators.required],
      }),
      unitPrice: new FormControl(deliveryItemRawValue.unitPrice, {
        validators: [Validators.required],
      }),
      totalPrice: new FormControl(deliveryItemRawValue.totalPrice),
      delivery: new FormControl(deliveryItemRawValue.delivery, {
        validators: [Validators.required],
      }),
      product: new FormControl(deliveryItemRawValue.product, {
        validators: [Validators.required],
      }),
    });
  }

  getDeliveryItem(form: DeliveryItemFormGroup): IDeliveryItem | NewDeliveryItem {
    return form.getRawValue() as IDeliveryItem | NewDeliveryItem;
  }

  resetForm(form: DeliveryItemFormGroup, deliveryItem: DeliveryItemFormGroupInput): void {
    const deliveryItemRawValue = { ...this.getFormDefaults(), ...deliveryItem };
    form.reset({
      ...deliveryItemRawValue,
      id: { value: deliveryItemRawValue.id, disabled: true },
    });
  }

  private getFormDefaults(): DeliveryItemFormDefaults {
    return {
      id: null,
    };
  }
}
