import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup } from '@angular/forms';
// import { LoginService } from './login.component.service';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../environments/environment';
import { HttpClient, HttpEvent, HttpParams, HttpRequest, HttpHeaders } from '@angular/common/http';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  username: string;
  password: string;
  errorMessage:string;
  form = new FormGroup({});

  constructor(private router: Router,private http: HttpClient,private cookieService: CookieService
    // private service: LoginService
    ) {}

  login() {
    const isAuthenticated = true;

    const ssoLoginUrl = environment.apiUrl+'ssologin';
    const body = JSON.stringify({ username: this.username, password: this.password });
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    this.http.post(ssoLoginUrl, body, { headers }).subscribe(
      (response:any) => {
        
        console.log('Login successful:', response);
        const userName = response.data.UserName
        const orgID = response.data.Organization
        const traineeID = response.data.TraineeID
        const ViewOnly = response.result[0].ViewOnly
        const FullAccess = response.result[0].FullAccess
        const DashboardPermission = response.result[0].DashboardPermission
        const RoleID = response.result[0].RoleID
        const IsAdmin = response.result[0].IsAdmin
        this.cookieService.set('userName1', userName);
        this.cookieService.set('OrgID', orgID);
        this.cookieService.set('TraineeID',traineeID);
        this.cookieService.set('ViewOnly',ViewOnly);
        this.cookieService.set('FullAccess',FullAccess);
        this.cookieService.set('DashboardPermission',DashboardPermission);
        this.cookieService.set('RoleID',RoleID);
        this.cookieService.set('IsAdmin',RoleID);
        
        var url = '/dashboard/'+traineeID;
        this.router.navigateByUrl(url);
        
      },
      (error) => {
        // Handle the error response
        console.error('Login error:', error);
        this.errorMessage = 'Login failed. Please check your credentials.';
        alert(this.errorMessage);
      }
    );

  }
}
