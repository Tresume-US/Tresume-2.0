import { ViewChild } from '@angular/core';
import { TabsetComponent } from 'ngx-bootstrap/tabs';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CreateNewJobsService } from './create-new-jobs.service';
import { CookieService } from 'ngx-cookie-service';
import { MessageService } from 'primeng/api';


@Component({
  selector: 'app-create-new-jobs',
  templateUrl: './create-new-jobs.component.html',
  styleUrls: ['./create-new-jobs.component.scss'],
  providers: [CookieService, MessageService , CreateNewJobsService],
})


export class CreateNewJobsComponent{
  
  
  @ViewChild('myTabs') myTabs: TabsetComponent;
  loading:boolean = false;
  basicactive:string='active';
  reqactive:string = '';
  orginfoactive = '';
  previewinfo = '';
  address:string='';
  selectedLegalstatus:any ;
  jobcode:string;
  companyname:string='';
  jobtitle:string='';
  zipcode:string='';
  citycode:string='';
  billrate:string='0';
  payrate:string='0';
  basicInfo: any;
  reqInfo: any;
  orgInfo: any;
  selectedstate:any=0;
  orgLogo: string = '';
  orgName: string = '';
  isAdmin: string;
  admin:any;
  OrgID: string;
  routeType: any;
  TraineeID: any;
  numberOfPositions:any;
  city: string[] = [];  
  filteredOwnership: any[] = [];
  selectedStatus: any[] = [];
  // statusOptions: any[]=[{name:'Eligible to work in the US',value:'ANY'},{name:'US Citizen'}, {name:'GC'}, {name:'F1'}, {name:'F1-CPT'},{name:'F1-OPT EAD'},{name:'GC-EAD'},{name:'H4-EAD'},{name:'L2-EAD'},{name:'Other EAD'},{name:'L1-Visa'},];
  statusOptions:any[];
  selectedCountry: any = 'US'; 
  countries: string[] = ['United States,'];

  selectedState: string = ''; 
  state: string[] 

  selectedCity: string;
  cities: string[];


  selectedCurrency: string = '1'; 
  selectedcCurrency: string = '1'; 
  
  currencies: string[] = [];

  selectedPayType: string = '1';
  selectedcPayType: string = '1';
  payTypes: string[] = ['hour', 'day', 'week', 'bi-week', 'month', 'year'];


  selectedTaxTerms: string = '1';
  selectedcTaxTerms: string = '1';
  taxTerms: any[];
  internaltaxterms:string='';
  selectedRespondBy: Date; 
  selectedJobType: string = '1'; 
  jobTypeOptions: any[];
  selectedPriority: string = '3';
  priorityOptions: any[];
  selectedJobStatus: any = '';
  jobStatusOptions: any[];  
  selectedClient: string = ''; 
  endclient:string='';
  clientjobid:string='';
  duration:string='';
  clientOptions: any[];
  skills:string = '';
  selectedInterviewMode: string = '';
  interviewModeOptions: any[] = [
    { value: '', label: 'Select' },
    { value: 'F2F', label: 'Face to Face' },
    { value: 'Phone', label: 'Phone' },
    { value: 'Zoom', label: 'Zoom' },
    { value: 'Goole', label: 'Google Meet' },
    { value: 'WebEx', label: 'WebEx' },
    { value: 'Zoom', label: 'Zoom' },
    { value: 'Other', label: 'Other' }
  ];
  selectedExperience: number=0; 
  public content:any;
   selectedTaxTerm: any;
  selectedDepartment: any;

  selectedrecmanger: any;
  selectedsalesManager: any;

  selectedaccountManager: any;

  checkboxes = [
    { label: 'ZipRecruiter', checked: false },
    { label: 'Dice', checked: false }
  ];
  securityClearance:string = '0';
  selectedPrimaryRecruiter: string = '';
  RecruiterStatusOptionsons: any[];
  admins:any[];
  JobDescription:string = '';
  comments:string = '';
  recruitmentmanager:string = '';
  accountsmanager:string='';
  salesmanager:string='';
  Legalstatus: any;
  username: any;
  jobbaordaccount: any = [];
  selectedJobboardaccount: any[]=[];
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private cookieService: CookieService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private service: CreateNewJobsService,
  ) {
    
   
  }

