import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { Observable } from 'rxjs';

import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { isPresent } from 'app/core/util/operators';
import { IExpenseCategory, NewExpenseCategory } from '../expense-category.model';

export type PartialUpdateExpenseCategory = Partial<IExpenseCategory> & Pick<IExpenseCategory, 'id'>;

export type EntityResponseType = HttpResponse<IExpenseCategory>;
export type EntityArrayResponseType = HttpResponse<IExpenseCategory[]>;

@Injectable({ providedIn: 'root' })
export class ExpenseCategoryService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/expense-categories');

  create(expenseCategory: NewExpenseCategory): Observable<EntityResponseType> {
    return this.http.post<IExpenseCategory>(this.resourceUrl, expenseCategory, { observe: 'response' });
  }

  update(expenseCategory: IExpenseCategory): Observable<EntityResponseType> {
    return this.http.put<IExpenseCategory>(
      `${this.resourceUrl}/${encodeURIComponent(this.getExpenseCategoryIdentifier(expenseCategory))}`,
      expenseCategory,
      { observe: 'response' },
    );
  }

  partialUpdate(expenseCategory: PartialUpdateExpenseCategory): Observable<EntityResponseType> {
    return this.http.patch<IExpenseCategory>(
      `${this.resourceUrl}/${encodeURIComponent(this.getExpenseCategoryIdentifier(expenseCategory))}`,
      expenseCategory,
      { observe: 'response' },
    );
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IExpenseCategory>(`${this.resourceUrl}/${encodeURIComponent(id)}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IExpenseCategory[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${encodeURIComponent(id)}`, { observe: 'response' });
  }

  getExpenseCategoryIdentifier(expenseCategory: Pick<IExpenseCategory, 'id'>): number {
    return expenseCategory.id;
  }

  compareExpenseCategory(o1: Pick<IExpenseCategory, 'id'> | null, o2: Pick<IExpenseCategory, 'id'> | null): boolean {
    return o1 && o2 ? this.getExpenseCategoryIdentifier(o1) === this.getExpenseCategoryIdentifier(o2) : o1 === o2;
  }

  addExpenseCategoryToCollectionIfMissing<Type extends Pick<IExpenseCategory, 'id'>>(
    expenseCategoryCollection: Type[],
    ...expenseCategoriesToCheck: (Type | null | undefined)[]
  ): Type[] {
    const expenseCategories: Type[] = expenseCategoriesToCheck.filter(isPresent);
    if (expenseCategories.length > 0) {
      const expenseCategoryCollectionIdentifiers = expenseCategoryCollection.map(expenseCategoryItem =>
        this.getExpenseCategoryIdentifier(expenseCategoryItem),
      );
      const expenseCategoriesToAdd = expenseCategories.filter(expenseCategoryItem => {
        const expenseCategoryIdentifier = this.getExpenseCategoryIdentifier(expenseCategoryItem);
        if (expenseCategoryCollectionIdentifiers.includes(expenseCategoryIdentifier)) {
          return false;
        }
        expenseCategoryCollectionIdentifiers.push(expenseCategoryIdentifier);
        return true;
      });
      return [...expenseCategoriesToAdd, ...expenseCategoryCollection];
    }
    return expenseCategoryCollection;
  }
}
