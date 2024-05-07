import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AddClientService } from './addclient.component.service';
import { CookieService } from 'ngx-cookie-service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-addclient',
  templateUrl: './addclient.component.html',
  styleUrls: ['./addclient.component.scss'],
  providers: [CookieService, AddClientService, MessageService],
})

export class AddclientComponent implements OnInit {
 
  email:any;
  loading: boolean = false;
  addClient: any;
  formData: any;
  Access: boolean = false;
  sendingEmail: boolean = false;
  Notes: string = '';
  requiredDocuments: { name: string }[] = [
    { name: 'Driving License' },
    { name: 'Resume' },
    { name: 'EML File' },
    { name: 'SSN' },
    { name: 'Transcripts' },
  ];
  selectedRequiredDocuments: any[] = [];
  filteredRequiredDocuments: any[] = [];
  allclientService: any;
  formBuilder: any;
  TraineeID: any;

  //dropdowns
  state: string[] = [];
  selectedstate:any=0;
  selectedcity:any=0;
  city: string[] = [];
  ClientStatusID: string[] = [];
  ClientCategoryID: string[] = [];
  PrimaryOwner: string[] = [];
  selectedPrimaryOwner: any=0;
  selectedClientStatusID: any=0;
  selectedClientCategoryID: any=0;
  country: string[] = ['United States'];
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
  Industry: string[] = [
    "Accounting - Finance",
    "Advertising",
    "Agriculture",
    "Airline - Aviation",
    "Architecture - Building",
    "Art - Photography - Journalism",
    "Automotive - Motor Vehicles - Parts",
    "Banking - Financial Services",
    "Broadcasting - Radio - TV",
    "Building Materials",
    "Chemical",
    "Computer Hardware",
    "Biotechnology",
    "Computer Software",
    "Construction",
    "Consulting",
    "Consumer Products",
    "Credit - Loan - Collections",
    "Defense - Aerospace",
    "Education - Teaching - Administration",
    "Electronics",
    "Employment - Recruiting - Staffing",
    "Energy - Utilities - Gas - Electric",
    "Entertainment",
    "Environmental",
    "Exercise - Fitness",
    "Fashion - Apparel - Textile",
    "Food",
    "Funeral - Cemetery",
    "Government - Civil Service",
    "Healthcare - Health Services",
    "Homebuilding",
    "Hospitality",
    "Hotel - Resort",
    "HVAC",
    "Import - Export",
    "Industrial",
    "Insurance",
    "Internet - ECommerce",
    "Landscaping",
    "Law Enforcement",
    "Legal",
    "Library Science",
    "Managed Care",
    "Manufacturing",
    "Medical Equipment",
    "Merchandising",
    "Military",
    "Mortgage",
    "Newspaper",
    "Not for Profit - Charitable",
    "Office Supplies - Equipment",
    "Oil Refining - Petroleum - Drilling",
    "Other Great Industries",
    "Packaging",
    "Pharmaceutical",
    "Printing - Publishing",
    "Public Relations",
    "Real Estate - Property Mgt",
    "Recreation",
    "Restaurant",
    "Retail",
    "Sales - Marketing",
    "Securities",
    "Security",
    "Semiconductor",
    "Social Services",
    "Telecommunications",
    "Training",
    "Transportation",
    "Travel",
    "Wireless"
  ];
  OrgID: string;
  routeType: any;
  
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private service: AddClientService,
    private cookieService: CookieService,
    private messageService: MessageService,
    private route: ActivatedRoute
  ) {
    
    this.OrgID = this.cookieService.get('OrgID');
    this.TraineeID = this.cookieService.get('TraineeID');
    this.routeType = this.route.snapshot.params["routeType"];
  }

  ngOnInit(): void {
    this.routeType = this.route.snapshot.params["routeType"];
    // this.loading = true;
    this.addClient = this.fb.group({
      ClientName: ['', [Validators.required, Validators.minLength(3)]],
      ContactNumber: ['', [Validators.required, Validators.maxLength(10)]],
      EmailID: ['', [Validators.required, Validators.email]],
      Address: ['', [Validators.required, Validators.minLength(3)]],
      VMSClientName: [''],
      FederalID: [''],
      ZipCode: [''],
      Website: [''],
      Fax: [''],
      Country: [''],
      state: [''],
      city: [''],
      Industry: [''],
      ClientStatusID: ['',[Validators.required,]],
      ClientCategoryID: ['',[Validators.required,]],
      PrimaryOwner: [''],
      PaymentTerms: [''],
      AboutCompany: [''],
      posting: ['Yes'],
      Access: [''],
      sendingEmail: [''],
    });

    this.getClientCategories();
    this.getClientStatus();
    this.getState();
    this.getPrimaryOwnerName();
  }


  onRequiredDocumentsSearch(event: any) {
    this.filteredRequiredDocuments = this.requiredDocuments.filter(option =>
      option.name.toLowerCase().includes(event.query.toLowerCase())
    );
  }

  addClientbutton() {
    if(this.selectedClientStatusID && this.selectedClientCategoryID && this.selectedPrimaryOwner){
     
    this.loading = true;
    const documents = this.selectedRequiredDocuments.map(doc => doc.name).join(', ');
    console.log(documents);
    let Req = {
      ClientName: this.addClient.value.ClientName,
      ContactNumber: this.addClient.value.ContactNumber,
      EmailID:this.addClient.value.EmailID,
      Website: this.addClient.value.Website,
      Address: this.addClient.value.Address,
      VMSClientName: this.addClient.value.VMSClientName,
      FederalID: this.addClient.value.FederalID,
      ZipCode: this.addClient.value.ZipCode,
      ClientWebsite: this.addClient.value.ClientWebsite,
      Fax: this.addClient.value.Fax,
      Industry: this.addClient.value.Industry,
      Country: this.addClient.value.Country,
      State: this.selectedstate,
      City: this.selectedcity,
      ClientStatusID: this.selectedClientStatusID,
      ClientCategoryID: this.selectedClientCategoryID,
      PrimaryOwner: this.selectedPrimaryOwner,
      PaymentTerms: this.addClient.value.PaymentTerms,
      AboutCompany: this.addClient.value.AboutCompany,
      posting: this.addClient.value.posting,
      sendingEmail: this.addClient.value.sendingEmail,
      Access: this.addClient.value.Access,
      RequiredDocuments: documents,
      Notes: this.Notes,
    };
    console.log(Req);
    this.service.addClienta(Req).subscribe(
      (x: any) => {
        this.handleSuccess(x);
        this.loading = false;
      },
      (error: any) => {
        this.handleError(error);
        this.loading = false;
      }
    );
    this.addClient.reset();
    this.selectedRequiredDocuments = [];
    this.Notes = '';
    }else{
      this.messageService.add({ severity: 'error', summary:  'Enter the required fields' });
    }
  }

  private handleSuccess(response: any): void {
    this.messageService.add({ severity: 'success', summary: response.message });
    console.log(response);
    this.loading = false;
    this.router.navigate(['/allclient/'+this.routeType]);
  }
  
  private handleError(response: any): void {
    this.messageService.add({ severity: 'error', summary:  response.message });
    this.loading = false;
  }
  cancel() {
    this.addClient.reset();
    this.selectedRequiredDocuments = [];
    this.Notes = '';
  }

  getClientCategories() {
    let Req = {
      TraineeID: this.TraineeID,
    };
    this.service.getClientCategoryID(Req).subscribe((x: any) => {
      this.ClientCategoryID = x.result;
    });
  }

  getClientStatus() {
    let Req = {
      TraineeID: this.TraineeID,
    };
    this.service.getClientStatusID(Req).subscribe((x: any) => {
      this.ClientStatusID = x.result;
    });
  }

  getPrimaryOwnerName() {
    let Req = {
      TraineeID: this.TraineeID,
      orgID:this.OrgID
    };
    this.service.getPrimaryOwner(Req).subscribe((x: any) => {
      this.PrimaryOwner = x;
    });
  }
  getState() {
    let Req = {
      TraineeID: this.TraineeID,
    };
    this.service.getLocation(Req).subscribe((x: any) => {
      this.state = x.result;
    });
  }
  getCity() {
    console.log(this.selectedstate);
    let Req = {
      TraineeID: this.TraineeID,
      State: this.selectedstate
    };
    this.service.getCity(Req).subscribe((x: any) => {
      this.city = x.result;
    });
  }

  isAddButtonEnabled(): boolean {
    return this.addClient.get('ClientStatusID').value !== null &&
           this.addClient.get('ClientCategoryID').value !== null;
  }

}


