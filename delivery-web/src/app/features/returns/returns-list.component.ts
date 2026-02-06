import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-returns-list',
  standalone: true,
  imports: [MatCardModule],
  template: `
    <div class="page-container">
      <h1>Returns</h1>
      <mat-card>
        <mat-card-content>
          <p>Returns management coming soon...</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; }
    h1 { margin-bottom: 24px; }
  `]
})
export class ReturnsListComponent {}
