import { ApplicationRef, ComponentRef, Injectable, Type, createComponent, inject } from '@angular/core';
import { Subject } from 'rxjs';

export interface ModalRef<T = unknown> {
  componentInstance: T;
  closed: Subject<unknown>;
  close: (result?: unknown) => void;
  dismiss: () => void;
}

@Injectable({ providedIn: 'root' })
export class ModalService {
  private appRef = inject(ApplicationRef);
  private modalContainer: HTMLElement | null = null;
  private currentModalRef: ComponentRef<unknown> | null = null;

  open<T>(component: Type<T>, _options?: { size?: string; backdrop?: string }): ModalRef<T> {
    // Create modal container if it doesn't exist
    if (!this.modalContainer) {
      this.modalContainer = document.createElement('div');
      this.modalContainer.id = 'modal-container';
      document.body.appendChild(this.modalContainer);
    }

    // Create backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'fixed inset-0 bg-black/50 z-50 flex items-center justify-center';

    // Create modal wrapper
    const modalWrapper = document.createElement('div');
    modalWrapper.className = 'bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 z-50';
    backdrop.appendChild(modalWrapper);

    // Create the component
    const componentRef = createComponent(component, {
      environmentInjector: this.appRef.injector,
      hostElement: modalWrapper,
    });

    this.currentModalRef = componentRef;
    this.modalContainer.appendChild(backdrop);
    this.appRef.attachView(componentRef.hostView);

    const closed = new Subject<unknown>();

    const modalRef: ModalRef<T> = {
      componentInstance: componentRef.instance,
      closed,
      close: (result?: unknown) => {
        closed.next(result);
        closed.complete();
        this.cleanup(componentRef, backdrop);
      },
      dismiss: () => {
        closed.complete();
        this.cleanup(componentRef, backdrop);
      },
    };

    // Inject the modalRef into the component if it has activeModal property
    const instance = componentRef.instance as { activeModal?: ModalRef<T> };
    if (instance) {
      instance.activeModal = modalRef;
    }

    return modalRef;
  }

  private cleanup(componentRef: ComponentRef<unknown>, backdrop: HTMLElement): void {
    this.appRef.detachView(componentRef.hostView);
    componentRef.destroy();
    backdrop.remove();
    this.currentModalRef = null;
  }
}
