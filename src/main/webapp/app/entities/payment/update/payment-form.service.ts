import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { IPayment, NewPayment } from '../payment.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IPayment for edit and NewPaymentFormGroupInput for create.
 */
type PaymentFormGroupInput = IPayment | PartialWithRequiredKeyOf<NewPayment>;

type PaymentFormDefaults = Pick<NewPayment, 'id'>;

type PaymentFormGroupContent = {
  id: FormControl<IPayment['id'] | NewPayment['id']>;
  paymentDate: FormControl<IPayment['paymentDate']>;
  amount: FormControl<IPayment['amount']>;
  method: FormControl<IPayment['method']>;
  reference: FormControl<IPayment['reference']>;
  notes: FormControl<IPayment['notes']>;
  tenant: FormControl<IPayment['tenant']>;
  customer: FormControl<IPayment['customer']>;
  delivery: FormControl<IPayment['delivery']>;
};

export type PaymentFormGroup = FormGroup<PaymentFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class PaymentFormService {
  createPaymentFormGroup(payment?: PaymentFormGroupInput): PaymentFormGroup {
    const paymentRawValue = {
      ...this.getFormDefaults(),
      ...(payment ?? { id: null }),
    };
    return new FormGroup<PaymentFormGroupContent>({
      id: new FormControl(
        { value: paymentRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      paymentDate: new FormControl(paymentRawValue.paymentDate, {
        validators: [Validators.required],
      }),
      amount: new FormControl(paymentRawValue.amount, {
        validators: [Validators.required],
      }),
      method: new FormControl(paymentRawValue.method, {
        validators: [Validators.required],
      }),
      reference: new FormControl(paymentRawValue.reference, {
        validators: [Validators.maxLength(100)],
      }),
      notes: new FormControl(paymentRawValue.notes),
      tenant: new FormControl(paymentRawValue.tenant, {
        validators: [Validators.required],
      }),
      customer: new FormControl(paymentRawValue.customer, {
        validators: [Validators.required],
      }),
      delivery: new FormControl(paymentRawValue.delivery),
    });
  }

  getPayment(form: PaymentFormGroup): IPayment | NewPayment {
    return form.getRawValue() as IPayment | NewPayment;
  }

  resetForm(form: PaymentFormGroup, payment: PaymentFormGroupInput): void {
    const paymentRawValue = { ...this.getFormDefaults(), ...payment };
    form.reset({
      ...paymentRawValue,
      id: { value: paymentRawValue.id, disabled: true },
    });
  }

  private getFormDefaults(): PaymentFormDefaults {
    return {
      id: null,
    };
  }
}
