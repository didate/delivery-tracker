import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';

import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { AlertError } from 'app/shared/alert/alert-error';
import { TranslateDirective } from 'app/shared/language';
import { ModalRef } from 'app/shared/modal';
import { IExpense } from '../expense.model';
import { ExpenseService } from '../service/expense.service';

@Component({
  templateUrl: './expense-delete-dialog.html',
  imports: [TranslateDirective, TranslateModule, FormsModule, FontAwesomeModule, AlertError],
})
export class ExpenseDeleteDialog {
  expense?: IExpense;
  activeModal?: ModalRef;

  protected expenseService = inject(ExpenseService);

  cancel(): void {
    this.activeModal?.dismiss();
  }

  confirmDelete(id: number): void {
    this.expenseService.delete(id).subscribe(() => {
      this.activeModal?.close(ITEM_DELETED_EVENT);
    });
  }
}
