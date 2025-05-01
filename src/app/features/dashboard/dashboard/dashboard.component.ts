import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { DashboardService } from '../../../core/services/dashboard.service';
import { forkJoin } from 'rxjs';
import { NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';

interface TimelineItem {
  startTime: string;
  endTime: string;
  status: 'Online' | 'Offline';
  stopType?: 'Normal' | 'Yarn';
}

interface RPMDataPoint {
  timestamp: string;
  rpm: number;
}

interface FiltersData {
  device_ID: string;
  count: number;
  availability: number;
  performance: number;
  weavingPerformance: number;
  avgSpeed: number;
  quality: number;
  efficiency: number;
  oee: number;
  prodProductivity_rate: number;
  stitches: number;
  stopsDuration: number;
  lastStop: string;
  totalNormalStops: number;
  totalYarnStops: number;
}

// Chart options interfaces
interface LineChartOptions {
  legend: boolean;
  showXAxisLabel: boolean;
  showYAxisLabel: boolean;
  xAxisLabel: string;
  yAxisLabel: string;
  animations: boolean;
  gradient: boolean;
  showGridLines: boolean;
  roundDomains: boolean;
  tooltipDisabled: boolean;
  xAxis: boolean;
  yAxis: boolean;
  xScaleMin: number;
  xScaleMax: number;
  xAxisTickFormatting?: (val: number) => string;
}

interface TimelineChartOptions {
  showXAxisLabel: boolean;
  showYAxisLabel: boolean;
  xAxisLabel: string;
  gradient: boolean;
  animations: boolean;
  roundDomains: boolean;
  showGridLines: boolean;
  barPadding: number;
  tooltipDisabled: boolean;
  xAxis?: boolean;
  yAxis?: boolean;
  xAxisTickFormatting?: (val: number) => string;
  yAxisTickFormatting?: (val: number) => string;
  tooltipTemplate?: (data: any) => string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule,
    NgxChartsModule,
  ],
})
export class DashboardComponent implements OnInit {
  selectedDuration = 0;
  dashboardData: { rpmData: RPMDataPoint[] } | null = null;
  filtersData: FiltersData | null = null;
  timelineData: TimelineItem[] | null = null;
  isLoading = true;
  error: string | null = null;

  // Chart configurations
  rpmChartData: any[] = [];
  timelineChartData: any[] = [];
  performanceGaugeData: any[] = [];
  availabilityGaugeData: any[] = [];

  // Chart options
  lineChartOptions: LineChartOptions = {
    legend: false,
    showXAxisLabel: true,
    showYAxisLabel: true,
    xAxisLabel: 'Time',
    yAxisLabel: 'RPM',
    animations: true,
    gradient: false,
    showGridLines: true,
    roundDomains: true,
    tooltipDisabled: false,
    xAxis: true,
    yAxis: true,
    xScaleMin: 0,
    xScaleMax: 0,
  };

  timelineChartOptions: TimelineChartOptions = {
    showXAxisLabel: true,
    showYAxisLabel: false,
    xAxisLabel: 'Time',
    gradient: false,
    animations: true,
    roundDomains: true,
    showGridLines: false,
    barPadding: 0,
    tooltipDisabled: false,
  };

  gaugeOptions = {
    min: 0,
    max: 100,
    units: '%',
    showAxis: false,
    bigSegments: 10,
    smallSegments: 5,
    animations: true,
    angleSpan: 240,
    startAngle: -120,
    showText: true,
    margin: [30, 30, 30, 30],
    textValue: '',
  };

  colorScheme = {
    name: 'custom',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#2196F3', '#4CAF50', '#FF5722', '#FFC107'],
  };

  performanceColorScheme = {
    name: 'performance',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#4CAF50'],
  };

  availabilityColorScheme = {
    name: 'availability',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#2196F3'],
  };

  timeFilters = [
    { value: 0, label: 'Current Shift' },
    { value: 1, label: 'Last Shift' },
    { value: 2, label: 'Last Day' },
    { value: 3, label: 'Last Week' },
    { value: 4, label: 'Last Month' },
  ];

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData(): void {
    this.isLoading = true;
    this.error = null;

    forkJoin({
      fillers: this.dashboardService.getFillers(this.selectedDuration),
      dashboard: this.dashboardService.getDashboardData(this.selectedDuration),
      timeline: this.dashboardService.getTimelineData(this.selectedDuration),
    }).subscribe({
      next: (data) => {
        this.filtersData = data.fillers;
        this.dashboardData = data.dashboard;
        this.timelineData = data.timeline;
        this.updateCharts();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.error = 'Failed to load dashboard data. Please try again.';
        this.isLoading = false;
      },
    });
  }

