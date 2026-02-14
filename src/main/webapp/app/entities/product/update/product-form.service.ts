import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { IProduct, NewProduct } from '../product.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IProduct for edit and NewProductFormGroupInput for create.
 */
type ProductFormGroupInput = IProduct | PartialWithRequiredKeyOf<NewProduct>;

type ProductFormDefaults = Pick<NewProduct, 'id' | 'active'>;

type ProductFormGroupContent = {
  id: FormControl<IProduct['id'] | NewProduct['id']>;
  code: FormControl<IProduct['code']>;
  name: FormControl<IProduct['name']>;
  description: FormControl<IProduct['description']>;
  price: FormControl<IProduct['price']>;
  active: FormControl<IProduct['active']>;
  tenant: FormControl<IProduct['tenant']>;
};

export type ProductFormGroup = FormGroup<ProductFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class ProductFormService {
  createProductFormGroup(product?: ProductFormGroupInput): ProductFormGroup {
    const productRawValue = {
      ...this.getFormDefaults(),
      ...(product ?? { id: null }),
    };
    return new FormGroup<ProductFormGroupContent>({
      id: new FormControl(
        { value: productRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      code: new FormControl(productRawValue.code, {
        validators: [Validators.required, Validators.maxLength(20)],
      }),
      name: new FormControl(productRawValue.name, {
        validators: [Validators.required, Validators.maxLength(100)],
      }),
      description: new FormControl(productRawValue.description),
      price: new FormControl(productRawValue.price, {
        validators: [Validators.required],
      }),
      active: new FormControl(productRawValue.active, {
        validators: [Validators.required],
      }),
      tenant: new FormControl(productRawValue.tenant, {
        validators: [Validators.required],
      }),
    });
  }

  getProduct(form: ProductFormGroup): IProduct | NewProduct {
    return form.getRawValue() as IProduct | NewProduct;
  }

  resetForm(form: ProductFormGroup, product: ProductFormGroupInput): void {
    const productRawValue = { ...this.getFormDefaults(), ...product };
    form.reset({
      ...productRawValue,
      id: { value: productRawValue.id, disabled: true },
    });
  }

  private getFormDefaults(): ProductFormDefaults {
    return {
      id: null,
      active: false,
    };
  }
}
