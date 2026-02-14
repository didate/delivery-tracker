import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen flex flex-col">
      <!-- Header -->
      <header class="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <a routerLink="/" class="flex items-center gap-2 text-blue-600 font-bold text-xl">
            <i class="pi pi-truck text-2xl"></i>
            <span>Delivery Manager</span>
          </a>
          <div class="flex items-center gap-6">
            <a routerLink="/auth/login" class="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Login
            </a>
            <a routerLink="/auth/register" class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full transition-colors">
              Get Started
            </a>
          </div>
        </div>
      </header>

      <!-- Hero Section -->
      <section class="bg-gradient-to-br from-blue-600 to-blue-800 text-white pt-32 pb-20 px-6 mt-16">
        <div class="max-w-4xl mx-auto text-center">
          <h1 class="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Streamline Your Delivery Operations
          </h1>
          <p class="text-xl md:text-2xl mb-8 opacity-90 leading-relaxed">
            Manage customers, drivers, products, and deliveries all in one place.
            Track payments, monitor performance, and grow your business efficiently.
          </p>
          <div class="flex flex-wrap gap-4 justify-center">
            <a routerLink="/auth/register" class="px-8 py-3 bg-white text-blue-600 font-semibold rounded-full hover:bg-blue-50 transition-colors text-lg">
              Start Free Trial
            </a>
            <a routerLink="/auth/login" class="px-8 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-full hover:bg-white/10 transition-colors text-lg">
              Sign In
            </a>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="py-20 px-6 bg-gray-50">
        <div class="max-w-7xl mx-auto">
          <h2 class="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Everything You Need
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            @for (feature of features; track feature.title) {
              <div class="bg-white p-8 rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all text-center">
                <div class="w-16 h-16 mx-auto mb-6 rounded-2xl bg-blue-100 flex items-center justify-center">
                  <i [class]="feature.icon + ' text-2xl text-blue-600'"></i>
                </div>
                <h3 class="text-xl font-semibold text-gray-900 mb-3">{{ feature.title }}</h3>
                <p class="text-gray-600 leading-relaxed">{{ feature.description }}</p>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="py-16 px-6 bg-blue-600">
        <div class="max-w-3xl mx-auto text-center">
          <h2 class="text-3xl font-bold text-white mb-4">Ready to get started?</h2>
          <p class="text-blue-100 text-lg mb-8">Join thousands of businesses managing their deliveries efficiently.</p>
          <a routerLink="/auth/register" class="inline-block px-8 py-3 bg-white text-blue-600 font-semibold rounded-full hover:bg-blue-50 transition-colors text-lg">
            Create Free Account
          </a>
        </div>
      </section>

      <!-- Footer -->
      <footer class="bg-gray-900 text-gray-400 py-8 px-6 mt-auto">
        <div class="max-w-7xl mx-auto text-center">
          <p>&copy; 2024 Delivery Manager. All rights reserved.</p>
        </div>
      </footer>
    </div>
  `,
})
export class LandingComponent {
  readonly features = [
    {
      icon: 'pi pi-users',
      title: 'Customer Management',
      description: 'Keep track of all your customers, their orders, and payment history in one place.'
    },
    {
      icon: 'pi pi-car',
      title: 'Driver Coordination',
      description: 'Assign deliveries to drivers and monitor their routes and performance.'
    },
    {
      icon: 'pi pi-box',
      title: 'Product Catalog',
      description: 'Manage your product inventory with pricing and availability tracking.'
    },
    {
      icon: 'pi pi-chart-line',
      title: 'Analytics Dashboard',
      description: 'Get insights into your delivery operations with real-time analytics.'
    },
    {
      icon: 'pi pi-credit-card',
      title: 'Payment Tracking',
      description: 'Track payments from customers and monitor outstanding balances.'
    },
    {
      icon: 'pi pi-sync',
      title: 'Returns Management',
      description: 'Handle product returns efficiently with full tracking and reporting.'
    }
  ];
}
