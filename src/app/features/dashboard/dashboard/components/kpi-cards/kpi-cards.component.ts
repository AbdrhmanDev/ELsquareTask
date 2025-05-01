import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-kpi-cards',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="kpi-cards">
      <div class="kpi-card">
        <div class="kpi-label">Productivity</div>
        <div class="kpi-value" *ngIf="data">
          {{ data.prodProductivity_rate | number: '1.2-2' }}
        </div>
        <div class="kpi-unit">m/min</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-label">Avg. Speed</div>
        <div class="kpi-value" *ngIf="data">
          {{ data.avgSpeed | number: '1.0-0' }}
        </div>
        <div class="kpi-unit">m/min</div>
      </div>
    </div>
  `,
  styles: [`
    .kpi-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .kpi-card {
      background: white;
      padding: 1rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      text-align: center;
    }

    .kpi-label {
      color: rgba(0,0,0,0.6);
      font-size: 0.9rem;
      margin-bottom: 0.5rem;
    }

    .kpi-value {
      font-size: 1.5rem;
      font-weight: bold;
      color: #2196F3;
    }

    .kpi-unit {
      color: rgba(0,0,0,0.4);
      font-size: 0.8rem;
    }
  `]
})
export class KpiCardsComponent {
  @Input() data: any;
}