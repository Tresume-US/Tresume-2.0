import { Component, OnInit } from '@angular/core';
import { ClientViewDetailService } from './client-view-details.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-client-view-details',
  templateUrl: './client-view-details.component.html',
  styleUrls: ['./client-view-details.component.scss'],
  providers: [CookieService, ClientViewDetailService, MessageService],
})


export class ClientViewDetailsComponent implements OnInit {

  clients: any[];
  routeType: any[];
  ClientID: any[];
  TraineeID: string = '';
  OrgID: string = '';
  noResultsFound: boolean=true;
  loading: boolean = false;
  ClientDetails:any[];
  constructor( private router: Router, private route: ActivatedRoute, private cookieService: CookieService,private messageService: MessageService, private service: ClientViewDetailService) {
    
    this.TraineeID = this.cookieService.get('TraineeID');
    // this.OrgID = this.cookieService.get('OrgID');
    this.ClientID = this.route.snapshot.params['ClientID'];
   }

  ngOnInit(): void {
    this.ClientViewDetails();
  }

  

  ClientViewDetails() {
    let Req = {
      TraineeID: this.TraineeID,
      clientid:this.ClientID
    };
    console.log(Req)
    this.service.getClientDetailsList(Req).subscribe((x: any) => {
      this.ClientDetails = x.result;
      this.noResultsFound = this.ClientDetails.length === 0;
    this.loading = false;
    }),
    (error: any) => {
      // Error callback
      console.error('Error occurred:', error);
      // Handle error here
      this.loading = false; // Set loading to false on error
    };
  }

}
