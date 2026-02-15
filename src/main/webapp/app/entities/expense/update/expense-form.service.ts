import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { IExpense, NewExpense } from '../expense.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IExpense for edit and NewExpenseFormGroupInput for create.
 */
type ExpenseFormGroupInput = IExpense | PartialWithRequiredKeyOf<NewExpense>;

type ExpenseFormDefaults = Pick<NewExpense, 'id'>;

type ExpenseFormGroupContent = {
  id: FormControl<IExpense['id'] | NewExpense['id']>;
  expenseDate: FormControl<IExpense['expenseDate']>;
  amount: FormControl<IExpense['amount']>;
  description: FormControl<IExpense['description']>;
  receiptUrl: FormControl<IExpense['receiptUrl']>;
  category: FormControl<IExpense['category']>;
  driver: FormControl<IExpense['driver']>;
};

export type ExpenseFormGroup = FormGroup<ExpenseFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class ExpenseFormService {
  createExpenseFormGroup(expense?: ExpenseFormGroupInput): ExpenseFormGroup {
    const expenseRawValue = {
      ...this.getFormDefaults(),
      ...(expense ?? { id: null }),
    };
    return new FormGroup<ExpenseFormGroupContent>({
      id: new FormControl(
        { value: expenseRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      expenseDate: new FormControl(expenseRawValue.expenseDate, {
        validators: [Validators.required],
      }),
      amount: new FormControl(expenseRawValue.amount, {
        validators: [Validators.required],
      }),
      description: new FormControl(expenseRawValue.description),
      receiptUrl: new FormControl(expenseRawValue.receiptUrl, {
        validators: [Validators.maxLength(500)],
      }),
      category: new FormControl(expenseRawValue.category, {
        validators: [Validators.required],
      }),
      driver: new FormControl(expenseRawValue.driver),
    });
  }

  getExpense(form: ExpenseFormGroup): IExpense | NewExpense {
    return form.getRawValue() as IExpense | NewExpense;
  }

  resetForm(form: ExpenseFormGroup, expense: ExpenseFormGroupInput): void {
    const expenseRawValue = { ...this.getFormDefaults(), ...expense };
    form.reset({
      ...expenseRawValue,
      id: { value: expenseRawValue.id, disabled: true },
    });
  }

  private getFormDefaults(): ExpenseFormDefaults {
    return {
      id: null,
    };
  }
}
