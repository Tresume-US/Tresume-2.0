import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpEvent, HttpParams, HttpRequest, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class RecruiterViewJobsService {
  public endpoint = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getCity(request: any): Observable<ResponseDetails> {
    return this.http.post<ResponseDetails>(this.endpoint + 'getCity', request);
  }

  getJobPostData(request: any): Observable<ResponseDetails> {
    return this.http.post<ResponseDetails>(this.endpoint + 'getJobPostData', request);
  }
  PostJob(request: any): Observable<ResponseDetails> {
    return this.http.post<ResponseDetails>(this.endpoint + 'PostJob', request);
  }
  GetJobsbyJobID(request: any): Observable<ResponseDetails> {
    return this.http.post<ResponseDetails>(this.endpoint + 'GetJobsbyJobID', request);
  }
  getJobUpdateData(request: any): Observable<ResponseDetails> {
    return this.http.post<ResponseDetails>(this.endpoint + 'getJobUpdateData', request);
  }
  UpdateJob(request: any): Observable<ResponseDetails> {
    return this.http.post<ResponseDetails>(this.endpoint + 'UpdateJob', request);
  }
}
export interface ResponseDetails {
  flag?: any;
  result?: any;
}