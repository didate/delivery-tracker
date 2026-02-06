import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

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

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const { email, password, rememberMe } = this.loginForm.getRawValue();

      // TODO: Replace with actual AuthService call
      // await this.authService.login({ email, password });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Store remember me preference if needed
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }

      // Navigate to dashboard on success
      await this.router.navigate(['/dashboard']);
    } catch (error) {
      this.errorMessage.set(
        error instanceof Error ? error.message : 'Login failed. Please try again.'
      );
    } finally {
      this.isLoading.set(false);
    }
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
