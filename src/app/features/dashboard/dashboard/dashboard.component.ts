import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { DashboardService } from '../../../core/services/dashboard.service';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { forkJoin } from 'rxjs';
import 'chartjs-adapter-moment';
import moment from 'moment';

// Register Chart.js components and adapter
Chart.register(...registerables);

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

interface TimelineDataset {
  start: Date;
  end: Date;
  color: string;
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
  ],
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('rpmChart', { static: true })
  rpmChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('timelineChart', { static: true })
  timelineChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('performanceChart', { static: true })
  performanceChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('availabilityChart', { static: true })
  availabilityChartRef!: ElementRef<HTMLCanvasElement>;

  selectedDuration = 0;
  dashboardData: { rpmData: RPMDataPoint[] } | null = null;
  filtersData: FiltersData | null = null;
  timelineData: TimelineItem[] | null = null;
  isLoading = true;
  error: string | null = null;

  private rpmChart: Chart | null = null;
  private timelineChart: Chart | null = null;
  private performanceChart: Chart | null = null;
  private availabilityChart: Chart | null = null;

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

  ngAfterViewInit(): void {
    // Add a small delay to ensure the view is fully rendered
    setTimeout(() => {
      this.initializeCharts();
    });
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

  private initializeCharts(): void {
    if (
      this.rpmChartRef?.nativeElement &&
      this.timelineChartRef?.nativeElement &&
      this.performanceChartRef?.nativeElement &&
      this.availabilityChartRef?.nativeElement
    ) {
      this.initializeRPMChart();
      this.initializeTimelineChart();
      this.initializeDonutCharts();
    } else {
      console.error('Chart references not available');
    }
  }

  private initializeRPMChart(): void {
    if (!this.rpmChartRef?.nativeElement) return;

    const ctx = this.rpmChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    this.rpmChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'RPM',
            data: [],
            borderColor: '#1976d2',
            backgroundColor: 'rgba(25, 118, 210, 0.1)',
            tension: 0.4,
            fill: true,
            pointRadius: 0,
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            titleColor: '#fff',
            bodyColor: '#fff',
            titleFont: { size: 13 },
            bodyFont: { size: 12 },
            padding: 10,
            displayColors: false,
          },
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'RPM',
              color: '#666',
            },
            grid: {
              color: '#eee',
            },
            ticks: {
              color: '#666',
            },
          },
          x: {
            type: 'time',
            time: {
              unit: 'minute',
              displayFormats: {
                minute: 'HH:mm',
              },
            },
            title: {
              display: true,
              text: 'Time',
              color: '#666',
            },
            grid: {
              color: '#eee',
            },
            ticks: {
              color: '#666',
              maxRotation: 0,
            },
          },
        },
      },
    });
  }

  private initializeTimelineChart(): void {
    if (!this.timelineChartRef?.nativeElement) return;

    const ctx = this.timelineChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    this.timelineChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Machine Status'],
        datasets: [
          {
            label: 'Machine Status',
            data: [],
            backgroundColor: [],
            barThickness: 40,
            minBarLength: 5,
          },
        ],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: true,
            mode: 'nearest',
            callbacks: {
              label: (context: any) => {
                const data = context.raw;
                return `${data.status} (${moment(data.startTime).format(
                  'HH:mm:ss'
                )} - ${moment(data.endTime).format('HH:mm:ss')})`;
              },
            },
          },
        },
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'hour',
              displayFormats: {
                hour: 'HH:mm',
              },
            },
            title: {
              display: true,
              text: 'Time',
              color: '#666',
            },
            grid: {
              color: '#eee',
            },
            ticks: {
              color: '#666',
            },
          },
          y: {
            display: true,
            grid: {
              display: false,
            },
          },
        },
      },
    });
  }

  private initializeDonutCharts(): void {
    if (
      !this.performanceChartRef?.nativeElement ||
      !this.availabilityChartRef?.nativeElement
    )
      return;

    const perfCtx = this.performanceChartRef.nativeElement.getContext('2d');
    const availCtx = this.availabilityChartRef.nativeElement.getContext('2d');
    if (!perfCtx || !availCtx) return;

    const commonOptions = {
      cutout: '75%',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: false,
        },
      },
    };

    // Performance Chart
    this.performanceChart = new Chart(perfCtx, {
      type: 'doughnut',
      data: {
        datasets: [
          {
            data: [0, 100],
            backgroundColor: ['#4CAF50', '#f5f5f5'],
            borderWidth: 0,
          },
        ],
      },
      options: commonOptions,
    });

    // Availability Chart
    this.availabilityChart = new Chart(availCtx, {
      type: 'doughnut',
      data: {
        datasets: [
          {
            data: [0, 100],
            backgroundColor: ['#2196F3', '#f5f5f5'],
            borderWidth: 0,
          },
        ],
      },
      options: commonOptions,
    });
  }

  private updateCharts(): void {
    this.updateRPMChart();
    this.updateTimelineChart();
    this.updateDonutCharts();
  }

  private updateRPMChart(): void {
    if (!this.rpmChart || !this.dashboardData?.rpmData) return;

    this.rpmChart.data.labels = this.dashboardData.rpmData.map(
      (d: RPMDataPoint) => d.timestamp
    );
    this.rpmChart.data.datasets[0].data = this.dashboardData.rpmData.map(
      (d: RPMDataPoint) => d.rpm
    );
    this.rpmChart.update();
  }

  private updateTimelineChart(): void {
    if (!this.timelineChart || !this.timelineData) return;

    const chartData = this.timelineData.map((item) => ({
      x: new Date(item.startTime).getTime(),
      width:
        new Date(item.endTime).getTime() - new Date(item.startTime).getTime(),
      y: 'Machine Status',
      status: item.status,
      startTime: item.startTime,
      endTime: item.endTime,
    }));

    this.timelineChart.data.datasets[0].data = chartData as any;
    this.timelineChart.data.datasets[0].backgroundColor = chartData.map((d) =>
      d.status === 'Online' ? '#a1ca70' : '#e61e2b'
    );

    this.timelineChart.update('none');
  }

  private updateDonutCharts(): void {
    if (!this.performanceChart || !this.availabilityChart || !this.filtersData)
      return;

    // Convert decimal to percentage for both charts
    const performancePercentage = this.filtersData.performance * 100;
    const availabilityPercentage = this.filtersData.availability * 100;

    // Update Performance Chart
    this.performanceChart.data.datasets[0].data = [
      performancePercentage,
      100 - performancePercentage,
    ];
    this.performanceChart.update();

    // Update Availability Chart
    this.availabilityChart.data.datasets[0].data = [
      availabilityPercentage,
      100 - availabilityPercentage,
    ];
    this.availabilityChart.update();
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
