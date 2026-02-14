import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { TranslateModule } from '@ngx-translate/core';

import { Alert } from 'app/shared/alert/alert';
import { AlertError } from 'app/shared/alert/alert-error';
import { TranslateDirective } from 'app/shared/language';
import { IDriver } from '../driver.model';

@Component({
  selector: 'jhi-driver-detail',
  templateUrl: './driver-detail.html',
  imports: [FontAwesomeModule, Alert, AlertError, TranslateDirective, TranslateModule, RouterLink],
})
export class DriverDetail {
  driver = input<IDriver | null>(null);

  previousState(): void {
    globalThis.history.back();
  }
}