ngOnInit(): void{
this.loading = true;
  this.OrgID = this.cookieService.get('OrgID');
  this.TraineeID = this.cookieService.get('TraineeID');
  this.username = this.cookieService.get('userName1');
  this.routeType = this.route.snapshot.params["routeType"];
  this.isAdmin = this.cookieService.get('IsAdmin');
  if(!this.isAdmin){
    this.admin = this.cookieService.get('admin')
  }else{
    this.admin = this.cookieService.get('userName1')
  }
  this.getJobPostData();
  }

  nextTab(tab:number) {
    if(tab == 1){
      this.basicactive = 'active';
      this.reqactive = '';
      this.orginfoactive = '';
      this.previewinfo = '';
    } else if(tab == 2){
      this.basicactive = '';
      this.reqactive = 'active';
      this.orginfoactive = '';
      this.previewinfo = '';
    }else if(tab == 3){
      this.basicactive = '';
      this.reqactive = '';
      this.orginfoactive = 'active';
      this.previewinfo = '';
    }else if(tab == 4){
      this.basicactive = '';
      this.reqactive = '';
      this.orginfoactive = '';
      this.previewinfo = 'active';
    } 
  console.log(this.selectedLegalstatus);
  }
  onChange(event: { value: any }) {
    console.log(event.value);
    this.selectedLegalstatus = event.value;
  }

  onJobStatusChange(selectedValue: any) {
    // Find the corresponding object in jobStatusOptions array
    const selectedOption = this.jobStatusOptions.find(option => option.Value === selectedValue);
  
    // Set the selectedJobStatus to the whole object or just the Value based on your requirements
    this.selectedJobStatus = selectedOption; // or selectedOption.Value if you just want the value
  
    // Log the selected value
    console.log(selectedOption.Value);
  }

