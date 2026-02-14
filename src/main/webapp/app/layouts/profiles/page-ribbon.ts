import { Component, Injector, OnInit, Signal, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { TranslateDirective } from 'app/shared/language';

import { ProfileService } from './profile.service';

@Component({
  selector: 'jhi-page-ribbon',
  standalone: true,
  template: `
    @if (ribbonEnvSignal?.(); as ribbonEnv) {
      <div class="fixed top-10 -left-10 z-50 rotate-[-45deg] pointer-events-none">
        <a
          href=""
          class="block bg-red-600/75 text-white text-center py-2 px-12 text-sm font-medium shadow-md pointer-events-none"
          [jhiTranslate]="'global.ribbon.' + (ribbonEnv ?? '')"
        >
          {{ { dev: 'Developpement' }[ribbonEnv ?? ''] }}
        </a>
      </div>
    }
  `,
  imports: [TranslateDirective, TranslateModule],
})
export default class PageRibbon implements OnInit {
  ribbonEnvSignal?: Signal<string | undefined>;
  private readonly injector = inject(Injector);
  private readonly profileService = inject(ProfileService);

  ngOnInit(): void {
    const ribbonEnv$: Observable<string | undefined> = this.profileService.getProfileInfo().pipe(map(profileInfo => profileInfo.ribbonEnv));
    this.ribbonEnvSignal = toSignal(ribbonEnv$, { injector: this.injector });
  }
}
