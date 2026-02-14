import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { IProductionSite, NewProductionSite } from '../production-site.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IProductionSite for edit and NewProductionSiteFormGroupInput for create.
 */
type ProductionSiteFormGroupInput = IProductionSite | PartialWithRequiredKeyOf<NewProductionSite>;

type ProductionSiteFormDefaults = Pick<NewProductionSite, 'id' | 'active'>;

type ProductionSiteFormGroupContent = {
  id: FormControl<IProductionSite['id'] | NewProductionSite['id']>;
  code: FormControl<IProductionSite['code']>;
  name: FormControl<IProductionSite['name']>;
  address: FormControl<IProductionSite['address']>;
  phone: FormControl<IProductionSite['phone']>;
  active: FormControl<IProductionSite['active']>;
  tenant: FormControl<IProductionSite['tenant']>;
};

export type ProductionSiteFormGroup = FormGroup<ProductionSiteFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class ProductionSiteFormService {
  createProductionSiteFormGroup(productionSite?: ProductionSiteFormGroupInput): ProductionSiteFormGroup {
    const productionSiteRawValue = {
      ...this.getFormDefaults(),
      ...(productionSite ?? { id: null }),
    };
    return new FormGroup<ProductionSiteFormGroupContent>({
      id: new FormControl(
        { value: productionSiteRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      code: new FormControl(productionSiteRawValue.code, {
        validators: [Validators.required, Validators.maxLength(20)],
      }),
      name: new FormControl(productionSiteRawValue.name, {
        validators: [Validators.required, Validators.maxLength(100)],
      }),
      address: new FormControl(productionSiteRawValue.address),
      phone: new FormControl(productionSiteRawValue.phone, {
        validators: [Validators.maxLength(20)],
      }),
      active: new FormControl(productionSiteRawValue.active, {
        validators: [Validators.required],
      }),
      tenant: new FormControl(productionSiteRawValue.tenant, {
        validators: [Validators.required],
      }),
    });
  }

  getProductionSite(form: ProductionSiteFormGroup): IProductionSite | NewProductionSite {
    return form.getRawValue() as IProductionSite | NewProductionSite;
  }

  resetForm(form: ProductionSiteFormGroup, productionSite: ProductionSiteFormGroupInput): void {
    const productionSiteRawValue = { ...this.getFormDefaults(), ...productionSite };
    form.reset({
      ...productionSiteRawValue,
      id: { value: productionSiteRawValue.id, disabled: true },
    });
  }

  private getFormDefaults(): ProductionSiteFormDefaults {
    return {
      id: null,
      active: false,
    };
  }
}
