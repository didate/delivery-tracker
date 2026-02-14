import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { TranslateModule } from '@ngx-translate/core';

import { Alert } from 'app/shared/alert/alert';
import { AlertError } from 'app/shared/alert/alert-error';
import { TranslateDirective } from 'app/shared/language';
import { IDeliveryItem } from '../delivery-item.model';

@Component({
  selector: 'jhi-delivery-item-detail',
  templateUrl: './delivery-item-detail.html',
  imports: [FontAwesomeModule, Alert, AlertError, TranslateDirective, TranslateModule, RouterLink],
})
export class DeliveryItemDetail {
  deliveryItem = input<IDeliveryItem | null>(null);

  previousState(): void {
    globalThis.history.back();
  }
}
