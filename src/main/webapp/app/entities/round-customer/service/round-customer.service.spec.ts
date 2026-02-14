import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { IRoundCustomer } from '../round-customer.model';
import { sampleWithFullData, sampleWithNewData, sampleWithPartialData, sampleWithRequiredData } from '../round-customer.test-samples';

import { RestRoundCustomer, RoundCustomerService } from './round-customer.service';

const requireRestSample: RestRoundCustomer = {
  ...sampleWithRequiredData,
  visitTime: sampleWithRequiredData.visitTime?.toJSON(),
};

describe('RoundCustomer Service', () => {
  let service: RoundCustomerService;
  let httpMock: HttpTestingController;
  let expectedResult: IRoundCustomer | IRoundCustomer[] | boolean | null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClientTesting()],
    });
    expectedResult = null;
    service = TestBed.inject(RoundCustomerService);
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

    it('should create a RoundCustomer', () => {
      const roundCustomer = { ...sampleWithNewData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.create(roundCustomer).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'POST' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should update a RoundCustomer', () => {
      const roundCustomer = { ...sampleWithRequiredData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.update(roundCustomer).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PUT' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should partial update a RoundCustomer', () => {
      const patchObject = { ...sampleWithPartialData };
      const returnedFromService = { ...requireRestSample };
      const expected = { ...sampleWithRequiredData };

      service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'PATCH' });
      req.flush(returnedFromService);
      expect(expectedResult).toMatchObject(expected);
    });

    it('should return a list of RoundCustomer', () => {
      const returnedFromService = { ...requireRestSample };

      const expected = { ...sampleWithRequiredData };

      service.query().subscribe(resp => (expectedResult = resp.body));

      const req = httpMock.expectOne({ method: 'GET' });
      req.flush([returnedFromService]);
      httpMock.verify();
      expect(expectedResult).toMatchObject([expected]);
    });

    it('should delete a RoundCustomer', () => {
      const expected = true;

      service.delete(123).subscribe(resp => (expectedResult = resp.ok));

      const req = httpMock.expectOne({ method: 'DELETE' });
      req.flush({ status: 200 });
      expect(expectedResult).toBe(expected);
    });

    describe('addRoundCustomerToCollectionIfMissing', () => {
      it('should add a RoundCustomer to an empty array', () => {
        const roundCustomer: IRoundCustomer = sampleWithRequiredData;
        expectedResult = service.addRoundCustomerToCollectionIfMissing([], roundCustomer);
        expect(expectedResult).toEqual([roundCustomer]);
      });

      it('should not add a RoundCustomer to an array that contains it', () => {
        const roundCustomer: IRoundCustomer = sampleWithRequiredData;
        const roundCustomerCollection: IRoundCustomer[] = [
          {
            ...roundCustomer,
          },
          sampleWithPartialData,
        ];
        expectedResult = service.addRoundCustomerToCollectionIfMissing(roundCustomerCollection, roundCustomer);
        expect(expectedResult).toHaveLength(2);
      });

      it("should add a RoundCustomer to an array that doesn't contain it", () => {
        const roundCustomer: IRoundCustomer = sampleWithRequiredData;
        const roundCustomerCollection: IRoundCustomer[] = [sampleWithPartialData];
        expectedResult = service.addRoundCustomerToCollectionIfMissing(roundCustomerCollection, roundCustomer);
        expect(expectedResult).toHaveLength(2);
        expect(expectedResult).toContain(roundCustomer);
      });

      it('should add only unique RoundCustomer to an array', () => {
        const roundCustomerArray: IRoundCustomer[] = [sampleWithRequiredData, sampleWithPartialData, sampleWithFullData];
        const roundCustomerCollection: IRoundCustomer[] = [sampleWithRequiredData];
        expectedResult = service.addRoundCustomerToCollectionIfMissing(roundCustomerCollection, ...roundCustomerArray);
        expect(expectedResult).toHaveLength(3);
      });

      it('should accept varargs', () => {
        const roundCustomer: IRoundCustomer = sampleWithRequiredData;
        const roundCustomer2: IRoundCustomer = sampleWithPartialData;
        expectedResult = service.addRoundCustomerToCollectionIfMissing([], roundCustomer, roundCustomer2);
        expect(expectedResult).toEqual([roundCustomer, roundCustomer2]);
      });

      it('should accept null and undefined values', () => {
        const roundCustomer: IRoundCustomer = sampleWithRequiredData;
        expectedResult = service.addRoundCustomerToCollectionIfMissing([], null, roundCustomer, undefined);
        expect(expectedResult).toEqual([roundCustomer]);
      });

      it('should return initial array if no RoundCustomer is added', () => {
        const roundCustomerCollection: IRoundCustomer[] = [sampleWithRequiredData];
        expectedResult = service.addRoundCustomerToCollectionIfMissing(roundCustomerCollection, undefined, null);
        expect(expectedResult).toEqual(roundCustomerCollection);
      });
    });

    describe('compareRoundCustomer', () => {
      it('should return true if both entities are null', () => {
        const entity1 = null;
        const entity2 = null;

        const compareResult = service.compareRoundCustomer(entity1, entity2);

        expect(compareResult).toEqual(true);
      });

      it('should return false if one entity is null', () => {
        const entity1 = { id: 5340 };
        const entity2 = null;

        const compareResult1 = service.compareRoundCustomer(entity1, entity2);
        const compareResult2 = service.compareRoundCustomer(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey differs', () => {
        const entity1 = { id: 5340 };
        const entity2 = { id: 21862 };

        const compareResult1 = service.compareRoundCustomer(entity1, entity2);
        const compareResult2 = service.compareRoundCustomer(entity2, entity1);

        expect(compareResult1).toEqual(false);
        expect(compareResult2).toEqual(false);
      });

      it('should return false if primaryKey matches', () => {
        const entity1 = { id: 5340 };
        const entity2 = { id: 5340 };

        const compareResult1 = service.compareRoundCustomer(entity1, entity2);
        const compareResult2 = service.compareRoundCustomer(entity2, entity1);

        expect(compareResult1).toEqual(true);
        expect(compareResult2).toEqual(true);
      });
    });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
