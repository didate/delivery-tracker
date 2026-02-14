import { HttpResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { IProduct } from 'app/entities/product/product.model';
import { ProductService } from 'app/entities/product/service/product.service';
import { AlertError } from 'app/shared/alert/alert-error';
import { TranslateDirective } from 'app/shared/language';
import { IPriceHistory } from '../price-history.model';
import { PriceHistoryService } from '../service/price-history.service';

import { PriceHistoryFormGroup, PriceHistoryFormService } from './price-history-form.service';

@Component({
  selector: 'jhi-price-history-update',
  templateUrl: './price-history-update.html',
  imports: [TranslateDirective, TranslateModule, FontAwesomeModule, AlertError, ReactiveFormsModule],
})
export class PriceHistoryUpdate implements OnInit {
  isSaving = signal(false);
  priceHistory: IPriceHistory | null = null;

  productsSharedCollection = signal<IProduct[]>([]);

  protected priceHistoryService = inject(PriceHistoryService);
  protected priceHistoryFormService = inject(PriceHistoryFormService);
  protected productService = inject(ProductService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: PriceHistoryFormGroup = this.priceHistoryFormService.createPriceHistoryFormGroup();

  compareProduct = (o1: IProduct | null, o2: IProduct | null): boolean => this.productService.compareProduct(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ priceHistory }) => {
      this.priceHistory = priceHistory;
      if (priceHistory) {
        this.updateForm(priceHistory);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    globalThis.history.back();
  }

  save(): void {
    this.isSaving.set(true);
    const priceHistory = this.priceHistoryFormService.getPriceHistory(this.editForm);
    if (priceHistory.id === null) {
      this.subscribeToSaveResponse(this.priceHistoryService.create(priceHistory));
    } else {
      this.subscribeToSaveResponse(this.priceHistoryService.update(priceHistory));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IPriceHistory>>): void {
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

  protected updateForm(priceHistory: IPriceHistory): void {
    this.priceHistory = priceHistory;
    this.priceHistoryFormService.resetForm(this.editForm, priceHistory);

    this.productsSharedCollection.set(
      this.productService.addProductToCollectionIfMissing<IProduct>(this.productsSharedCollection(), priceHistory.product),
    );
  }

  protected loadRelationshipsOptions(): void {
    this.productService
      .query()
      .pipe(map((res: HttpResponse<IProduct[]>) => res.body ?? []))
      .pipe(
        map((products: IProduct[]) => this.productService.addProductToCollectionIfMissing<IProduct>(products, this.priceHistory?.product)),
      )
      .subscribe((products: IProduct[]) => this.productsSharedCollection.set(products));
  }
}
