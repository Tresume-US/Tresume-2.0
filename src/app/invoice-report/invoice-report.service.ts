
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ResponseDetails } from '../app.service';
import { HttpClient, HttpEvent, HttpParams, HttpRequest, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class InvoiceReportService {
  // deleteplacementdata(Req: { TraineeInterviewID: number; }) {
  //   throw new Error('Method not implemented.');
  // }
  private endpoint = environment.apiUrl;

  constructor(private http: HttpClient) { }


  getInvoiceReport(request: any): Observable<ResponseDetails> {
    return this.http.post<ResponseDetails>(this.endpoint + 'getInvoiceReport', request);
  }

}
