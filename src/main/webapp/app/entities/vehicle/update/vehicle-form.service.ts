import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { IVehicle, NewVehicle } from '../vehicle.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IVehicle for edit and NewVehicleFormGroupInput for create.
 */
type VehicleFormGroupInput = IVehicle | PartialWithRequiredKeyOf<NewVehicle>;

type VehicleFormDefaults = Pick<NewVehicle, 'id' | 'active'>;

type VehicleFormGroupContent = {
  id: FormControl<IVehicle['id'] | NewVehicle['id']>;
  code: FormControl<IVehicle['code']>;
  name: FormControl<IVehicle['name']>;
  type: FormControl<IVehicle['type']>;
  brand: FormControl<IVehicle['brand']>;
  model: FormControl<IVehicle['model']>;
  registrationNumber: FormControl<IVehicle['registrationNumber']>;
  year: FormControl<IVehicle['year']>;
  capacity: FormControl<IVehicle['capacity']>;
  fuelType: FormControl<IVehicle['fuelType']>;
  active: FormControl<IVehicle['active']>;
  notes: FormControl<IVehicle['notes']>;
  tenant: FormControl<IVehicle['tenant']>;
};

export type VehicleFormGroup = FormGroup<VehicleFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class VehicleFormService {
  createVehicleFormGroup(vehicle?: VehicleFormGroupInput): VehicleFormGroup {
    const vehicleRawValue = {
      ...this.getFormDefaults(),
      ...(vehicle ?? { id: null }),
    };
    return new FormGroup<VehicleFormGroupContent>({
      id: new FormControl(
        { value: vehicleRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      code: new FormControl(vehicleRawValue.code, {
        validators: [Validators.required, Validators.maxLength(20)],
      }),
      name: new FormControl(vehicleRawValue.name, {
        validators: [Validators.required, Validators.maxLength(100)],
      }),
      type: new FormControl(vehicleRawValue.type, {
        validators: [Validators.required],
      }),
      brand: new FormControl(vehicleRawValue.brand, {
        validators: [Validators.maxLength(50)],
      }),
      model: new FormControl(vehicleRawValue.model, {
        validators: [Validators.maxLength(50)],
      }),
      registrationNumber: new FormControl(vehicleRawValue.registrationNumber, {
        validators: [Validators.maxLength(20)],
      }),
      year: new FormControl(vehicleRawValue.year),
      capacity: new FormControl(vehicleRawValue.capacity),
      fuelType: new FormControl(vehicleRawValue.fuelType, {
        validators: [Validators.maxLength(20)],
      }),
      active: new FormControl(vehicleRawValue.active, {
        validators: [Validators.required],
      }),
      notes: new FormControl(vehicleRawValue.notes),
      tenant: new FormControl(vehicleRawValue.tenant, {
        validators: [Validators.required],
      }),
    });
  }

  getVehicle(form: VehicleFormGroup): IVehicle | NewVehicle {
    return form.getRawValue() as IVehicle | NewVehicle;
  }

  resetForm(form: VehicleFormGroup, vehicle: VehicleFormGroupInput): void {
    const vehicleRawValue = { ...this.getFormDefaults(), ...vehicle };
    form.reset({
      ...vehicleRawValue,
      id: { value: vehicleRawValue.id, disabled: true },
    });
  }

  private getFormDefaults(): VehicleFormDefaults {
    return {
      id: null,
      active: false,
    };
  }
}
