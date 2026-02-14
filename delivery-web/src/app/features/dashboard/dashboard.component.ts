import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { DashboardService } from './services/dashboard.service';

interface StatCard {
  title: string;
  value: number | string;
  icon: string;
  color: string;
  bgColor: string;
}

interface QuickAction {
  label: string;
  icon: string;
  route: string;
  color: string;
  bgColor: string;
}

type ActivityType = 'delivery' | 'payment';

interface RecentActivity {
  id: number;
  type: ActivityType;
  description: string;
  timestamp: Date;
  status: 'completed' | 'pending' | 'in_progress' | 'cancelled';
  amount?: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, DatePipe, CurrencyPipe],
  template: `
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p class="mt-1 text-gray-500">Welcome back! Here's an overview of your delivery operations.</p>
      </div>

      @if (isLoading()) {
        <div class="flex flex-col items-center justify-center py-20">
          <div class="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p class="mt-4 text-gray-500">Loading dashboard data...</p>
        </div>
      } @else {
        <!-- Stats Cards -->
        <section class="mb-8">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Overview</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            @for (stat of stats(); track stat.title) {
              <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div class="flex items-center gap-4">
                  <div
                    class="w-12 h-12 rounded-xl flex items-center justify-center"
                    [style.background-color]="stat.bgColor"
                    [style.color]="stat.color">
                    <i [class]="stat.icon" class="text-xl"></i>
                  </div>
                  <div>
                    <p class="text-2xl font-semibold text-gray-900">{{ stat.value }}</p>
                    <p class="text-sm text-gray-500">{{ stat.title }}</p>
                  </div>
                </div>
              </div>
            }
          </div>
        </section>

        <!-- Quick Actions -->
        <section class="mb-8">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            @for (action of quickActions(); track action.label) {
              <a
                [routerLink]="action.route"
                class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all hover:-translate-y-0.5 text-center block">
                <div
                  class="w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-3"
                  [style.background-color]="action.bgColor"
                  [style.color]="action.color">
                  <i [class]="action.icon" class="text-xl"></i>
                </div>
                <span class="text-sm font-medium text-gray-700">{{ action.label }}</span>
              </a>
            }
          </div>
        </section>

        <!-- Recent Activity -->
        <section class="mb-8">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-medium text-gray-900">Recent Activity</h2>
            <a routerLink="/deliveries" class="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View All
              <i class="pi pi-arrow-right text-xs"></i>
            </a>
          </div>
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            @if (recentActivity().length === 0) {
              <div class="flex flex-col items-center justify-center py-12 text-gray-400">
                <i class="pi pi-inbox text-5xl mb-4 opacity-50"></i>
                <p>No recent activity</p>
              </div>
            } @else {
              <div class="divide-y divide-gray-100">
                @for (activity of recentActivity(); track activity.id) {
                  <div class="flex items-center gap-4 p-4 hover:bg-gray-50">
                    <div
                      class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      [class]="activity.type === 'delivery' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'">
                      <i [class]="getActivityIcon(activity.type)"></i>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-gray-900 truncate">{{ activity.description }}</p>
                      <p class="text-xs text-gray-500">{{ activity.timestamp | date:'short' }}</p>
                    </div>
                    @if (activity.amount) {
                      <span class="text-sm font-semibold text-gray-900">{{ activity.amount | currency }}</span>
                    }
                    <span
                      class="px-3 py-1 text-xs font-medium rounded-full"
                      [class]="getStatusClasses(activity.status)">
                      {{ formatStatus(activity.status) }}
                    </span>
                  </div>
                }
              </div>
            }
          </div>
        </section>
      }
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);

  readonly isLoading = signal(true);
  readonly stats = signal<StatCard[]>([]);
  readonly recentActivity = signal<RecentActivity[]>([]);

  readonly quickActions = signal<QuickAction[]>([
    { label: 'New Delivery', icon: 'pi pi-plus-circle', route: '/deliveries', color: '#1976d2', bgColor: '#e3f2fd' },
    { label: 'New Customer', icon: 'pi pi-user-plus', route: '/customers', color: '#7b1fa2', bgColor: '#f3e5f5' },
    { label: 'New Product', icon: 'pi pi-plus', route: '/products', color: '#388e3c', bgColor: '#e8f5e9' },
    { label: 'View Returns', icon: 'pi pi-replay', route: '/returns', color: '#f57c00', bgColor: '#fff3e0' },
    { label: 'Manage Drivers', icon: 'pi pi-users', route: '/drivers', color: '#00897b', bgColor: '#e0f2f1' },
    { label: 'View Payments', icon: 'pi pi-credit-card', route: '/payments', color: '#5c6bc0', bgColor: '#e8eaf6' }
  ]);

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.isLoading.set(true);

    this.dashboardService.getDashboardStats().subscribe({
      next: (dashboardStats) => {
        this.stats.set([
          { title: 'Total Customers', value: dashboardStats.totalCustomers, icon: 'pi pi-users', color: '#1976d2', bgColor: '#e3f2fd' },
          { title: 'Total Products', value: dashboardStats.totalProducts, icon: 'pi pi-box', color: '#7b1fa2', bgColor: '#f3e5f5' },
          { title: 'Active Drivers', value: dashboardStats.activeDrivers, icon: 'pi pi-truck', color: '#388e3c', bgColor: '#e8f5e9' },
          { title: "Today's Deliveries", value: dashboardStats.todayDeliveries, icon: 'pi pi-file', color: '#f57c00', bgColor: '#fff3e0' },
          { title: 'Pending Returns', value: dashboardStats.pendingReturns, icon: 'pi pi-replay', color: '#c62828', bgColor: '#ffebee' },
          { title: 'Monthly Revenue', value: this.formatCurrency(dashboardStats.monthlyRevenue), icon: 'pi pi-wallet', color: '#00897b', bgColor: '#e0f2f1' }
        ]);
        this.loadRecentActivity();
      },
      error: (error) => {
        console.error('Error loading dashboard stats:', error);
        this.isLoading.set(false);
      }
    });
  }

  private loadRecentActivity(): void {
    this.dashboardService.getRecentDeliveries().subscribe({
      next: (deliveries) => {
        const activities: RecentActivity[] = deliveries.map(d => ({
          id: d.id,
          type: 'delivery' as ActivityType,
          description: `Delivery ${d.code} to ${d.customerName}`,
          timestamp: new Date(d.deliveryDate),
          status: this.mapDeliveryStatus(d.status),
          amount: d.totalAmount
        }));

        this.dashboardService.getRecentPayments().subscribe({
          next: (payments) => {
            const paymentActivities: RecentActivity[] = payments.map(p => ({
              id: p.id + 10000,
              type: 'payment' as ActivityType,
              description: `Payment from ${p.customerName}`,
              timestamp: new Date(p.paymentDate),
              status: 'completed' as const,
              amount: p.amount
            }));

            const allActivities = [...activities, ...paymentActivities]
              .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
              .slice(0, 5);

            this.recentActivity.set(allActivities);
            this.isLoading.set(false);
          },
          error: () => {
            this.recentActivity.set(activities);
            this.isLoading.set(false);
          }
        });
      },
      error: () => {
        this.recentActivity.set([]);
        this.isLoading.set(false);
      }
    });
  }

  private mapDeliveryStatus(status: string): 'completed' | 'pending' | 'in_progress' | 'cancelled' {
    const statusMap: Record<string, 'completed' | 'pending' | 'in_progress' | 'cancelled'> = {
      'COMPLETED': 'completed',
      'PENDING': 'pending',
      'IN_PROGRESS': 'in_progress',
      'CANCELLED': 'cancelled'
    };
    return statusMap[status] || 'pending';
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  getActivityIcon(type: ActivityType): string {
    return type === 'delivery' ? 'pi pi-truck' : 'pi pi-wallet';
  }

  getStatusClasses(status: string): string {
    const classes: Record<string, string> = {
      'completed': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'in_progress': 'bg-blue-100 text-blue-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  }

  formatStatus(status: string): string {
    return status.replace('_', ' ');
  }
}
