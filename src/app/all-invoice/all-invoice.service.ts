import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpEvent, HttpParams, HttpRequest, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';


@Injectable()
export class AllInvoiceService {

  public endpoint = environment.apiUrl;

  constructor(private http: HttpClient) { }
  
  getAllInvoiceList(request: any): Observable<ResponseDetails> {
    return this.http.post<ResponseDetails>(this.endpoint + 'getAllInvoiceList', request);
}

  getPaidInvoiceList(request: any): Observable<ResponseDetails> {
    return this.http.post<ResponseDetails>(this.endpoint + 'getPaidInvoiceList', request);
}
  getunPaidInvoiceList(request: any): Observable<ResponseDetails> {
    return this.http.post<ResponseDetails>(this.endpoint + 'getunPaidInvoiceList', request);
}
updateReceivedPayment(request: any): Observable<ResponseDetails> {
  return this.http.post<ResponseDetails>(this.endpoint + 'updateReceivedPayment', request);
}
CancelInvoice(request: any): Observable<ResponseDetails> {
  return this.http.post<ResponseDetails>(this.endpoint + 'CancelInvoice', request);
}

getCancelledInvoices(request: any): Observable<ResponseDetails> {
  return this.http.post<ResponseDetails>(this.endpoint + 'getCancelledInvoices', request);
}
}
export interface ResponseDetails {
  flag?: any;
  result?: any;
}
