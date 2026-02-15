import { DatePipe } from '@angular/common';
import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Data, ParamMap, Router, RouterLink } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ModalService } from 'app/shared/modal';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { combineLatest, Subscription, tap } from 'rxjs';

import { DEFAULT_SORT_DATA, SORT } from 'app/config/navigation.constants';
import { ITEMS_PER_PAGE, PAGE_HEADER, TOTAL_COUNT_RESPONSE_HEADER } from 'app/config/pagination.constants';
import { AccountService } from 'app/core/auth/account.service';
import { Alert } from 'app/shared/alert/alert';
import { AlertError } from 'app/shared/alert/alert-error';
import { Filter, FilterField, FilterOptions, IFilterOption, IFilterOptions } from 'app/shared/filter';
import { TranslateDirective } from 'app/shared/language';
import { ItemCount, PaginationComponent } from 'app/shared/pagination';
import { SortByDirective, SortDirective, SortService, SortState, sortStateSignal } from 'app/shared/sort';
import { UserManagementService } from '../service/user-management.service';
import { User } from '../user-management.model';

@Component({
  selector: 'jhi-user-mgmt',
  templateUrl: './user-management.html',
  imports: [
    RouterLink,
    FontAwesomeModule,
    AlertError,
    Alert,
    TranslateDirective,
    TranslateModule,
    SortDirective,
    SortByDirective,
    ItemCount,
    PaginationComponent,
    DatePipe,
    Filter,
  ],
})
export default class UserManagement implements OnInit {
  subscription: Subscription | null = null;
  currentAccount = inject(AccountService).trackCurrentAccount();
  users = signal<User[] | null>(null);
  isLoading = signal(false);
  totalItems = signal(0);
  itemsPerPage = signal(ITEMS_PER_PAGE);
  page = signal(1);
  sortState = sortStateSignal({});

  filters: IFilterOptions = new FilterOptions();
  filterFields: FilterField[] = [
    { name: 'login', label: 'Login', type: 'contains', placeholder: 'Search by login...' },
    { name: 'email', label: 'Email', type: 'contains', placeholder: 'Search by email...' },
    { name: 'firstName', label: 'First Name', type: 'contains', placeholder: 'Search by first name...' },
    { name: 'lastName', label: 'Last Name', type: 'contains', placeholder: 'Search by last name...' },
  ];

  private readonly userService = inject(UserManagementService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sortService = inject(SortService);
  private readonly modalService = inject(ModalService);
  private readonly translateService = inject(TranslateService);

  ngOnInit(): void {
    this.subscription = combineLatest([this.activatedRoute.queryParamMap, this.activatedRoute.data])
      .pipe(
        tap(([params, data]) => this.fillComponentAttributeFromRoute(params, data)),
        tap(() => this.loadAll()),
      )
      .subscribe();

    this.filters.filterChanges.subscribe(filterOptions => this.handleNavigation(1, this.sortState(), filterOptions));
  }

  setActive(user: User, isActivated: boolean): void {
    this.userService.update({ ...user, activated: isActivated }).subscribe(() => this.loadAll());
  }

  trackIdentity(item: User): number {
    return item.id!;
  }

  deleteUser(user: User): void {
    this.modalService.confirm({
      title: 'entity.delete.title',
      message: 'userManagement.delete.question',
      confirmText: 'entity.action.delete',
      confirmButtonType: 'danger',
      onConfirm: () => {
        this.userService.delete(user.login!).subscribe(() => this.loadAll());
      },
    });
  }

  loadAll(): void {
    this.isLoading.set(true);
    const queryObject: any = {
      page: this.page() - 1,
      size: this.itemsPerPage(),
      sort: this.sortService.buildSortParam(this.sortState(), 'id'),
    };
    for (const filterOption of this.filters.filterOptions) {
      queryObject[filterOption.name] = filterOption.values;
    }
    this.userService.query(queryObject).subscribe({
      next: (res: HttpResponse<User[]>) => {
        this.isLoading.set(false);
        this.onSuccess(res.body, res.headers);
      },
      error: () => this.isLoading.set(false),
    });
  }

  navigateToWithComponentValues(event: SortState): void {
    this.handleNavigation(this.page(), event, this.filters.filterOptions);
  }

  navigateToPage(page: number): void {
    this.handleNavigation(page, this.sortState(), this.filters.filterOptions);
  }

  protected fillComponentAttributeFromRoute(params: ParamMap, data: Data): void {
    const page = params.get(PAGE_HEADER);
    this.page.set(+(page ?? 1));
    this.sortState.set(this.sortService.parseSortParam(params.get(SORT) ?? data[DEFAULT_SORT_DATA] ?? data.defaultSort));
    this.filters.initializeFromParams(params);
  }

  protected handleNavigation(page: number, sortState: SortState, filterOptions?: IFilterOption[]): void {
    const queryParamsObj: any = {
      page,
      size: this.itemsPerPage(),
      sort: this.sortService.buildSortParam(sortState),
    };

    if (filterOptions) {
      for (const filterOption of filterOptions) {
        queryParamsObj[filterOption.nameAsQueryParam()] = filterOption.values;
      }
    }

    this.router.navigate(['./'], {
      relativeTo: this.activatedRoute,
      queryParams: queryParamsObj,
    });
  }

  private onSuccess(users: User[] | null, headers: HttpHeaders): void {
    this.totalItems.set(Number(headers.get(TOTAL_COUNT_RESPONSE_HEADER)));
    this.users.set(users);
  }
}
