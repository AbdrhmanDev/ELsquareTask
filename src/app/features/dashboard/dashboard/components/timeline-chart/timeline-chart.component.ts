import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ScaleType } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-timeline-chart',
  standalone: true,
  imports: [CommonModule, NgxChartsModule],
  template: `
    <div class="timeline-chart">
      <ngx-charts-line-chart
        [results]="timelineData"
        [xAxis]="true"
        [yAxis]="true"
        [legend]="true"
        [showXAxisLabel]="true"
        [showYAxisLabel]="true"
        [xAxisLabel]="'Time'"
        [yAxisLabel]="'Value'"
        [timeline]="false"
        [autoScale]="true"
        [scheme]="colorScheme"
      >
      </ngx-charts-line-chart>
    </div>
  `,
  styles: [
    `
      .timeline-chart {
        height: 300px;
        margin: 1rem 0;
      }
    `,
  ],
})
export class TimelineChartComponent {
  @Input() timelineData: any[] = [];

  colorScheme = {
    name: 'timeline',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#2196F3', '#4CAF50', '#FF5722', '#FFC107'],
  };
}
