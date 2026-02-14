import { inject, Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import dayjs from 'dayjs/esm';

@Pipe({
  name: 'formatMediumDate',
})
export default class FormatMediumDatePipe implements PipeTransform {
  private translateService = inject(TranslateService);

  transform(day: dayjs.Dayjs | null | undefined): string {
    if (!day) {
      return '';
    }
    const lang = this.translateService.currentLang || 'fr';
    const format = lang === 'fr' ? 'DD/MM/YY' : 'MM/DD/YY';
    return day.format(format);
  }
}
