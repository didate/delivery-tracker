import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';

import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { AlertError } from 'app/shared/alert/alert-error';
import { TranslateDirective } from 'app/shared/language';
import { ModalRef } from 'app/shared/modal';
import { ICustomer } from '../customer.model';
import { CustomerService } from '../service/customer.service';

@Component({
  templateUrl: './customer-delete-dialog.html',
  imports: [TranslateDirective, TranslateModule, FormsModule, FontAwesomeModule, AlertError],
})
export class CustomerDeleteDialog {
  customer?: ICustomer;
  activeModal?: ModalRef;

  protected customerService = inject(CustomerService);

  cancel(): void {
    this.activeModal?.dismiss();
  }

  confirmDelete(id: number): void {
    this.customerService.delete(id).subscribe(() => {
      this.activeModal?.close(ITEM_DELETED_EVENT);
    });
  }
}
