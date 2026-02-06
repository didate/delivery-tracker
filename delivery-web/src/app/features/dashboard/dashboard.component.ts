import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatCardModule],
  template: `
    <div class="dashboard-container">
      <h1>Dashboard</h1>
      <mat-card>
        <mat-card-header>
          <mat-card-title>Welcome to Delivery Web</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>This is your dashboard. Start managing your deliveries, customers, and more.</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .dashboard-container {
      h1 {
        margin-bottom: 24px;
        font-size: 24px;
        font-weight: 500;
      }
    }

    mat-card {
      max-width: 600px;
    }
  `]
})
export class DashboardComponent {}
