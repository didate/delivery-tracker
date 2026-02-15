import { beforeEach, describe, expect, it, vitest } from 'vitest';
import { HttpResponse } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Subject, from, of } from 'rxjs';

import { VehicleService } from 'app/entities/vehicle/service/vehicle.service';
import { IVehicle } from 'app/entities/vehicle/vehicle.model';
import { IDriver } from '../driver.model';
import { DriverService } from '../service/driver.service';

import { DriverFormService } from './driver-form.service';
import { DriverUpdate } from './driver-update';

describe('Driver Management Update Component', () => {
  let comp: DriverUpdate;
  let fixture: ComponentFixture<DriverUpdate>;
  let activatedRoute: ActivatedRoute;
  let driverFormService: DriverFormService;
  let driverService: DriverService;
  let vehicleService: VehicleService;

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

    fixture = TestBed.createComponent(DriverUpdate);
    activatedRoute = TestBed.inject(ActivatedRoute);
    driverFormService = TestBed.inject(DriverFormService);
    driverService = TestBed.inject(DriverService);
    vehicleService = TestBed.inject(VehicleService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call Vehicle query and add missing value', () => {
      const driver: IDriver = { id: 7800 };
      const vehicle: IVehicle = { id: 18638 };
      driver.vehicle = vehicle;

      const vehicleCollection: IVehicle[] = [{ id: 18638 }];
      vitest.spyOn(vehicleService, 'query').mockReturnValue(of(new HttpResponse({ body: vehicleCollection })));
      const additionalVehicles = [vehicle];
      const expectedCollection: IVehicle[] = [...additionalVehicles, ...vehicleCollection];
      vitest.spyOn(vehicleService, 'addVehicleToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ driver });
      comp.ngOnInit();

      expect(vehicleService.query).toHaveBeenCalled();
      expect(vehicleService.addVehicleToCollectionIfMissing).toHaveBeenCalledWith(
        vehicleCollection,
        ...additionalVehicles.map(i => expect.objectContaining(i) as typeof i),
      );
      expect(comp.vehiclesSharedCollection()).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const driver: IDriver = { id: 7800 };
      const vehicle: IVehicle = { id: 18638 };
      driver.vehicle = vehicle;

      activatedRoute.data = of({ driver });
      comp.ngOnInit();

      expect(comp.vehiclesSharedCollection()).toContainEqual(vehicle);
      expect(comp.driver).toEqual(driver);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IDriver>>();
      const driver = { id: 27475 };
      vitest.spyOn(driverFormService, 'getDriver').mockReturnValue(driver);
      vitest.spyOn(driverService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ driver });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(new HttpResponse({ body: driver }));
      saveSubject.complete();

      // THEN
      expect(driverFormService.getDriver).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(driverService.update).toHaveBeenCalledWith(expect.objectContaining(driver));
      expect(comp.isSaving()).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IDriver>>();
      const driver = { id: 27475 };
      vitest.spyOn(driverFormService, 'getDriver').mockReturnValue({ id: null });
      vitest.spyOn(driverService, 'create').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ driver: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(new HttpResponse({ body: driver }));
      saveSubject.complete();

      // THEN
      expect(driverFormService.getDriver).toHaveBeenCalled();
      expect(driverService.create).toHaveBeenCalled();
      expect(comp.isSaving()).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IDriver>>();
      const driver = { id: 27475 };
      vitest.spyOn(driverService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ driver });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(driverService.update).toHaveBeenCalled();
      expect(comp.isSaving()).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareVehicle', () => {
      it('should forward to vehicleService', () => {
        const entity = { id: 18638 };
        const entity2 = { id: 22559 };
        vitest.spyOn(vehicleService, 'compareVehicle');
        comp.compareVehicle(entity, entity2);
        expect(vehicleService.compareVehicle).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
