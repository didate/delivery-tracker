import { Component, input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  template: `
    @if (loading()) {
      <div class="loading-overlay">
        <mat-spinner diameter="50"></mat-spinner>
      </div>
    }
  `,
  styles: [`
    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
    }
  `]
})
export class LoadingSpinnerComponent {
  loading = input<boolean>(false);
}
