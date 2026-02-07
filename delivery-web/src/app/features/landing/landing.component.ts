import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule, CardModule],
  template: `
    <div class="landing-container">
      <!-- Header -->
      <header class="landing-header">
        <div class="header-content">
          <div class="logo">
            <i class="pi pi-truck" style="font-size: 1.5rem; margin-right: 0.5rem;"></i>
            <span>Delivery Manager</span>
          </div>
          <div class="header-actions">
            <a routerLink="/auth/login" class="login-link">Login</a>
            <a routerLink="/auth/register" pButton label="Get Started" class="p-button-rounded"></a>
          </div>
        </div>
      </header>

      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-content">
          <h1>Streamline Your Delivery Operations</h1>
          <p>
            Manage customers, drivers, products, and deliveries all in one place.
            Track payments, monitor performance, and grow your business efficiently.
          </p>
          <div class="hero-actions">
            <a routerLink="/auth/register" pButton label="Start Free Trial" class="p-button-lg p-button-rounded"></a>
            <a routerLink="/auth/login" pButton label="Sign In" class="p-button-lg p-button-rounded p-button-outlined"></a>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="features-section">
        <h2>Everything You Need</h2>
        <div class="features-grid">
          <div class="feature-card">
            <i class="pi pi-users"></i>
            <h3>Customer Management</h3>
            <p>Keep track of all your customers, their orders, and payment history in one place.</p>
          </div>
          <div class="feature-card">
            <i class="pi pi-car"></i>
            <h3>Driver Coordination</h3>
            <p>Assign deliveries to drivers and monitor their routes and performance.</p>
          </div>
          <div class="feature-card">
            <i class="pi pi-box"></i>
            <h3>Product Catalog</h3>
            <p>Manage your product inventory with pricing and availability tracking.</p>
          </div>
          <div class="feature-card">
            <i class="pi pi-chart-line"></i>
            <h3>Analytics Dashboard</h3>
            <p>Get insights into your delivery operations with real-time analytics.</p>
          </div>
          <div class="feature-card">
            <i class="pi pi-credit-card"></i>
            <h3>Payment Tracking</h3>
            <p>Track payments from customers and monitor outstanding balances.</p>
          </div>
          <div class="feature-card">
            <i class="pi pi-sync"></i>
            <h3>Returns Management</h3>
            <p>Handle product returns efficiently with full tracking and reporting.</p>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="landing-footer">
        <p>&copy; 2024 Delivery Manager. All rights reserved.</p>
      </footer>
    </div>
  `,
  styles: [`
    .landing-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .landing-header {
      background: white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 100;
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo {
      display: flex;
      align-items: center;
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--primary-color);
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .login-link {
      color: var(--text-color);
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s;
    }

    .login-link:hover {
      color: var(--primary-color);
    }

    .hero-section {
      background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-700) 100%);
      color: white;
      padding: 8rem 2rem 6rem;
      margin-top: 60px;
    }

    .hero-content {
      max-width: 800px;
      margin: 0 auto;
      text-align: center;
    }

    .hero-content h1 {
      font-size: 3rem;
      font-weight: 700;
      margin-bottom: 1.5rem;
      line-height: 1.2;
    }

    .hero-content p {
      font-size: 1.25rem;
      margin-bottom: 2rem;
      opacity: 0.9;
      line-height: 1.6;
    }

    .hero-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .hero-actions .p-button-outlined {
      background: transparent;
      border-color: white;
      color: white;
    }

    .hero-actions .p-button-outlined:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .features-section {
      padding: 5rem 2rem;
      background: var(--surface-ground);
    }

    .features-section h2 {
      text-align: center;
      font-size: 2.5rem;
      margin-bottom: 3rem;
      color: var(--text-color);
    }

    .features-grid {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }

    .feature-card {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      text-align: center;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .feature-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    }

    .feature-card i {
      font-size: 2.5rem;
      color: var(--primary-color);
      margin-bottom: 1rem;
    }

    .feature-card h3 {
      font-size: 1.25rem;
      margin-bottom: 0.75rem;
      color: var(--text-color);
    }

    .feature-card p {
      color: var(--text-color-secondary);
      line-height: 1.5;
    }

    .landing-footer {
      background: var(--surface-900);
      color: var(--surface-300);
      padding: 2rem;
      text-align: center;
      margin-top: auto;
    }

    @media screen and (max-width: 768px) {
      .hero-content h1 {
        font-size: 2rem;
      }

      .hero-content p {
        font-size: 1rem;
      }

      .features-section h2 {
        font-size: 1.75rem;
      }
    }
  `]
})
export class LandingComponent {}
