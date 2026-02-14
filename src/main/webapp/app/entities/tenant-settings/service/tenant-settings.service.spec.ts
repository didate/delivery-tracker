import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ITenantSettings } from '../tenant-settings.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../tenant-settings.test-samples';

import { TenantSettingsService } from './tenant-settings.service';

const requireRestSample: ITenantSettings = {
  ...sampleWithRequiredData,
};

describe('TenantSettings Service', () => {
  let service: TenantSettingsService;
  let httpMock: HttpTestingController;
  let expectedResult: ITenantSettings | ITenantSettings[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(TenantSettingsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  describe('Service methods', () => {
    it('should find an element', () => {
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.find(123).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should create a TenantSettings', () => {
      const tenantSettings = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(tenantSettings).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a TenantSettings', () => {
      const tenantSettings = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(tenantSettings).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a TenantSettings', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of TenantSettings', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a TenantSettings', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addTenantSettingsToCollectionIfMissing', () => {
      it('should add a TenantSettings to an empty array', () => {
        const tenantSettings: ITenantSettings = sampleWithRequiredData;
        expectedResult = service.addTenantSettingsToCollectionIfMissing([], tenantSettings);
        expect(expectedResult).toEqual([tenantSettings]);
      });

      it('should not add a TenantSettings to an array that contains it', () => {
        const tenantSettings: ITenantSettings = sampleWithRequiredData;
        const tenantSettingsCollection: ITenantSettings[] = [
          {
            ...tenantSettings,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addTenantSettingsToCollectionIfMissing(tenantSettingsCollection, tenantSettings);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a TenantSettings to an array that doesn't contain it", () => {
        const tenantSettings: ITenantSettings = sampleWithRequiredData;
        const tenantSettingsCollection: ITenantSettings[] = [sampleWithPartialData];
        expectedResult = service.addTenantSettingsToCollectionIfMissing(tenantSettingsCollection, tenantSettings);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(tenantSettings);
      });

      it('should add only unique TenantSettings to an array', () => {
        const tenantSettingsArray: ITenantSettings[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const tenantSettingsCollection: ITenantSettings[] = [sampleWithRequiredData];
        expectedResult = service.addTenantSettingsToCollectionIfMissing(tenantSettingsCollection, ...tenantSettingsArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const tenantSettings: ITenantSettings = sampleWithRequiredData;
        const tenantSettings2: ITenantSettings = sampleWithPartialData;
        expectedResult = service.addTenantSettingsToCollectionIfMissing([], tenantSettings, tenantSettings2);
        expect(expectedResult).toEqual([tenantSettings, tenantSettings2]);
      });

      it('should accept null and undefined values', () => {
        const tenantSettings: ITenantSettings = sampleWithRequiredData;
        expectedResult = service.addTenantSettingsToCollectionIfMissing([], null, tenantSettings, undefined);
        expect(expectedResult).toEqual([tenantSettings]);
      });

      it('should return initial array if no TenantSettings is added', () => {
        const tenantSettingsCollection: ITenantSettings[] = [sampleWithRequiredData];
        expectedResult = service.addTenantSettingsToCollectionIfMissing(tenantSettingsCollection, undefined, null);
        expect(expectedResult).toEqual(tenantSettingsCollection);
      });
    });

    describe('compareTenantSettings', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareTenantSettings(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 15390 };
        const entity2 = null;

        const compareResult1 = service.compareTenantSettings(entity1, entity2);
        const compareResult2 = service.compareTenantSettings(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 15390 };
        const entity2 = { id: 16316 };

        const compareResult1 = service.compareTenantSettings(entity1, entity2);
        const compareResult2 = service.compareTenantSettings(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 15390 };
        const entity2 = { id: 15390 };

        const compareResult1 = service.compareTenantSettings(entity1, entity2);
        const compareResult2 = service.compareTenantSettings(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
