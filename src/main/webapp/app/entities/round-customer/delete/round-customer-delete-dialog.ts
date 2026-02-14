import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';

import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { AlertError } from 'app/shared/alert/alert-error';
import { TranslateDirective } from 'app/shared/language';
import { ModalRef } from 'app/shared/modal';
import { IRoundCustomer } from '../round-customer.model';
import { RoundCustomerService } from '../service/round-customer.service';

@Component({
  templateUrl: './round-customer-delete-dialog.html',
  imports: [TranslateDirective, TranslateModule, FormsModule, FontAwesomeModule, AlertError],
})
export class RoundCustomerDeleteDialog {
  roundCustomer?: IRoundCustomer;
  activeModal?: ModalRef;

  protected roundCustomerService = inject(RoundCustomerService);

  cancel(): void {
    this.activeModal?.dismiss();
  }

  confirmDelete(id: number): void {
    this.roundCustomerService.delete(id).subscribe(() => {
      this.activeModal?.close(ITEM_DELETED_EVENT);
    });
  }
}
