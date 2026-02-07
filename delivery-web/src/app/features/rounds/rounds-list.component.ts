import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-rounds-list',
  standalone: true,
  imports: [CardModule],
  template: `
    <div class="page-container">
      <h1>Rounds</h1>
      <p-card>
        <p>Rounds management coming soon...</p>
      </p-card>
    </div>
  `,
  styles: [`
    .page-container { padding: 24px; }
    h1 { margin-bottom: 24px; }
  `]
})
export class RoundsListComponent {}
