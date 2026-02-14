import { Routes } from '@angular/router';

import { ASC } from 'app/config/navigation.constants';
import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';

import ExpenseResolve from './route/expense-routing-resolve.service';

const expenseRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/expense').then(m => m.Expense),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/expense-detail').then(m => m.ExpenseDetail),
    resolve: {
      expense: ExpenseResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/expense-update').then(m => m.ExpenseUpdate),
    resolve: {
      expense: ExpenseResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/expense-update').then(m => m.ExpenseUpdate),
    resolve: {
      expense: ExpenseResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default expenseRoute;
