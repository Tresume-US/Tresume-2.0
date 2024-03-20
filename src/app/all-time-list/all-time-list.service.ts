import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable()

export class TimesheetListService {
    public endpoint = environment.apiUrl;
    // public endpoint = 'https://alpha.tresume.us/TresumeAPI/';
    // public endpoint = 'http://localhost:3000/';

    constructor(private http: HttpClient) { }

    deleteUserAccount(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'deleteUserAccount', request);
    }
   
    getAllTimeList(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'getAllTimeList', request);
    }
    
    getPendingTimesheetResult(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'getPendingTimesheetResult', request);
    }
    getRejectedTimesheetResult(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'getRejectedTimesheetResult', request);
    }
    getCompletedTimesheetResult(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'getCompletedTimesheetResult', request);
    }
    getNonBillableTimesheetResult(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'getNonBillableTimesheetResult', request);
    }
    insertTimesheetTraineeCandidate(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'insertTimesheetTraineeCandidate', request);
    }
    getLocation(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'getLocation', request);
    }
    
    deleteTimesheet(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'deleteTimesheet', request);
    }

    gettimesheetrole(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'gettimesheetrole', request);
      }

    
    
}
export interface ResponseDetails {
    flag?: any;
    result?: any;
}