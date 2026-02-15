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

import { IProductionSite } from '../production-site.model';
import { ProductionSiteService } from '../service/production-site.service';

import { ProductionSiteFormGroup, ProductionSiteFormService } from './production-site-form.service';

@Component({
  selector: 'jhi-production-site-update',
  templateUrl: './production-site-update.html',
  imports: [TranslateDirective, TranslateModule, FontAwesomeModule, AlertError, ReactiveFormsModule],
})
export class ProductionSiteUpdate implements OnInit {
  isSaving = signal(false);
  productionSite: IProductionSite | null = null;

  protected dataUtils = inject(DataUtils);
  protected eventManager = inject(EventManager);
  protected productionSiteService = inject(ProductionSiteService);
  protected productionSiteFormService = inject(ProductionSiteFormService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: ProductionSiteFormGroup = this.productionSiteFormService.createProductionSiteFormGroup();

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ productionSite }) => {
      this.productionSite = productionSite;
      if (productionSite) {
        this.updateForm(productionSite);
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
    const productionSite = this.productionSiteFormService.getProductionSite(this.editForm);
    if (productionSite.id === null) {
      this.subscribeToSaveResponse(this.productionSiteService.create(productionSite));
    } else {
      this.subscribeToSaveResponse(this.productionSiteService.update(productionSite));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IProductionSite>>): void {
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

  protected updateForm(productionSite: IProductionSite): void {
    this.productionSite = productionSite;
    this.productionSiteFormService.resetForm(this.editForm, productionSite);
  }
}
