import { HttpResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { DataUtils, FileLoadError } from 'app/core/util/data-util.service';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { AlertError } from 'app/shared/alert/alert-error';
import { AlertErrorModel } from 'app/shared/alert/alert-error.model';
import { TranslateDirective } from 'app/shared/language';

import { IExpenseCategory } from '../expense-category.model';
import { ExpenseCategoryService } from '../service/expense-category.service';

import { ExpenseCategoryFormGroup, ExpenseCategoryFormService } from './expense-category-form.service';

@Component({
  selector: 'jhi-expense-category-update',
  templateUrl: './expense-category-update.html',
  imports: [TranslateDirective, TranslateModule, FontAwesomeModule, AlertError, ReactiveFormsModule],
})
export class ExpenseCategoryUpdate implements OnInit {
  isSaving = signal(false);
  expenseCategory: IExpenseCategory | null = null;

  protected dataUtils = inject(DataUtils);
  protected eventManager = inject(EventManager);
  protected expenseCategoryService = inject(ExpenseCategoryService);
  protected expenseCategoryFormService = inject(ExpenseCategoryFormService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: ExpenseCategoryFormGroup = this.expenseCategoryFormService.createExpenseCategoryFormGroup();

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ expenseCategory }) => {
      this.expenseCategory = expenseCategory;
      if (expenseCategory) {
        this.updateForm(expenseCategory);
      }
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
    const expenseCategory = this.expenseCategoryFormService.getExpenseCategory(this.editForm);
    if (expenseCategory.id === null) {
      this.subscribeToSaveResponse(this.expenseCategoryService.create(expenseCategory));
    } else {
      this.subscribeToSaveResponse(this.expenseCategoryService.update(expenseCategory));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IExpenseCategory>>): void {
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

  protected updateForm(expenseCategory: IExpenseCategory): void {
    this.expenseCategory = expenseCategory;
    this.expenseCategoryFormService.resetForm(this.editForm, expenseCategory);
  }
}
