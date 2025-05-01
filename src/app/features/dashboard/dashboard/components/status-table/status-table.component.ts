import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="status-table">
      <table>
        <thead>
          <tr>
            <th>Status</th>
            <th>Duration</th>
            <th>Percentage</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let status of statusData">
            <td>
              <span
                class="status-indicator"
                [style.background-color]="status.color"
              ></span>
              {{ status.name }}
            </td>
            <td>{{ status.duration }}</td>
            <td>{{ status.percentage | number : '1.1-1' }}%</td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [
    `
      .status-table {
        background: white;
        border-radius: 8px;
        padding: 1rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        margin: 1rem 0;
      }

      table {
        width: 100%;
        border-collapse: collapse;
      }

      th,
      td {
        padding: 0.75rem;
        text-align: left;
        border-bottom: 1px solid #eee;
      }

      th {
        font-weight: 600;
        color: rgba(0, 0, 0, 0.6);
      }

      .status-indicator {
        display: inline-block;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        margin-right: 8px;
      }
    `,
  ],
})
export class StatusTableComponent {
  @Input() statusData: Array<{
    name: string;
    duration: string;
    percentage: number;
    color: string;
  }> = [];
}
