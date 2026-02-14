import { Component, input, output } from '@angular/core';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [ModalComponent],
  template: `
    <app-modal
      [isOpen]="isOpen()"
      [title]="title()"
      maxWidth="400px"
      (close)="onCancel()">
      <div class="text-center">
        <div class="mx-auto mb-4 w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
          <i class="pi pi-exclamation-triangle text-2xl text-red-600"></i>
        </div>
        <p class="text-gray-600 mb-6">{{ message() }}</p>
        <div class="flex gap-3 justify-center">
          <button
            (click)="onCancel()"
            class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors">
            {{ cancelText() }}
          </button>
          <button
            (click)="onConfirm()"
            class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors">
            {{ confirmText() }}
          </button>
        </div>
      </div>
    </app-modal>
  `,
})
export class ConfirmDialogComponent {
  isOpen = input<boolean>(false);
  title = input<string>('Confirm');
  message = input<string>('Are you sure?');
  confirmText = input<string>('Confirm');
  cancelText = input<string>('Cancel');

  confirm = output<void>();
  cancel = output<void>();

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
