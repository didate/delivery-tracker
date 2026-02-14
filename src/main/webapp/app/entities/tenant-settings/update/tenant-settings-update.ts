import { HttpResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { TenantService } from 'app/entities/tenant/service/tenant.service';
import { ITenant } from 'app/entities/tenant/tenant.model';
import { AlertError } from 'app/shared/alert/alert-error';
import { TranslateDirective } from 'app/shared/language';
import { TenantSettingsService } from '../service/tenant-settings.service';
import { ITenantSettings } from '../tenant-settings.model';

import { TenantSettingsFormGroup, TenantSettingsFormService } from './tenant-settings-form.service';

@Component({
  selector: 'jhi-tenant-settings-update',
  templateUrl: './tenant-settings-update.html',
  imports: [TranslateDirective, TranslateModule, NgbModule, FontAwesomeModule, AlertError, ReactiveFormsModule],
})
export class TenantSettingsUpdate implements OnInit {
  isSaving = signal(false);
  tenantSettings: ITenantSettings | null = null;

  tenantsSharedCollection = signal<ITenant[]>([]);

  protected tenantSettingsService = inject(TenantSettingsService);
  protected tenantSettingsFormService = inject(TenantSettingsFormService);
  protected tenantService = inject(TenantService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: TenantSettingsFormGroup = this.tenantSettingsFormService.createTenantSettingsFormGroup();

  compareTenant = (o1: ITenant | null, o2: ITenant | null): boolean => this.tenantService.compareTenant(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ tenantSettings }) => {
      this.tenantSettings = tenantSettings;
      if (tenantSettings) {
        this.updateForm(tenantSettings);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    globalThis.history.back();
  }

  save(): void {
    this.isSaving.set(true);
    const tenantSettings = this.tenantSettingsFormService.getTenantSettings(this.editForm);
    if (tenantSettings.id === null) {
      this.subscribeToSaveResponse(this.tenantSettingsService.create(tenantSettings));
    } else {
      this.subscribeToSaveResponse(this.tenantSettingsService.update(tenantSettings));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ITenantSettings>>): void {
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

  protected updateForm(tenantSettings: ITenantSettings): void {
    this.tenantSettings = tenantSettings;
    this.tenantSettingsFormService.resetForm(this.editForm, tenantSettings);

    this.tenantsSharedCollection.set(
      this.tenantService.addTenantToCollectionIfMissing<ITenant>(this.tenantsSharedCollection(), tenantSettings.tenant),
    );
  }

  protected loadRelationshipsOptions(): void {
    this.tenantService
      .query()
      .pipe(map((res: HttpResponse<ITenant[]>) => res.body ?? []))
      .pipe(map((tenants: ITenant[]) => this.tenantService.addTenantToCollectionIfMissing<ITenant>(tenants, this.tenantSettings?.tenant)))
      .subscribe((tenants: ITenant[]) => this.tenantsSharedCollection.set(tenants));
  }
}
