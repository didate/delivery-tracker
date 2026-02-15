import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Component({
  selector: 'jhi-modal',
  templateUrl: './modal.component.html',
  standalone: true,
})
export class ModalComponent {
  @Input() title = '';
  @Input() body = '';
  @Input() confirmText = 'OK';
  @Input() cancelText = 'Cancel';
  @Input() confirmButtonType: 'primary' | 'danger' | 'warning' | 'success' = 'primary';

  @Output() confirmClick = new EventEmitter<void>();
  @Output() cancelClick = new EventEmitter<void>();

  get confirmButtonClass(): string {
    switch (this.confirmButtonType) {
      case 'danger':
        return 'inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors';
      case 'warning':
        return 'inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors';
      case 'success':
        return 'inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors';
      default:
        return 'inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors';
    }
  }

  onConfirm(): void {
    this.confirmClick.emit();
  }

  onCancel(): void {
    this.cancelClick.emit();
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.onCancel();
  }
}
