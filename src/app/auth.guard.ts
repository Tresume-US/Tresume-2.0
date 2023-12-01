import { Injectable } from '@angular/core';
import { CanActivate, Router,NavigationEnd } from '@angular/router';
import { AppService } from './app.service';
import { CookieService } from 'ngx-cookie-service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AppService, private router: Router,private cookieService: CookieService) {}

  canActivate(): boolean {
    if (this.authService.isLoggedIn()) {
      // User is authenticated, allow access to the route
     var traineeID =  this.cookieService.get('TraineeID'); 
       this.router.events.subscribe((e) => {
        if (e instanceof NavigationEnd) {
          let navEnd = <NavigationEnd>e;
          console.log(navEnd);
         
          if (navEnd.url.includes("/login") || navEnd.urlAfterRedirects.includes("/login") ) {
            var url = '/dashboard/'+traineeID;
            window.location.href = url;
          }
          
        }
      });
      return true;
    } else {
      // User is not authenticated, redirect to the login page
      // window.location.href = 'https://tresume.us/Login.aspx';
      // window.location.href = 'http://localhost:4200/login';
      // window.location.href = 'https://beta.tresume.us/TresumeNG/login';
      this.router.navigate(['/login']);
      return false;
    }
  }
}

