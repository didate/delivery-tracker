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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

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

  async onSubmit(): Promise<void> {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    try {
      const formValue = this.registerForm.getRawValue();

      // TODO: Replace with actual AuthService call
      // await this.authService.registerTenant({
      //   companyName: formValue.companyName,
      //   email: formValue.email,
      //   password: formValue.password,
      //   phone: formValue.phone || undefined,
      //   address: formValue.address || undefined,
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      this.successMessage.set(
        'Registration successful! Redirecting to login...'
      );

      // Redirect to login after showing success message
      setTimeout(() => {
        this.router.navigate(['/auth/login']);
      }, 2000);
    } catch (error) {
      this.errorMessage.set(
        error instanceof Error ? error.message : 'Registration failed. Please try again.'
      );
    } finally {
      this.isLoading.set(false);
    }
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
