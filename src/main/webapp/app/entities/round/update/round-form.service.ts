import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';

import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IRound, NewRound } from '../round.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IRound for edit and NewRoundFormGroupInput for create.
 */
type RoundFormGroupInput = IRound | PartialWithRequiredKeyOf<NewRound>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IRound | NewRound> = Omit<T, 'startTime' | 'endTime'> & {
  startTime?: string | null;
  endTime?: string | null;
};

type RoundFormRawValue = FormValueOf<IRound>;

type NewRoundFormRawValue = FormValueOf<NewRound>;

type RoundFormDefaults = Pick<NewRound, 'id' | 'startTime' | 'endTime'>;

type RoundFormGroupContent = {
  id: FormControl<RoundFormRawValue['id'] | NewRound['id']>;
  name: FormControl<RoundFormRawValue['name']>;
  roundDate: FormControl<RoundFormRawValue['roundDate']>;
  status: FormControl<RoundFormRawValue['status']>;
  startTime: FormControl<RoundFormRawValue['startTime']>;
  endTime: FormControl<RoundFormRawValue['endTime']>;
  notes: FormControl<RoundFormRawValue['notes']>;
  tenant: FormControl<RoundFormRawValue['tenant']>;
  driver: FormControl<RoundFormRawValue['driver']>;
};

export type RoundFormGroup = FormGroup<RoundFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class RoundFormService {
  createRoundFormGroup(round?: RoundFormGroupInput): RoundFormGroup {
    const roundRawValue = this.convertRoundToRoundRawValue({
      ...this.getFormDefaults(),
      ...(round ?? { id: null }),
    });
    return new FormGroup<RoundFormGroupContent>({
      id: new FormControl(
        { value: roundRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      name: new FormControl(roundRawValue.name, {
        validators: [Validators.required, Validators.maxLength(100)],
      }),
      roundDate: new FormControl(roundRawValue.roundDate, {
        validators: [Validators.required],
      }),
      status: new FormControl(roundRawValue.status, {
        validators: [Validators.required],
      }),
      startTime: new FormControl(roundRawValue.startTime),
      endTime: new FormControl(roundRawValue.endTime),
      notes: new FormControl(roundRawValue.notes),
      tenant: new FormControl(roundRawValue.tenant, {
        validators: [Validators.required],
      }),
      driver: new FormControl(roundRawValue.driver, {
        validators: [Validators.required],
      }),
    });
  }

  getRound(form: RoundFormGroup): IRound | NewRound {
    return this.convertRoundRawValueToRound(form.getRawValue() as RoundFormRawValue | NewRoundFormRawValue);
  }

  resetForm(form: RoundFormGroup, round: RoundFormGroupInput): void {
    const roundRawValue = this.convertRoundToRoundRawValue({ ...this.getFormDefaults(), ...round });
    form.reset({
      ...roundRawValue,
      id: { value: roundRawValue.id, disabled: true },
    });
  }

  private getFormDefaults(): RoundFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      startTime: currentTime,
      endTime: currentTime,
    };
  }

  private convertRoundRawValueToRound(rawRound: RoundFormRawValue | NewRoundFormRawValue): IRound | NewRound {
    return {
      ...rawRound,
      startTime: dayjs(rawRound.startTime, DATE_TIME_FORMAT),
      endTime: dayjs(rawRound.endTime, DATE_TIME_FORMAT),
    };
  }

  private convertRoundToRoundRawValue(
    round: IRound | (Partial<NewRound> & RoundFormDefaults),
  ): RoundFormRawValue | PartialWithRequiredKeyOf<NewRoundFormRawValue> {
    return {
      ...round,
      startTime: round.startTime ? round.startTime.format(DATE_TIME_FORMAT) : undefined,
      endTime: round.endTime ? round.endTime.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
