import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../environments/environment';

@Injectable()
export class NavigationService {

    private endpoint = environment.apiUrl;
    FullAccess: number[]
    ViewOnly: number[]

    constructor(private http: HttpClient, private cookieService: CookieService) { }

    getuseraccess(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'getuseraccess', request);
      }
      fetchUnreadCount(req: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'fetchUnreadCount', req);
      }
    checkFullAccess(numberToCheck: number): boolean {
        const userName = this.cookieService.get('userName1');
        var VewAccess = this.cookieService.get('ViewOnly');
        this.ViewOnly = VewAccess.split(',').map(Number);
        return this.FullAccess.includes(numberToCheck);
    }

    checkViewOnly(numberToCheck: number): boolean {
        var VewAccess = this.cookieService.get('ViewOnly');
        this.ViewOnly = VewAccess.split(',').map(Number);
        return this.ViewOnly.includes(numberToCheck);
    }

}

export interface ResponseDetails {
    flag?: any;
    result?: any;
}