import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';

import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { AlertError } from 'app/shared/alert/alert-error';
import { TranslateDirective } from 'app/shared/language';
import { ModalRef } from 'app/shared/modal';
import { IProduction } from '../production.model';
import { ProductionService } from '../service/production.service';

@Component({
  templateUrl: './production-delete-dialog.html',
  imports: [TranslateDirective, TranslateModule, FormsModule, FontAwesomeModule, AlertError],
})
export class ProductionDeleteDialog {
  production?: IProduction;
  activeModal?: ModalRef;

  protected productionService = inject(ProductionService);

  cancel(): void {
    this.activeModal?.dismiss();
  }

  confirmDelete(id: number): void {
    this.productionService.delete(id).subscribe(() => {
      this.activeModal?.close(ITEM_DELETED_EVENT);
    });
  }
}
