import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-600 to-purple-700">
      <div class="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <!-- Header -->
        <div class="px-8 pt-8 pb-6 text-center">
          <div class="w-16 h-16 mx-auto mb-4 rounded-xl bg-blue-600 flex items-center justify-center">
            <i class="pi pi-truck text-white text-2xl"></i>
          </div>
          <h1 class="text-2xl font-bold text-gray-900">Welcome Back</h1>
          <p class="mt-2 text-gray-500">Sign in to your account to continue</p>
        </div>

        <!-- Form -->
        <div class="px-8 pb-8">
          @if (errorMessage()) {
            <div class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
              <i class="pi pi-exclamation-circle text-xl"></i>
              <span class="text-sm">{{ errorMessage() }}</span>
            </div>
          }

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-5">
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
                  [class.border-red-500]="loginForm.controls.email.invalid && loginForm.controls.email.touched"
                />
              </div>
              @if (loginForm.controls.email.invalid && loginForm.controls.email.touched) {
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
                  placeholder="Enter your password"
                  autocomplete="current-password"
                  class="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  [class.border-red-500]="loginForm.controls.password.invalid && loginForm.controls.password.touched"
                />
                <button
                  type="button"
                  (click)="togglePassword()"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                  <i [class]="showPassword() ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
                </button>
              </div>
              @if (loginForm.controls.password.invalid && loginForm.controls.password.touched) {
                <p class="mt-1 text-sm text-red-600">{{ getPasswordErrorMessage() }}</p>
              }
            </div>

            <!-- Remember & Forgot -->
            <div class="flex items-center justify-between">
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  formControlName="rememberMe"
                  class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span class="text-sm text-gray-600">Remember me</span>
              </label>
              <a href="#" class="text-sm text-blue-600 hover:text-blue-700 hover:underline">
                Forgot password?
              </a>
            </div>

            <!-- Submit -->
            <button
              type="submit"
              [disabled]="isLoading()"
              class="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
              @if (isLoading()) {
                <i class="pi pi-spinner pi-spin"></i>
                <span>Signing in...</span>
              } @else {
                <i class="pi pi-sign-in"></i>
                <span>Sign In</span>
              }
            </button>
          </form>

          <!-- Footer -->
          <div class="mt-6 pt-6 border-t border-gray-200 text-center">
            <p class="text-gray-600">
              Don't have an account?
              <a routerLink="/auth/register" class="text-blue-600 hover:text-blue-700 font-medium hover:underline">
                Create one
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly showPassword = signal(false);

  readonly loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false],
  });

  togglePassword(): void {
    this.showPassword.update(v => !v);
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
