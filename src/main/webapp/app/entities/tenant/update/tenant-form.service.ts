import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { ITenant, NewTenant } from '../tenant.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts ITenant for edit and NewTenantFormGroupInput for create.
 */
type TenantFormGroupInput = ITenant | PartialWithRequiredKeyOf<NewTenant>;

type TenantFormDefaults = Pick<NewTenant, 'id' | 'active'>;

type TenantFormGroupContent = {
  id: FormControl<ITenant['id'] | NewTenant['id']>;
  code: FormControl<ITenant['code']>;
  name: FormControl<ITenant['name']>;
  email: FormControl<ITenant['email']>;
  phone: FormControl<ITenant['phone']>;
  address: FormControl<ITenant['address']>;
  logoUrl: FormControl<ITenant['logoUrl']>;
  active: FormControl<ITenant['active']>;
};

export type TenantFormGroup = FormGroup<TenantFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class TenantFormService {
  createTenantFormGroup(tenant?: TenantFormGroupInput): TenantFormGroup {
    const tenantRawValue = {
      ...this.getFormDefaults(),
      ...(tenant ?? { id: null }),
    };
    return new FormGroup<TenantFormGroupContent>({
      id: new FormControl(
        { value: tenantRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      code: new FormControl(tenantRawValue.code, {
        validators: [Validators.required, Validators.maxLength(20)],
      }),
      name: new FormControl(tenantRawValue.name, {
        validators: [Validators.required, Validators.maxLength(100)],
      }),
      email: new FormControl(tenantRawValue.email, {
        validators: [Validators.required],
      }),
      phone: new FormControl(tenantRawValue.phone, {
        validators: [Validators.maxLength(20)],
      }),
      address: new FormControl(tenantRawValue.address),
      logoUrl: new FormControl(tenantRawValue.logoUrl, {
        validators: [Validators.maxLength(500)],
      }),
      active: new FormControl(tenantRawValue.active, {
        validators: [Validators.required],
      }),
    });
  }

  getTenant(form: TenantFormGroup): ITenant | NewTenant {
    return form.getRawValue() as ITenant | NewTenant;
  }

  resetForm(form: TenantFormGroup, tenant: TenantFormGroupInput): void {
    const tenantRawValue = { ...this.getFormDefaults(), ...tenant };
    form.reset({
      ...tenantRawValue,
      id: { value: tenantRawValue.id, disabled: true },
    });
  }

  private getFormDefaults(): TenantFormDefaults {
    return {
      id: null,
      active: false,
    };
  }
}
