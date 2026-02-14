import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { IExpenseCategory, NewExpenseCategory } from '../expense-category.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IExpenseCategory for edit and NewExpenseCategoryFormGroupInput for create.
 */
type ExpenseCategoryFormGroupInput = IExpenseCategory | PartialWithRequiredKeyOf<NewExpenseCategory>;

type ExpenseCategoryFormDefaults = Pick<NewExpenseCategory, 'id' | 'active'>;

type ExpenseCategoryFormGroupContent = {
  id: FormControl<IExpenseCategory['id'] | NewExpenseCategory['id']>;
  code: FormControl<IExpenseCategory['code']>;
  name: FormControl<IExpenseCategory['name']>;
  description: FormControl<IExpenseCategory['description']>;
  active: FormControl<IExpenseCategory['active']>;
  tenant: FormControl<IExpenseCategory['tenant']>;
};

export type ExpenseCategoryFormGroup = FormGroup<ExpenseCategoryFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class ExpenseCategoryFormService {
  createExpenseCategoryFormGroup(expenseCategory?: ExpenseCategoryFormGroupInput): ExpenseCategoryFormGroup {
    const expenseCategoryRawValue = {
      ...this.getFormDefaults(),
      ...(expenseCategory ?? { id: null }),
    };
    return new FormGroup<ExpenseCategoryFormGroupContent>({
      id: new FormControl(
        { value: expenseCategoryRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      code: new FormControl(expenseCategoryRawValue.code, {
        validators: [Validators.required, Validators.maxLength(20)],
      }),
      name: new FormControl(expenseCategoryRawValue.name, {
        validators: [Validators.required, Validators.maxLength(100)],
      }),
      description: new FormControl(expenseCategoryRawValue.description),
      active: new FormControl(expenseCategoryRawValue.active, {
        validators: [Validators.required],
      }),
      tenant: new FormControl(expenseCategoryRawValue.tenant, {
        validators: [Validators.required],
      }),
    });
  }

  getExpenseCategory(form: ExpenseCategoryFormGroup): IExpenseCategory | NewExpenseCategory {
    return form.getRawValue() as IExpenseCategory | NewExpenseCategory;
  }

  resetForm(form: ExpenseCategoryFormGroup, expenseCategory: ExpenseCategoryFormGroupInput): void {
    const expenseCategoryRawValue = { ...this.getFormDefaults(), ...expenseCategory };
    form.reset({
      ...expenseCategoryRawValue,
      id: { value: expenseCategoryRawValue.id, disabled: true },
    });
  }

  private getFormDefaults(): ExpenseCategoryFormDefaults {
    return {
      id: null,
      active: false,
    };
  }
}
