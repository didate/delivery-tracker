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
import { SidebarItem, SidebarChildItem } from './sidebar-item.model';
import { SidebarMenuItems } from './sidebar-menu.config';

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
  readonly version: string;
  account = inject(AccountService).trackCurrentAccount();

  // Menu items from configuration
  readonly menuItems: SidebarItem[] = SidebarMenuItems;

  // Track open/closed state of dropdowns
  dropdownState: Record<string, boolean> = {};

  readonly sidebarService = inject(SidebarService);
  private readonly accountService = inject(AccountService);
  private readonly profileService = inject(ProfileService);
  private readonly router = inject(Router);

  constructor() {
    const { VERSION } = environment;
    if (VERSION) {
      this.version = VERSION.toLowerCase().startsWith('v') ? VERSION : `v${VERSION}`;
    } else {
      this.version = '';
    }

    // Initialize all dropdowns as open
    for (const item of this.menuItems) {
      if (item.isDropdown && item.dropdownId) {
        this.dropdownState[item.dropdownId] = true;
      }
    }
  }

  ngOnInit(): void {
    this.profileService.getProfileInfo().subscribe(profileInfo => {
      this.inProduction.set(profileInfo.inProduction ?? true);
      this.openAPIEnabled.set(profileInfo.openAPIEnabled ?? false);
    });
  }

  collapseNavbar(): void {
    // Only collapse on mobile (lg breakpoint is 1024px in Tailwind)
    if (window.innerWidth < 1024) {
      this.sidebarService.collapse();
      this.isNavbarCollapsed.set(true);
    }
  }

  toggleNavbar(): void {
    this.sidebarService.toggle();
    this.isNavbarCollapsed.update(isNavbarCollapsed => !isNavbarCollapsed);
  }

  toggleDropdown(dropdownId: string): void {
    this.dropdownState[dropdownId] = !this.dropdownState[dropdownId];
  }

  isDropdownOpen(dropdownId: string): boolean {
    return this.dropdownState[dropdownId] ?? false;
  }

  hasAuthority(item: SidebarItem | SidebarChildItem): boolean {
    if (!item.authorities || item.authorities.length === 0) {
      return true;
    }
    return this.accountService.hasAnyAuthority(item.authorities);
  }

  // Check if any children are visible for a dropdown
  hasVisibleChildren(item: SidebarItem): boolean {
    if (!item.children) {
      return false;
    }
    return item.children.some(child => this.hasAuthority(child));
  }

  // Special checks for admin menu items
  shouldShowAdminItem(item: SidebarChildItem): boolean {
    if (item.name === 'API') {
      return this.openAPIEnabled();
    }
    return true;
  }
}
