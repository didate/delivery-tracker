import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class ActiveModal {
  private closeSubject = new Subject<unknown>();
  private dismissSubject = new Subject<void>();

  closed$ = this.closeSubject.asObservable();
  dismissed$ = this.dismissSubject.asObservable();

  private _onClose?: (result?: unknown) => void;
  private _onDismiss?: () => void;

  setCallbacks(onClose: (result?: unknown) => void, onDismiss: () => void): void {
    this._onClose = onClose;
    this._onDismiss = onDismiss;
  }

  close(result?: unknown): void {
    this.closeSubject.next(result);
    this.closeSubject.complete();
    this._onClose?.(result);
  }

  dismiss(): void {
    this.dismissSubject.next();
    this.dismissSubject.complete();
    this._onDismiss?.();
  }
}
