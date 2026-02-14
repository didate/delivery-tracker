import { NgClass } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from 'environments/environment';

import { AccountService } from 'app/core/auth/account.service';
import { ProfileService } from 'app/layouts/profiles/profile.service';
import HasAnyAuthorityDirective from 'app/shared/auth/has-any-authority.directive';
import { TranslateDirective } from 'app/shared/language';
import { SidebarService } from './sidebar.service';

@Component({
  selector: 'jhi-sidebar',
  standalone: true,
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  imports: [RouterLink, RouterLinkActive, FontAwesomeModule, HasAnyAuthorityDirective, TranslateDirective, TranslateModule, NgClass],
})
export default class SidebarComponent implements OnInit {
  inProduction = signal(true);
  isNavbarCollapsed = signal(true);
  openAPIEnabled = signal(false);
  isEntitiesOpen = signal(true);
  isAdminOpen = signal(true);
  readonly version: string;
  account = inject(AccountService).trackCurrentAccount();

  readonly sidebarService = inject(SidebarService);
  private readonly profileService = inject(ProfileService);
  private readonly router = inject(Router);

  constructor() {
    const { VERSION } = environment;
    if (VERSION) {
      this.version = VERSION.toLowerCase().startsWith('v') ? VERSION : `v${VERSION}`;
    } else {
      this.version = '';
    }
  }

  ngOnInit(): void {
    this.profileService.getProfileInfo().subscribe(profileInfo => {
      this.inProduction.set(profileInfo.inProduction ?? true);
      this.openAPIEnabled.set(profileInfo.openAPIEnabled ?? false);
    });
  }

  collapseNavbar(): void {
    this.isNavbarCollapsed.set(true);
  }

  toggleNavbar(): void {
    this.isNavbarCollapsed.update(isNavbarCollapsed => !isNavbarCollapsed);
  }

  toggleEntities(): void {
    this.isEntitiesOpen.update(v => !v);
  }

  toggleAdmin(): void {
    this.isAdminOpen.update(v => !v);
  }
}
