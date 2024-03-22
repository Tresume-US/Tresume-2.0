import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpEvent, HttpParams, HttpRequest, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class ViewDetailsService {
  public endpoint = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getPendingTimesheetResult(request: any): Observable<ResponseDetails> {
    return this.http.post<ResponseDetails>(this.endpoint + 'getPendingTimesheetResult', request);
  }

  UpdateRejectStatus(request: any): Observable<ResponseDetails> {
    return this.http.post<ResponseDetails>(this.endpoint + 'UpdateRejectStatus', request);
  }

  UpdateAcceptStatus(request: any): Observable<ResponseDetails> {
    return this.http.post<ResponseDetails>(this.endpoint + 'UpdateAcceptStatus', request);
  }

  Candidateviewdetails(request: any): Observable<ResponseDetails> {
    return this.http.post<ResponseDetails>(this.endpoint + 'Candidateviewdetails', request);
  }
  updatetimesheet(request: any): Observable<ResponseDetails> {
    return this.http.post<ResponseDetails>(this.endpoint + 'updatetimesheet', request);
  }

}
export interface ResponseDetails {
  flag?: any;
  result?: any;
}