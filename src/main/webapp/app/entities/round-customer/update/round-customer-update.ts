import { HttpResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { DataUtils, FileLoadError } from 'app/core/util/data-util.service';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { ICustomer } from 'app/entities/customer/customer.model';
import { CustomerService } from 'app/entities/customer/service/customer.service';
import { IRound } from 'app/entities/round/round.model';
import { AlertError } from 'app/shared/alert/alert-error';
import { TranslateDirective } from 'app/shared/language';

import { IRoundCustomer } from '../round-customer.model';
import { RoundCustomerService } from '../service/round-customer.service';

import { RoundCustomerFormGroup, RoundCustomerFormService } from './round-customer-form.service';
import { AlertErrorModel } from 'app/shared/alert/alert-error.model';
import { RoundService } from 'app/entities/round/service/round.service';

@Component({
  selector: 'jhi-round-customer-update',
  templateUrl: './round-customer-update.html',
  imports: [TranslateDirective, TranslateModule, FontAwesomeModule, AlertError, ReactiveFormsModule],
})
export class RoundCustomerUpdate implements OnInit {
  isSaving = signal(false);
  roundCustomer: IRoundCustomer | null = null;

  roundsSharedCollection = signal<IRound[]>([]);
  customersSharedCollection = signal<ICustomer[]>([]);

  protected dataUtils = inject(DataUtils);
  protected eventManager = inject(EventManager);
  protected roundCustomerService = inject(RoundCustomerService);
  protected roundCustomerFormService = inject(RoundCustomerFormService);
  protected roundService = inject(RoundService);
  protected customerService = inject(CustomerService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: RoundCustomerFormGroup = this.roundCustomerFormService.createRoundCustomerFormGroup();

  compareRound = (o1: IRound | null, o2: IRound | null): boolean => this.roundService.compareRound(o1, o2);

  compareCustomer = (o1: ICustomer | null, o2: ICustomer | null): boolean => this.customerService.compareCustomer(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ roundCustomer }) => {
      this.roundCustomer = roundCustomer;
      if (roundCustomer) {
        this.updateForm(roundCustomer);
      }

      this.loadRelationshipsOptions();
    });
  }

  byteSize(base64String: string): string {
    return this.dataUtils.byteSize(base64String);
  }

  openFile(base64String: string, contentType: string | null | undefined): void {
    this.dataUtils.openFile(base64String, contentType);
  }

  setFileData(event: Event, field: string, isImage: boolean): void {
    this.dataUtils.loadFileToForm(event, this.editForm, field, isImage).subscribe({
      error: (err: FileLoadError) =>
        this.eventManager.broadcast(new EventWithContent<AlertErrorModel>('deliveryApp.error', { ...err, key: `error.file.${err.key}` })),
    });
  }

  previousState(): void {
    globalThis.history.back();
  }

  save(): void {
    this.isSaving.set(true);
    const roundCustomer = this.roundCustomerFormService.getRoundCustomer(this.editForm);
    if (roundCustomer.id === null) {
      this.subscribeToSaveResponse(this.roundCustomerService.create(roundCustomer));
    } else {
      this.subscribeToSaveResponse(this.roundCustomerService.update(roundCustomer));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IRoundCustomer>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: () => this.onSaveSuccess(),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveSuccess(): void {
    this.previousState();
  }

  protected onSaveError(): void {
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSaving.set(false);
  }

  protected updateForm(roundCustomer: IRoundCustomer): void {
    this.roundCustomer = roundCustomer;
    this.roundCustomerFormService.resetForm(this.editForm, roundCustomer);

    this.roundsSharedCollection.set(
      this.roundService.addRoundToCollectionIfMissing<IRound>(this.roundsSharedCollection(), roundCustomer.round),
    );
    this.customersSharedCollection.set(
      this.customerService.addCustomerToCollectionIfMissing<ICustomer>(this.customersSharedCollection(), roundCustomer.customer),
    );
  }

  protected loadRelationshipsOptions(): void {
    this.roundService
      .query()
      .pipe(map((res: HttpResponse<IRound[]>) => res.body ?? []))
      .pipe(map((rounds: IRound[]) => this.roundService.addRoundToCollectionIfMissing<IRound>(rounds, this.roundCustomer?.round)))
      .subscribe((rounds: IRound[]) => this.roundsSharedCollection.set(rounds));

    this.customerService
      .query()
      .pipe(map((res: HttpResponse<ICustomer[]>) => res.body ?? []))
      .pipe(
        map((customers: ICustomer[]) =>
          this.customerService.addCustomerToCollectionIfMissing<ICustomer>(customers, this.roundCustomer?.customer),
        ),
      )
      .subscribe((customers: ICustomer[]) => this.customersSharedCollection.set(customers));
  }
}
