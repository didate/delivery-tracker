import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { PasswordModule } from 'primeng/password';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    InputTextModule,
    ButtonModule,
    CardModule,
    PasswordModule,
  ],
  template: `
    <div class="register-container">
      <p-card class="register-card">
        <div class="register-content">
          <h1 class="auth-title">Create Account</h1>
          <p class="auth-subtitle">Register your company to get started</p>

          @if (errorMessage()) {
            <div class="error-alert">
              <i class="pi pi-exclamation-circle"></i>
              <span>{{ errorMessage() }}</span>
            </div>
          }

          @if (successMessage()) {
            <div class="success-alert">
              <i class="pi pi-check-circle"></i>
              <span>{{ successMessage() }}</span>
            </div>
          }

          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="auth-form">
            <div class="field">
              <label for="companyName">Company Name</label>
              <span class="p-input-icon-left w-full">
                <i class="pi pi-building"></i>
                <input
                  id="companyName"
                  type="text"
                  pInputText
                  formControlName="companyName"
                  placeholder="Enter your company name"
                  autocomplete="organization"
                  class="w-full"
                  [class.ng-invalid]="registerForm.controls.companyName.invalid && registerForm.controls.companyName.touched"
                  [class.ng-dirty]="registerForm.controls.companyName.touched"
                />
              </span>
              @if (registerForm.controls.companyName.invalid && registerForm.controls.companyName.touched) {
                <small class="p-error">{{ getCompanyNameErrorMessage() }}</small>
              }
            </div>

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
                  [class.ng-invalid]="registerForm.controls.email.invalid && registerForm.controls.email.touched"
                  [class.ng-dirty]="registerForm.controls.email.touched"
                />
              </span>
              @if (registerForm.controls.email.invalid && registerForm.controls.email.touched) {
                <small class="p-error">{{ getEmailErrorMessage() }}</small>
              }
            </div>

            <div class="field">
              <label for="password">Password</label>
              <p-password
                id="password"
                formControlName="password"
                placeholder="Create a password"
                [toggleMask]="true"
                [feedback]="true"
                styleClass="w-full"
                inputStyleClass="w-full"
                autocomplete="new-password"
                weakLabel="Weak"
                mediumLabel="Medium"
                strongLabel="Strong"
              ></p-password>
              @if (registerForm.controls.password.invalid && registerForm.controls.password.touched) {
                <small class="p-error">{{ getPasswordErrorMessage() }}</small>
              }
              <small class="field-hint">Min 8 chars with uppercase, lowercase, and number</small>
            </div>

            <div class="field">
              <label for="confirmPassword">Confirm Password</label>
              <p-password
                id="confirmPassword"
                formControlName="confirmPassword"
                placeholder="Confirm your password"
                [toggleMask]="true"
                [feedback]="false"
                styleClass="w-full"
                inputStyleClass="w-full"
                autocomplete="new-password"
              ></p-password>
              @if (
                (registerForm.controls.confirmPassword.invalid && registerForm.controls.confirmPassword.touched) ||
                (registerForm.hasError('passwordMismatch') && registerForm.controls.confirmPassword.touched)
              ) {
                <small class="p-error">{{ getConfirmPasswordErrorMessage() }}</small>
              }
            </div>

            <div class="field">
              <label for="phone">Phone (optional)</label>
              <span class="p-input-icon-left w-full">
                <i class="pi pi-phone"></i>
                <input
                  id="phone"
                  type="tel"
                  pInputText
                  formControlName="phone"
                  placeholder="Enter your phone number"
                  autocomplete="tel"
                  class="w-full"
                />
              </span>
            </div>

            <div class="field">
              <label for="address">Address (optional)</label>
              <span class="p-input-icon-left w-full">
                <i class="pi pi-map-marker"></i>
                <input
                  id="address"
                  type="text"
                  pInputText
                  formControlName="address"
                  placeholder="Enter your business address"
                  autocomplete="street-address"
                  class="w-full"
                />
              </span>
            </div>

            <p-button
              type="submit"
              label="Create Account"
              [loading]="isLoading()"
              [disabled]="isLoading() || !!successMessage()"
              styleClass="w-full"
              icon="pi pi-user-plus"
            ></p-button>
          </form>

          <div class="auth-footer">
            <p>
              Already have an account?
              <a routerLink="/auth/login" class="auth-link">Sign in</a>
            </p>
          </div>
        </div>
      </p-card>
    </div>
  `,
  styles: [`
    .register-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 1rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .register-card {
      width: 100%;
      max-width: 480px;
    }

    .register-content {
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

    .success-alert {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      background-color: #f0fdf4;
      border: 1px solid #bbf7d0;
      border-radius: 0.5rem;
      color: #16a34a;
      margin-bottom: 1rem;
    }

    .success-alert i {
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

    .field-hint {
      color: #64748b;
      font-size: 0.75rem;
    }

    .w-full {
      width: 100%;
    }

    .p-error {
      color: #dc2626;
      font-size: 0.875rem;
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
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly hidePassword = signal(true);
  readonly hideConfirmPassword = signal(true);

  readonly registerForm = this.fb.nonNullable.group(
    {
      companyName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), this.passwordStrengthValidator]],
      confirmPassword: ['', [Validators.required]],
      phone: [''],
      address: [''],
    },
    {
      validators: [this.passwordMatchValidator],
    }
  );

  togglePasswordVisibility(): void {
    this.hidePassword.update((value) => !value);
  }

  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword.update((value) => !value);
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const formValue = this.registerForm.getRawValue();

    this.authService.register({
      tenantName: formValue.companyName,
      tenantCode: formValue.companyName.toLowerCase().replace(/\s+/g, '-'),
      email: formValue.email,
      password: formValue.password,
      name: formValue.companyName,
      phone: formValue.phone || undefined,
      address: formValue.address || undefined,
    }).subscribe({
      next: () => {
        this.successMessage.set('Registration successful! Redirecting to dashboard...');
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1500);
      },
      error: (err) => {
        this.errorMessage.set(err.message || 'Registration failed. Please try again.');
        this.isLoading.set(false);
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }

  private passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) {
      return null;
    }

    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);

    const valid = hasUpperCase && hasLowerCase && hasNumber;
    return valid ? null : { passwordStrength: true };
  }

  private passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    if (password && confirmPassword && password !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  getCompanyNameErrorMessage(): string {
    const control = this.registerForm.controls.companyName;
    if (control.hasError('required')) {
      return 'Company name is required';
    }
    if (control.hasError('minlength')) {
      return 'Company name must be at least 2 characters';
    }
    return '';
  }

  getEmailErrorMessage(): string {
    const control = this.registerForm.controls.email;
    if (control.hasError('required')) {
      return 'Email is required';
    }
    if (control.hasError('email')) {
      return 'Please enter a valid email address';
    }
    return '';
  }

  getPasswordErrorMessage(): string {
    const control = this.registerForm.controls.password;
    if (control.hasError('required')) {
      return 'Password is required';
    }
    if (control.hasError('minlength')) {
      return 'Password must be at least 8 characters';
    }
    if (control.hasError('passwordStrength')) {
      return 'Password must contain uppercase, lowercase, and number';
    }
    return '';
  }

  getConfirmPasswordErrorMessage(): string {
    const control = this.registerForm.controls.confirmPassword;
    if (control.hasError('required')) {
      return 'Please confirm your password';
    }
    if (this.registerForm.hasError('passwordMismatch')) {
      return 'Passwords do not match';
    }
    return '';
  }
}
