import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class IntegrationService {

    public endpoint = environment.apiUrl;

  constructor(private http: HttpClient) { }

  sendWhatsapp(obj:any): Observable<ResponseDetails> {
    return this.http.post<ResponseDetails>(this.endpoint+'sendWhatsapp', obj );
  }

  insertWhatsapp(obj:any): Observable<ResponseDetails>{
    console.log("inside the insertwhatsapp")
    return this.http.post<ResponseDetails>(this.endpoint+'insert-whatsapp',obj)
  }

  addMailChimp(request: any): Observable<ResponseDetails> {
    return this.http.post<ResponseDetails>(this.endpoint + 'mailchimp', request);
  }
  addBeeline(request: any): Observable<ResponseDetails> {
    return this.http.post<ResponseDetails>(this.endpoint + 'beeline', request);
  }

}
export interface ResponseDetails {
  message(message: any): unknown;
  flag?: any;
  result?: any;
}