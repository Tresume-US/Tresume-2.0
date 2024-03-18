import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable()

export class ApplicantDetailsService {

    public endpoint = environment.apiUrl;

    constructor(private http: HttpClient) { }

    getjobapplicants(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'getjobapplicants', request);
    }

    acceptApplication(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'acceptApplication', request);
    }

    rejectApplication(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'rejectApplication', request);
    }
    getResumeDetails(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'getResumeDetails', request);
    }
    getResumePath(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'getResumePath', request);
    }
    
}
export interface ResponseDetails {
    flag?: any;
    result?: any;
}


