import { Component, input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  template: `
    @if (loading()) {
      <div class="absolute inset-0 bg-white/70 flex items-center justify-center z-50">
        <div class="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    }
  `,
})
export class LoadingSpinnerComponent {
  loading = input<boolean>(false);
}
