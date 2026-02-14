import { Component } from '@angular/core';

import { TranslateDirective } from 'app/shared/language';

@Component({
  selector: 'jhi-footer',
  standalone: true,
  templateUrl: './footer.html',
  imports: [TranslateDirective],
})
export default class Footer {}
