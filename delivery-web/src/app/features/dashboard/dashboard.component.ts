import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { DatePipe } from '@angular/common';

interface StatCard {
  title: string;
  value: number | string;
  icon: string;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

interface QuickAction {
  label: string;
  icon: string;
  route: string;
  color: string;
}

interface RecentActivity {
  id: number;
  type: 'delivery' | 'return' | 'payment' | 'customer';
  description: string;
  timestamp: Date;
  status: 'completed' | 'pending' | 'cancelled';
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    DatePipe
  ],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <h1>Dashboard</h1>
        <p class="subtitle">Welcome back! Here's an overview of your delivery operations.</p>
      </header>

      <!-- Stats Cards Section -->
      <section class="stats-section">
        <h2 class="section-title">Overview</h2>
        <div class="stats-grid">
          @for (stat of stats(); track stat.title) {
            <mat-card class="stat-card" [style.--accent-color]="stat.color">
              <mat-card-content>
                <div class="stat-icon" [style.background-color]="stat.color + '20'" [style.color]="stat.color">
                  <mat-icon>{{ stat.icon }}</mat-icon>
                </div>
                <div class="stat-info">
                  <span class="stat-value">{{ stat.value }}</span>
                  <span class="stat-label">{{ stat.title }}</span>
                </div>
                @if (stat.trend) {
                  <div class="stat-trend" [class.positive]="stat.trend.isPositive" [class.negative]="!stat.trend.isPositive">
                    <mat-icon>{{ stat.trend.isPositive ? 'trending_up' : 'trending_down' }}</mat-icon>
                    <span>{{ stat.trend.value }}%</span>
                  </div>
                }
              </mat-card-content>
            </mat-card>
          }
        </div>
      </section>

      <!-- Quick Actions Section -->
      <section class="quick-actions-section">
        <h2 class="section-title">Quick Actions</h2>
        <div class="actions-grid">
          @for (action of quickActions(); track action.label) {
            <a [routerLink]="action.route" class="action-link">
              <mat-card class="action-card">
                <mat-card-content>
                  <div class="action-icon" [style.background-color]="action.color + '20'" [style.color]="action.color">
                    <mat-icon>{{ action.icon }}</mat-icon>
                  </div>
                  <span class="action-label">{{ action.label }}</span>
                </mat-card-content>
              </mat-card>
            </a>
          }
        </div>
      </section>

      <!-- Recent Activity Section -->
      <section class="activity-section">
        <div class="section-header">
          <h2 class="section-title">Recent Activity</h2>
          <a mat-button routerLink="/deliveries" color="primary">
            View All
            <mat-icon>arrow_forward</mat-icon>
          </a>
        </div>
        <mat-card class="activity-card">
          <mat-card-content>
            @if (recentActivity().length === 0) {
              <div class="empty-state">
                <mat-icon>inbox</mat-icon>
                <p>No recent activity</p>
              </div>
            } @else {
              <div class="activity-list">
                @for (activity of recentActivity(); track activity.id; let last = $last) {
                  <div class="activity-item">
                    <div class="activity-icon" [class]="activity.type">
                      <mat-icon>{{ getActivityIcon(activity.type) }}</mat-icon>
                    </div>
                    <div class="activity-content">
                      <span class="activity-description">{{ activity.description }}</span>
                      <span class="activity-time">{{ activity.timestamp | date:'short' }}</span>
                    </div>
                    <div class="activity-status" [class]="activity.status">
                      {{ activity.status }}
                    </div>
                  </div>
                  @if (!last) {
                    <mat-divider></mat-divider>
                  }
                }
              </div>
            }
          </mat-card-content>
        </mat-card>
      </section>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .dashboard-header {
      margin-bottom: 32px;

      h1 {
        margin: 0 0 8px 0;
        font-size: 28px;
        font-weight: 500;
        color: var(--mat-sys-on-surface);
      }

      .subtitle {
        margin: 0;
        color: var(--mat-sys-on-surface-variant);
        font-size: 14px;
      }
    }

