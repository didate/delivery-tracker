import { Component, inject, output } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  private readonly router = inject(Router);

  menuToggle = output<void>();

  // These would typically come from an AuthService
  readonly currentUser = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: ''
  };

  readonly tenantName = 'Delivery Co.';

  onMenuToggle(): void {
    this.menuToggle.emit();
  }

  onProfile(): void {
    this.router.navigate(['/settings/profile']);
  }

  onSettings(): void {
    this.router.navigate(['/settings']);
  }

  onLogout(): void {
    // This would typically call an AuthService logout method
    console.log('Logout clicked');
    this.router.navigate(['/auth/login']);
  }
}
