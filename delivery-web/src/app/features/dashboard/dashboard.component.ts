import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { DashboardService, DashboardStats, RecentDelivery, RecentPayment } from './services/dashboard.service';

interface StatCard {
  title: string;
  value: number | string;
  icon: string;
  color: string;
}

interface QuickAction {
  label: string;
  icon: string;
  route: string;
  color: string;
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
  imports: [
    RouterLink,
    CardModule,
    ButtonModule,
    DividerModule,
    ProgressSpinnerModule,
    DatePipe,
    CurrencyPipe
  ],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <h1>Dashboard</h1>
        <p class="subtitle">Welcome back! Here's an overview of your delivery operations.</p>
      </header>

      @if (isLoading()) {
        <div class="loading-container">
          <p-progressSpinner></p-progressSpinner>
          <p>Loading dashboard data...</p>
        </div>
      } @else {
        <!-- Stats Cards Section -->
        <section class="stats-section">
          <h2 class="section-title">Overview</h2>
          <div class="stats-grid">
            @for (stat of stats(); track stat.title) {
              <p-card styleClass="stat-card">
                <div class="stat-card-content" [style.--accent-color]="stat.color">
                  <div class="stat-icon" [style.background-color]="stat.color + '20'" [style.color]="stat.color">
                    <i [class]="stat.icon"></i>
                  </div>
                  <div class="stat-info">
                    <span class="stat-value">{{ stat.value }}</span>
                    <span class="stat-label">{{ stat.title }}</span>
                  </div>
                </div>
              </p-card>
            }
          </div>
        </section>

        <!-- Quick Actions Section -->
        <section class="quick-actions-section">
          <h2 class="section-title">Quick Actions</h2>
          <div class="actions-grid">
            @for (action of quickActions(); track action.label) {
              <a [routerLink]="action.route" class="action-link">
                <p-card styleClass="action-card">
                  <div class="action-card-content">
                    <div class="action-icon" [style.background-color]="action.color + '20'" [style.color]="action.color">
                      <i [class]="action.icon"></i>
                    </div>
                    <span class="action-label">{{ action.label }}</span>
                  </div>
                </p-card>
              </a>
            }
          </div>
        </section>

        <!-- Recent Activity Section -->
        <section class="activity-section">
          <div class="section-header">
            <h2 class="section-title">Recent Activity</h2>
            <a routerLink="/deliveries" class="view-all-link">
              View All
              <i class="pi pi-arrow-right"></i>
            </a>
          </div>
          <p-card styleClass="activity-card">
            @if (recentActivity().length === 0) {
              <div class="empty-state">
                <i class="pi pi-inbox"></i>
                <p>No recent activity</p>
              </div>
            } @else {
              <div class="activity-list">
                @for (activity of recentActivity(); track activity.id; let last = $last) {
                  <div class="activity-item">
                    <div class="activity-icon" [class]="activity.type">
                      <i [class]="getActivityIcon(activity.type)"></i>
                    </div>
                    <div class="activity-content">
                      <span class="activity-description">{{ activity.description }}</span>
                      <span class="activity-time">{{ activity.timestamp | date:'short' }}</span>
                    </div>
                    @if (activity.amount) {
                      <div class="activity-amount">
                        {{ activity.amount | currency }}
                      </div>
                    }
                    <div class="activity-status" [class]="activity.status">
                      {{ formatStatus(activity.status) }}
                    </div>
                  </div>
                  @if (!last) {
                    <p-divider></p-divider>
                  }
                }
              </div>
            }
          </p-card>
        </section>
      }
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 24px;
      color: var(--text-color-secondary);

