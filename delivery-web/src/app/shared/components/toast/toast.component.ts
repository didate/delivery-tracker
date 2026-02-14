import { Component, inject } from '@angular/core';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-md">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="flex items-start gap-3 p-4 rounded-lg shadow-lg border animate-slide-in"
          [class]="getToastClasses(toast.type)">
          <i [class]="getIconClass(toast.type)" class="text-lg mt-0.5"></i>
          <div class="flex-1 min-w-0">
            <p class="font-medium text-sm">{{ toast.title }}</p>
            <p class="text-sm opacity-90 mt-0.5">{{ toast.message }}</p>
          </div>
          <button
            (click)="toastService.remove(toast.id)"
            class="text-current opacity-70 hover:opacity-100 transition-opacity">
            <i class="pi pi-times text-sm"></i>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes slide-in {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .animate-slide-in {
      animation: slide-in 0.3s ease-out;
    }
  `]
})
export class ToastComponent {
  readonly toastService = inject(ToastService);

  getToastClasses(type: string): string {
    const baseClasses = 'bg-white';
    switch (type) {
      case 'success':
        return `${baseClasses} border-l-4 border-l-green-500 text-green-800`;
      case 'error':
        return `${baseClasses} border-l-4 border-l-red-500 text-red-800`;
      case 'warn':
        return `${baseClasses} border-l-4 border-l-yellow-500 text-yellow-800`;
      case 'info':
        return `${baseClasses} border-l-4 border-l-blue-500 text-blue-800`;
      default:
        return baseClasses;
    }
  }

  getIconClass(type: string): string {
    switch (type) {
      case 'success':
        return 'pi pi-check-circle text-green-500';
      case 'error':
        return 'pi pi-times-circle text-red-500';
      case 'warn':
        return 'pi pi-exclamation-triangle text-yellow-500';
      case 'info':
        return 'pi pi-info-circle text-blue-500';
      default:
        return 'pi pi-info-circle';
    }
  }
}
