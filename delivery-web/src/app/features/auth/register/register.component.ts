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
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-600 to-purple-700">
      <div class="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
        <!-- Header -->
        <div class="px-8 pt-8 pb-6 text-center">
          <div class="w-16 h-16 mx-auto mb-4 rounded-xl bg-blue-600 flex items-center justify-center">
            <i class="pi pi-truck text-white text-2xl"></i>
          </div>
          <h1 class="text-2xl font-bold text-gray-900">Create Account</h1>
          <p class="mt-2 text-gray-500">Register your company to get started</p>
        </div>

        <!-- Form -->
        <div class="px-8 pb-8">
          @if (errorMessage()) {
            <div class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
              <i class="pi pi-exclamation-circle text-xl"></i>
              <span class="text-sm">{{ errorMessage() }}</span>
            </div>
          }

          @if (successMessage()) {
            <div class="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-700">
              <i class="pi pi-check-circle text-xl"></i>
              <span class="text-sm">{{ successMessage() }}</span>
            </div>
          }

          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-4">
            <!-- Company Name -->
            <div>
              <label for="companyName" class="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i class="pi pi-building text-gray-400"></i>
                </div>
                <input
                  id="companyName"
                  type="text"
                  formControlName="companyName"
                  placeholder="Enter your company name"
                  autocomplete="organization"
                  class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  [class.border-red-500]="registerForm.controls.companyName.invalid && registerForm.controls.companyName.touched"
                />
              </div>
              @if (registerForm.controls.companyName.invalid && registerForm.controls.companyName.touched) {
                <p class="mt-1 text-sm text-red-600">{{ getCompanyNameErrorMessage() }}</p>
              }
            </div>

            <!-- Email -->
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i class="pi pi-envelope text-gray-400"></i>
                </div>
                <input
                  id="email"
                  type="email"
                  formControlName="email"
                  placeholder="Enter your email"
                  autocomplete="email"
                  class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  [class.border-red-500]="registerForm.controls.email.invalid && registerForm.controls.email.touched"
                />
              </div>
              @if (registerForm.controls.email.invalid && registerForm.controls.email.touched) {
                <p class="mt-1 text-sm text-red-600">{{ getEmailErrorMessage() }}</p>
              }
            </div>

            <!-- Password -->
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i class="pi pi-lock text-gray-400"></i>
                </div>
                <input
                  id="password"
                  [type]="showPassword() ? 'text' : 'password'"
                  formControlName="password"
                  placeholder="Create a password"
                  autocomplete="new-password"
                  class="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  [class.border-red-500]="registerForm.controls.password.invalid && registerForm.controls.password.touched"
                />
                <button
                  type="button"
                  (click)="togglePassword()"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                  <i [class]="showPassword() ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
                </button>
              </div>
              @if (registerForm.controls.password.invalid && registerForm.controls.password.touched) {
                <p class="mt-1 text-sm text-red-600">{{ getPasswordErrorMessage() }}</p>
              }
              <p class="mt-1 text-xs text-gray-500">Min 8 chars with uppercase, lowercase, and number</p>
            </div>

            <!-- Confirm Password -->
            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i class="pi pi-lock text-gray-400"></i>
                </div>
                <input
                  id="confirmPassword"
                  [type]="showConfirmPassword() ? 'text' : 'password'"
                  formControlName="confirmPassword"
                  placeholder="Confirm your password"
                  autocomplete="new-password"
                  class="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  [class.border-red-500]="(registerForm.controls.confirmPassword.invalid || registerForm.hasError('passwordMismatch')) && registerForm.controls.confirmPassword.touched"
                />
                <button
                  type="button"
                  (click)="toggleConfirmPassword()"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                  <i [class]="showConfirmPassword() ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
                </button>
              </div>
              @if ((registerForm.controls.confirmPassword.invalid || registerForm.hasError('passwordMismatch')) && registerForm.controls.confirmPassword.touched) {
                <p class="mt-1 text-sm text-red-600">{{ getConfirmPasswordErrorMessage() }}</p>
              }
            </div>

            <!-- Phone (optional) -->
            <div>
              <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">Phone (optional)</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i class="pi pi-phone text-gray-400"></i>
                </div>
                <input
                  id="phone"
                  type="tel"
                  formControlName="phone"
                  placeholder="Enter your phone number"
                  autocomplete="tel"
                  class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <!-- Address (optional) -->
            <div>
              <label for="address" class="block text-sm font-medium text-gray-700 mb-1">Address (optional)</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i class="pi pi-map-marker text-gray-400"></i>
                </div>
                <input
                  id="address"
                  type="text"
                  formControlName="address"
                  placeholder="Enter your business address"
                  autocomplete="street-address"
                  class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <!-- Submit -->
            <button
              type="submit"
              [disabled]="isLoading() || !!successMessage()"
              class="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 mt-6">
              @if (isLoading()) {
                <i class="pi pi-spinner pi-spin"></i>
                <span>Creating account...</span>
              } @else {
                <i class="pi pi-user-plus"></i>
                <span>Create Account</span>
              }
            </button>
          </form>

          <!-- Footer -->
          <div class="mt-6 pt-6 border-t border-gray-200 text-center">
            <p class="text-gray-600">
              Already have an account?
              <a routerLink="/auth/login" class="text-blue-600 hover:text-blue-700 font-medium hover:underline">
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly showPassword = signal(false);
  readonly showConfirmPassword = signal(false);

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

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword.update(v => !v);
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
