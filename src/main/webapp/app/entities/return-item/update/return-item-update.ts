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
import { IProductReturn } from 'app/entities/product-return/product-return.model';
import { ProductReturnService } from 'app/entities/product-return/service/product-return.service';
import { AlertError } from 'app/shared/alert/alert-error';
import { TranslateDirective } from 'app/shared/language';
import { IReturnItem } from '../return-item.model';
import { ReturnItemService } from '../service/return-item.service';

import { ReturnItemFormGroup, ReturnItemFormService } from './return-item-form.service';

@Component({
  selector: 'jhi-return-item-update',
  templateUrl: './return-item-update.html',
  imports: [TranslateDirective, TranslateModule, FontAwesomeModule, AlertError, ReactiveFormsModule],
})
export class ReturnItemUpdate implements OnInit {
  isSaving = signal(false);
  returnItem: IReturnItem | null = null;

  productReturnsSharedCollection = signal<IProductReturn[]>([]);
  productsSharedCollection = signal<IProduct[]>([]);

  protected returnItemService = inject(ReturnItemService);
  protected returnItemFormService = inject(ReturnItemFormService);
  protected productReturnService = inject(ProductReturnService);
  protected productService = inject(ProductService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: ReturnItemFormGroup = this.returnItemFormService.createReturnItemFormGroup();

  compareProductReturn = (o1: IProductReturn | null, o2: IProductReturn | null): boolean =>
    this.productReturnService.compareProductReturn(o1, o2);

  compareProduct = (o1: IProduct | null, o2: IProduct | null): boolean => this.productService.compareProduct(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ returnItem }) => {
      this.returnItem = returnItem;
      if (returnItem) {
        this.updateForm(returnItem);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    globalThis.history.back();
  }

  save(): void {
    this.isSaving.set(true);
    const returnItem = this.returnItemFormService.getReturnItem(this.editForm);
    if (returnItem.id === null) {
      this.subscribeToSaveResponse(this.returnItemService.create(returnItem));
    } else {
      this.subscribeToSaveResponse(this.returnItemService.update(returnItem));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IReturnItem>>): void {
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

  protected updateForm(returnItem: IReturnItem): void {
    this.returnItem = returnItem;
    this.returnItemFormService.resetForm(this.editForm, returnItem);

    this.productReturnsSharedCollection.set(
      this.productReturnService.addProductReturnToCollectionIfMissing<IProductReturn>(
        this.productReturnsSharedCollection(),
        returnItem.productReturn,
      ),
    );
    this.productsSharedCollection.set(
      this.productService.addProductToCollectionIfMissing<IProduct>(this.productsSharedCollection(), returnItem.product),
    );
  }

  protected loadRelationshipsOptions(): void {
    this.productReturnService
      .query()
      .pipe(map((res: HttpResponse<IProductReturn[]>) => res.body ?? []))
      .pipe(
        map((productReturns: IProductReturn[]) =>
          this.productReturnService.addProductReturnToCollectionIfMissing<IProductReturn>(productReturns, this.returnItem?.productReturn),
        ),
      )
      .subscribe((productReturns: IProductReturn[]) => this.productReturnsSharedCollection.set(productReturns));

    this.productService
      .query()
      .pipe(map((res: HttpResponse<IProduct[]>) => res.body ?? []))
      .pipe(
        map((products: IProduct[]) => this.productService.addProductToCollectionIfMissing<IProduct>(products, this.returnItem?.product)),
      )
      .subscribe((products: IProduct[]) => this.productsSharedCollection.set(products));
  }
}
