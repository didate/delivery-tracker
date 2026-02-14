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
import { IProduct } from 'app/entities/product/product.model';
import { ProductService } from 'app/entities/product/service/product.service';
import { IProductionSite } from 'app/entities/production-site/production-site.model';
import { ProductionSiteService } from 'app/entities/production-site/service/production-site.service';
import { TenantService } from 'app/entities/tenant/service/tenant.service';
import { ITenant } from 'app/entities/tenant/tenant.model';
import { AlertError } from 'app/shared/alert/alert-error';
import { AlertErrorModel } from 'app/shared/alert/alert-error.model';
import { TranslateDirective } from 'app/shared/language';
import { IProduction } from '../production.model';
import { ProductionService } from '../service/production.service';

import { ProductionFormGroup, ProductionFormService } from './production-form.service';

@Component({
  selector: 'jhi-production-update',
  templateUrl: './production-update.html',
  imports: [TranslateDirective, TranslateModule, FontAwesomeModule, AlertError, ReactiveFormsModule],
})
export class ProductionUpdate implements OnInit {
  isSaving = signal(false);
  production: IProduction | null = null;

  tenantsSharedCollection = signal<ITenant[]>([]);
  productsSharedCollection = signal<IProduct[]>([]);
  productionSitesSharedCollection = signal<IProductionSite[]>([]);

  protected dataUtils = inject(DataUtils);
  protected eventManager = inject(EventManager);
  protected productionService = inject(ProductionService);
  protected productionFormService = inject(ProductionFormService);
  protected tenantService = inject(TenantService);
  protected productService = inject(ProductService);
  protected productionSiteService = inject(ProductionSiteService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: ProductionFormGroup = this.productionFormService.createProductionFormGroup();

  compareTenant = (o1: ITenant | null, o2: ITenant | null): boolean => this.tenantService.compareTenant(o1, o2);

  compareProduct = (o1: IProduct | null, o2: IProduct | null): boolean => this.productService.compareProduct(o1, o2);

  compareProductionSite = (o1: IProductionSite | null, o2: IProductionSite | null): boolean =>
    this.productionSiteService.compareProductionSite(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ production }) => {
      this.production = production;
      if (production) {
        this.updateForm(production);
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
    const production = this.productionFormService.getProduction(this.editForm);
    if (production.id === null) {
      this.subscribeToSaveResponse(this.productionService.create(production));
    } else {
      this.subscribeToSaveResponse(this.productionService.update(production));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IProduction>>): void {
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

  protected updateForm(production: IProduction): void {
    this.production = production;
    this.productionFormService.resetForm(this.editForm, production);

    this.tenantsSharedCollection.set(
      this.tenantService.addTenantToCollectionIfMissing<ITenant>(this.tenantsSharedCollection(), production.tenant),
    );
    this.productsSharedCollection.set(
      this.productService.addProductToCollectionIfMissing<IProduct>(this.productsSharedCollection(), production.product),
    );
    this.productionSitesSharedCollection.set(
      this.productionSiteService.addProductionSiteToCollectionIfMissing<IProductionSite>(
        this.productionSitesSharedCollection(),
        production.productionSite,
      ),
    );
  }

  protected loadRelationshipsOptions(): void {
    this.tenantService
      .query()
      .pipe(map((res: HttpResponse<ITenant[]>) => res.body ?? []))
      .pipe(map((tenants: ITenant[]) => this.tenantService.addTenantToCollectionIfMissing<ITenant>(tenants, this.production?.tenant)))
      .subscribe((tenants: ITenant[]) => this.tenantsSharedCollection.set(tenants));

    this.productService
      .query()
      .pipe(map((res: HttpResponse<IProduct[]>) => res.body ?? []))
      .pipe(
        map((products: IProduct[]) => this.productService.addProductToCollectionIfMissing<IProduct>(products, this.production?.product)),
      )
      .subscribe((products: IProduct[]) => this.productsSharedCollection.set(products));

    this.productionSiteService
      .query()
      .pipe(map((res: HttpResponse<IProductionSite[]>) => res.body ?? []))
      .pipe(
        map((productionSites: IProductionSite[]) =>
          this.productionSiteService.addProductionSiteToCollectionIfMissing<IProductionSite>(
            productionSites,
            this.production?.productionSite,
          ),
        ),
      )
      .subscribe((productionSites: IProductionSite[]) => this.productionSitesSharedCollection.set(productionSites));
  }
}
