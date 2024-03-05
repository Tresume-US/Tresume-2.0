import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { MessageService } from 'primeng/api';
import { CreateInvoiceService } from './create-invoice.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-create-invoice',
  templateUrl: './create-invoice.component.html',
  styleUrls: ['./create-invoice.component.scss'],
  providers: [CookieService, CreateInvoiceService, MessageService],

})
export class CreateInvoiceComponent implements OnInit {

  loading: boolean = false;
  TraineeID: any;
  OrgID: string = '';
  showPopup: boolean = false;
  showConfirmationDialog2: any;
  showConfirmationDialog: any;
  showConfirmationModal: boolean = false;
  showModal: boolean = false;
  previousOption: string = '';
  clients: any;
  ClientName: any;
  state: any;
  files: File[] = [];
  selectedRowIndex: number | null = null;
  clientEmail: any;
  selectedBillingaddress: string = '';
  selectedInvoiceDate: string = '';
  selectedDueDate: string = '';
  selectedTerm: any;
  InvoiceNo: any;
  routeType: any;
  productService: string[] = ["Service"];
  ccEmails: any;
  bccEmails: any;
  invoiceLines: any[] = [];
  subtotal: number = 0;
  discountPercentage: number = 0;
  discountAmount: number = 0;
  total: number = 0;
  balanceDue: number = 0;
  selectedState: any;
  states: any[] = [];
  messageOnInvoice: string[] = [
    `Remit Payment To: Asta CRS, Inc.
    Please mail checks to: Asta Crs Inc 44121 Leesburg Pike,
    STE 230, Ashburn VA 20147 
    Attn: Prabhakar Thangarajah
    Ph: 703-889-8511 Fax: 703-889-8585`
  ];
  termsOptions = [
    { value: '10 days', label: '10 days' },
    { value: '20 days', label: '20 days' },
    { value: 'Net 15', label: 'Net 15' },
    { value: 'addNew', label: 'Add New' }
  ];
  messageOnStatement: any;
  newTermName: string = '';
  dueType: string = '';
  dueDays: number = 0;


  ngOnInit(): void {
    this.OrgID = this.cookieService.get('OrgID');
    this.TraineeID = this.cookieService.get('TraineeID');
    this.getState();
    this.fetchclientlist();
    this.calculateSubtotal();
    this.fetchtimesheetreport();
  }

  constructor(private messageService: MessageService, private cookieService: CookieService, private Service: CreateInvoiceService, private router: Router, private route: ActivatedRoute) {

    this.OrgID = this.cookieService.get('OrgID');
    this.routeType = this.route.snapshot.params["routeType"];
    this.addDefaultRows(2);
  }

  toggleEditable(index: number) {
    if (this.selectedRowIndex !== null) {
      this.invoiceLines[this.selectedRowIndex].editable = false;
    }
    this.selectedRowIndex = index;
    this.invoiceLines[index].editable = true;
  }

  addDefaultRows(count: number) {
    for (let i = 0; i < count; i++) {
      this.addLine();
    }
  }

  addLine() {
    this.invoiceLines.push({
      sno: '',
      serviceDate: '',
      productService: '',
      description: '',
      qty: 0,
      rate: 0,
      attachment: ''
    });
  }

  removeLine(index: number): void {
    this.invoiceLines.splice(index, 1);
    this.calculateSubtotal();
  }

  clearLines() {
    this.invoiceLines = [];
    this.addDefaultRows(2);
    this.calculateSubtotal();
  }

  updateAmount(line: any): void {
    line.amount = line.qty * line.rate;
    this.calculateSubtotal();
  }

  updateDiscount(event: any): void {
    const selectedDiscount = parseInt(event.target.value);
    this.discountPercentage = selectedDiscount;
    this.calculateTotal();
  }

  @ViewChild('fileInput') fileInput: ElementRef | undefined;
  maxSize: number = 20;

  onFilesSelected(event: any) {
    const fileList: FileList | null = event.target.files;
    if (fileList) {
      for (let i = 0; i < fileList.length; i++) {
        this.files.push(fileList[i]);
      }
    }
  }

  removeFile(index: number) {
    this.files.splice(index, 1);
  }

  uploadFiles() {
    for (let i = 0; i < this.files.length; i++) {
      const fileSizeMB = this.files[i].size / (1024 * 1024);
      if (fileSizeMB > this.maxSize) {
        alert("Please upload a file with a size less than " + this.maxSize + " MB.");
        return;
      }
    }
    console.log('Uploading files:', this.files);
  }


  onOptionChanges(event: any) {
    this.previousOption = this.selectedOption;
    this.selectedOption = event.target.value;
  }

  goToPreviousOption() {
    if (this.previousOption === 'example1' || this.previousOption === 'example2') {
      this.selectedOption = this.previousOption;
      this.selectedOption = 'example1';
    }
  }
  selectedFilter: string = '';

