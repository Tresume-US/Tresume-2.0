


import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AllInvoiceService } from './all-invoice.service';
import { MessageService } from 'primeng/api';
import { CookieService } from 'ngx-cookie-service';
import { NgModel } from '@angular/forms';

@Component({
  selector: 'app-all-invoice',
  templateUrl: './all-invoice.component.html',
  styleUrls: ['./all-invoice.component.scss'],
  providers: [CookieService, MessageService, AllInvoiceService],

})


export class AllInvoiceComponent implements OnInit {

  @Output() confirmed = new EventEmitter<boolean>();
  @Output() modalClosed = new EventEmitter<void>();
  makeInactiveModal: any;
  isModal3Open: any;
  // openMakeInactiveModal: any;
  deleteAction() {
    throw new Error('Method not implemented.');
  }
  loading: boolean = false;
  isRowSelected = false;
  isContentVisible = false;
  showContent1 = false;
  showContent2 = false;
  isModalOpen = false;
  shareLink = '';
  row: any;
  noResultsFound: boolean = true;
  invoices: any[] = [];
  paidInvoices: any[] = [];
  unpaidInvoices: any[] = [];
  allInvoices: any[] = [];
  filteredInvoices: any[] = [];
  searchQuery: string = '';
  filteredPaidInvoices: any[] = [];
  searchPaidQuery: string = '';
  filteredUnpaidInvoices: any[] = [];
  searchUnpaidQuery: string = '';
  OrgID: string = '';
  TraineeID: string = '';
  

  activeTab = 'allinvoices';
  showCustomDateModel = false;
  startDate: string;
  endDate: string;

  // receivedamt: any; 
  // invoiceid:any;
  // updateReceivedPayment() {
  //   let req = {
  //     // receivedamt: this.receivedamt,
  //     // invoiceid:this.invoiceid,
  //   };
  //   // console.log(this.receivedAmount); 

  //   console.log(req);
  //   // this.service.updateReceivedPayment(req).subscribe(
  //   //   (response: any) => {
  //   //     this.handleSuccess(response);
  //   //   },
  //   //   (error: any) => {
  //   //     this.handleError(error);
  //   //   }
  //   // );
  // }


  showPopup = false;
  receivedamt: number;
  invoiceid: number;

  openPopup(invoiceId: number) {
    this.showPopup = true;
    this.invoiceid = invoiceId;
  }
 
  selectAll(checked: boolean): void {
    this.filteredInvoices.forEach(invoice => {
      invoice.selected = checked;
    });    
  }

  selectAll1(checked: boolean): void {

    this.filteredPaidInvoices.forEach(invoice => {
      invoice.selected = checked;
    });

  }
  selectAll2(checked: boolean): void {
    this.filteredUnpaidInvoices.forEach(invoice => {
      invoice.selected = checked;
    });
  }

