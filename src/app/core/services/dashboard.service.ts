import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private apiUrl = 'http://196.219.184.42/Abdullatif_Backend/api/Machines';

  constructor(private http: HttpClient) {}

  getFillers(duration: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/GetFillers?duration=${duration}`);
  }

  getDashboardData(duration: number): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/GetDashboardData?duration=${duration}`
    );
  }

  getTimelineData(duration: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/GetTimeLineData?duration=${duration}`);
  }
}