      p {
        margin-top: 16px;
      }
    }

    .dashboard-header {
      margin-bottom: 32px;

      h1 {
        margin: 0 0 8px 0;
        font-size: 28px;
        font-weight: 500;
        color: var(--text-color);
      }

      .subtitle {
        margin: 0;
        color: var(--text-color-secondary);
        font-size: 14px;
      }
    }

    .section-title {
      font-size: 18px;
      font-weight: 500;
      margin: 0 0 16px 0;
      color: var(--text-color);
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      .section-title {
        margin: 0;
      }
    }

    .view-all-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: var(--primary-color);
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      transition: color 0.2s ease;

      &:hover {
        color: var(--primary-600);
        text-decoration: underline;
      }

      i {
        font-size: 12px;
      }
    }

    /* Stats Section */
    .stats-section {
      margin-bottom: 32px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 16px;
    }

    :host ::ng-deep .stat-card {
      transition: transform 0.2s ease, box-shadow 0.2s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .p-card-body {
        padding: 0;
      }

      .p-card-content {
        padding: 0;
      }
    }

    .stat-card-content {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
    }

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      i {
        font-size: 28px;
      }
    }

    .stat-info {
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      min-width: 0;
    }

    .stat-value {
      font-size: 28px;
      font-weight: 600;
      color: var(--text-color);
      line-height: 1.2;
    }

    .stat-label {
      font-size: 13px;
      color: var(--text-color-secondary);
      margin-top: 4px;
    }

    /* Quick Actions Section */
    .quick-actions-section {
      margin-bottom: 32px;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 16px;
    }

    .action-link {
      text-decoration: none;
    }

    :host ::ng-deep .action-card {
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .p-card-body {
        padding: 0;
      }

      .p-card-content {
        padding: 0;
      }
    }

    .action-card-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 24px 16px;
      text-align: center;
    }

    .action-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;

      i {
        font-size: 24px;
      }
    }

    .action-label {
      font-size: 14px;
      font-weight: 500;
      color: var(--text-color);
    }

    /* Activity Section */
    .activity-section {
      margin-bottom: 32px;
    }

    :host ::ng-deep .activity-card {
      .p-card-body {
        padding: 0;
      }

      .p-card-content {
        padding: 0;
      }
    }

    .activity-list {
      :host ::ng-deep p-divider {
        margin: 0 16px;

        .p-divider {
          margin: 0;
        }
      }
    }

    .activity-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
    }

    .activity-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      i {
        font-size: 18px;
      }

      &.delivery {
        background-color: #e3f2fd;
        color: #1976d2;
      }

      &.payment {
        background-color: #e8f5e9;
        color: #388e3c;
      }
    }

    .activity-content {
      flex-grow: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .activity-description {
      font-size: 14px;
      color: var(--text-color);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .activity-time {
      font-size: 12px;
      color: var(--text-color-secondary);
    }

    .activity-amount {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-color);
      margin-right: 8px;
    }

    .activity-status {
      font-size: 12px;
      font-weight: 500;
      padding: 4px 12px;
      border-radius: 12px;
      text-transform: capitalize;
      flex-shrink: 0;

      &.completed {
        background-color: #e8f5e9;
        color: #2e7d32;
      }

      &.pending {
        background-color: #fff3e0;
        color: #f57c00;
      }

      &.in_progress {
        background-color: #e3f2fd;
        color: #1976d2;
      }

      &.cancelled {
        background-color: #ffebee;
        color: #c62828;
      }
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      color: var(--text-color-secondary);

      i {
        font-size: 48px;
        margin-bottom: 16px;
        opacity: 0.5;
      }

      p {
        margin: 0;
        font-size: 14px;
      }
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .dashboard-container {
        padding: 16px;
      }

      .dashboard-header h1 {
        font-size: 24px;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .actions-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .stat-card-content {
        padding: 16px;
      }

      .stat-icon {
        width: 48px;
        height: 48px;

        i {
          font-size: 24px;
        }
      }

      .stat-value {
        font-size: 24px;
      }

      .activity-item {
        flex-wrap: wrap;
      }

      .activity-content {
        flex: 1 1 calc(100% - 72px);
      }

      .activity-amount,
      .activity-status {
        margin-left: 56px;
        margin-top: 8px;
      }
    }

    @media (max-width: 480px) {
      .actions-grid {
        grid-template-columns: 1fr;
      }

      .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);

  readonly isLoading = signal(true);
  readonly stats = signal<StatCard[]>([]);
  readonly recentActivity = signal<RecentActivity[]>([]);

  readonly quickActions = signal<QuickAction[]>([
    {
      label: 'New Delivery',
      icon: 'pi pi-plus-circle',
      route: '/deliveries',
      color: '#1976d2'
    },
    {
      label: 'New Customer',
      icon: 'pi pi-user-plus',
      route: '/customers',
      color: '#7b1fa2'
    },
    {
      label: 'New Product',
      icon: 'pi pi-plus',
      route: '/products',
      color: '#388e3c'
    },
    {
      label: 'View Returns',
      icon: 'pi pi-replay',
      route: '/returns',
      color: '#f57c00'
    },
    {
      label: 'Manage Drivers',
      icon: 'pi pi-users',
      route: '/drivers',
      color: '#00897b'
    },
    {
      label: 'View Payments',
      icon: 'pi pi-credit-card',
      route: '/payments',
      color: '#5c6bc0'
    }
  ]);

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.isLoading.set(true);

    this.dashboardService.getDashboardStats().subscribe({
      next: (dashboardStats) => {
        this.stats.set([
          {
            title: 'Total Customers',
            value: dashboardStats.totalCustomers,
            icon: 'pi pi-users',
            color: '#1976d2'
          },
          {
            title: 'Total Products',
            value: dashboardStats.totalProducts,
            icon: 'pi pi-box',
            color: '#7b1fa2'
          },
          {
            title: 'Active Drivers',
            value: dashboardStats.activeDrivers,
            icon: 'pi pi-truck',
            color: '#388e3c'
          },
          {
            title: "Today's Deliveries",
            value: dashboardStats.todayDeliveries,
            icon: 'pi pi-file',
            color: '#f57c00'
          },
          {
            title: 'Pending Returns',
            value: dashboardStats.pendingReturns,
            icon: 'pi pi-replay',
            color: '#c62828'
          },
          {
            title: 'Monthly Revenue',
            value: this.formatCurrency(dashboardStats.monthlyRevenue),
            icon: 'pi pi-wallet',
            color: '#00897b'
          }
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
    const icons: Record<ActivityType, string> = {
      delivery: 'pi pi-truck',
      payment: 'pi pi-wallet'
    };
    return icons[type];
  }

  formatStatus(status: string): string {
    return status.replace('_', ' ');
  }
}