  selectRow(invoice: any): void {
    invoice.selected = !invoice.selected;
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
        this.fetchAllInvoiceList();
      },
      (error: any) => {
        this.handleError(error);
      }
    );
    this.showPopup = false;
  }

  private handleSuccess(response: any): void {
    this.messageService.add({ severity: 'success', summary: response.message });
    console.log(response);
    this.loading = false;
    // this.router.navigate(['/all-invoice/' + this.routeType]);
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

  batchActionsOptions = ['Batch Actions'
  ];

  typeOptions = ['All transaction', 'All plus deposits'];

  statusOptions = ['All', 'Open'
  ];

  dateOptions = ['All', 'This Week', 'This Month', 'Last Week', 'Last Month', 'Custom dates'
  ];


  confirmDelete() {
    this.confirmed.emit(true);
  }

  cancelDelete() {
    this.confirmed.emit(false);
  }

  duplicateActions(): void {
    // Your delete logic here
    console.log('Deleting...');
  }

  uploadFile(event: any): void {
    const fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      const file: File = fileList[0];
      // You can perform further actions with the uploaded file
      console.log('File uploaded:', file);
    }
  }
  selectDocument(event: Event): void {
    event.preventDefault();
    document.getElementById('uploadInput')?.click();
  }

  openShareLinkModal(event: Event): void {
    event.preventDefault();
    this.shareLink = 'Your generated link';
    this.isModalOpen = true;
  }

  closeModals(): void {
    this.isModalOpen = false;
  }

  copyLink(): void {
    console.log('Copy Link logic');
  }

  save(): void {
    console.log('Save logic');
  }
  toggleContent(dropdown: string) {
    if (dropdown === 'dropdown1') {
      this.showContent1 = !this.showContent1;
    } else if (dropdown === 'dropdown2') {
      this.showContent2 = !this.showContent2;
    }
  }


  toggleContentVisibility() {
    this.isContentVisible = !this.isContentVisible;
  }
  onRowHover(): void {
    this.isRowSelected = true;
  }

  onRowOut(): void {
    this.isRowSelected = false;
  }



  showModal: any;

  closeModal2() {
    this.showModal = false;
  }



  paymentReceivedAction() {
    console.log('Payment Received');
  }

  duplicateAction() {
    console.log('Duplicate');
  }

  sendAction() {
    console.log('Send');
  }


  openSettings() {
    console.log("Settings icon clicked");
  }


  feedbackWithIcon() {
    throw new Error('Method not implemented.');
  }

  provideFeedback: any;
  closeModal() {
    throw new Error('Method not implemented.');
  }

  selectedType: string;
  showTable: boolean = false;

  viewRecurringTemplates() {
    this.showTable = true;

  }

  constructor(
    private dialog: MatDialog, private cookieService: CookieService, private messageService: MessageService, private service: AllInvoiceService,

  ) {

    this.OrgID = this.cookieService.get('OrgID');
    this.TraineeID = this.cookieService.get('TraineeID');
  }

  ngOnInit(): void {
    this.OrgID = this.cookieService.get('OrgID');
    this.loading = true;
    this.fetchPaidInvoiceList();
    this.fetchUnpaidInvoiceList();
    this.fetchAllInvoiceList();
  }


  fetchPaidInvoiceList() {
    let Req = {
      OrgID: this.OrgID,
    };
    this.service.getPaidInvoiceList(Req).subscribe((x: any) => {
      this.paidInvoices = x.result;
      this.applyPaidFilter();
      this.loading = false;
        this.paidInvoices = x.result;
        this.applyPaidFilter();
        this.loading = false;
        this.noResultsFound = this.paidInvoices.length === 0;
    }),
    (error: any) => {
      // Error callback
      console.error('Error occurred:', error);
      // Handle error here
      this.loading = false; // Set loading to false on error
    };
}
applyPaidFilter() {
  this.filteredPaidInvoices = this.paidInvoices.filter(invoice =>
      invoice.clientname.toLowerCase().includes(this.searchPaidQuery.toLowerCase())
    );
    this.noResultsFound = this.filteredPaidInvoices.length === 0 && this.searchPaidQuery !== '';
  }

  fetchUnpaidInvoiceList() {
    let Req = {
      OrgID: this.OrgID,
    };
    this.service.getunPaidInvoiceList(Req).subscribe((x: any) => {
      this.unpaidInvoices = x.result;
      this.applyUnpaidFilter();
      this.loading = false;
      this.noResultsFound = this.unpaidInvoices.length === 0;
  }),
  (error: any) => {
    // Error callback
    console.error('Error occurred:', error);
    // Handle error here
    this.loading = false; // Set loading to false on error
  };
}

  applyUnpaidFilter() {
    this.filteredUnpaidInvoices = this.unpaidInvoices.filter(invoice =>
      invoice.clientname.toLowerCase().includes(this.searchUnpaidQuery.toLowerCase())
    );
    this.noResultsFound = this.filteredUnpaidInvoices.length === 0 && this.searchUnpaidQuery !== '';
  }

  fetchAllInvoiceList() {
    let Req = {
      OrgID: this.OrgID,
    };
    this.service.getAllInvoiceList(Req).subscribe((x: any) => {
      this.allInvoices = x.result;
      this.applyFilter();
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

  applyFilter() {
    this.filteredInvoices = this.allInvoices.filter(invoice =>
      invoice.clientname.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
    this.noResultsFound = this.filteredInvoices.length === 0 && this.searchQuery !== '';
  }

  //this for amount filter
  // applyFilter() {
  //   this.filteredInvoices = this.allInvoices.filter(invoice =>
  //       (invoice.projectname.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
  //       invoice.total.toLowerCase().includes(this.searchQuery.toLowerCase()))
  //   );
  //   this.noResultsFound = this.filteredInvoices.length === 0 && this.searchQuery !== '';
  // }


  toggleCustomDateModel(option: string): void {
    this.showCustomDateModel = option === 'Custom dates';
  }


  applyAndClose(): void {
    this.applyDates(); // Apply dates
    this.showCustomDateModel = false; // Close custom date model
  }

  resetDates() {
    console.log('Resetting dates');
    this.startDate = '';
    this.endDate = '';
  }

  applyDates() {

    console.log(`Applying dates: Start - ${this.startDate}, End - ${this.endDate}`);

  }

  downloadExcel() {

  }

  isOverdue(date: Date): boolean {
    const currentDate = new Date();
    return date < currentDate;
  }

  cancel() {
    this.showPopup = false; // This hides the popup
    // Any other cancellation logic can go here
  }
  
}
