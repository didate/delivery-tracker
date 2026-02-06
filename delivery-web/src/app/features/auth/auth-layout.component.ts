import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-logo">
          <div class="logo-placeholder">
            <span>Delivery</span>
          </div>
        </div>
        <router-outlet />
      </div>
    </div>
  `,
  styles: `
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--mat-sys-primary-container) 0%, var(--mat-sys-surface) 100%);
      padding: 24px;
    }

    .auth-card {
      width: 100%;
      max-width: 420px;
      background: var(--mat-sys-surface);
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
      overflow: hidden;
    }

    .auth-logo {
      padding: 32px 24px 24px;
      text-align: center;
      border-bottom: 1px solid var(--mat-sys-outline-variant);
    }

    .logo-placeholder {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      font-weight: 600;
      color: var(--mat-sys-primary);
      letter-spacing: -0.5px;
    }
  `,
})
export class AuthLayoutComponent {}
