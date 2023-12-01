import { Component, OnInit, OnChanges } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { AppService } from './app.service';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [AppService]
})
export class AppComponent implements OnInit {

  constructor(private route: ActivatedRoute, private service1: AppService, private router: Router, private cookieService: CookieService) {
    //this.traineeID = this.route.snapshot.params["traineeId"];
    this.router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) {
        let navEnd = <NavigationEnd>e;
        if (navEnd.url.includes("/onboard/employee/")) {
          this.onboardSession = navEnd.url.split('/')[3];
          this.onboardView = true;
          this.getOnboardDetails();
        }
        if (navEnd.url.includes("/login") || navEnd.url.includes("/candidateView")) {
          this.enableNav = false;
        }
      }
    });
  }
  public url:string;
  public traineeID: any;
  public traineeDetails: any = {};
  public enableNav: boolean = true;
  public onboardView: boolean = false;
  public onboardSession: any;
  public sessionDetails: any;
  public name: any;
  public userName:string
  public orgID:string;
  public accesstoken:string;
  async ngOnInit() {
    //this.enableNav = (sessionStorage.getItem("Route") != "Documents");
    this.url = environment.routeUrl;
    setTimeout(() => {
      if (window.location.hostname === 'localhost') {
        return;
      } else {
        this.traineeID = this.cookieService.get('TraineeID')
        console.log('this.traineeID', this.traineeID)
        this.traineeDetails.FirstName = sessionStorage.getItem("FirstName");
        this.traineeDetails.LastName = sessionStorage.getItem("LastName");
        sessionStorage.setItem("TraineeID", this.traineeID);
        localStorage.setItem("TraineeID", this.traineeID);
         
      }
    }, 500);
        this.userName = this.cookieService.get('userName1');
         this.orgID = this.cookieService.get('OrgID');
         this.traineeID = this.cookieService.get('TraineeID');
         this.accesstoken = this.cookieService.get('accesstoken');

         await this.router.events.subscribe((e) => {
          if (e instanceof NavigationEnd) {
            let navEnd = <NavigationEnd>e;
            console.log(navEnd);
            this.enableNav=true;
            if (navEnd.url.includes("/onboard/employee/")) {
              this.onboardSession = navEnd.url.split('/')[3];
              this.onboardView = true;
              this.getOnboardDetails();
            }
            if (navEnd.url.includes("/login") || navEnd.url.includes("/candidateView") || navEnd.urlAfterRedirects.includes("/login") ) {
              this.enableNav = false;
              console.log(this.enableNav);
            }
            console.log(this.enableNav);
          }
        });
  }


  getOnboardDetails() {
    this.service1.getOnboardingSession(this.onboardSession).subscribe((x: any) => {
      if (x[0]) {
        this.sessionDetails = x[0];
        this.service1.getTraineeDetails(this.sessionDetails.TraineeID).subscribe((x: any) => {
          let response = x.result;
          if (response) {
            this.traineeDetails = response[0];
            this.name = this.traineeDetails.FirstName + ' ' + this.traineeDetails.LastName
          }
        });
      }
    });
  }

  async ngOnChanges(){
    this.userName = this.cookieService.get('userName1');
    this.orgID = this.cookieService.get('OrgID');
    this.traineeID = this.cookieService.get('TraineeID');
    this.accesstoken = this.cookieService.get('accesstoken');

    await this.router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) {
        let navEnd = <NavigationEnd>e;
        console.log(navEnd);
        this.enableNav=true;
        if (navEnd.url.includes("/onboard/employee/")) {
          this.onboardSession = navEnd.url.split('/')[3];
          this.onboardView = true;
          this.getOnboardDetails();
        }
        if (navEnd.url.includes("/login") || navEnd.url.includes("/candidateView") || navEnd.urlAfterRedirects.includes("/login") ) {
          this.enableNav = false;
          console.log(this.enableNav);
        }
        console.log(this.enableNav);
      }
    });
  }
}
