import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ClientViewDetailService } from './client-view-details.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { CookieService } from 'ngx-cookie-service';
import { DatePipe } from '@angular/common';
import { concatAll } from 'rxjs/operators';

@Component({
  selector: 'app-client-view-details',
  templateUrl: './client-view-details.component.html',
  styleUrls: ['./client-view-details.component.scss'],
  providers: [CookieService, ClientViewDetailService, MessageService, DatePipe],
})


export class ClientViewDetailsComponent implements OnInit {
  @ViewChild('exampleModal') exampleModal: ElementRef;
  clients: any[];
  routeType: any[];
  ClientID: any[];
  TraineeID: string = '';
  OrgID: string = '';
  noResultsFound: boolean = true;
  loading: boolean = false;
  ClientDetails: any[];
  additionalAmount: any = 0
  totalReceivedAmount: any = 0;
  totalPendingAmount: any = 0;
  constructor(private router: Router, private route: ActivatedRoute, private cookieService: CookieService, private messageService: MessageService, private service: ClientViewDetailService, private datePipe: DatePipe) {

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
      clientID: this.ClientID,
    };
    this.loading = true;
    this.service.getclientsInvoice(Req).subscribe((x: any) => {
      this.allInvoices = x.result;
      this.totalReceivedAmount =  this.allInvoices.reduce((sum, invoice) => sum + parseFloat(invoice.receivedamt), 0);
    this.totalPendingAmount =  this.allInvoices.reduce((sum, invoice) => sum + parseFloat(invoice.total) - parseFloat(invoice.receivedamt), 0);
      
      this.loading = false;
      this.noResultsFound = this.allInvoices.length === 0;
    }),
      (error: any) => {
        console.error('Error occurred:', error);
        this.loading = false;
      };
  }

  ClientViewDetails() {
    let Req = {
      // TraineeID: this.TraineeID,
      clientid: this.ClientID,
      OrgID: this.OrgID,
    };
    this.loading = true;
    this.service.getClientDetailsList(Req).subscribe((x: any) => {
      this.ClientDetails = x.result;
      console.log("inside the clintdetails",this.ClientDetails)
      this.noResultsFound = this.ClientDetails.length === 0;
      this.loading = false;
    }),
      (error: any) => {
        console.error('Error occurred:', error);
        this.loading = false;
      };
  }

  receivedamt: number;
  invoiceid: number;
  showPopup = false;
  openPopupbox = false;

  openPopup(invoiceId: number) {
    this.showPopup = true;
    this.invoiceid = invoiceId;
  }
  Popup() {
    this.openPopupbox = true;
  }
  cancel() {
    this.showPopup = false;
  }

  Addamount() {
    this.allInvoices.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    for (let invoice of this.allInvoices) {
      let remainingAmount = invoice.total - invoice.receivedamt;
      console.log("additionalAmount :" + this.additionalAmount);
      console.log("Received Amount :" + remainingAmount);
      let amountToAllocate = Math.min(this.additionalAmount, remainingAmount);

      if (amountToAllocate > 0) {
        invoice.receivedamt = parseFloat(invoice.receivedamt) + amountToAllocate;
        this.additionalAmount -= amountToAllocate;
      }
      if (this.additionalAmount === 0) {
        break;
      }
    }
    console.log(this.allInvoices);
    (this.exampleModal.nativeElement as any).modal('hide');
  }

  SavePayment() {
    let req = this.allInvoices.map(invoice => ({
      id: invoice.id,
      receivedamt: invoice.receivedamt
    }));

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

  subtractAmount() {
    const req = {
      id: this.invoiceid,
      receivedamt: this.receivedamt
    };
    console.log(req);
    this.service.subtractPayment(req).subscribe(
      (response: any) => {
        this.handleSuccess(response);
        this.ClientViewDetails();
        this.fetchclientsInvoice();
      },
      (error: any) => {
        this.handleError(error);
        this.fetchclientsInvoice();
      }
    );
    this.showPopup = false;
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



  calculateDays(duedate: string): string {
    const currentDate = new Date();
    const dueDate = new Date(duedate);
    const timeDiff = dueDate.getTime() - currentDate.getTime();
    const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (dayDiff < 0) {
      return `overdue ${Math.abs(dayDiff)} days`;
    } else if (dayDiff === 0) {
      return 'due today';
    } else {
      return `due in ${dayDiff} days`;
    }
  }
  getRemainingAmount(total: number, receivedAmt: number): number {
    return total - receivedAmt;
  }

}
