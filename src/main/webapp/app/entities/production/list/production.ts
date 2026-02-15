import { HttpHeaders } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Data, ParamMap, Router, RouterLink } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ModalService } from 'app/shared/modal';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, Subscription, combineLatest, finalize, tap } from 'rxjs';

import { DEFAULT_SORT_DATA, SORT } from 'app/config/navigation.constants';
import { ITEMS_PER_PAGE, PAGE_HEADER, TOTAL_COUNT_RESPONSE_HEADER } from 'app/config/pagination.constants';
import { DataUtils } from 'app/core/util/data-util.service';
import { Alert } from 'app/shared/alert/alert';
import { AlertError } from 'app/shared/alert/alert-error';
import { FormatMediumDatePipe } from 'app/shared/date';
import { Filter, FilterOptions, IFilterOption, IFilterOptions } from 'app/shared/filter';
import { ResponsiveTableDirective } from 'app/shared/directives';
import { TranslateDirective } from 'app/shared/language';
import { ItemCount, PaginationComponent } from 'app/shared/pagination';
import { SortByDirective, SortDirective, SortService, type SortState, sortStateSignal } from 'app/shared/sort';
import { IProduction } from '../production.model';
import { EntityArrayResponseType, ProductionService } from '../service/production.service';

@Component({
  selector: 'jhi-production',
  templateUrl: './production.html',
  imports: [
    RouterLink,
    FormsModule,
    FontAwesomeModule,
    AlertError,
    Alert,
    SortDirective,
    SortByDirective,
    TranslateDirective,
    TranslateModule,
    FormatMediumDatePipe,
    Filter,
    ItemCount,
    PaginationComponent,
    ResponsiveTableDirective,
  ],
})
export class Production implements OnInit {
  subscription: Subscription | null = null;
  productions = signal<IProduction[]>([]);
  isLoading = signal(false);

  sortState = sortStateSignal({});
  filters: IFilterOptions = new FilterOptions();

  itemsPerPage = signal(ITEMS_PER_PAGE);
  totalItems = signal(0);
  page = signal(1);

  readonly router = inject(Router);
  protected readonly productionService = inject(ProductionService);
  protected readonly activatedRoute = inject(ActivatedRoute);
  protected readonly sortService = inject(SortService);
  protected dataUtils = inject(DataUtils);
  protected modalService = inject(ModalService);

  trackId = (item: IProduction): number => this.productionService.getProductionIdentifier(item);

  ngOnInit(): void {
    this.subscription = combineLatest([this.activatedRoute.queryParamMap, this.activatedRoute.data])
      .pipe(
        tap(([params, data]) => this.fillComponentAttributeFromRoute(params, data)),
        tap(() => this.load()),
      )
      .subscribe();

    this.filters.filterChanges.subscribe(filterOptions => this.handleNavigation(1, this.sortState(), filterOptions));
  }

  byteSize(base64String: string): string {
    return this.dataUtils.byteSize(base64String);
  }

  openFile(base64String: string, contentType: string | null | undefined): void {
    return this.dataUtils.openFile(base64String, contentType);
  }

  delete(production: IProduction): void {
    this.modalService.confirm({
      title: 'entity.delete.title',
      message: 'deliveryApp.production.delete.question',
      confirmText: 'entity.action.delete',
      confirmButtonType: 'danger',
      onConfirm: () => {
        this.productionService.delete(production.id).subscribe(() => this.load());
      },
    });
  }

  load(): void {
    this.queryBackend().subscribe((res: EntityArrayResponseType) => this.onResponseSuccess(res));
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
    this.sortState.set(this.sortService.parseSortParam(params.get(SORT) ?? data[DEFAULT_SORT_DATA]));
    this.filters.initializeFromParams(params);
  }

  protected onResponseSuccess(response: EntityArrayResponseType): void {
    this.fillComponentAttributesFromResponseHeader(response.headers);
    const dataFromBody = this.fillComponentAttributesFromResponseBody(response.body);
    this.productions.set(dataFromBody);
  }

  protected fillComponentAttributesFromResponseBody(data: IProduction[] | null): IProduction[] {
    return data ?? [];
  }

  protected fillComponentAttributesFromResponseHeader(headers: HttpHeaders): void {
    this.totalItems.set(Number(headers.get(TOTAL_COUNT_RESPONSE_HEADER)));
  }

  protected queryBackend(): Observable<EntityArrayResponseType> {
    this.isLoading.set(true);
    const pageToLoad: number = this.page();
    const queryObject: any = {
      page: pageToLoad - 1,
      size: this.itemsPerPage(),
      sort: this.sortService.buildSortParam(this.sortState()),
    };
    for (const filterOption of this.filters.filterOptions) {
      queryObject[filterOption.name] = filterOption.values;
    }
    return this.productionService.query(queryObject).pipe(finalize(() => this.isLoading.set(false)));
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
}
