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
    this.OrgID = this.cookieService.get('OrgID');
    this.ClientID = this.route.snapshot.params['ClientID'];
   }

  ngOnInit(): void {
    this.loading = true;
    this.ClientViewDetails();
    this.fetchclientsInvoice();
  }
  
  allInvoices: any[] = [];
  fetchclientsInvoice() {
    let Req = {
      OrgID: this.OrgID,
      clientID:this.ClientID,
    };
    this.loading = true;
    this.service.getclientsInvoice(Req).subscribe((x: any) => {
      this.allInvoices = x.result;
    
      this.loading = false;
      this.noResultsFound = this.allInvoices.length === 0;
    }),
    (error: any) => {
      // Error callback
      console.error('Error occurred:', error);
      // Handle error here
      this.loading = false; // Set loading to false on error
    };
  }

  ClientViewDetails() {
    let Req = {
      TraineeID: this.TraineeID,
      clientid:this.ClientID
    };
    console.log(Req)
    this.loading = true;
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

  receivedamt: number;
  invoiceid: number;
  showPopup = false;

  
  openPopup(invoiceId: number) {
    this.showPopup = true;
    this.invoiceid = invoiceId;
  }
  cancel() {
    this.showPopup = false; // This hides the popup
    // Any other cancellation logic can go here
  }



  saveAmount() {
    // console.log('Invoice ID:', this.invoiceid);
    // console.log('Received payment amount:', this.receivedamt);
    const req = {
      id: this.invoiceid,
      receivedamt: this.receivedamt
    };

    console.log(req);
    this.service.updateReceivedPayment(req).subscribe(
      (response: any) => {
        this.handleSuccess(response);
        this.ClientViewDetails();
        // this.fetchPaidInvoiceList();
        // this.fetchUnpaidInvoiceList();
        this.fetchclientsInvoice();
      },
      (error: any) => {
        this.handleError(error);
        // this.fetchPaidInvoiceList();
        // this.fetchUnpaidInvoiceList();
        this.fetchclientsInvoice();
      }
      
    );
    
    this.showPopup = false;
  }

  updateReceivedPayment() {
    let req = {
      receivedamt: this.receivedamt,
      invoiceid:this.invoiceid,
    };
    console.log(this.receivedamt); 

    console.log(req);
    this.service.updateReceivedPayment(req).subscribe(
      (response: any) => {
        this.handleSuccess(response);
        this.ClientViewDetails();
      },
      (error: any) => {
        this.handleError(error);
      }
    );
  }

  private handleSuccess(response: any): void {
    this.messageService.add({ severity: 'success', summary: response.message });
    console.log(response);
    this.loading = false;
  }

  private handleError(error: any): void {
    let errorMessage = 'An error occurred';
    if (error.error && error.error.message) {
      errorMessage = error.error.message;
    }
    this.messageService.add({ severity: 'error', summary: errorMessage });
    console.error('Error occurred:', error);
    this.loading = false;
  }

  getTotalAmount(): number {
    return this.ClientDetails.reduce((total, client) => total + parseFloat(client.total), 0);
}

getReceivedAmount(): number {
  return this.ClientDetails.reduce((total, client) => total + parseFloat(client.receivedamt), 0);
}

getPendingAmount(): number {
  return this.ClientDetails.reduce((total, client) => total + (parseFloat(client.total) - parseFloat(client.receivedamt)), 0);
}


}
