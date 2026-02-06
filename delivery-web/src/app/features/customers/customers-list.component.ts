import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-customers-list',
  standalone: true,
  imports: [MatCardModule],
  template: `
    <div class="page-container">
      <h1>Customers</h1>
      <mat-card>
        <mat-card-content>
          <p>Customers management coming soon...</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; }
    h1 { margin-bottom: 24px; }
  `]
})
export class CustomersListComponent {}
