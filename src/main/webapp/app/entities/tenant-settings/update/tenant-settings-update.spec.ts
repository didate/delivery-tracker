import { beforeEach, describe, expect, it, vitest } from 'vitest';
import { HttpResponse } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Subject, from, of } from 'rxjs';

import { TenantService } from 'app/entities/tenant/service/tenant.service';
import { ITenant } from 'app/entities/tenant/tenant.model';
import { TenantSettingsService } from '../service/tenant-settings.service';
import { ITenantSettings } from '../tenant-settings.model';

import { TenantSettingsFormService } from './tenant-settings-form.service';
import { TenantSettingsUpdate } from './tenant-settings-update';

describe('TenantSettings Management Update Component', () => {
  let comp: TenantSettingsUpdate;
  let fixture: ComponentFixture<TenantSettingsUpdate>;
  let activatedRoute: ActivatedRoute;
  let tenantSettingsFormService: TenantSettingsFormService;
  let tenantSettingsService: TenantSettingsService;
  let tenantService: TenantService;

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

    fixture = TestBed.createComponent(TenantSettingsUpdate);
    activatedRoute = TestBed.inject(ActivatedRoute);
    tenantSettingsFormService = TestBed.inject(TenantSettingsFormService);
    tenantSettingsService = TestBed.inject(TenantSettingsService);
    tenantService = TestBed.inject(TenantService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should call Tenant query and add missing value', () => {
      const tenantSettings: ITenantSettings = { id: 16316 };
      const tenant: ITenant = { id: 2662 };
      tenantSettings.tenant = tenant;

      const tenantCollection: ITenant[] = [{ id: 2662 }];
      vitest.spyOn(tenantService, 'query').mockReturnValue(of(new HttpResponse({ body: tenantCollection })));
      const additionalTenants = [tenant];
      const expectedCollection: ITenant[] = [...additionalTenants, ...tenantCollection];
      vitest.spyOn(tenantService, 'addTenantToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ tenantSettings });
      comp.ngOnInit();

      expect(tenantService.query).toHaveBeenCalled();
      expect(tenantService.addTenantToCollectionIfMissing).toHaveBeenCalledWith(
        tenantCollection,
        ...additionalTenants.map(i => expect.objectContaining(i) as typeof i),
      );
      expect(comp.tenantsSharedCollection()).toEqual(expectedCollection);
    });

    it('should update editForm', () => {
      const tenantSettings: ITenantSettings = { id: 16316 };
      const tenant: ITenant = { id: 2662 };
      tenantSettings.tenant = tenant;

      activatedRoute.data = of({ tenantSettings });
      comp.ngOnInit();

      expect(comp.tenantsSharedCollection()).toContainEqual(tenant);
      expect(comp.tenantSettings).toEqual(tenantSettings);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ITenantSettings>>();
      const tenantSettings = { id: 15390 };
      vitest.spyOn(tenantSettingsFormService, 'getTenantSettings').mockReturnValue(tenantSettings);
      vitest.spyOn(tenantSettingsService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ tenantSettings });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(new HttpResponse({ body: tenantSettings }));
      saveSubject.complete();

      // THEN
      expect(tenantSettingsFormService.getTenantSettings).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(tenantSettingsService.update).toHaveBeenCalledWith(expect.objectContaining(tenantSettings));
      expect(comp.isSaving()).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ITenantSettings>>();
      const tenantSettings = { id: 15390 };
      vitest.spyOn(tenantSettingsFormService, 'getTenantSettings').mockReturnValue({ id: null });
      vitest.spyOn(tenantSettingsService, 'create').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ tenantSettings: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(new HttpResponse({ body: tenantSettings }));
      saveSubject.complete();

      // THEN
      expect(tenantSettingsFormService.getTenantSettings).toHaveBeenCalled();
      expect(tenantSettingsService.create).toHaveBeenCalled();
      expect(comp.isSaving()).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ITenantSettings>>();
      const tenantSettings = { id: 15390 };
      vitest.spyOn(tenantSettingsService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ tenantSettings });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(tenantSettingsService.update).toHaveBeenCalled();
      expect(comp.isSaving()).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareTenant', () => {
      it('should forward to tenantService', () => {
        const entity = { id: 2662 };
        const entity2 = { id: 17495 };
        vitest.spyOn(tenantService, 'compareTenant');
        comp.compareTenant(entity, entity2);
        expect(tenantService.compareTenant).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
