import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

interface FillerData {
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

interface RpmDataPoint {
  timestamp: string;
  rpm: number;
}

interface DashboardData {
  rpmData: RpmDataPoint[];
}

interface TimelineItem {
  startTime: string;
  endTime: string;
  status: 'Online' | 'Offline';
  stopType?: string;
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private apiUrl = 'http://196.219.184.42/Abdullatif_Backend/api/Machines';

  constructor(private http: HttpClient) {}

  getFillers(duration: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/GetFillers?duration=${duration}`).pipe(
      map((data) => this.validateFillers(data)),
      catchError(() => of(this.getMockFillers()))
    );
  }

  getDashboardData(duration: number): Observable<any> {
    return this.http
      .get(`${this.apiUrl}/GetDashboardData?duration=${duration}`)
      .pipe(
        map((data) => this.validateDashboardData(data)),
        catchError(() => of(this.getMockDashboardData()))
      );
  }

  getTimelineData(duration: number): Observable<any> {
    return this.http
      .get(`${this.apiUrl}/GetTimeLineData?duration=${duration}`)
      .pipe(
        map((data) => this.validateTimelineData(data)),
        catchError(() => of(this.getMockTimelineData()))
      );
  }

  private validateFillers(data: any): FillerData {
    if (!data) return this.getMockFillers();

    return {
      device_ID: data.device_ID || 'MOCK_DEVICE',
      count: Number(data.count) || 0,
      availability: this.validatePercentage(data.availability),
      performance: this.validatePercentage(data.performance),
      weavingPerformance: this.validatePercentage(data.weavingPerformance),
      avgSpeed: Number(data.avgSpeed) || 0,
      quality: this.validatePercentage(data.quality),
      efficiency: this.validatePercentage(data.efficiency),
      oee: this.validatePercentage(data.oee),
      prodProductivity_rate: Number(data.prodProductivity_rate) || 0,
      stitches: Number(data.stitches) || 0,
      stopsDuration: Number(data.stopsDuration) || 0,
      lastStop: data.lastStop || new Date().toISOString(),
      totalNormalStops: Number(data.totalNormalStops) || 0,
      totalYarnStops: Number(data.totalYarnStops) || 0,
    };
  }

  private validateDashboardData(data: any): DashboardData {
    if (!data?.rpmData) return this.getMockDashboardData();

    return {
      rpmData: Array.isArray(data.rpmData)
        ? data.rpmData
            .filter((item: any): item is RpmDataPoint => item && item.timestamp)
            .map(
              (item: any): RpmDataPoint => ({
                timestamp: item.timestamp,
                rpm: Number(item.rpm) || 0,
              })
            )
            .filter((item: RpmDataPoint) => !isNaN(item.rpm))
        : [],
    };
  }

  private validateTimelineData(data: any): TimelineItem[] {
    if (!Array.isArray(data)) return this.getMockTimelineData();

    return data
      .filter(
        (item: any) =>
          item &&
          item.startTime &&
          (item.status === 'Online' || item.status === 'Offline')
      )
      .map(
        (item: any): TimelineItem => ({
          startTime: item.startTime,
          endTime: item.endTime || new Date().toISOString(),
          status: item.status,
          stopType:
            item.status === 'Offline' ? item.stopType || 'Normal' : undefined,
        })
      );
  }

  private validatePercentage(value: any): number {
    const num = Number(value);
    if (isNaN(num)) return 0;
    return Math.max(0, Math.min(1, num));
  }

  private getMockFillers(): FillerData {
    return {
      device_ID: 'MOCK_DEVICE',
      count: 1200,
      availability: 0.85,
      performance: 0.78,
      weavingPerformance: 0.82,
      avgSpeed: 850,
      quality: 0.95,
      efficiency: 0.8,
      oee: 0.75,
      prodProductivity_rate: 90,
      stitches: 15000,
      stopsDuration: 120,
      lastStop: new Date().toISOString(),
      totalNormalStops: 5,
      totalYarnStops: 3,
    };
  }

  private getMockDashboardData(): DashboardData {
    const now = new Date();
    const rpmData: RpmDataPoint[] = [];

    for (let i = 0; i < 24; i++) {
      const date = new Date(now);
      date.setHours(now.getHours() - i);
      rpmData.push({
        timestamp: date.toISOString(),
        rpm: Math.floor(700 + Math.random() * 200), 
      });
    }

    return { rpmData };
  }

  private getMockTimelineData(): TimelineItem[] {
    const now = new Date();
    const timelineData: TimelineItem[] = [];
    let currentTime = now;


    for (let i = 0; i < 12; i++) {
     
      const onlineStart = new Date(currentTime);
      currentTime = new Date(currentTime.setHours(currentTime.getHours() - 1));
      timelineData.push({
        startTime: currentTime.toISOString(),
        endTime: onlineStart.toISOString(),
        status: 'Online',
      });

      
      const offlineStart = new Date(currentTime);
      currentTime = new Date(currentTime.setHours(currentTime.getHours() - 1));
      timelineData.push({
        startTime: currentTime.toISOString(),
        endTime: offlineStart.toISOString(),
        status: 'Offline',
        stopType: Math.random() > 0.5 ? 'Normal' : 'Yarn',
      });
    }

    return timelineData;
  }
}