  onTimeFilterChange(duration: number): void {
    this.selectedDuration = duration;
    this.loadAllData();
  }

  private updateCharts(): void {
    this.updateRPMChart();
    this.updateTimelineChart();
    this.updateGaugeCharts();
  }

  private updateRPMChart(): void {
    if (!this.dashboardData?.rpmData || this.dashboardData.rpmData.length === 0)
      return;

    const sortedData = [...this.dashboardData.rpmData]
      .filter((d) => !isNaN(d.rpm) && d.rpm !== null && d.timestamp)
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

    if (sortedData.length === 0) return;

    const firstTimestamp = new Date(sortedData[0].timestamp).getTime();
    const lastTimestamp = new Date(
      sortedData[sortedData.length - 1].timestamp
    ).getTime();

    this.lineChartOptions = {
      ...this.lineChartOptions,
      xScaleMin: firstTimestamp,
      xScaleMax: lastTimestamp,
      xAxisTickFormatting: (val: number) => {
        const date = new Date(val);
        return date.toLocaleTimeString();
      },
    };

    this.rpmChartData = [
      {
        name: 'RPM',
        series: sortedData.map((d) => ({
          name: new Date(d.timestamp).getTime(),
          value: Math.round(Math.max(0, Number(d.rpm) || 0)),
          min: 0,
        })),
      },
    ];
  }

  private updateTimelineChart(): void {
    if (!this.timelineData || this.timelineData.length === 0) return;

    const sortedData = [...this.timelineData]
      .filter((item) => {
        const start = new Date(item.startTime).getTime();
        const end = item.endTime
          ? new Date(item.endTime).getTime()
          : new Date().getTime();
        return !isNaN(start) && !isNaN(end) && start <= end;
      })
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );

    if (sortedData.length === 0) return;

    const online = [];
    const offline = [];
    const now = new Date().getTime();

    for (const item of sortedData) {
      const startTime = new Date(item.startTime).getTime();
      const endTime = item.endTime ? new Date(item.endTime).getTime() : now;
      const durationInMinutes = Math.max(
        0,
        (endTime - startTime) / (1000 * 60)
      );

      if (isNaN(durationInMinutes)) continue;

      const timePoint = {
        name: startTime,
        value: Math.round(durationInMinutes),
        status: item.status,
        stopType: item.stopType,
        endTime: endTime,
        extra: {
          startTimeFormatted: new Date(startTime).toLocaleString(),
          endTimeFormatted: new Date(endTime).toLocaleString(),
          duration: this.formatDuration(durationInMinutes),
          status: item.status,
          stopType: item.stopType || 'N/A',
        },
      };

      if (item.status === 'Online') {
        online.push(timePoint);
      } else {
        offline.push(timePoint);
      }
    }

    // Update timeline chart options
    this.timelineChartOptions = {
      ...this.timelineChartOptions,
      xAxis: true,
      yAxis: true,
      xAxisTickFormatting: (val: number) => {
        return new Date(val).toLocaleTimeString();
      },
      yAxisTickFormatting: (val: number) => {
        return `${Math.round(val)}m`;
      },
      tooltipTemplate: (data: any) => {
        return `
                <div>
                    <div>Status: ${data.extra.status}</div>
                    <div>Start: ${data.extra.startTimeFormatted}</div>
                    <div>End: ${data.extra.endTimeFormatted}</div>
                    <div>Duration: ${data.extra.duration}</div>
                    ${
                      data.extra.stopType !== 'N/A'
                        ? `<div>Stop Type: ${data.extra.stopType}</div>`
                        : ''
                    }
                </div>
            `;
      },
    };

    this.timelineChartData = [
      {
        name: 'Online',
        series: online,
      },
      {
        name: 'Offline',
        series: offline,
      },
    ];
  }

  private formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }

  private updateGaugeCharts(): void {
    if (!this.filtersData) return;

    const performanceValue = Math.round(this.filtersData.performance * 100);
    const availabilityValue = Math.round(this.filtersData.availability * 100);

    this.performanceGaugeData = [
      {
        name: 'Performance',
        value: performanceValue,
        textValue: `${performanceValue}%`,
      },
    ];

    this.availabilityGaugeData = [
      {
        name: 'Availability',
        value: availabilityValue,
        textValue: `${availabilityValue}%`,
      },
    ];
  }

  getStopCounts(): { normal: number; yarn: number } {
    if (!this.timelineData) return { normal: 0, yarn: 0 };

    const normalStops = this.timelineData.filter(
      (item) => item.status === 'Offline' && item.stopType === 'Normal'
    ).length;

    const yarnStops = this.timelineData.filter(
      (item) => item.status === 'Offline' && item.stopType === 'Yarn'
    ).length;

    return { normal: normalStops, yarn: yarnStops };
  }
}
