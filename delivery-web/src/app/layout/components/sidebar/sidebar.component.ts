import { Component, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    MatListModule,
    MatIconModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  navigationClick = output<void>();

  readonly navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'home', route: '/dashboard' },
    { label: 'Customers', icon: 'people', route: '/customers' },
    { label: 'Drivers', icon: 'local_shipping', route: '/drivers' },
    { label: 'Products', icon: 'inventory', route: '/products' },
    { label: 'Deliveries', icon: 'receipt', route: '/deliveries' },
    { label: 'Returns', icon: 'assignment_return', route: '/returns' },
    { label: 'Payments', icon: 'payments', route: '/payments' },
    { label: 'Rounds', icon: 'route', route: '/rounds' },
    { label: 'Settings', icon: 'settings', route: '/settings' }
  ];

  onNavItemClick(): void {
    this.navigationClick.emit();
  }
}
