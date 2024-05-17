import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { AllClientService } from './allclient.service';
import { MessageService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-allclient',
  templateUrl: './allclient.component.html',
  providers: [CookieService, AllClientService, MessageService],
  styleUrls: ['./allclient.component.scss']
})
export class AllclientComponent implements OnInit {
  
  loading: boolean = false;
  deleteIndex: number;
  showConfirmationDialog: boolean = false;
  TraineeID: string = '';
  clients: any[];
  noResultsFound: boolean = false;
  orgID: string ='';
  routeType: any;

  constructor(private fb: FormBuilder, private cookieService: CookieService, private service: AllClientService, private messageService: MessageService, private router: Router, private route: ActivatedRoute) {
    this.routeType = this.route.snapshot.params["routeType"];
  }

  ngOnInit(): void {
    this.loading = true;
    this.TraineeID = this.cookieService.get('TraineeID');
    this.orgID = this.cookieService.get('OrgID')
    this.fetchclientlist();
  }

  ngOnChanges(): void {
    // this.fetchclientlist();
  }


  fetchclientlist() {
    let Req = {
      TraineeID: this.TraineeID,
      // OrgID:this.orgID
    };
    this.service.getTraineeClientList(Req).subscribe((x: any) => {
      this.clients = x.result;
      this.noResultsFound = this.clients.length === 0;
    this.loading = false;

    }),
    (error: any) => {
      // Error callback
      console.error('Error occurred:', error);
      // Handle error here
      this.loading = false; // Set loading to false on error
    };
  }


  deleteclient(ClientID: number) {
    this.deleteIndex = ClientID;
    console.log(this.deleteIndex);
    this.showConfirmationDialog = true;
  }


  confirmDelete() {
    console.log(this.deleteIndex);
    let Req = {
      ClientID: this.deleteIndex,
    };
    this.service.deleteClientAccount(Req).subscribe((x: any) => {
      var flag = x.flag;
      this.fetchclientlist();
      if (flag === 1) {
        this.messageService.add({
          severity: 'success',
          summary: 'Client Deleted Sucessfully',
        });
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Please try again later',
        });
      }

    });
    this.showConfirmationDialog = false;
  }


  cancelDelete() {
    console.log(this.showConfirmationDialog);
    this.showConfirmationDialog = false;
  }

  searchInput: string = '';

  // isClientVisible(client: any): boolean {
  //   const searchValue = this.searchInput.toLowerCase();
  //   return (
  //     client.EmailID.toLowerCase().includes(searchValue) ||
  //     client.ClientName.toLowerCase().includes(searchValue)
  //   );
  // }

  

}
