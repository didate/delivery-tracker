import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import dayjs from 'dayjs/esm';

@Pipe({
  name: 'formatMediumDatetime',
  pure: false,
})
export default class FormatMediumDatetimePipe implements PipeTransform {
  private translateService = inject(TranslateService);

  transform(day: dayjs.Dayjs | string | null | undefined): string {
    if (!day) {
      return '';
    }
    const lang = this.translateService.currentLang || 'fr';
    const format = lang === 'fr' ? 'DD/MM/YY HH:mm' : 'MM/DD/YY HH:mm';
    // Handle both Dayjs objects and string dates
    const dayjsDate = typeof day === 'string' ? dayjs(day) : day;
    return dayjsDate.format(format);
  }
}
