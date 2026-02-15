import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { ICustomer, NewCustomer } from '../customer.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts ICustomer for edit and NewCustomerFormGroupInput for create.
 */
type CustomerFormGroupInput = ICustomer | PartialWithRequiredKeyOf<NewCustomer>;

type CustomerFormDefaults = Pick<NewCustomer, 'id' | 'active'>;

type CustomerFormGroupContent = {
  id: FormControl<ICustomer['id'] | NewCustomer['id']>;
  code: FormControl<ICustomer['code']>;
  name: FormControl<ICustomer['name']>;
  phone: FormControl<ICustomer['phone']>;
  email: FormControl<ICustomer['email']>;
  address: FormControl<ICustomer['address']>;
  latitude: FormControl<ICustomer['latitude']>;
  longitude: FormControl<ICustomer['longitude']>;
  active: FormControl<ICustomer['active']>;
  notes: FormControl<ICustomer['notes']>;
  tenant: FormControl<ICustomer['tenant']>;
  driver: FormControl<ICustomer['driver']>;
};

export type CustomerFormGroup = FormGroup<CustomerFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class CustomerFormService {
  createCustomerFormGroup(customer?: CustomerFormGroupInput): CustomerFormGroup {
    const customerRawValue = {
      ...this.getFormDefaults(),
      ...(customer ?? { id: null }),
    };
    return new FormGroup<CustomerFormGroupContent>({
      id: new FormControl(
        { value: customerRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      code: new FormControl(customerRawValue.code, {
        validators: [Validators.required, Validators.maxLength(50)],
      }),
      name: new FormControl(customerRawValue.name, {
        validators: [Validators.required, Validators.maxLength(100)],
      }),
      phone: new FormControl(customerRawValue.phone, {
        validators: [Validators.maxLength(20)],
      }),
      email: new FormControl(customerRawValue.email, {
        validators: [Validators.maxLength(100)],
      }),
      address: new FormControl(customerRawValue.address),
      latitude: new FormControl(customerRawValue.latitude, {
        validators: [Validators.min(-90), Validators.max(90)],
      }),
      longitude: new FormControl(customerRawValue.longitude, {
        validators: [Validators.min(-180), Validators.max(180)],
      }),
      active: new FormControl(customerRawValue.active, {
        validators: [Validators.required],
      }),
      notes: new FormControl(customerRawValue.notes),
      tenant: new FormControl(customerRawValue.tenant, {
        validators: [Validators.required],
      }),
      driver: new FormControl(customerRawValue.driver),
    });
  }

  getCustomer(form: CustomerFormGroup): ICustomer | NewCustomer {
    return form.getRawValue() as ICustomer | NewCustomer;
  }

  resetForm(form: CustomerFormGroup, customer: CustomerFormGroupInput): void {
    const customerRawValue = { ...this.getFormDefaults(), ...customer };
    const isEditing = customerRawValue.id !== null;
    form.reset({
      ...customerRawValue,
      id: { value: customerRawValue.id, disabled: true },
      code: { value: customerRawValue.code, disabled: isEditing },
    });
  }

  private getFormDefaults(): CustomerFormDefaults {
    return {
      id: null,
      active: true,
    };
  }
}
