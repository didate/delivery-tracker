import { HttpResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { DataUtils, FileLoadError } from 'app/core/util/data-util.service';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { IExpenseCategory } from 'app/entities/expense-category/expense-category.model';
import { TenantService } from 'app/entities/tenant/service/tenant.service';
import { ITenant } from 'app/entities/tenant/tenant.model';
import { AlertError } from 'app/shared/alert/alert-error';
import { TranslateDirective } from 'app/shared/language';

import { IExpense } from '../expense.model';
import { ExpenseService } from '../service/expense.service';

import { ExpenseFormGroup, ExpenseFormService } from './expense-form.service';
import { AlertErrorModel } from 'app/shared/alert/alert-error.model';
import { ExpenseCategoryService } from 'app/entities/expense-category/service/expense-category.service';
import { IDriver } from 'app/entities/driver/driver.model';
import { DriverService } from 'app/entities/driver/service/driver.service';

@Component({
  selector: 'jhi-expense-update',
  templateUrl: './expense-update.html',
  imports: [TranslateDirective, TranslateModule, FontAwesomeModule, AlertError, ReactiveFormsModule],
})
export class ExpenseUpdate implements OnInit {
  isSaving = signal(false);
  expense: IExpense | null = null;

  tenantsSharedCollection = signal<ITenant[]>([]);
  expenseCategoriesSharedCollection = signal<IExpenseCategory[]>([]);
  driversSharedCollection = signal<IDriver[]>([]);

  protected dataUtils = inject(DataUtils);
  protected eventManager = inject(EventManager);
  protected expenseService = inject(ExpenseService);
  protected expenseFormService = inject(ExpenseFormService);
  protected tenantService = inject(TenantService);
  protected expenseCategoryService = inject(ExpenseCategoryService);
  protected driverService = inject(DriverService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: ExpenseFormGroup = this.expenseFormService.createExpenseFormGroup();

  compareTenant = (o1: ITenant | null, o2: ITenant | null): boolean => this.tenantService.compareTenant(o1, o2);

  compareExpenseCategory = (o1: IExpenseCategory | null, o2: IExpenseCategory | null): boolean =>
    this.expenseCategoryService.compareExpenseCategory(o1, o2);

  compareDriver = (o1: IDriver | null, o2: IDriver | null): boolean => this.driverService.compareDriver(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ expense }) => {
      this.expense = expense;
      if (expense) {
        this.updateForm(expense);
      }

      this.loadRelationshipsOptions();
    });
  }

  byteSize(base64String: string): string {
    return this.dataUtils.byteSize(base64String);
  }

  openFile(base64String: string, contentType: string | null | undefined): void {
    this.dataUtils.openFile(base64String, contentType);
  }

  setFileData(event: Event, field: string, isImage: boolean): void {
    this.dataUtils.loadFileToForm(event, this.editForm, field, isImage).subscribe({
      error: (err: FileLoadError) =>
        this.eventManager.broadcast(new EventWithContent<AlertErrorModel>('deliveryApp.error', { ...err, key: `error.file.${err.key}` })),
    });
  }

  previousState(): void {
    globalThis.history.back();
  }

  save(): void {
    this.isSaving.set(true);
    const expense = this.expenseFormService.getExpense(this.editForm);
    if (expense.id === null) {
      this.subscribeToSaveResponse(this.expenseService.create(expense));
    } else {
      this.subscribeToSaveResponse(this.expenseService.update(expense));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IExpense>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: () => this.onSaveSuccess(),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveSuccess(): void {
    this.previousState();
  }

  protected onSaveError(): void {
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSaving.set(false);
  }

  protected updateForm(expense: IExpense): void {
    this.expense = expense;
    this.expenseFormService.resetForm(this.editForm, expense);

    this.tenantsSharedCollection.set(
      this.tenantService.addTenantToCollectionIfMissing<ITenant>(this.tenantsSharedCollection(), expense.tenant),
    );
    this.expenseCategoriesSharedCollection.set(
      this.expenseCategoryService.addExpenseCategoryToCollectionIfMissing<IExpenseCategory>(
        this.expenseCategoriesSharedCollection(),
        expense.category,
      ),
    );
    this.driversSharedCollection.set(
      this.driverService.addDriverToCollectionIfMissing<IDriver>(this.driversSharedCollection(), expense.driver),
    );
  }

  protected loadRelationshipsOptions(): void {
    this.tenantService
      .query()
      .pipe(map((res: HttpResponse<ITenant[]>) => res.body ?? []))
      .pipe(map((tenants: ITenant[]) => this.tenantService.addTenantToCollectionIfMissing<ITenant>(tenants, this.expense?.tenant)))
      .subscribe((tenants: ITenant[]) => this.tenantsSharedCollection.set(tenants));

    this.expenseCategoryService
      .query()
      .pipe(map((res: HttpResponse<IExpenseCategory[]>) => res.body ?? []))
      .pipe(
        map((expenseCategories: IExpenseCategory[]) =>
          this.expenseCategoryService.addExpenseCategoryToCollectionIfMissing<IExpenseCategory>(expenseCategories, this.expense?.category),
        ),
      )
      .subscribe((expenseCategories: IExpenseCategory[]) => this.expenseCategoriesSharedCollection.set(expenseCategories));

    this.driverService
      .query()
      .pipe(map((res: HttpResponse<IDriver[]>) => res.body ?? []))
      .pipe(map((drivers: IDriver[]) => this.driverService.addDriverToCollectionIfMissing<IDriver>(drivers, this.expense?.driver)))
      .subscribe((drivers: IDriver[]) => this.driversSharedCollection.set(drivers));
  }
}
