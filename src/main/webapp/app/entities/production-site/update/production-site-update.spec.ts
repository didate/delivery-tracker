import { beforeEach, describe, expect, it, vitest } from 'vitest';
import { HttpResponse } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { Subject, from, of } from 'rxjs';

import { IProductionSite } from '../production-site.model';
import { ProductionSiteService } from '../service/production-site.service';

import { ProductionSiteFormService } from './production-site-form.service';
import { ProductionSiteUpdate } from './production-site-update';

describe('ProductionSite Management Update Component', () => {
  let comp: ProductionSiteUpdate;
  let fixture: ComponentFixture<ProductionSiteUpdate>;
  let activatedRoute: ActivatedRoute;
  let productionSiteFormService: ProductionSiteFormService;
  let productionSiteService: ProductionSiteService;

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

    fixture = TestBed.createComponent(ProductionSiteUpdate);
    activatedRoute = TestBed.inject(ActivatedRoute);
    productionSiteFormService = TestBed.inject(ProductionSiteFormService);
    productionSiteService = TestBed.inject(ProductionSiteService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('should update editForm', () => {
      const productionSite: IProductionSite = { id: 9041 };

      activatedRoute.data = of({ productionSite });
      comp.ngOnInit();

      expect(comp.productionSite).toEqual(productionSite);
    });
  });

  describe('save', () => {
    it('should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IProductionSite>>();
      const productionSite = { id: 20528 };
      vitest.spyOn(productionSiteFormService, 'getProductionSite').mockReturnValue(productionSite);
      vitest.spyOn(productionSiteService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ productionSite });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(new HttpResponse({ body: productionSite }));
      saveSubject.complete();

      // THEN
      expect(productionSiteFormService.getProductionSite).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(productionSiteService.update).toHaveBeenCalledWith(expect.objectContaining(productionSite));
      expect(comp.isSaving()).toEqual(false);
    });

    it('should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IProductionSite>>();
      const productionSite = { id: 20528 };
      vitest.spyOn(productionSiteFormService, 'getProductionSite').mockReturnValue({ id: null });
      vitest.spyOn(productionSiteService, 'create').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ productionSite: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.next(new HttpResponse({ body: productionSite }));
      saveSubject.complete();

      // THEN
      expect(productionSiteFormService.getProductionSite).toHaveBeenCalled();
      expect(productionSiteService.create).toHaveBeenCalled();
      expect(comp.isSaving()).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IProductionSite>>();
      const productionSite = { id: 20528 };
      vitest.spyOn(productionSiteService, 'update').mockReturnValue(saveSubject);
      vitest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ productionSite });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving()).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(productionSiteService.update).toHaveBeenCalled();
      expect(comp.isSaving()).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });
});