    .section-title {
      font-size: 18px;
      font-weight: 500;
      margin: 0 0 16px 0;
      color: var(--mat-sys-on-surface);
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      .section-title {
        margin: 0;
      }

      a {
        mat-icon {
          margin-left: 4px;
          font-size: 18px;
          width: 18px;
          height: 18px;
        }
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

    .stat-card {
      transition: transform 0.2s ease, box-shadow 0.2s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      mat-card-content {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 20px !important;
      }
    }

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      mat-icon {
        font-size: 28px;
        width: 28px;
        height: 28px;
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
      color: var(--mat-sys-on-surface);
      line-height: 1.2;
    }

    .stat-label {
      font-size: 13px;
      color: var(--mat-sys-on-surface-variant);
      margin-top: 4px;
    }

    .stat-trend {
      display: flex;
      align-items: center;
      gap: 2px;
      font-size: 12px;
      font-weight: 500;
      padding: 4px 8px;
      border-radius: 12px;

      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }

      &.positive {
        color: #2e7d32;
        background-color: #e8f5e9;
      }

      &.negative {
        color: #c62828;
        background-color: #ffebee;
      }
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

    .action-card {
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      mat-card-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        padding: 24px 16px !important;
        text-align: center;
      }
    }

    .action-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;

      mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }
    }

    .action-label {
      font-size: 14px;
      font-weight: 500;
      color: var(--mat-sys-on-surface);
    }

    /* Activity Section */
    .activity-section {
      margin-bottom: 32px;
    }

    .activity-card {
      mat-card-content {
        padding: 0 !important;
      }
    }

    .activity-list {
      mat-divider {
        margin: 0 16px;
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

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      &.delivery {
        background-color: #e3f2fd;
        color: #1976d2;
      }

      &.return {
        background-color: #fff3e0;
        color: #f57c00;
      }

      &.payment {
        background-color: #e8f5e9;
        color: #388e3c;
      }

      &.customer {
        background-color: #f3e5f5;
        color: #7b1fa2;
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
      color: var(--mat-sys-on-surface);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .activity-time {
      font-size: 12px;
      color: var(--mat-sys-on-surface-variant);
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
      color: var(--mat-sys-on-surface-variant);

      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
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

      .stat-card mat-card-content {
        padding: 16px !important;
      }

      .stat-icon {
        width: 48px;
        height: 48px;

        mat-icon {
          font-size: 24px;
          width: 24px;
          height: 24px;
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
export class DashboardComponent {
  // Mock data using signals - ready to be connected to real APIs
  readonly stats = signal<StatCard[]>([
    {
      title: 'Total Customers',
      value: 1247,
      icon: 'people',
      color: '#1976d2',
      trend: { value: 12, isPositive: true }
    },
    {
      title: 'Total Products',
      value: 356,
      icon: 'inventory',
      color: '#7b1fa2',
      trend: { value: 8, isPositive: true }
    },
    {
      title: 'Active Drivers',
      value: 24,
      icon: 'local_shipping',
      color: '#388e3c',
      trend: { value: 5, isPositive: true }
    },
    {
      title: "Today's Deliveries",
      value: 87,
      icon: 'receipt_long',
      color: '#f57c00',
      trend: { value: 3, isPositive: false }
    },
    {
      title: 'Pending Returns',
      value: 15,
      icon: 'assignment_return',
      color: '#c62828'
    },
    {
      title: 'Monthly Revenue',
      value: '$48,520',
      icon: 'payments',
      color: '#00897b',
      trend: { value: 18, isPositive: true }
    }
  ]);

  readonly quickActions = signal<QuickAction[]>([
    {
      label: 'New Delivery',
      icon: 'add_circle',
      route: '/deliveries',
      color: '#1976d2'
    },
    {
      label: 'New Customer',
      icon: 'person_add',
      route: '/customers',
      color: '#7b1fa2'
    },
    {
      label: 'New Product',
      icon: 'add_box',
      route: '/products',
      color: '#388e3c'
    },
    {
      label: 'View Returns',
      icon: 'assignment_return',
      route: '/returns',
      color: '#f57c00'
    },
    {
      label: 'Manage Drivers',
      icon: 'groups',
      route: '/drivers',
      color: '#00897b'
    },
    {
      label: 'View Payments',
      icon: 'account_balance_wallet',
      route: '/payments',
      color: '#5c6bc0'
    }
  ]);

  readonly recentActivity = signal<RecentActivity[]>([
    {
      id: 1,
      type: 'delivery',
      description: 'Delivery #1247 completed to John Smith',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      status: 'completed'
    },
    {
      id: 2,
      type: 'customer',
      description: 'New customer registered: Sarah Johnson',
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      status: 'completed'
    },
    {
      id: 3,
      type: 'return',
      description: 'Return request #89 from Mike Davis',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      status: 'pending'
    },
    {
      id: 4,
      type: 'payment',
      description: 'Payment received: $125.00 from Order #1245',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
      status: 'completed'
    },
    {
      id: 5,
      type: 'delivery',
      description: 'Delivery #1246 assigned to Driver Alex',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
      status: 'pending'
    }
  ]);

  getActivityIcon(type: RecentActivity['type']): string {
    const icons: Record<RecentActivity['type'], string> = {
      delivery: 'local_shipping',
      return: 'assignment_return',
      payment: 'payments',
      customer: 'person'
    };
    return icons[type];
  }
}
