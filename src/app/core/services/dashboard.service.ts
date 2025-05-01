import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private apiUrl = 'http://196.219.184.42/Abdullatif_Backend/api/Machines';

  constructor(private http: HttpClient) {}

  getDashboardData(duration: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/GetFilters?duration=${duration}`);
  }

  // Duration values:
  // 0: Current Shift
  // 1: Last Shift
  // 2: Last Day
  // 3: Last Week
  // 4: Last Month
}
