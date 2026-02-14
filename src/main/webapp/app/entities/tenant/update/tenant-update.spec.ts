import { beforeEach, describe, expect, it, vitest } from 'vitest';
import { HttpResponse } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Subject, from, of } from 'rxjs';

import { TenantService } from '../service/tenant.service';
import { ITenant } from '../tenant.model';

import { TenantFormService } from './tenant-form.service';
import { TenantUpdate } from './tenant-update';

describe('Tenant Management Update Component', () => {
  let comp: TenantUpdate;
  let fixture: ComponentFixture<TenantUpdate>;
  let activatedRoute: ActivatedRoute;
  let tenantFormService: TenantFormService;
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

    fixture = TestBed.createComponent(TenantUpdate);
    activatedRoute = TestBed.inject(ActivatedRoute);
    tenantFormService = TestBed.inject(TenantFormService);
    tenantService = TestBed.inject(TenantService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should update editForm', () => {
      const tenant: ITenant = { id: 17495 };

      activatedRoute.data = of({ tenant });
      comp.ngOnInit();

      expect(comp.tenant).toEqual(tenant);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ITenant>>();
      const tenant = { id: 2662 };
      vitest.spyOn(tenantFormService, 'getTenant').mockReturnValue(tenant);
      vitest.spyOn(tenantService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ tenant });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(new HttpResponse({ body: tenant }));
      saveSubject.complete();

      // THEN
      expect(tenantFormService.getTenant).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(tenantService.update).toHaveBeenCalledWith(expect.objectContaining(tenant));
      expect(comp.isSaving()).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ITenant>>();
      const tenant = { id: 2662 };
      vitest.spyOn(tenantFormService, 'getTenant').mockReturnValue({ id: null });
      vitest.spyOn(tenantService, 'create').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ tenant: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(new HttpResponse({ body: tenant }));
      saveSubject.complete();

      // THEN
      expect(tenantFormService.getTenant).toHaveBeenCalled();
      expect(tenantService.create).toHaveBeenCalled();
      expect(comp.isSaving()).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ITenant>>();
      const tenant = { id: 2662 };
      vitest.spyOn(tenantService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ tenant });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(tenantService.update).toHaveBeenCalled();
      expect(comp.isSaving()).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });
});
