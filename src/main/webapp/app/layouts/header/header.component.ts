import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateService } from '@ngx-translate/core';

import { AccountService } from 'app/core/auth/account.service';
import { LANGUAGES } from 'app/config/language.constants';
import { LoginService } from 'app/login/login.service';
import FindLanguageFromKeyPipe from 'app/shared/language/find-language-from-key.pipe';
import { SidebarService } from '../sidebar/sidebar.service';

@Component({
  selector: 'jhi-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [RouterLink, FontAwesomeModule, FindLanguageFromKeyPipe],
})
export default class HeaderComponent {
  isNavbarCollapsed = signal(true);
  isUserMenuOpen = signal(false);
  isLanguageMenuOpen = signal(false);
  languages = LANGUAGES;
  account = inject(AccountService).trackCurrentAccount();

  readonly sidebarService = inject(SidebarService);
  private readonly loginService = inject(LoginService);
  private readonly translateService = inject(TranslateService);
  private readonly router = inject(Router);

  get currentLanguage(): string {
    return this.translateService.currentLang;
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
}
