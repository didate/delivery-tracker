import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import dayjs from 'dayjs/esm';
import { Observable, map } from 'rxjs';

import { DATE_FORMAT } from 'app/config/input.constants';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { isPresent } from 'app/core/util/operators';
import { IRound, NewRound } from '../round.model';

export type PartialUpdateRound = Partial<IRound> & Pick<IRound, 'id'>;

type RestOf<T extends IRound | NewRound> = Omit<T, 'roundDate' | 'startTime' | 'endTime'> & {
  roundDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
};

export type RestRound = RestOf<IRound>;

export type NewRestRound = RestOf<NewRound>;

export type PartialUpdateRestRound = RestOf<PartialUpdateRound>;

export type EntityResponseType = HttpResponse<IRound>;
export type EntityArrayResponseType = HttpResponse<IRound[]>;

@Injectable({ providedIn: 'root' })
export class RoundService {
  protected readonly http = inject(HttpClient);
  protected readonly applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/rounds');

  create(round: NewRound): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(round);
    return this.http.post<RestRound>(this.resourceUrl, copy, { observe: 'response' }).pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(round: IRound): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(round);
    return this.http
      .put<RestRound>(`${this.resourceUrl}/${encodeURIComponent(this.getRoundIdentifier(round))}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(round: PartialUpdateRound): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(round);
    return this.http
      .patch<RestRound>(`${this.resourceUrl}/${encodeURIComponent(this.getRoundIdentifier(round))}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestRound>(`${this.resourceUrl}/${encodeURIComponent(id)}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestRound[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${encodeURIComponent(id)}`, { observe: 'response' });
  }

  getRoundIdentifier(round: Pick<IRound, 'id'>): number {
    return round.id;
  }

  compareRound(o1: Pick<IRound, 'id'> | null, o2: Pick<IRound, 'id'> | null): boolean {
    return o1 && o2 ? this.getRoundIdentifier(o1) === this.getRoundIdentifier(o2) : o1 === o2;
  }

  addRoundToCollectionIfMissing<Type extends Pick<IRound, 'id'>>(
    roundCollection: Type[],
    ...roundsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const rounds: Type[] = roundsToCheck.filter(isPresent);
    if (rounds.length > 0) {
      const roundCollectionIdentifiers = roundCollection.map(roundItem => this.getRoundIdentifier(roundItem));
      const roundsToAdd = rounds.filter(roundItem => {
        const roundIdentifier = this.getRoundIdentifier(roundItem);
        if (roundCollectionIdentifiers.includes(roundIdentifier)) {
          return false;
        }
        roundCollectionIdentifiers.push(roundIdentifier);
        return true;
      });
      return [...roundsToAdd, ...roundCollection];
    }
    return roundCollection;
  }

  protected convertDateFromClient<T extends IRound | NewRound | PartialUpdateRound>(round: T): RestOf<T> {
    return {
      ...round,
      roundDate: round.roundDate?.format(DATE_FORMAT) ?? null,
      startTime: round.startTime?.toJSON() ?? null,
      endTime: round.endTime?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restRound: RestRound): IRound {
    return {
      ...restRound,
      roundDate: restRound.roundDate ? dayjs(restRound.roundDate) : undefined,
      startTime: restRound.startTime ? dayjs(restRound.startTime) : undefined,
      endTime: restRound.endTime ? dayjs(restRound.endTime) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestRound>): HttpResponse<IRound> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestRound[]>): HttpResponse<IRound[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
