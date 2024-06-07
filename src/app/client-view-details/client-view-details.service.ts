import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpEvent, HttpParams, HttpRequest, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable()

export class ClientViewDetailService {
    public endpoint = environment.apiUrl;

    constructor(private http: HttpClient) { }
    
    getClientDetailsList(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'getClientDetailsList', request);
    }
    getclientsInvoice(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'getclientsInvoice', request);
    }
    updateReceivedPayment(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'updateReceivedPayment', request);
      }
    subtractPayment(request: any): Observable<ResponseDetails> {
    return this.http.post<ResponseDetails>(this.endpoint + 'subtractPayment', request);
    }
    updateAmount(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'updateAmount', request);
    }

}
export interface ResponseDetails {
    flag?: any;
    result?: any;
}


