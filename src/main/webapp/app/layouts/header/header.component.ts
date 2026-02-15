import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateService } from '@ngx-translate/core';

import { AccountService } from 'app/core/auth/account.service';
import { hasAdminAuthority } from 'app/core/auth/account.model';
import { LANGUAGES } from 'app/config/language.constants';
import { LoginService } from 'app/login/login.service';
import { StateStorageService } from 'app/core/auth/state-storage.service';
import FindLanguageFromKeyPipe from 'app/shared/language/find-language-from-key.pipe';
import { SidebarService } from '../sidebar/sidebar.service';
import { TenantService } from 'app/entities/tenant/service/tenant.service';
import { ITenant } from 'app/entities/tenant/tenant.model';

@Component({
  selector: 'jhi-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [RouterLink, FontAwesomeModule, FindLanguageFromKeyPipe],
})
export default class HeaderComponent implements OnInit {
  isNavbarCollapsed = signal(true);
  isUserMenuOpen = signal(false);
  isLanguageMenuOpen = signal(false);
  isTenantMenuOpen = signal(false);
  languages = LANGUAGES;
  account = inject(AccountService).trackCurrentAccount();
  tenants = signal<ITenant[]>([]);
  currentTenant = signal<ITenant | null>(null);

  readonly sidebarService = inject(SidebarService);
  private readonly loginService = inject(LoginService);
  private readonly translateService = inject(TranslateService);
  private readonly router = inject(Router);
  private readonly tenantService = inject(TenantService);
  private readonly stateStorageService = inject(StateStorageService);
  private readonly accountService = inject(AccountService);

  ngOnInit(): void {
    // Load tenants for admin users
    const acc = this.account();
    if (hasAdminAuthority(acc)) {
      this.loadTenants();
    }
  }

  get currentLanguage(): string {
    return this.translateService.currentLang;
  }

  get isAdmin(): boolean {
    return hasAdminAuthority(this.account());
  }

  collapseNavbar(): void {
    this.isNavbarCollapsed.set(true);
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen.update(v => !v);
  }

  closeUserMenu(): void {
    this.isUserMenuOpen.set(false);
  }

  toggleLanguageMenu(): void {
    this.isLanguageMenuOpen.update(v => !v);
  }

  closeLanguageMenu(): void {
    this.isLanguageMenuOpen.set(false);
  }

  changeLanguage(languageKey: string): void {
    this.translateService.use(languageKey);
    this.closeLanguageMenu();
  }

  login(): void {
    this.router.navigate(['/login']);
  }

  logout(): void {
    this.collapseNavbar();
    this.loginService.logout();
    this.router.navigate(['']);
  }

  toggleNavbar(): void {
    this.isNavbarCollapsed.update(isNavbarCollapsed => !isNavbarCollapsed);
  }

  toggleTenantMenu(): void {
    this.isTenantMenuOpen.update(v => !v);
  }

  closeTenantMenu(): void {
    this.isTenantMenuOpen.set(false);
  }

  loadTenants(): void {
    this.tenantService.getAllActive().subscribe({
      next: response => {
        const tenantList = response.body ?? [];
        this.tenants.set(tenantList);

        // Set current tenant based on account
        const acc = this.account();
        if (acc?.tenantId) {
          const current = tenantList.find(t => t.id === acc.tenantId);
          if (current) {
            this.currentTenant.set(current);
          }
        }
      },
    });
  }

  switchTenant(tenant: ITenant): void {
    if (tenant.id === this.currentTenant()?.id) {
      this.closeTenantMenu();
      return;
    }

    this.tenantService.switchTenant(tenant.id).subscribe({
      next: response => {
        const switchResponse = response.body;
        if (switchResponse) {
          // Check if user used "remember me" (token is in localStorage)
          const rememberMe = localStorage.getItem('jhi-authenticationToken') !== null;

          // Store the new JWT token
          this.stateStorageService.storeAuthenticationToken(switchResponse.id_token, rememberMe);

          // Update current tenant
          this.currentTenant.set(switchResponse.tenant);

          // Refresh account info
          this.accountService.identity(true).subscribe();

          // Close menu
          this.closeTenantMenu();

          // Reload current route to refresh data with new tenant context
          const currentUrl = this.router.url;
          this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            this.router.navigate([currentUrl]);
          });
        }
      },
    });
  }
}
