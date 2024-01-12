import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpEvent, HttpParams, HttpRequest, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable()

export class TalentBenchService {
    public endpoint = environment.apiUrl;

constructor(private http: HttpClient) { }

getTalentBenchList(request: any): Observable<ResponseDetails> {
  return this.http.post<ResponseDetails>(this.endpoint + 'getTalentBenchList', request);
}

addTalentBenchList(request: any): Observable<ResponseDetails> {
    return this.http.post<ResponseDetails>(this.endpoint + 'addTalentBenchList', request);
  }

candidatestatus(request: any): Observable<ResponseDetails> {
   return this.http.post<ResponseDetails>(this.endpoint + 'candidatestatus', request);
 }

 getLegalStatus(request: any): Observable<ResponseDetails> {
   return this.http.post<ResponseDetails>(this.endpoint + 'getLegalStatus', request);
 }
}
export interface ResponseDetails {
flag?: any;
result?: any;
}