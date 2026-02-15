import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { IPriceHistory, NewPriceHistory } from '../price-history.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IPriceHistory for edit and NewPriceHistoryFormGroupInput for create.
 */
type PriceHistoryFormGroupInput = IPriceHistory | PartialWithRequiredKeyOf<NewPriceHistory>;

type PriceHistoryFormDefaults = Pick<NewPriceHistory, 'id'>;

type PriceHistoryFormGroupContent = {
  id: FormControl<IPriceHistory['id'] | NewPriceHistory['id']>;
  price: FormControl<IPriceHistory['price']>;
  effectiveDate: FormControl<IPriceHistory['effectiveDate']>;
  endDate: FormControl<IPriceHistory['endDate']>;
  product: FormControl<IPriceHistory['product']>;
};

export type PriceHistoryFormGroup = FormGroup<PriceHistoryFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class PriceHistoryFormService {
  createPriceHistoryFormGroup(priceHistory?: PriceHistoryFormGroupInput): PriceHistoryFormGroup {
    const priceHistoryRawValue = {
      ...this.getFormDefaults(),
      ...(priceHistory ?? { id: null }),
    };
    return new FormGroup<PriceHistoryFormGroupContent>({
      id: new FormControl(
        { value: priceHistoryRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      price: new FormControl(priceHistoryRawValue.price, {
        validators: [Validators.required],
      }),
      effectiveDate: new FormControl(priceHistoryRawValue.effectiveDate, {
        validators: [Validators.required],
      }),
      endDate: new FormControl(priceHistoryRawValue.endDate),
      product: new FormControl(priceHistoryRawValue.product, {
        validators: [Validators.required],
      }),
    });
  }

  getPriceHistory(form: PriceHistoryFormGroup): IPriceHistory | NewPriceHistory {
    return form.getRawValue() as IPriceHistory | NewPriceHistory;
  }

  resetForm(form: PriceHistoryFormGroup, priceHistory: PriceHistoryFormGroupInput): void {
    const priceHistoryRawValue = { ...this.getFormDefaults(), ...priceHistory };
    form.reset({
      ...priceHistoryRawValue,
      id: { value: priceHistoryRawValue.id, disabled: true },
    });
  }

  private getFormDefaults(): PriceHistoryFormDefaults {
    return {
      id: null,
    };
  }
}
