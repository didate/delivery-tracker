import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  routerLink: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside
      class="fixed left-0 top-0 z-40 h-screen transition-transform bg-white border-r border-gray-200"
      [class.translate-x-0]="isOpen()"
      [class.-translate-x-full]="!isOpen()"
      [class.md:translate-x-0]="true"
      [style.width.px]="280">

      <!-- Logo Section -->
      <div class="flex items-center justify-between h-16 px-4 border-b border-gray-200">
        <a routerLink="/dashboard" class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
            <i class="pi pi-truck text-white text-lg"></i>
          </div>
          <span class="text-lg font-bold text-gray-900">Delivery</span>
        </a>
        <button
          (click)="closeSidebar.emit()"
          class="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100">
          <i class="pi pi-times"></i>
        </button>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
        @for (item of navItems; track item.routerLink) {
          <a
            [routerLink]="item.routerLink"
            routerLinkActive="bg-blue-50 text-blue-700 border-blue-600"
            [routerLinkActiveOptions]="{exact: item.routerLink === '/dashboard'}"
            class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors border-l-4 border-transparent"
            (click)="onNavClick()">
            <i [class]="item.icon" class="text-lg"></i>
            <span class="font-medium">{{ item.label }}</span>
          </a>
        }
      </nav>

      <!-- User Section -->
      <div class="p-4 border-t border-gray-200">
        <div class="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-50">
          <div class="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
            {{ getUserInitials() }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">{{ userName }}</p>
            <p class="text-xs text-gray-500 truncate">{{ userEmail }}</p>
          </div>
          <button
            (click)="onLogout()"
            class="p-2 rounded-lg text-gray-500 hover:bg-gray-200 hover:text-red-600 transition-colors"
            title="Logout">
            <i class="pi pi-sign-out"></i>
          </button>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class SidebarComponent {
  private readonly authService = inject(AuthService);

  isOpen = input<boolean>(false);
  closeSidebar = output<void>();

  userName = '';
  userEmail = '';

  readonly navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'pi pi-home', routerLink: '/dashboard' },
    { label: 'Customers', icon: 'pi pi-users', routerLink: '/customers' },
    { label: 'Products', icon: 'pi pi-box', routerLink: '/products' },
    { label: 'Drivers', icon: 'pi pi-car', routerLink: '/drivers' },
    { label: 'Deliveries', icon: 'pi pi-truck', routerLink: '/deliveries' },
    { label: 'Returns', icon: 'pi pi-replay', routerLink: '/returns' },
    { label: 'Payments', icon: 'pi pi-credit-card', routerLink: '/payments' },
    { label: 'Rounds', icon: 'pi pi-map', routerLink: '/rounds' },
    { label: 'Settings', icon: 'pi pi-cog', routerLink: '/settings' },
  ];

  constructor() {
    const user = this.authService.currentUser();
    if (user) {
      this.userName = user.name;
      this.userEmail = user.email;
    }
  }

  getUserInitials(): string {
    const user = this.authService.currentUser();
    if (user && user.name) {
      const parts = user.name.split(' ');
      return parts.map(p => p[0]).join('').toUpperCase().slice(0, 2);
    }
    return 'U';
  }

  onNavClick(): void {
    if (window.innerWidth < 768) {
      this.closeSidebar.emit();
    }
  }

  onLogout(): void {
    this.authService.logout();
  }
}
