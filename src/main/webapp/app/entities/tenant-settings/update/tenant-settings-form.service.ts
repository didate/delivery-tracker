import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { ITenantSettings, NewTenantSettings } from '../tenant-settings.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts ITenantSettings for edit and NewTenantSettingsFormGroupInput for create.
 */
type TenantSettingsFormGroupInput = ITenantSettings | PartialWithRequiredKeyOf<NewTenantSettings>;

type TenantSettingsFormDefaults = Pick<NewTenantSettings, 'id'>;

type TenantSettingsFormGroupContent = {
  id: FormControl<ITenantSettings['id'] | NewTenantSettings['id']>;
  currency: FormControl<ITenantSettings['currency']>;
  timezone: FormControl<ITenantSettings['timezone']>;
  dateFormat: FormControl<ITenantSettings['dateFormat']>;
  language: FormControl<ITenantSettings['language']>;
};

export type TenantSettingsFormGroup = FormGroup<TenantSettingsFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class TenantSettingsFormService {
  createTenantSettingsFormGroup(tenantSettings?: TenantSettingsFormGroupInput): TenantSettingsFormGroup {
    const tenantSettingsRawValue = {
      ...this.getFormDefaults(),
      ...(tenantSettings ?? { id: null }),
    };
    return new FormGroup<TenantSettingsFormGroupContent>({
      id: new FormControl(
        { value: tenantSettingsRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      currency: new FormControl(tenantSettingsRawValue.currency, {
        validators: [Validators.maxLength(3)],
      }),
      timezone: new FormControl(tenantSettingsRawValue.timezone, {
        validators: [Validators.maxLength(50)],
      }),
      dateFormat: new FormControl(tenantSettingsRawValue.dateFormat, {
        validators: [Validators.maxLength(20)],
      }),
      language: new FormControl(tenantSettingsRawValue.language, {
        validators: [Validators.maxLength(10)],
      }),
    });
  }

  getTenantSettings(form: TenantSettingsFormGroup): ITenantSettings | NewTenantSettings {
    return form.getRawValue() as ITenantSettings | NewTenantSettings;
  }

  resetForm(form: TenantSettingsFormGroup, tenantSettings: TenantSettingsFormGroupInput): void {
    const tenantSettingsRawValue = { ...this.getFormDefaults(), ...tenantSettings };
    form.reset({
      ...tenantSettingsRawValue,
      id: { value: tenantSettingsRawValue.id, disabled: true },
    });
  }

  private getFormDefaults(): TenantSettingsFormDefaults {
    return {
      id: null,
    };
  }
}
