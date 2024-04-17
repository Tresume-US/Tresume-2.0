import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { MessageService } from 'primeng/api';
import { CreateInvoiceService } from './create-invoice.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';


@Component({
  selector: 'app-create-invoice',
  templateUrl: './create-invoice.component.html',
  styleUrls: ['./create-invoice.component.scss'],
  providers: [CookieService, CreateInvoiceService, MessageService],

})
export class CreateInvoiceComponent implements OnInit {
  clients: any[] = [/* Your client data */];
  selectedClient: any;
  isClientSelected: boolean = false;

  showDatePicker: boolean = false;
  fromDate: string = '';
  toDate: string = '';
  loading: boolean = false;
  TraineeID: any;
  OrgID: string = '';
  showPopup: boolean = false;
  showConfirmationDialog2: any;
  showConfirmationDialog: any;
  showConfirmationModal: boolean = false;
  showModal: boolean = false;
  previousOption: string = '';
  // clients: any;
  ClientName: any;
  state: any;
  files: File[] = [];
  selectedRowIndex: number | null = null;
  clientEmail: any;
  selectedBillingaddress: string = '';
  selectedInvoiceDate: string = '';
  selectedDueDate: string = '';
  selectedTerm: any = 0;
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

  messageOnInvoice: string = "`Remit Payment To: Asta CRS, Inc.Please mail checks to: Asta Crs Inc 44121 Leesburg Pike,STE 230, Ashburn VA 20147  Attn: Prabhakar Thangarajah  Ph: 703-889-8511 Fax: 703-889-8585`"
 //PaymentTerms: any;
  PaymentTerms: any = [

    {
      value:"7",
      option:'Net 7'
      },
      {
    value:"10",
    option:'Net 10'
    },
    {
      value:"15",
      option:'Net 15'
      },
      {
        value:"30",
        option:'Net 30'
        },
        {
          value:"45",
          option:'Net 45'
          },
          {
            value:"60",
            option:'Net 60'
            },
            {
              value:"90",
              option:'Net 90'
              },
];
  messageOnStatement: any;
  newTermName: string = '';
  dueType: string = '';
  dueDays: number = 0;
  timesheetlist: any = [];
  clientid: any;
  selectedclient:any;
  username: any;
  newrows: boolean = false;
  candidatelistname:any;
  candidateid:any =0;
  daywisetimesheetlist: any = [];
  showCustomDate: boolean;
  previousClient: any;
  showAlert: boolean;

  ngOnInit(): void {
    this.loading = true;
    this.OrgID = this.cookieService.get('OrgID');
    this.TraineeID = this.cookieService.get('TraineeID');
    this.username = this.cookieService.get('userName1');
    this.getState();
    this.fetchclientlist();
    this.calculateSubtotal();
    this.addDefaultRows(2);
    this.fetchInvoiceNo();
    this.newrows = true;
    this.selectedInvoiceDate = this.getCurrentDate();
    this.getinvoicecandidatelist();
    this.previousClient = this.selectedClient;
  }

  constructor(private messageService: MessageService, private cookieService: CookieService, private Service: CreateInvoiceService, private router: Router, private route: ActivatedRoute , private dialog: MatDialog) {

    this.OrgID = this.cookieService.get('OrgID');
    this.routeType = this.route.snapshot.params["routeType"];
    // this.addDefaultRows(2);
  }

  addService() {
    if (!this.selectedclient) {
      alert('Please select a client before Adding a Service!');
    }
  }

