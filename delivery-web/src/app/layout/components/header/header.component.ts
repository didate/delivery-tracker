import { Component, inject, signal, output, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  template: `
    <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
      <!-- Mobile menu button -->
      <button
        (click)="toggleSidebar.emit()"
        class="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100">
        <i class="pi pi-bars text-lg"></i>
      </button>

      <!-- Logo (mobile) -->
      <a routerLink="/dashboard" class="lg:hidden flex items-center gap-2 text-blue-600 font-bold">
        <i class="pi pi-truck text-xl"></i>
        <span>Delivery</span>
      </a>

      <!-- Spacer -->
      <div class="flex-1 hidden lg:block"></div>

      <!-- User section -->
      <div class="flex items-center gap-3">
        <button class="p-2 rounded-lg text-gray-500 hover:bg-gray-100 relative">
          <i class="pi pi-bell text-lg"></i>
          <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <div class="relative" #userMenuContainer>
          <button
            (click)="toggleUserMenu()"
            class="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <div class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
              {{ userInitials() }}
            </div>
            <span class="hidden md:block text-sm font-medium text-gray-700">{{ currentUser().name }}</span>
            <i class="pi pi-chevron-down text-xs text-gray-400 hidden md:block"></i>
          </button>

          @if (userMenuOpen()) {
            <div class="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              <a
                routerLink="/settings"
                (click)="closeUserMenu()"
                class="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                <i class="pi pi-cog"></i>
                Settings
              </a>
              <div class="border-t border-gray-100 my-1"></div>
              <button
                (click)="onLogout()"
                class="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                <i class="pi pi-sign-out"></i>
                Logout
              </button>
            </div>
          }
        </div>
      </div>
    </header>
  `,
})
export class HeaderComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  toggleSidebar = output<void>();

  readonly userMenuOpen = signal(false);
  readonly currentUser = signal({ name: 'User', email: '' });

  ngOnInit(): void {
    this.loadUserInfo();
  }

  userInitials(): string {
    const name = this.currentUser().name;
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  toggleUserMenu(): void {
    this.userMenuOpen.update(v => !v);
  }

  closeUserMenu(): void {
    this.userMenuOpen.set(false);
  }

  private loadUserInfo(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.currentUser.set({ name: user.name, email: user.email });
    }
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
