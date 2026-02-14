import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { IProductionSite } from '../production-site.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../production-site.test-samples';

import { ProductionSiteService } from './production-site.service';

const requireRestSample: IProductionSite = {
  ...sampleWithRequiredData,
};

describe('ProductionSite Service', () => {
  let service: ProductionSiteService;
  let httpMock: HttpTestingController;
  let expectedResult: IProductionSite | IProductionSite[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(ProductionSiteService);
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

    it('should create a ProductionSite', () => {
      const productionSite = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(productionSite).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a ProductionSite', () => {
      const productionSite = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(productionSite).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a ProductionSite', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of ProductionSite', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a ProductionSite', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addProductionSiteToCollectionIfMissing', () => {
      it('should add a ProductionSite to an empty array', () => {
        const productionSite: IProductionSite = sampleWithRequiredData;
        expectedResult = service.addProductionSiteToCollectionIfMissing([], productionSite);
        expect(expectedResult).toEqual([productionSite]);
      });

      it('should not add a ProductionSite to an array that contains it', () => {
        const productionSite: IProductionSite = sampleWithRequiredData;
        const productionSiteCollection: IProductionSite[] = [
          {
            ...productionSite,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addProductionSiteToCollectionIfMissing(productionSiteCollection, productionSite);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a ProductionSite to an array that doesn't contain it", () => {
        const productionSite: IProductionSite = sampleWithRequiredData;
        const productionSiteCollection: IProductionSite[] = [sampleWithPartialData];
        expectedResult = service.addProductionSiteToCollectionIfMissing(productionSiteCollection, productionSite);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(productionSite);
      });

      it('should add only unique ProductionSite to an array', () => {
        const productionSiteArray: IProductionSite[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const productionSiteCollection: IProductionSite[] = [sampleWithRequiredData];
        expectedResult = service.addProductionSiteToCollectionIfMissing(productionSiteCollection, ...productionSiteArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const productionSite: IProductionSite = sampleWithRequiredData;
        const productionSite2: IProductionSite = sampleWithPartialData;
        expectedResult = service.addProductionSiteToCollectionIfMissing([], productionSite, productionSite2);
        expect(expectedResult).toEqual([productionSite, productionSite2]);
      });

      it('should accept null and undefined values', () => {
        const productionSite: IProductionSite = sampleWithRequiredData;
        expectedResult = service.addProductionSiteToCollectionIfMissing([], null, productionSite, undefined);
        expect(expectedResult).toEqual([productionSite]);
      });

      it('should return initial array if no ProductionSite is added', () => {
        const productionSiteCollection: IProductionSite[] = [sampleWithRequiredData];
        expectedResult = service.addProductionSiteToCollectionIfMissing(productionSiteCollection, undefined, null);
        expect(expectedResult).toEqual(productionSiteCollection);
      });
    });

    describe('compareProductionSite', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareProductionSite(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 20528 };
        const entity2 = null;

        const compareResult1 = service.compareProductionSite(entity1, entity2);
        const compareResult2 = service.compareProductionSite(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 20528 };
        const entity2 = { id: 9041 };

        const compareResult1 = service.compareProductionSite(entity1, entity2);
        const compareResult2 = service.compareProductionSite(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 20528 };
        const entity2 = { id: 20528 };

        const compareResult1 = service.compareProductionSite(entity1, entity2);
        const compareResult2 = service.compareProductionSite(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
