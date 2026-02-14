import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { NgClass } from '@angular/common';

import { AlertModel, AlertService, AlertType } from 'app/core/util/alert.service';

@Component({
  selector: 'jhi-alert',
  templateUrl: './alert.html',
  imports: [NgClass],
})
export class Alert implements OnInit, OnDestroy {
  alerts = signal<AlertModel[]>([]);

  private readonly alertService = inject(AlertService);

  ngOnInit(): void {
    this.alerts.set(this.alertService.get());
  }

  getAlertClasses(alert: AlertModel): Record<string, boolean> {
    const typeClasses: Record<AlertType, string> = {
      success: 'bg-green-50 text-green-800 border border-green-200',
      danger: 'bg-red-50 text-red-800 border border-red-200',
      warning: 'bg-yellow-50 text-yellow-800 border border-yellow-200',
      info: 'bg-blue-50 text-blue-800 border border-blue-200',
    };

    const classes: Record<string, boolean> = {};
    const typeClass = typeClasses[alert.type];
    if (typeClass) {
      typeClass.split(' ').forEach(cls => {
        classes[cls] = true;
      });
    }

    if (alert.toast) {
      classes['shadow-lg'] = true;
    }

    return classes;
  }

  ngOnDestroy(): void {
    this.alertService.clear();
  }

  close(alert: AlertModel): void {
    alert.close?.(this.alerts());
  }
}
