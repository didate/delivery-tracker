import { beforeEach, describe, expect, it, vitest } from 'vitest';
import { HttpResponse } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Subject, from, of } from 'rxjs';

import { IDriver } from 'app/entities/driver/driver.model';
import { DriverService } from 'app/entities/driver/service/driver.service';
import { IRound } from '../round.model';
import { RoundService } from '../service/round.service';

import { RoundFormService } from './round-form.service';
import { RoundUpdate } from './round-update';

describe('Round Management Update Component', () => {
  let comp: RoundUpdate;
  let fixture: ComponentFixture<RoundUpdate>;
  let activatedRoute: ActivatedRoute;
  let roundFormService: RoundFormService;
  let roundService: RoundService;
  let driverService: DriverService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: {
            params: from([{}]),
          },
        },
      ],
    });

    fixture = TestBed.createComponent(RoundUpdate);
    activatedRoute = TestBed.inject(ActivatedRoute);
    roundFormService = TestBed.inject(RoundFormService);
    roundService = TestBed.inject(RoundService);
    driverService = TestBed.inject(DriverService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call Driver query and add missing value', () => {
      const round: IRound = { id: 13350 };
      const driver: IDriver = { id: 27475 };
      round.driver = driver;

      const driverCollection: IDriver[] = [{ id: 27475 }];
      vitest.spyOn(driverService, 'query').mockReturnValue(of(new HttpResponse({ body: driverCollection })));
      const additionalDrivers = [driver];
      const expectedCollection: IDriver[] = [...additionalDrivers, ...driverCollection];
      vitest.spyOn(driverService, 'addDriverToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ round });
      comp.ngOnInit();

      expect(driverService.query).toHaveBeenCalled();
      expect(driverService.addDriverToCollectionIfMissing).toHaveBeenCalledWith(
        driverCollection,
        ...additionalDrivers.map(i => expect.objectContaining(i) as typeof i),
      );
      expect(comp.driversSharedCollection()).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const round: IRound = { id: 13350 };
      const driver: IDriver = { id: 27475 };
      round.driver = driver;

      activatedRoute.data = of({ round });
      comp.ngOnInit();

      expect(comp.driversSharedCollection()).toContainEqual(driver);
      expect(comp.round).toEqual(round);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IRound>>();
      const round = { id: 19799 };
      vitest.spyOn(roundFormService, 'getRound').mockReturnValue(round);
      vitest.spyOn(roundService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ round });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(new HttpResponse({ body: round }));
      saveSubject.complete();

      // THEN
      expect(roundFormService.getRound).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(roundService.update).toHaveBeenCalledWith(expect.objectContaining(round));
      expect(comp.isSaving()).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IRound>>();
      const round = { id: 19799 };
      vitest.spyOn(roundFormService, 'getRound').mockReturnValue({ id: null });
      vitest.spyOn(roundService, 'create').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ round: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(new HttpResponse({ body: round }));
      saveSubject.complete();

      // THEN
      expect(roundFormService.getRound).toHaveBeenCalled();
      expect(roundService.create).toHaveBeenCalled();
      expect(comp.isSaving()).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IRound>>();
      const round = { id: 19799 };
      vitest.spyOn(roundService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ round });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(roundService.update).toHaveBeenCalled();
      expect(comp.isSaving()).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareDriver', () => {
      it('should forward to driverService', () => {
        const entity = { id: 27475 };
        const entity2 = { id: 7800 };
        vitest.spyOn(driverService, 'compareDriver');
        comp.compareDriver(entity, entity2);
        expect(driverService.compareDriver).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
