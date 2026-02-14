import { beforeEach, describe, expect, it, vitest } from 'vitest';
import { HttpResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { of } from 'rxjs';

import { DeliveryService } from '../service/delivery.service';

import { DeliveryDeleteDialog } from './delivery-delete-dialog';

describe('Delivery Management Delete Component', () => {
  let comp: DeliveryDeleteDialog;
  let fixture: ComponentFixture<DeliveryDeleteDialog>;
  let service: DeliveryService;
  let mockActiveModal: NgbActiveModal;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NgbActiveModal],
    });
    fixture = TestBed.createComponent(DeliveryDeleteDialog);
    comp = fixture.componentInstance;
    service = TestBed.inject(DeliveryService);
    mockActiveModal = TestBed.inject(NgbActiveModal);
  });

  describe('confirmDelete', () => {
    it('should call delete service on confirmDelete', () => {
      // GIVEN
      vitest.spyOn(service, 'delete').mockReturnValue(of(new HttpResponse({ body: {} })));
      vitest.spyOn(mockActiveModal, 'close');

      // WHEN
      comp.confirmDelete(123);

      // THEN
      expect(service.delete).toHaveBeenCalledWith(123);
      expect(mockActiveModal.close).toHaveBeenCalledWith('deleted');
    });

    it('should not call delete service on clear', () => {
      // GIVEN
      vitest.spyOn(service, 'delete');
      vitest.spyOn(mockActiveModal, 'close');
      vitest.spyOn(mockActiveModal, 'dismiss');

      // WHEN
      comp.cancel();

      // THEN
      expect(service.delete).not.toHaveBeenCalled();
      expect(mockActiveModal.close).not.toHaveBeenCalled();
      expect(mockActiveModal.dismiss).toHaveBeenCalled();
    });
  });
});
