import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MenubarModule,
    ButtonModule,
    AvatarModule,
    MenuModule
  ],
  template: `
    <div class="header-container">
      <p-menubar [model]="menuItems()">
        <ng-template #start>
          <div class="logo" routerLink="/dashboard">
            <i class="pi pi-truck"></i>
            <span>Delivery Manager</span>
          </div>
        </ng-template>
        <ng-template #end>
          <div class="user-section">
            <span class="user-name">{{ currentUser().name }}</span>
            <p-avatar
              [label]="userInitials()"
              shape="circle"
              styleClass="cursor-pointer"
              (click)="userMenu.toggle($event)"
            ></p-avatar>
            <p-menu #userMenu [model]="userMenuItems" [popup]="true"></p-menu>
          </div>
        </ng-template>
      </p-menubar>
    </div>
  `,
  styles: [`
    .header-container {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
    }

    :host ::ng-deep .p-menubar {
      background: white;
      border-radius: 0;
      border: none;
      border-bottom: 1px solid var(--surface-border);
      padding: 0.5rem 1rem;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--primary-color);
      cursor: pointer;
      margin-right: 2rem;
    }

    .logo i {
      font-size: 1.5rem;
    }

    .user-section {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .user-name {
      font-weight: 500;
      color: var(--text-color);
    }

    @media screen and (max-width: 768px) {
      .user-name {
        display: none;
      }
    }
  `]
})
export class HeaderComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  readonly menuItems = signal<MenuItem[]>([]);

  readonly currentUser = signal({
    name: 'User',
    email: ''
  });

  readonly userMenuItems: MenuItem[] = [
    {
      label: 'Profile',
      icon: 'pi pi-user',
      command: () => this.router.navigate(['/settings/profile'])
    },
    {
      label: 'Settings',
      icon: 'pi pi-cog',
      command: () => this.router.navigate(['/settings'])
    },
    { separator: true },
    {
      label: 'Logout',
      icon: 'pi pi-sign-out',
      command: () => this.onLogout()
    }
  ];

  ngOnInit(): void {
    this.loadUserInfo();
    this.initMenuItems();
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

  private loadUserInfo(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.currentUser.set({
        name: user.name,
        email: user.email
      });
    }
  }

  private initMenuItems(): void {
    this.menuItems.set([
      {
        label: 'Dashboard',
        icon: 'pi pi-home',
        routerLink: '/dashboard'
      },
      {
        label: 'Customers',
        icon: 'pi pi-users',
        routerLink: '/customers'
      },
      {
        label: 'Products',
        icon: 'pi pi-box',
        routerLink: '/products'
      },
      {
        label: 'Drivers',
        icon: 'pi pi-car',
        routerLink: '/drivers'
      },
      {
        label: 'Deliveries',
        icon: 'pi pi-truck',
        routerLink: '/deliveries'
      },
      {
        label: 'Payments',
        icon: 'pi pi-credit-card',
        routerLink: '/payments'
      },
      {
        label: 'Returns',
        icon: 'pi pi-replay',
        routerLink: '/returns'
      }
    ]);
  }

  private onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
