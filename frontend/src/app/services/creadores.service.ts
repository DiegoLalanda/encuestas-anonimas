import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RequestAccessResponse } from '../interfaces/request-access-response.interface';
import { environment } from '../../environments/environment.prod';

@Injectable({ providedIn: 'root' })
export class CreadoresService {
  private apiUrl = `${environment.apiUrl}/creadores`;

  constructor(private http: HttpClient) {}

  requestAccess(email: string): Observable<RequestAccessResponse> {
    return this.http.post<RequestAccessResponse>(this.apiUrl, { email });
  }
}
