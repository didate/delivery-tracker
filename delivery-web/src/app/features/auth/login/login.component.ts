import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { PasswordModule } from 'primeng/password';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    InputTextModule,
    ButtonModule,
    CardModule,
    CheckboxModule,
    PasswordModule,
  ],
  template: `
    <div class="login-container">
      <p-card class="login-card">
        <div class="login-content">
          <h1 class="auth-title">Welcome Back</h1>
          <p class="auth-subtitle">Sign in to your account to continue</p>

          @if (errorMessage()) {
            <div class="error-alert">
              <i class="pi pi-exclamation-circle"></i>
              <span>{{ errorMessage() }}</span>
            </div>
          }

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="auth-form">
            <div class="field">
              <label for="email">Email</label>
              <span class="p-input-icon-left w-full">
                <i class="pi pi-envelope"></i>
                <input
                  id="email"
                  type="email"
                  pInputText
                  formControlName="email"
                  placeholder="Enter your email"
                  autocomplete="email"
                  class="w-full"
                  [class.ng-invalid]="loginForm.controls.email.invalid && loginForm.controls.email.touched"
                  [class.ng-dirty]="loginForm.controls.email.touched"
                />
              </span>
              @if (loginForm.controls.email.invalid && loginForm.controls.email.touched) {
                <small class="p-error">{{ getEmailErrorMessage() }}</small>
              }
            </div>

            <div class="field">
              <label for="password">Password</label>
              <p-password
                id="password"
                formControlName="password"
                placeholder="Enter your password"
                [toggleMask]="true"
                [feedback]="false"
                styleClass="w-full"
                inputStyleClass="w-full"
                autocomplete="current-password"
              ></p-password>
              @if (loginForm.controls.password.invalid && loginForm.controls.password.touched) {
                <small class="p-error">{{ getPasswordErrorMessage() }}</small>
              }
            </div>

            <div class="form-options">
              <div class="remember-me-wrapper">
                <p-checkbox
                  formControlName="rememberMe"
                  [binary]="true"
                  inputId="rememberMe"
                ></p-checkbox>
                <label for="rememberMe" class="remember-me-label">Remember me</label>
              </div>
              <a href="#" class="forgot-link">Forgot password?</a>
            </div>

            <p-button
              type="submit"
              label="Sign In"
              [loading]="isLoading()"
              [disabled]="isLoading()"
              styleClass="w-full"
              icon="pi pi-sign-in"
            ></p-button>
          </form>

          <div class="auth-footer">
            <p>
              Don't have an account?
              <a routerLink="/auth/register" class="auth-link">Create one</a>
            </p>
          </div>
        </div>
      </p-card>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 1rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .login-card {
      width: 100%;
      max-width: 420px;
    }

    .login-content {
      padding: 1rem;
    }

    .auth-title {
      font-size: 1.75rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0 0 0.5rem 0;
      text-align: center;
    }

    .auth-subtitle {
      color: #64748b;
      text-align: center;
      margin: 0 0 1.5rem 0;
    }

    .error-alert {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      background-color: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 0.5rem;
      color: #dc2626;
      margin-bottom: 1rem;
    }

    .error-alert i {
      font-size: 1.25rem;
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .field label {
      font-weight: 500;
      color: #374151;
    }

    .w-full {
      width: 100%;
    }

    .p-error {
      color: #dc2626;
      font-size: 0.875rem;
    }

    .form-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .remember-me-wrapper {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .remember-me-label {
      cursor: pointer;
      color: #374151;
    }

    .forgot-link {
      color: #6366f1;
      text-decoration: none;
      font-size: 0.875rem;
    }

    .forgot-link:hover {
      text-decoration: underline;
    }

    .auth-footer {
      text-align: center;
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid #e5e7eb;
    }

    .auth-footer p {
      color: #64748b;
      margin: 0;
    }

    .auth-link {
      color: #6366f1;
      text-decoration: none;
      font-weight: 500;
    }

    .auth-link:hover {
      text-decoration: underline;
    }

    :host ::ng-deep {
      .p-card {
        border-radius: 1rem;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      }

      .p-card-body {
        padding: 2rem;
      }

      .p-inputtext {
        padding: 0.75rem 0.75rem 0.75rem 2.5rem;
      }

      .p-password {
        width: 100%;
      }

      .p-password-input {
        width: 100%;
        padding: 0.75rem;
      }

      .p-button {
        padding: 0.75rem 1.5rem;
        font-weight: 500;
      }
    }
  `],
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly hidePassword = signal(true);

  readonly loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false],
  });

  togglePasswordVisibility(): void {
    this.hidePassword.update((value) => !value);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { email, password, rememberMe } = this.loginForm.getRawValue();

    this.authService.login(email, password).subscribe({
      next: () => {
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        }
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.errorMessage.set(err.message || 'Login failed. Please try again.');
        this.isLoading.set(false);
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }

  getEmailErrorMessage(): string {
    const emailControl = this.loginForm.controls.email;
    if (emailControl.hasError('required')) {
      return 'Email is required';
    }
    if (emailControl.hasError('email')) {
      return 'Please enter a valid email address';
    }
    return '';
  }

  getPasswordErrorMessage(): string {
    const passwordControl = this.loginForm.controls.password;
    if (passwordControl.hasError('required')) {
      return 'Password is required';
    }
    if (passwordControl.hasError('minlength')) {
      return 'Password must be at least 6 characters';
    }
    return '';
  }
}
