import { DecimalPipe } from '@angular/common';
import { HttpHeaders } from '@angular/common/http';
import { Component, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { TranslateModule } from '@ngx-translate/core';

import { TOTAL_COUNT_RESPONSE_HEADER } from 'app/config/pagination.constants';
import { DataUtils } from 'app/core/util/data-util.service';
import { IPriceHistory } from 'app/entities/price-history/price-history.model';
import { PriceHistoryService } from 'app/entities/price-history/service/price-history.service';
import { Alert } from 'app/shared/alert/alert';
import { AlertError } from 'app/shared/alert/alert-error';
import { FormatMediumDatePipe } from 'app/shared/date';
import { TranslateDirective } from 'app/shared/language';
import { ItemCount, PaginationComponent } from 'app/shared/pagination';
import { IProduct } from '../product.model';

@Component({
  selector: 'jhi-product-detail',
  templateUrl: './product-detail.html',
  imports: [
    FontAwesomeModule,
    Alert,
    AlertError,
    TranslateDirective,
    TranslateModule,
    RouterLink,
    DecimalPipe,
    FormatMediumDatePipe,
    PaginationComponent,
    ItemCount,
  ],
})
export class ProductDetail {
  product = input<IProduct | null>(null);
  priceHistory = signal<IPriceHistory[]>([]);

  // Pagination
  page = signal(1);
  itemsPerPage = 5;
  totalItems = signal(0);

  protected dataUtils = inject(DataUtils);
  protected priceHistoryService = inject(PriceHistoryService);

  constructor() {
    effect(() => {
      const prod = this.product();
      if (prod?.id) {
        this.loadPriceHistory(prod.id);
      }
    });
  }

  loadPriceHistory(productId: number): void {
    this.priceHistoryService
      .query({
        'productId.equals': productId,
        page: this.page() - 1,
        size: this.itemsPerPage,
        sort: ['effectiveDate,desc'],
      })
      .subscribe(res => {
        this.fillFromHeaders(res.headers);
        this.priceHistory.set(res.body ?? []);
      });
  }

  onPageChange(page: number): void {
    this.page.set(page);
    const prod = this.product();
    if (prod?.id) {
      this.loadPriceHistory(prod.id);
    }
  }

  protected fillFromHeaders(headers: HttpHeaders): void {
    this.totalItems.set(Number(headers.get(TOTAL_COUNT_RESPONSE_HEADER)));
  }

  byteSize(base64String: string): string {
    return this.dataUtils.byteSize(base64String);
  }

  openFile(base64String: string, contentType: string | null | undefined): void {
    this.dataUtils.openFile(base64String, contentType);
  }

  previousState(): void {
    globalThis.history.back();
  }
}
