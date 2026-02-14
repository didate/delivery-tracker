import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'jhi-progress-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
      <div class="h-full rounded-full transition-all duration-300" [class]="barClass()" [style.width.%]="percentage()">
        <span class="sr-only">{{ percentage() | number: '1.0-0' }}%</span>
        <ng-content></ng-content>
      </div>
    </div>
  `,
})
export class ProgressBarComponent {
  value = input<number>(0);
  max = input<number>(100);
  type = input<string>('primary');
  striped = input<boolean>(false);
  animated = input<boolean>(false);

  percentage = computed(() => {
    const maxVal = this.max() || 100;
    return Math.min(100, Math.max(0, (this.value() / maxVal) * 100));
  });

  barClass = computed(() => {
    const typeClasses: Record<string, string> = {
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      danger: 'bg-red-500',
      info: 'bg-blue-400',
      primary: 'bg-primary-500',
    };

    let classes = typeClasses[this.type()] || typeClasses['primary'];

    if (this.striped()) {
      classes += ' bg-stripes';
    }

    return classes;
  });
}
