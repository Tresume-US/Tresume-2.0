import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class HrmsService {
  public endpoint = environment.apiUrl;
  // public endpoint = 'https://alpha.tresume.us/TresumeAPI/';
  // public endpoint = 'http://localhost:3000/';

  constructor(private http: HttpClient) { }
  
  gethrmscandidateList(request: any): Observable<ResponseDetails> {
      return this.http.post<ResponseDetails>(this.endpoint + 'gethrmscandidateList', request);
  }

  deletehrmscandidateAccount(request: any): Observable<ResponseDetails> {
      return this.http.post<ResponseDetails>(this.endpoint + 'deletehrmscandidateAccount', request);
  }
  
  addHrmsCandidate(request: any): Observable<ResponseDetails> {
    return this.http.post<ResponseDetails>(this.endpoint + 'addHrmsCandidate', request);
  }

  fetchHrmsRecruiter(request: any): Observable<ResponseDetails> {
    return this.http.post<ResponseDetails>(this.endpoint + 'fetchHrmsRecruiter', request);
  }
}
export interface ResponseDetails {
  flag?: any;
  result?: any;
}
