import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [ButtonModule],
  template: `
    <div class="confirm-dialog-content">
      <p class="message">{{ data.message }}</p>
      <div class="dialog-actions">
        <p-button
          [label]="data.cancelText || 'Cancel'"
          severity="secondary"
          (onClick)="onCancel()">
        </p-button>
        <p-button
          [label]="data.confirmText || 'Confirm'"
          (onClick)="onConfirm()">
        </p-button>
      </div>
    </div>
  `,
  styles: [`
    .confirm-dialog-content {
      min-width: 300px;
    }

    .message {
      margin: 0 0 1.5rem 0;
      line-height: 1.5;
    }

    .dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
    }
  `]
})
export class ConfirmDialogComponent {
  private readonly dialogRef = inject(DynamicDialogRef);
  private readonly dialogConfig = inject(DynamicDialogConfig);

  readonly data: ConfirmDialogData = this.dialogConfig.data;

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
