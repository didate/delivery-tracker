import { HttpResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { AlertError } from 'app/shared/alert/alert-error';
import { TranslateDirective } from 'app/shared/language';
import { TenantSettingsService } from '../service/tenant-settings.service';
import { ITenantSettings } from '../tenant-settings.model';

import { TenantSettingsFormGroup, TenantSettingsFormService } from './tenant-settings-form.service';

@Component({
  selector: 'jhi-tenant-settings-update',
  templateUrl: './tenant-settings-update.html',
  imports: [TranslateDirective, TranslateModule, FontAwesomeModule, AlertError, ReactiveFormsModule],
})
export class TenantSettingsUpdate implements OnInit {
  isSaving = signal(false);
  tenantSettings: ITenantSettings | null = null;

  protected tenantSettingsService = inject(TenantSettingsService);
  protected tenantSettingsFormService = inject(TenantSettingsFormService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: TenantSettingsFormGroup = this.tenantSettingsFormService.createTenantSettingsFormGroup();

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ tenantSettings }) => {
      this.tenantSettings = tenantSettings;
      if (tenantSettings) {
        this.updateForm(tenantSettings);
      }
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
  }
}
