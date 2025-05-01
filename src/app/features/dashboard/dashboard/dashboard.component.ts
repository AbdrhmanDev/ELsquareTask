import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { DashboardService } from '../../../core/services/dashboard.service';

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
    MatIconModule
  ]
})
export class DashboardComponent implements OnInit {
  selectedDuration = 0;
  dashboardData: any = null;
  isLoading = true;
  error: string | null = null;

  timeFilters = [
    { value: 0, label: 'Current Shift' },
    { value: 1, label: 'Last Shift' },
    { value: 2, label: 'Last Day' },
    { value: 3, label: 'Last Week' },
    { value: 4, label: 'Last Month' }
  ];

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.dashboardService.getDashboardData(this.selectedDuration).subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.error = null;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.error = 'Failed to load dashboard data. Please try again.';
        this.isLoading = false;
      }
    });
  }

  onTimeFilterChange(duration: number): void {
    this.selectedDuration = duration;
    this.loadDashboardData();
  }
}
