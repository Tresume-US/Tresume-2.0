import { Component, EventEmitter, OnInit, Output} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AllInvoiceService } from './all-invoice.service';
import { MessageService } from 'primeng/api';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-all-invoice',
  templateUrl: './all-invoice.component.html',
  styleUrls: ['./all-invoice.component.scss'],
  providers: [CookieService, MessageService , AllInvoiceService],
  
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
  noResultsFound:boolean = true;
  invoices: any[] = [];
  unpaidInvoices: any[] = [];
  allInvoices: any[] = [];

  OrgID:string = '';
  TraineeID:string = '';

  activeTab = 'allinvoices';
  showCustomDateModel = false;
  startDate: string;
  endDate: string;
  
  
  batchActionsOptions = ['Batch Actions'];

  typeOptions = ['All transaction','All plus deposits'];

  statusOptions = ['All', 'Open'
  ];

  dateOptions = ['All', 'This Week','This Month','Last Week','Last Month','Custom dates'
  ];


confirmDelete() {
  this.confirmed.emit(true);
}

cancelDelete() {
  this.confirmed.emit(false);
}

duplicateActions(): void {
  console.log('Deleting...');
}

uploadFile(event: any): void {
  const fileList: FileList = event.target.files;
  if (fileList.length > 0) {
    const file: File = fileList[0];
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
  onRowHover(event: MouseEvent): void {
    this.isRowSelected = true;
  }

  onRowOut(event: MouseEvent): void {
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

  handlePrint() {
    console.log("Print icon clicked");
  }

  handleFileUpload() {
    console.log("File upload icon clicked");
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

       }
    
  ngOnInit(): void {
    // this.loading = true;
    this.OrgID = this.cookieService.get('OrgID');
    this.TraineeID = this.cookieService.get('TraineeID');
    this.fetchPaidInvoiceList();
    this.fetchunPaidInvoiceList();
    this.fetchAllInvoiceList();

    throw new Error('Method not implemented.');
    
  }


  fetchPaidInvoiceList(){
    let Req = {
      OrgID: this.OrgID,
    };
    this.service.getPaidInvoiceList(Req).subscribe((x: any) => {
      this.invoices = x.result;
      this.noResultsFound = this.invoices.length === 0;
      // this.loading = false;

    });
  }

  fetchunPaidInvoiceList(){
    let Req = {
      OrgID: this.OrgID,
    };
    this.service.getunPaidInvoiceList(Req).subscribe((x: any) => {
      this.unpaidInvoices = x.result;
      this.noResultsFound = this.unpaidInvoices.length === 0;
     });
  }
  fetchAllInvoiceList(){
    let Req = {
      OrgID: this.OrgID,
    };
    this.service.getAllInvoiceList(Req).subscribe((x: any) => {
      this.allInvoices = x.result;
      this.noResultsFound = this.allInvoices.length === 0;
     });
  }
  toggleCustomDateModel(option: string): void {
    this.showCustomDateModel = option === 'Custom dates';
  }
  
  applyAndClose(): void {
    this.applyDates(); 
    this.showCustomDateModel = false;
  }
   resetDates() {  
    console.log('Resetting dates');
    this.startDate = '';
    this.endDate = '';
  }
  applyDates() {
    console.log(`Applying dates: Start - ${this.startDate}, End - ${this.endDate}`);
  }
  }