  getinvoicecandidatelist() {
    let Req = {
      OrgId : this.OrgID,
     };
     this.Service.invoiceCandidatetList(Req).subscribe((x: any) => {
       this.candidatelistname = x.result;
     });
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
    // this.addDefaultRows(2);
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



  removeFile(index: number): void {
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
    if(event == 1){
      this.showAdditionalInputs = false;


    }else{
      this.showAdditionalInputs = true;

      console.log(this.timesheetlist.length);


    }
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
    if(value === 'option1'){
      this.getalltimesheetlist();
    } else if(value === 'option2'){
      this.getcurrenttimesheetlist();
    }else if(value === 'option3'){
      this.getlasttimesheetlist();
    }
  }

  oncandidatechange(value:any) {
    console.log(value);
    this.candidateid = value;
    this.getalltimesheetlist();
  }


  onOptionChange(event: any) {
    this.selectedOption = event.target.value;
    if (this.selectedOption === 'example2') {
    } else {
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

  selectedOption: any = '1';
  showAdditionalInputs: boolean = false;
  showButtons: any;

  onFilterChange(value: string) {
    this.selectedOption = value;
    console.log('Selected Option:', this.selectedOption);

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
      orgID: this.OrgID,
    };
    this.Service.getInvoiceClientList(Req).subscribe((x: any) => {
      this.clients = x.result;
      this.loading = false;
    });
  }

  getalltimesheetlist() {
    let Req = {
      orgID: this.clientid,
      candidateid:this.candidateid,
    };
    this.Service.gettimesheetlist(Req).subscribe((x: any) => {
      this.timesheetlist = x.result;
      this.daywisetimesheetlist = [];
      if(this.timesheetlist.length != 0){
        for (let i = 0; i < this.timesheetlist.length; i++) {
          console.log(this.timesheetlist[i]);
          const fromDateString = this.timesheetlist[i].fromdate;
          const fromDate = new Date(fromDateString);
          for (let day = 1; day <= 7; day++) {
            const nextDate = new Date(fromDate);
            nextDate.setDate(nextDate.getDate() + day);
            var date = nextDate.toISOString();

            var hrs = this.timesheetlist[i]['day' + day];
            if(hrs != ''){
              var data = {
                fromdate:date,
                details:this.timesheetlist[i].details,
                totalhrs:hrs,
                billableamt:this.timesheetlist[i].billableamt,
                id:this.timesheetlist[i].id,
                candidatename:this.timesheetlist[i].candidatename
                }
                this.daywisetimesheetlist.push(data);
            }

          }
          console.log(this.daywisetimesheetlist);
        }
      }
    });
  }

  getlasttimesheetlist() {
    let today = new Date();
    let lastMonthLastDate = new Date(today.getFullYear(), today.getMonth(), 0);
    let lastMonthFirstDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);

    // Convert last month's first and last date to YYYY-MM-DD format
    let formattedStartDate = lastMonthFirstDate.toISOString().split('T')[0];
    let formattedEndDate = lastMonthLastDate.toISOString().split('T')[0];

    let Req = {
        orgID: this.clientid,
        candidateid:this.candidateid,
        startdate: formattedStartDate,
        enddate: formattedEndDate
    };

    this.Service.gettimesheetlist(Req).subscribe((x: any) => {
        this.timesheetlist = x.result;

        this.daywisetimesheetlist = [];
        if(this.timesheetlist.length != 0){
          for (let i = 0; i < this.timesheetlist.length; i++) {
            console.log(this.timesheetlist[i]);
            const fromDateString = this.timesheetlist[i].fromdate;
            const fromDate = new Date(fromDateString);
            for (let day = 1; day <= 7; day++) {
              const nextDate = new Date(fromDate);
              nextDate.setDate(nextDate.getDate() + day);
              var date = nextDate.toISOString();

              var hrs = this.timesheetlist[i]['day' + day];
              if(hrs != ''){
                var data = {
                  fromdate:date,
                  details:this.timesheetlist[i].details,
                  totalhrs:hrs,
                  billableamt:this.timesheetlist[i].billableamt,
                  id:this.timesheetlist[i].id,
                  candidatename:this.timesheetlist[i].candidatename
                  }
                  this.daywisetimesheetlist.push(data);
              }

            }
            console.log(this.daywisetimesheetlist);
          }
        }
    });
}


getcurrenttimesheetlist() {
  let today = new Date();
  let currentMonthFirstDate = new Date(today.getFullYear(), today.getMonth(), 1);
  let nextMonthFirstDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  let currentMonthLastDate = new Date(nextMonthFirstDate.getTime() - 1);

  // Convert current month's first and last date to YYYY-MM-DD format
  let formattedStartDate = currentMonthFirstDate.toISOString().split('T')[0];
  let formattedEndDate = currentMonthLastDate.toISOString().split('T')[0];

  let Req = {
      orgID: this.clientid,
      candidateid:this.candidateid,
      startdate: formattedStartDate,
      enddate: formattedEndDate
  };

  this.Service.gettimesheetlist(Req).subscribe((x: any) => {
      this.timesheetlist = x.result;
      this.daywisetimesheetlist = [];
      if(this.timesheetlist.length != 0){
        for (let i = 0; i < this.timesheetlist.length; i++) {
          console.log(this.timesheetlist[i]);
          const fromDateString = this.timesheetlist[i].fromdate;
          const fromDate = new Date(fromDateString);
          for (let day = 1; day <= 7; day++) {
            const nextDate = new Date(fromDate);
            nextDate.setDate(nextDate.getDate() + day);
            var date = nextDate.toISOString();

            var hrs = this.timesheetlist[i]['day' + day];
            if(hrs != ''){
              var data = {
                fromdate:date,
                details:this.timesheetlist[i].details,
                totalhrs:hrs,
                billableamt:this.timesheetlist[i].billableamt,
                id:this.timesheetlist[i].id,
                candidatename:this.timesheetlist[i].candidatename
                }
                this.daywisetimesheetlist.push(data);
            }

          }
          console.log(this.daywisetimesheetlist);
        }
      }
  });
}

  addtimesheet(timesheet: any) {
    if (this.newrows) {
      this.invoiceLines = [];
    }
    var data = {
      sno: '',
      serviceDate: timesheet.fromdate,
      productService: 'SERVICE',
      description: timesheet.details,
      qty: timesheet.totalhrs,
      rate: timesheet.billableamt,
      attachment: '',
      timesheetid: timesheet.id
    }
    this.invoiceLines.push(data);
    this.updateAmount(data);
    this.newrows = false;
    const index = this.daywisetimesheetlist.findIndex((item: any) => item.id === timesheet.id);
    if (index !== -1) {
      this.daywisetimesheetlist.splice(index, 1);
    }
  }


  addalltimesheet(timesheet: any) {
    if (this.newrows) {
      this.invoiceLines = [];
    }
    const indexesToRemove: number[] = [];

    for (let i = 0; i < this.daywisetimesheetlist.length; i++) {
      var data = {
        sno: '',
        serviceDate: this.daywisetimesheetlist[i].fromdate,
        productService: 'SERVICE',
        description: this.daywisetimesheetlist[i].details,
        qty: this.daywisetimesheetlist[i].totalhrs,
        rate: this.daywisetimesheetlist[i].billableamt,
        attachment: '',
        timesheetid: this.daywisetimesheetlist[i].id
      }
      this.invoiceLines.push(data);
      this.updateAmount(data);
      indexesToRemove.push(i);
    }
    indexesToRemove.reverse().forEach(index => {
      this.daywisetimesheetlist.splice(index, 1);
    });

    this.newrows = false;
  }

  addinvoice() {


    this.loading = true;
    let invoiceLinesData: { serviceDate: any, description: any, qty: any, rate: any,timesheetid:any }[] = [];
    this.invoiceLines.forEach((line, index) => {
      invoiceLinesData.push({
        serviceDate: line.serviceDate,
        description: line.description,
        qty: line.qty,
        rate: line.rate,
        timesheetid:line.timesheetid
      });
    });

  const formData = new FormData();
  formData.append('clientid', this.clientid.toString());
  formData.append('client', this.ClientName);
  formData.append('clientemail', this.clientEmail);
  formData.append('ccEmails', this.ccEmails);
  formData.append('bccEmails', this.bccEmails);
  formData.append('billing_address', this.selectedBillingaddress);
  formData.append('InvoiceDate', this.selectedInvoiceDate);
  formData.append('DueDate', this.selectedDueDate);

  formData.append('PaymentTerms', this.selectedTerm);
  formData.append('invoiceNo', this.InvoiceNo);

  formData.append('location', this.selectedState);
  formData.append('subtotal', this.subtotal.toString());
  formData.append('discount', this.discountPercentage.toString());
  formData.append('discountAmount', this.discountAmount.toString());
  formData.append('total', this.total.toString());
  formData.append('balanceDue', this.balanceDue.toString());
  formData.append('invoice_message', this.messageOnInvoice);
  formData.append('statement', this.messageOnStatement);
  //formData.append('PaymentTerms', this.PaymentTerms);
  formData.append('dueType', this.dueType.toString());
  formData.append('status', '1');
  formData.append('created_by', this.username);

  formData.append('traineeid', this.TraineeID);
  formData.append('orgid', this.OrgID);

  // Append invoice lines data
  formData.append('invoicedetails', JSON.stringify(invoiceLinesData));

  // Append attachments
  this.files.forEach(file => {
    formData.append('attachments', file);
  });

    this.loading = false;

    this.Service.createInvoice(formData).subscribe(
      (response: any) => {
        this.handleSuccess(response);
      },
      (error: any) => {
        this.handleError(error);
      }
    );
  }




  getCurrentDate(): string {
    // Get current date in format YYYY-MM-DD
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
    const day = currentDate.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  private handleSuccess(response: any): void {
    this.messageService.add({ severity: 'success', summary: response.message });
    console.log(response);
    this.loading = false;
    this.router.navigate(['/all-invoice/']);
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
    this.Service.getTimesheetReport(Req).subscribe((x: any) => {
      this.tableData = x.result;
      this.loading = false;
    });
    console.log(Req);
  }



fetchInvoiceNo() {
  let Req = {
    orgId: this.OrgID,
  };
  this.Service.GetlastInvoice(Req).subscribe(
    (response: any) => {
      this.InvoiceNo = response.invoiceNo;
    },
    (error: any) => {
      console.error('Error fetching invoice number:', error);
    }
  );
}
onDropdownChange(event: any) {
  // Calculate due date based on selected term
  const termValue = parseInt(this.selectedTerm); // Convert string to number
  if (termValue > 0) {
    const currentDate = new Date();
    const dueDate = new Date(currentDate.getTime() + (termValue * 24 * 60 * 60 * 1000));
    this.selectedDueDate = dueDate.toISOString().split('T')[0];
  } else {
    this.selectedDueDate = ''; // Reset due date if no term is selected
  }
}

invoicedata: any[];
// getExistingInvoiceNo() {

//     let Req = {
//       orgId: this.OrgID,
//       InvoiceNo: this.invoiceno,
//     };
//     this.Service.checkExistInvoiceNo(Req).subscribe(
//       (response: any) => {
//         this.invoicedata = response.result;
//       },
//       (error: any) => {
//         console.error('Error fetching invoice data:', error);
//       }
//     );

// }

getExistingInvoiceNo() {
  let req = {
    orgId: this.OrgID,
    InvoiceNo: this.InvoiceNo,
  };

  this.Service.checkExistInvoiceNo(req).subscribe(
    (response: any) => {
      if (response.invoiceExists) {
        alert('Invoice number already exists.');
      } else {
        this.addinvoice();
      }
    },
    (error: any) => {
      console.error('Error fetching invoice data:', error);
    }
  );
}
onFilterChangess(option: string) {
  this.showCustomDate = (option === 'custom');
}

//  Bala coding start


onclientChanges(){
  this.clientid = this.selectedclient.ClientID
 this.clientEmail = this.selectedclient.EmailID
 this.selectedBillingaddress = this.selectedclient.Address
 this.ClientName = this.selectedclient.ClientName
 this.selectedTerm = this.selectedclient.PaymentTerms
 console.log(this.selectedclient);
 this.getalltimesheetlist();
 if (this.isClientSelected) {
  const confirmChange = confirm("Do you want to switch the client without saving the invoice?");
  if (!confirmChange) {
    this.selectedClient = this.selectedClient; // Ensure the same client remains selected
    return;
  }
}
this.isClientSelected = true; // Mark client as selected after the first change
}

changeClient() {
  this.isClientSelected = false;
  this.showAlert = false;
}

cancelChange() {
  this.showAlert = false;
}
//Bala coding end
}
