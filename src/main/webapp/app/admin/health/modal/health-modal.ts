import { KeyValuePipe } from '@angular/common';
import { Component } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';

import { TranslateDirective } from 'app/shared/language';
import { ModalRef } from 'app/shared/modal';
import { HealthDetails, HealthKey } from '../health.model';

@Component({
  selector: 'jhi-health-modal',
  templateUrl: './health-modal.html',
  imports: [TranslateDirective, TranslateModule, KeyValuePipe],
})
export default class HealthModal {
  health?: { key: HealthKey; value: HealthDetails };
  activeModal?: ModalRef;

  readableValue(value: any): string {
    if (this.health?.key === 'diskSpace') {
      // should display storage space in a human readable unit
      const val = value / 1073741824;
      if (val > 1) {
        return `${val.toFixed(2)} GB`;
      }
      return `${(value / 1048576).toFixed(2)} MB`;
    }

    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  }

  dismiss(): void {
    this.activeModal?.dismiss();
  }
}
