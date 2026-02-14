import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';

import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { AlertError } from 'app/shared/alert/alert-error';
import { TranslateDirective } from 'app/shared/language';
import { ModalRef } from 'app/shared/modal';
import { TenantSettingsService } from '../service/tenant-settings.service';
import { ITenantSettings } from '../tenant-settings.model';

@Component({
  templateUrl: './tenant-settings-delete-dialog.html',
  imports: [TranslateDirective, TranslateModule, FormsModule, FontAwesomeModule, AlertError],
})
export class TenantSettingsDeleteDialog {
  tenantSettings?: ITenantSettings;
  activeModal?: ModalRef;

  protected tenantSettingsService = inject(TenantSettingsService);

  cancel(): void {
    this.activeModal?.dismiss();
  }

  confirmDelete(id: number): void {
    this.tenantSettingsService.delete(id).subscribe(() => {
      this.activeModal?.close(ITEM_DELETED_EVENT);
    });
  }
}