getCity() {
  console.log(this.selectedstate);
  let Req = {
    TraineeID: this.TraineeID,
    State: this.selectedstate
  };
  this.service.getCity(Req).subscribe((x: any) => {
    this.cities = x.result;
  });
  }


  getJobPostData(){
    let Req = {
      TraineeID: this.TraineeID,
      OrgID: this.OrgID
    };
    this.service.getJobPostData(Req).subscribe((x: any) => {
      this.loading = false;
      this.jobcode = x.NextJobId;
      this.state = x.states
      this.currencies = x.currencyTypes;
      this.payTypes = x.payTypes;
      this.taxTerms = x.taxTerms;
      this.jobTypeOptions = x.jobTypes;
      this.priorityOptions = x.priorities;
      this.jobStatusOptions = x.jobStatuses;
      this.clientOptions = x.clients;
      this.statusOptions = x.legalstatus;
      this.RecruiterStatusOptionsons = x.recruiters;
      this.admins = x.admins;
      this.jobbaordaccount = x.jobbaordaccount

      for(var i=0;i<this.jobbaordaccount.length;i++){
        this.JobboardSelection(this.jobbaordaccount[i]);
      }

      console.log(x)
    }),(error: any) => {
      // Error callback
      console.error('Error occurred:', error);
      // Handle error here
      this.loading = false; // Set loading to false on error
    };
  }

  PostJob(type:any){
    this.loading = true;
    if (this.selectedLegalstatus && this.selectedLegalstatus.length > 0) {
      this.Legalstatus = this.selectedLegalstatus.map((item: { value: any; }) => item.value).join(',');
    }else{
      this.Legalstatus = '';
    }
    console.log( this.internaltaxterms);
    console.log( this.selectedPrimaryRecruiter);
    console.log( this.jobtitle);
    console.log( this.selectedstate);
    console.log( this.selectedRespondBy);
    if (
      this.selectedPrimaryRecruiter &&
      this.jobtitle &&
      this.selectedstate &&
      this.selectedCity &&
      this.selectedRespondBy &&
      this.numberOfPositions &&
      this.internaltaxterms
      ) {
        let Req = {
          RecruiterID: this.selectedPrimaryRecruiter,
          OrgID: this.OrgID,
          JobTitle: this.jobtitle,
          Company: this.companyname,
          City: this.selectedCity,
          State: this.selectedState,
          Country: this.selectedCountry,
          ZipCode: this.zipcode,
          Address: this.address,
          AreaCode: this.citycode,
          JobDescription: this.JobDescription,
          JobCode: this.jobcode,
          Skills: this.skills,
          PayRate: this.payrate,
          PayRateTypeID: this.selectedPayType,
          PayRateCurrencyTypeID: this.selectedCurrency,
          PayRateTaxTermID: this.selectedTaxTerms,
          BillRate: this.billrate,
          BillRateTypeID: this.selectedcPayType,
          BillRateCurrencyTypeID: this.selectedcCurrency,
          BillRateTaxTermID: this.selectedcTaxTerms,
          JobTypeID: this.selectedJobType,
          LegalStatus: this.Legalstatus,
          JobStausID: this.selectedJobStatus.JobStatusID,
          NoOfPosition: this.numberOfPositions,
          RespondDate: this.selectedRespondBy,
          ClientID: this.selectedClient,
          EndClient: this.endclient,
          ClientJobID: this.clientjobid,
          PriorityID: this.selectedPriority,
          Duration: this.duration,
          InterviewMode: this.selectedInterviewMode,
          SecruityClearance: this.securityClearance,
          PrimaryRecruiterID: this.selectedPrimaryRecruiter,
          RecruitmentManagerID: this.recruitmentmanager,
          SalesManagerID: this.salesmanager,
          AccountManagerID: this.accountsmanager,
          TaxTermID: this.internaltaxterms,
          Comments: this.comments,
          Active: type,
          CreateBy: this.username,
          LastUpdateBy: this.username,
          MinYearsOfExpInMonths: this.selectedExperience * 12,
          JobStatus: this.selectedJobStatus.Value,
          jobboardaccount:this.selectedJobboardaccount
      };
  
      this.service.PostJob(Req).subscribe(
          (x: any) => {
            this.loading = false;
            this.Email(Req);
              this.messageService.add({ severity: 'success', summary: 'Job Posted Successfully' });
              this.router.navigate(['/jobpostings']);
          },
          (error: any) => {
            
              // Error callback
              this.messageService.add({ severity: 'danger', summary: 'Job Not Posted. Please Try Again' });
              console.error('Error occurred:', error);
              // Handle error here
              this.loading = false; // Set loading to false on error
          }
      );
  } else {
      alert('Please Enter all Mandatory Fields');
      this.loading = false;
  }
  
  }

  Email(data: any) {
    var clientlogo;
    if (this.orgLogo === null || this.orgLogo === undefined) {
        clientlogo = '';
    } else {
        clientlogo = `<img src='${this.orgLogo}' alt = '${this.orgName}' class='logo'>`;
    }

    // Prepare the job details
    const jobDetails = `
      <p>Job Code: ${data.JobCode}</p>
      <h3>BASIC INFORMATION</h3>
      <p>COMPANY NAME: ${data.Company}</p>
      <p>JOB TITLE: ${data.JobTitle}</p>
      <p>COUNTRY: ${data.Country}</p>
      <p>STATE: ${data.State}</p>
      <p>CITY: ${data.City}</p>
      <p>ZIP CODE: ${data.ZipCode}</p>
      <p>CITY CODE: ${data.AreaCode}</p>
      <p>ADDRESS: ${data.Address}</p>
      <h3>REQUIREMENT INFORMATION</h3>
      <p>MIN. EXPERIENCE: ${data.MinYearsOfExpInMonths / 12} years</p>
      <p>Job Status: ${data.JobStatus}</p>
      <p>Legal Status: ${data.LegalStatus}</p>
      <p>Pay Rate: ${data.PayRate}</p>
      <p>Bill Rate: ${data.BillRate}</p>
      <p>JOB DESCRIPTION: ${data.JobDescription}</p>
    `;

    // Format the email content
    const emailContent = `
      <p>Hello Admin,</p>
      <p>A new job has been successfully posted to the system.</p>
      <p>Job Details:</p>
      ${jobDetails}
      <p>Thanks & Regards,</p>
      <p>${this.username}</p>
    `;

    // Prepare the request for sending the email
    const request = {
        to: this.admin,
        subject: 'Job Posted Successfully',
        text: emailContent,
    };

    // Send the email
    this.service.sendEmail(request).subscribe(x => {
        this.messageService.add({ severity: 'success', summary: 'Job Posting Email Sent' });
    });
}


  JobboardSelection(data:any){
    if(data.Active){
      this.selectedJobboardaccount.push(data)
    }else{
      const index = this.selectedJobboardaccount.indexOf(data);
      if (index !== -1) {
        this.selectedJobboardaccount.splice(index, 1);
      }
    }
    console.log(this.selectedJobboardaccount);

  }

  }

