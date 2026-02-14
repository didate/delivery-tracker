import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  type: 'success' | 'error' | 'warn' | 'info';
  title: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private nextId = 0;
  readonly toasts = signal<Toast[]>([]);

  show(type: Toast['type'], title: string, message: string, duration = 5000): void {
    const id = this.nextId++;
    const toast: Toast = { id, type, title, message };

    this.toasts.update(toasts => [...toasts, toast]);

    setTimeout(() => {
      this.remove(id);
    }, duration);
  }

  success(title: string, message: string): void {
    this.show('success', title, message);
  }

  error(title: string, message: string): void {
    this.show('error', title, message);
  }

  warn(title: string, message: string): void {
    this.show('warn', title, message);
  }

  info(title: string, message: string): void {
    this.show('info', title, message);
  }

  remove(id: number): void {
    this.toasts.update(toasts => toasts.filter(t => t.id !== id));
  }
}
