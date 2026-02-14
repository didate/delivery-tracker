import { Routes } from '@angular/router';

import { ASC } from 'app/config/navigation.constants';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';

import ExpenseCategoryResolve from './route/expense-category-routing-resolve.service';

const expenseCategoryRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/expense-category').then(m => m.ExpenseCategory),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/expense-category-detail').then(m => m.ExpenseCategoryDetail),
    resolve: {
      expenseCategory: ExpenseCategoryResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/expense-category-update').then(m => m.ExpenseCategoryUpdate),
    resolve: {
      expenseCategory: ExpenseCategoryResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/expense-category-update').then(m => m.ExpenseCategoryUpdate),
    resolve: {
      expenseCategory: ExpenseCategoryResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default expenseCategoryRoute;
