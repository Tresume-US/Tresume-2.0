import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpEvent, HttpParams, HttpRequest, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';


@Injectable()
export class CreateNewJobsService {

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

  sendEmail(request: any): Observable<ResponseDetails> {
    let params = new HttpParams({
        fromObject: { to: request.to, subject: request.subject, text: request.text },
    });

    let httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' }),
    };
    return this.http.post<ResponseDetails>(this.endpoint + 'text-mail', params.toString(), httpOptions);
}
}
export interface ResponseDetails {
  flag?: any;
  result?: any;
}