  onFilterChanges(value: string) {
    this.selectedFilter = value;
  }

  onOptionChange(event: any) {
    this.selectedOption = event.target.value;
    if (this.selectedOption === 'example2') {
    } else {
    }
  }

  onDropdownChange(event: any) {
    if (event.target.value === 'addNew') {
      this.showModal = true;
    }
  }

  closeModal2() {
    this.showModal = false;
  }

  clearSelection() {
    this.newTermName = '';
    this.dueType = '';
    this.dueDays = 0;
    this.closeModal2();
  }
  
  confirmDelete() {
    this.showConfirmationModal = true;
  }

  deleteItems() {
    console.log("Item deleted!");

    this.closeModal();
  }

  closeModal1() {
    this.showConfirmationModal = false;
  }

  togglePopup(event: Event): void {
    event.preventDefault();
    this.showPopup = !this.showPopup;
  }

  closePopup(): void {
    this.showPopup = false;
  }

  selectedOption: string = '';
  showAdditionalInputs: boolean = false;
  showButtons: any;

  onFilterChange(value: string) {
    this.selectedOption = value;
    this.showAdditionalInputs = this.selectedOption === 'option3';
    console.log('Selected Option:', this.selectedOption);
    console.log('showAdditionalInputs:', this.showAdditionalInputs);
  }

  selectedItem: any;

  openDeleteModal(item: any) {
    this.selectedItem = item;
  }

  deleteItem() {
    console.log('Deleting item:', this.selectedItem);
    this.closeModal();
  }

  closeModal() {
    this.selectedItem = null;
  }

  getState() {
    let req = {
      OrgID: this.OrgID,
    };
    this.Service.getLocationinvoice(req).subscribe((x: any) => {
      this.states = x.result;
      this.loading = false;
    });
  }

  // getDropdownOption() {
  //   return this.states;
  // }

  // onDropdownChanges(selectedOption: any, row: any) {
  //   row.location = selectedOption.state;
  // }

  fetchclientlist() {
    let Req = {
      TraineeID: this.TraineeID,
    };
    this.Service.getTraineeClientList(Req).subscribe((x: any) => {
      this.clients = x.result;
      this.loading = false;
    });
  }


  addinvoice() {
    this.loading = true;
    let invoiceLinesData: { serviceDate: any, description: any, qty: any, rate: any }[] = [];
    this.invoiceLines.forEach((line, index) => {
      invoiceLinesData.push({
        serviceDate: line.serviceDate,
        description: line.description,
        qty: line.qty,
        rate: line.rate
      });
    });

    let req = {
      client: this.ClientName,
      clientEmail: this.clientEmail,
      ccEmails: this.ccEmails,
      bccEmails: this.bccEmails,
      Billingaddress: this.selectedBillingaddress,
      InvoiceDate: this.selectedInvoiceDate,
      DueDate: this.selectedDueDate,
      Terms: this.selectedTerm,
      InvoiceNo: this.InvoiceNo,
      state: this.selectedState,
      invoiceLines: invoiceLinesData,
      subtotal: this.subtotal,
      discountPercentage: this.discountPercentage,
      discountAmount: this.discountAmount,
      total: this.total,
      balanceDue: this.balanceDue,
      messageOnInvoice: this.messageOnInvoice,
      messageOnStatement: this.messageOnStatement,
      attachments: this.files,
      newTermName: this.newTermName,
      dueType: this.dueType,
      dueDays: this.dueDays
    };
    console.log(req);
    this.loading = false;

    // this.Service.createInvoice(req).subscribe(
    //   (response: any) => {
    //     this.handleSuccess(response);
    //   },
    //   (error: any) => {
    //     this.handleError(error);
    //   }
    // );
  }


  private handleSuccess(response: any): void {
    this.messageService.add({ severity: 'success', summary: response.message });
    console.log(response);
    this.loading = false;
    this.router.navigate(['/all-invoice/' + this.routeType]);
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

  calculateSubtotal(): void {
    this.subtotal = this.invoiceLines.reduce((acc, line) => acc + (line.qty * line.rate), 0);
    this.calculateTotal();
  }

  calculateTotal(): void {
    this.discountAmount = (this.subtotal * this.discountPercentage) / 100;
    this.total = this.subtotal - this.discountAmount;
    this.balanceDue = this.total;
  }

  tableData = [
    { activeDate: '', client: '', product: '', description: '', rates: '', duration: '', billable: '' },
  ];

  fetchtimesheetreport() {
    let Req = {
      OrgID: this.OrgID,
    };
    this.Service.getReportTimesheet(Req).subscribe((x: any) => {
      this.tableData = x.result;
      this.loading = false;
    });
    console.log(Req);
  }
}