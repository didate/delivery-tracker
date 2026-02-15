import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { IProduction, NewProduction } from '../production.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IProduction for edit and NewProductionFormGroupInput for create.
 */
type ProductionFormGroupInput = IProduction | PartialWithRequiredKeyOf<NewProduction>;

type ProductionFormDefaults = Pick<NewProduction, 'id'>;

type ProductionFormGroupContent = {
  id: FormControl<IProduction['id'] | NewProduction['id']>;
  productionDate: FormControl<IProduction['productionDate']>;
  quantity: FormControl<IProduction['quantity']>;
  notes: FormControl<IProduction['notes']>;
  product: FormControl<IProduction['product']>;
  productionSite: FormControl<IProduction['productionSite']>;
};

export type ProductionFormGroup = FormGroup<ProductionFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class ProductionFormService {
  createProductionFormGroup(production?: ProductionFormGroupInput): ProductionFormGroup {
    const productionRawValue = {
      ...this.getFormDefaults(),
      ...(production ?? { id: null }),
    };
    return new FormGroup<ProductionFormGroupContent>({
      id: new FormControl(
        { value: productionRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      productionDate: new FormControl(productionRawValue.productionDate, {
        validators: [Validators.required],
      }),
      quantity: new FormControl(productionRawValue.quantity, {
        validators: [Validators.required],
      }),
      notes: new FormControl(productionRawValue.notes),
      product: new FormControl(productionRawValue.product, {
        validators: [Validators.required],
      }),
      productionSite: new FormControl(productionRawValue.productionSite, {
        validators: [Validators.required],
      }),
    });
  }

  getProduction(form: ProductionFormGroup): IProduction | NewProduction {
    return form.getRawValue() as IProduction | NewProduction;
  }

  resetForm(form: ProductionFormGroup, production: ProductionFormGroupInput): void {
    const productionRawValue = { ...this.getFormDefaults(), ...production };
    form.reset({
      ...productionRawValue,
      id: { value: productionRawValue.id, disabled: true },
    });
  }

  private getFormDefaults(): ProductionFormDefaults {
    return {
      id: null,
    };
  }
}
