import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpEvent, HttpParams, HttpRequest, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';


@Injectable()

export class CorporateDocumentService {

  public endpoint = environment.apiUrl;

  constructor(private http: HttpClient) { }

  
  getDocumnetType(request: any): Observable<ResponseDetails> {
    return this.http.post<ResponseDetails>(this.endpoint + 'getDocumnetType', request);
  }
  getTabsList(request: any): Observable<ResponseDetails> {
    return this.http.post<ResponseDetails>(this.endpoint + 'getTabsList', request);
  }
  deletecorporatedocument(request: any): Observable<ResponseDetails> {
    return this.http.post<ResponseDetails>(this.endpoint + 'deletecorporatedocument', request);
  }
  uploadCorporateDoc(request: FormData): Observable<ResponseDetails> {
    return this.http.post<ResponseDetails>(this.endpoint + 'uploadCorporateDoc', request);
  }
}
export interface ResponseDetails {
  flag?: any;
  result?: any;
}
