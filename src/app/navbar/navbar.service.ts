import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../environments/environment';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable(
{
   providedIn: 'root'
}
)
export class NavigationService {

    private endpoint = environment.apiUrl;
    FullAccess: number[]
    ViewOnly: number[]

    private notificationCount = new BehaviorSubject<number>(0);
    currentCount = this.notificationCount.asObservable();

    constructor(private http: HttpClient, private cookieService: CookieService) { }

    getuseraccess(request: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'getuseraccess', request);
      }
      // fetchUnreadCount(req: any): Observable<ResponseDetails> {
      //   return this.http.post<ResponseDetails>(this.endpoint + 'fetchUnreadCount', req);
      // }
      fetchNotifications(req: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'fetchNotifications', req);
      }
      
      UpdateNotificationResult(req: any): Observable<ResponseDetails> {
        return this.http.post<ResponseDetails>(this.endpoint + 'UpdateNotificationResult', req);
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

    updateCount(count: number) {
      this.notificationCount.next(count);
      console.log(this.notificationCount);
    }

    fetchUnreadCount(req: any): Observable<ResponseDetails2> {
      return this.http.post<ResponseDetails2>(`${this.endpoint}fetchUnreadCount`, req).pipe(
        tap(response => {
          // Update the notification count
          this.notificationCount.next(response.unreadCount);
        })
      );
    }
    updateAllRead(req: any): Observable<ResponseDetails> {
      return this.http.post<ResponseDetails>(this.endpoint + 'updateAllRead', req);
    }
}
interface ResponseDetails2 {
  unreadCount: number;
}
export interface ResponseDetails {
    flag?: any;
    result?: any;
}