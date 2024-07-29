import { Component, OnInit, OnChanges } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { NavigationService } from './navbar.service';

@Component({
    selector: 'ts-nav',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss'],
    providers: [NavigationService]
})
export class NavbarComponent implements OnInit {

    public onboardView: boolean = false;
    public traineeID:any;
    public traineeDetails: any = {};
    public userName: string;
    public isLoaded: boolean = false;
    orgID:any;
    fullAccess: number[];
    viewOnly: number[];
    isDropdownOpen: { [key: string]: boolean } = {};
    isSubMenuOpen: { [key: string]: boolean } = {};
    timesheetrole:any;
    userType: string;
    constructor(private route: ActivatedRoute, private router: Router,
        private cookieService: CookieService, private navService: NavigationService) {

    }

    ngOnInit() {
      this.traineeID = this.cookieService.get('TraineeID')
      this.orgID = this.cookieService.get('OrgID');
        this.userName = this.cookieService.get('userName1');
        this.userType = this.cookieService.get('usertype');
        this.timesheetrole = this.cookieService.get('timesheet_role');
        this.traineeDetails.FirstName = sessionStorage.getItem("FirstName");
        this.traineeDetails.LastName = sessionStorage.getItem("LastName");
        this.getUnreadCount();
        let Req = {
            username: this.userName
        };
        console.log(this.userType);
        if(this.userType ==='RECRUITER'){
            this.navService.getuseraccess(Req).subscribe((x: any) => {
                const ViewOnly = x.result[0].ViewOnly
                const FullAccess = x.result[0].FullAccess
                const DashboardPermission = x.result[0].DashboardPermission
                const RoleID = x.result[0].RoleID
               
                this.cookieService.set('ViewOnly', ViewOnly);
                this.cookieService.set('FullAccess', FullAccess);
                this.cookieService.set('DashboardPermission', DashboardPermission);
                this.cookieService.set('RoleID', RoleID);
             
                this.fullAccess = FullAccess.split(',').map(Number);
                var VewAccess = this.cookieService.get('ViewOnly');
                this.viewOnly = VewAccess.split(',').map(Number);
                this.isLoaded = true;
            });
            
        }else{
            this.isLoaded = true;
        }
       

    }

    checkFullAccess(numberToCheck: number): boolean {
        return this.fullAccess.includes(numberToCheck) || this.viewOnly.includes(numberToCheck);
    }

    public logout() {
        document.cookie.split(";").forEach(cookie => {
            const eqPos = cookie.indexOf("=");
            const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        });
        sessionStorage.clear();
        const randomQueryParam = Math.random().toString(36).substring(7);
        this.router.navigate([''], { queryParams: { refresh: randomQueryParam } });
    }
    
    
    
      toggleDropdown(subMenuId: string): void {
        this.isDropdownOpen[subMenuId] = !this.isDropdownOpen[subMenuId];
      }

      toggleSubMenu(subMenuId: string): void {
        this.isSubMenuOpen[subMenuId] = !this.isSubMenuOpen[subMenuId];
      }
      
      


    
      

      isPopupOpen = false;
      unreadCount: number = 0;

      getUnreadCount() {
        let req = {
          traineeID: this.traineeID,
          orgID: this.orgID

          // traineeID: 1176655,
          // orgID: 28
        };
      console.log(req)
        this.navService.fetchUnreadCount(req).subscribe((response: any) => {
          this.unreadCount = response.unreadCount; 
        }, (error) => {
          console.error('Error fetching unread count:', error);
        });
      }
      
  selectedNotification: any = null;
  notifications = [
    { message: 'New comment on your post', time: new Date(), isRead: false },
    // { message: 'Your order has been shipped', time: new Date(Date.now() - 24 * 60 * 60 * 1000), isRead: true },
    { message: 'Password changed successfully', time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), isRead: false },
    { message: 'Password changed successfully', time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), isRead: false },
    // { message: 'Your order has been shipped', time: new Date(Date.now() - 24 * 60 * 60 * 1000), isRead: true },
    { message: 'Password changed successfully', time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), isRead: false },
    { message: 'Password changed successfully', time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), isRead: false },
    
  ];

  togglePopup() {
    this.isPopupOpen = !this.isPopupOpen;
    this.selectedNotification = null;
    console.log('Popup toggled:', this.isPopupOpen);
  }

  viewNotification(notification: any) {
    this.selectedNotification = notification;
  }

  goBack() {
    this.selectedNotification = null;
  }

  formatNotificationTime(notificationTime: Date): string {
    const now = new Date();
    const notificationDate = new Date(notificationTime);
    const diffDays = Math.floor((now.getTime() - notificationDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return notificationDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday ' + notificationDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return notificationDate.toLocaleDateString() + ' ' + notificationDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  }
}