import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Team, CreateTeamDto, UpdateTeamDto } from '../../../core/models/team.model';

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/teams`;

  getAll(): Observable<Team[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(response => response.data || [])
    );
  }

  getById(id: string): Observable<Team> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.data || response)
    );
  }

  create(team: CreateTeamDto): Observable<Team> {
    return this.http.post<Team>(this.apiUrl, team);
  }

  update(id: string, team: UpdateTeamDto): Observable<Team> {
    return this.http.patch<Team>(`${this.apiUrl}/${id}`, team);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
