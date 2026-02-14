import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';

import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IRoundCustomer, NewRoundCustomer } from '../round-customer.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IRoundCustomer for edit and NewRoundCustomerFormGroupInput for create.
 */
type RoundCustomerFormGroupInput = IRoundCustomer | PartialWithRequiredKeyOf<NewRoundCustomer>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IRoundCustomer | NewRoundCustomer> = Omit<T, 'visitTime'> & {
  visitTime?: string | null;
};

type RoundCustomerFormRawValue = FormValueOf<IRoundCustomer>;

type NewRoundCustomerFormRawValue = FormValueOf<NewRoundCustomer>;

type RoundCustomerFormDefaults = Pick<NewRoundCustomer, 'id' | 'visited' | 'visitTime'>;

type RoundCustomerFormGroupContent = {
  id: FormControl<RoundCustomerFormRawValue['id'] | NewRoundCustomer['id']>;
  sequenceOrder: FormControl<RoundCustomerFormRawValue['sequenceOrder']>;
  visited: FormControl<RoundCustomerFormRawValue['visited']>;
  visitTime: FormControl<RoundCustomerFormRawValue['visitTime']>;
  notes: FormControl<RoundCustomerFormRawValue['notes']>;
  round: FormControl<RoundCustomerFormRawValue['round']>;
  customer: FormControl<RoundCustomerFormRawValue['customer']>;
};

export type RoundCustomerFormGroup = FormGroup<RoundCustomerFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class RoundCustomerFormService {
  createRoundCustomerFormGroup(roundCustomer?: RoundCustomerFormGroupInput): RoundCustomerFormGroup {
    const roundCustomerRawValue = this.convertRoundCustomerToRoundCustomerRawValue({
      ...this.getFormDefaults(),
      ...(roundCustomer ?? { id: null }),
    });
    return new FormGroup<RoundCustomerFormGroupContent>({
      id: new FormControl(
        { value: roundCustomerRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      sequenceOrder: new FormControl(roundCustomerRawValue.sequenceOrder, {
        validators: [Validators.required],
      }),
      visited: new FormControl(roundCustomerRawValue.visited),
      visitTime: new FormControl(roundCustomerRawValue.visitTime),
      notes: new FormControl(roundCustomerRawValue.notes),
      round: new FormControl(roundCustomerRawValue.round, {
        validators: [Validators.required],
      }),
      customer: new FormControl(roundCustomerRawValue.customer, {
        validators: [Validators.required],
      }),
    });
  }

  getRoundCustomer(form: RoundCustomerFormGroup): IRoundCustomer | NewRoundCustomer {
    return this.convertRoundCustomerRawValueToRoundCustomer(form.getRawValue() as RoundCustomerFormRawValue | NewRoundCustomerFormRawValue);
  }

  resetForm(form: RoundCustomerFormGroup, roundCustomer: RoundCustomerFormGroupInput): void {
    const roundCustomerRawValue = this.convertRoundCustomerToRoundCustomerRawValue({ ...this.getFormDefaults(), ...roundCustomer });
    form.reset({
      ...roundCustomerRawValue,
      id: { value: roundCustomerRawValue.id, disabled: true },
    });
  }

  private getFormDefaults(): RoundCustomerFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      visited: false,
      visitTime: currentTime,
    };
  }

  private convertRoundCustomerRawValueToRoundCustomer(
    rawRoundCustomer: RoundCustomerFormRawValue | NewRoundCustomerFormRawValue,
  ): IRoundCustomer | NewRoundCustomer {
    return {
      ...rawRoundCustomer,
      visitTime: dayjs(rawRoundCustomer.visitTime, DATE_TIME_FORMAT),
    };
  }

  private convertRoundCustomerToRoundCustomerRawValue(
    roundCustomer: IRoundCustomer | (Partial<NewRoundCustomer> & RoundCustomerFormDefaults),
  ): RoundCustomerFormRawValue | PartialWithRequiredKeyOf<NewRoundCustomerFormRawValue> {
    return {
      ...roundCustomer,
      visitTime: roundCustomer.visitTime ? roundCustomer.visitTime.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
