import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { IDriver, NewDriver } from '../driver.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IDriver for edit and NewDriverFormGroupInput for create.
 */
type DriverFormGroupInput = IDriver | PartialWithRequiredKeyOf<NewDriver>;

type DriverFormDefaults = Pick<NewDriver, 'id' | 'active'>;

type DriverFormGroupContent = {
  id: FormControl<IDriver['id'] | NewDriver['id']>;
  code: FormControl<IDriver['code']>;
  name: FormControl<IDriver['name']>;
  phone: FormControl<IDriver['phone']>;
  email: FormControl<IDriver['email']>;
  licenseNumber: FormControl<IDriver['licenseNumber']>;
  active: FormControl<IDriver['active']>;
  vehicle: FormControl<IDriver['vehicle']>;
};

export type DriverFormGroup = FormGroup<DriverFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class DriverFormService {
  createDriverFormGroup(driver?: DriverFormGroupInput): DriverFormGroup {
    const driverRawValue = {
      ...this.getFormDefaults(),
      ...(driver ?? { id: null }),
    };
    return new FormGroup<DriverFormGroupContent>({
      id: new FormControl(
        { value: driverRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      code: new FormControl(driverRawValue.code, {
        validators: [Validators.required, Validators.maxLength(20)],
      }),
      name: new FormControl(driverRawValue.name, {
        validators: [Validators.required, Validators.maxLength(100)],
      }),
      phone: new FormControl(driverRawValue.phone, {
        validators: [Validators.maxLength(20)],
      }),
      email: new FormControl(driverRawValue.email, {
        validators: [Validators.maxLength(100)],
      }),
      licenseNumber: new FormControl(driverRawValue.licenseNumber, {
        validators: [Validators.maxLength(50)],
      }),
      active: new FormControl(driverRawValue.active, {
        validators: [Validators.required],
      }),
      vehicle: new FormControl(driverRawValue.vehicle),
    });
  }

  getDriver(form: DriverFormGroup): IDriver | NewDriver {
    return form.getRawValue() as IDriver | NewDriver;
  }

  resetForm(form: DriverFormGroup, driver: DriverFormGroupInput): void {
    const driverRawValue = { ...this.getFormDefaults(), ...driver };
    form.reset({
      ...driverRawValue,
      id: { value: driverRawValue.id, disabled: true },
    });
  }

  private getFormDefaults(): DriverFormDefaults {
    return {
      id: null,
      active: false,
    };
  }
}
