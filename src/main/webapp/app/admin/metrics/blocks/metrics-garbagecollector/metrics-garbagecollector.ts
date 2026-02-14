import { DecimalPipe } from '@angular/common';
import { Component, input } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';

import { GarbageCollector } from 'app/admin/metrics/metrics.model';
import { TranslateDirective } from 'app/shared/language';
import { ProgressBarComponent } from 'app/shared/progress-bar';

@Component({
  selector: 'jhi-metrics-garbagecollector',
  templateUrl: './metrics-garbagecollector.html',
  imports: [DecimalPipe, TranslateDirective, TranslateModule, ProgressBarComponent],
})
export class MetricsGarbageCollector {
  /**
   * Object containing garbage collector related metrics
   */
  garbageCollectorMetrics = input<GarbageCollector>();

  /**
   * Boolean field saying if the metrics are in the process of being updated
   */
  updating = input<boolean>();
}
