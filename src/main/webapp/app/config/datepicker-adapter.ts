/**
 * Date adapter for dayjs
 */
import { Injectable } from '@angular/core';

import dayjs from 'dayjs/esm';

export interface DateStruct {
  year: number;
  month: number;
  day: number;
}

@Injectable({ providedIn: 'root' })
export class DateDayjsAdapter {
  fromModel(date: dayjs.Dayjs | null): DateStruct | null {
    if (date && dayjs.isDayjs(date) && date.isValid()) {
      return { year: date.year(), month: date.month() + 1, day: date.date() };
    }
    return null;
  }

  toModel(date: DateStruct | null): dayjs.Dayjs | null {
    return date ? dayjs(`${date.year}-${date.month}-${date.day}`) : null;
  }
}
