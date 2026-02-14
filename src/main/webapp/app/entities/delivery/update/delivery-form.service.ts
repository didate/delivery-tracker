import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { IDelivery, NewDelivery } from '../delivery.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IDelivery for edit and NewDeliveryFormGroupInput for create.
 */
type DeliveryFormGroupInput = IDelivery | PartialWithRequiredKeyOf<NewDelivery>;

type DeliveryFormDefaults = Pick<NewDelivery, 'id'>;

type DeliveryFormGroupContent = {
  id: FormControl<IDelivery['id'] | NewDelivery['id']>;
  deliveryDate: FormControl<IDelivery['deliveryDate']>;
  status: FormControl<IDelivery['status']>;
  totalAmount: FormControl<IDelivery['totalAmount']>;
  paidAmount: FormControl<IDelivery['paidAmount']>;
  notes: FormControl<IDelivery['notes']>;
  tenant: FormControl<IDelivery['tenant']>;
  customer: FormControl<IDelivery['customer']>;
  driver: FormControl<IDelivery['driver']>;
};

export type DeliveryFormGroup = FormGroup<DeliveryFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class DeliveryFormService {
  createDeliveryFormGroup(delivery?: DeliveryFormGroupInput): DeliveryFormGroup {
    const deliveryRawValue = {
      ...this.getFormDefaults(),
      ...(delivery ?? { id: null }),
    };
    return new FormGroup<DeliveryFormGroupContent>({
      id: new FormControl(
        { value: deliveryRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      deliveryDate: new FormControl(deliveryRawValue.deliveryDate, {
        validators: [Validators.required],
      }),
      status: new FormControl(deliveryRawValue.status, {
        validators: [Validators.required],
      }),
      totalAmount: new FormControl(deliveryRawValue.totalAmount),
      paidAmount: new FormControl(deliveryRawValue.paidAmount),
      notes: new FormControl(deliveryRawValue.notes),
      tenant: new FormControl(deliveryRawValue.tenant, {
        validators: [Validators.required],
      }),
      customer: new FormControl(deliveryRawValue.customer, {
        validators: [Validators.required],
      }),
      driver: new FormControl(deliveryRawValue.driver, {
        validators: [Validators.required],
      }),
    });
  }

  getDelivery(form: DeliveryFormGroup): IDelivery | NewDelivery {
    return form.getRawValue() as IDelivery | NewDelivery;
  }

  resetForm(form: DeliveryFormGroup, delivery: DeliveryFormGroupInput): void {
    const deliveryRawValue = { ...this.getFormDefaults(), ...delivery };
    form.reset({
      ...deliveryRawValue,
      id: { value: deliveryRawValue.id, disabled: true },
    });
  }

  private getFormDefaults(): DeliveryFormDefaults {
    return {
      id: null,
    };
  }
}
