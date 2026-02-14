import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { AccountService } from 'app/core/auth/account.service';
import { LoginService } from 'app/login/login.service';
import { SidebarService } from '../sidebar/sidebar.service';

@Component({
  selector: 'jhi-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [RouterLink, FontAwesomeModule],
})
export default class HeaderComponent {
  isNavbarCollapsed = signal(true);
  isUserMenuOpen = signal(false);
  account = inject(AccountService).trackCurrentAccount();

  readonly sidebarService = inject(SidebarService);
  private readonly loginService = inject(LoginService);
  private readonly router = inject(Router);

  collapseNavbar(): void {
    this.isNavbarCollapsed.set(true);
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen.update(v => !v);
  }

  closeUserMenu(): void {
    this.isUserMenuOpen.set(false);
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
