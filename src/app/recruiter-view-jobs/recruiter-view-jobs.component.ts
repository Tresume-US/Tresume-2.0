import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { MessageService } from 'primeng/api';
import { RecruiterViewJobsService } from './recruiter-view-jobs.service';
import { FormBuilder } from '@angular/forms';
import { TabsetComponent } from 'ngx-bootstrap/tabs';

import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-recruiter-view-jobs',
  templateUrl: './recruiter-view-jobs.component.html',
  providers: [CookieService, MessageService, RecruiterViewJobsService],
  styleUrls: ['./recruiter-view-jobs.component.scss']
})
export class RecruiterViewJobsComponent implements OnInit {

  @ViewChild('myTabs', { static: false }) myTabs: TabsetComponent;
  loading: boolean = false;
  basicactive: string = 'active';
  reqactive: string = '';
  orginfoactive: string = '';
  previewinfo: string = '';
  address: string = '';
  selectedLegalstatus: any;
  jobcode: string;
  companyname: string = '';
  jobtitle: string = '';
  zipcode: string = '';
  citycode: string = '';
  billrate: string = '0';
  payrate: string = '0';
  basicInfo: any;
  reqInfo: any;
  orgInfo: any;
  selectedstate: any = 0;
  OrgID: string;
  routeType: any;
  TraineeID: any;
  numberOfPositions: any;
  city: string[] = [];
  filteredOwnership: any[] = [];
  selectedStatus: any[] = [];
  statusOptions: any[] = [];
  selectedCountry: any = 'US';
  countries: string[] = ['United States'];

  selectedState: string = '';
  state: string[] = [];

  selectedCity: string;
  cities: string[] = [];

  selectedCurrency: string = '1';
  selectedcCurrency: string = '1';
  currencies: string[] = [];

  selectedPayType: string = '1';
  selectedcPayType: string = '1';
  payTypes: string[] = ['hour', 'day', 'week', 'bi-week', 'month', 'year'];

  selectedTaxTerms: string = '1';
  selectedcTaxTerms: string = '1';
  taxTerms: any[] = [];
  internaltaxterms: string = '';
  selectedRespondBy: string ='';
  selectedJobType: string = '';
  jobTypeOptions: any[] = [];
  selectedPriority: string = '';
  priorityOptions: any[] = [];
  selectedJobStatus: any = '';
  jobStatusOptions: any[] = [];
  selectedClient: string = '';
  endclient: string = '';
  clientjobid: string = '';
  duration: string = '';
  clientOptions: any[] = [];
  skills: string = '';
  selectedInterviewMode: string = '';
  interviewModeOptions: any[] = [
    { value: '', label: 'Select' },
    { value: 'F2F', label: 'Face to Face' },
    { value: 'Phone', label: 'Phone' },
    { value: 'Zoom', label: 'Zoom' },
    { value: 'Google', label: 'Google Meet' },
    { value: 'WebEx', label: 'WebEx' },
    { value: 'Other', label: 'Other' }
  ];
  selectedExperience: number = 0;
  public content: any;
  selectedTaxTerm: any;
  selectedDepartment: any;
  selectedrecmanger: any;
  selectedsalesManager: any;

  selectedaccountManager: any;

  checkboxes = [
    { label: 'ZipRecruiter', checked: false },
    { label: 'Dice', checked: false }
  ];
  securityClearance: string = '0';
  selectedPrimaryRecruiter: string = '';
  RecruiterStatusOptions: any[] = [];
  admins: any[] = [];
  JobDescription: string = '';
  comments: string = '';
  recruitmentmanager: string = '';
  accountsmanager: string = '';
  salesmanager: string = '';
  Legalstatus: any;
  username: any;
  jobbaordaccount: any = [];
  selectedJobboardaccount: any[] = [];
  JobCode: string = '';
  usertype: string;
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private cookieService: CookieService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private service: RecruiterViewJobsService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.loading = true;
    this.OrgID = this.cookieService.get('OrgID');
    this.TraineeID = this.cookieService.get('TraineeID');
    this.username = this.cookieService.get('userName1');
    this.routeType = this.route.snapshot.params['jobId'];
    
    this.usertype = this.cookieService.get('usertype');
    console.log(this.routeType);
    this.getJobPostData();

    if (this.routeType) {
      this.GetJobsbyJobID();
    } else {
      this.getJobPostData();
    }
  }

  GetJobsbyJobID() {
    let Req = {
      JobID: this.routeType
    };
    this.service.GetJobsbyJobID(Req).subscribe((x: any) => {
      console.log(x);
      let data = x.result[0];
      this.loading = false;
      this.jobcode = this.routeType;
      this.selectedCity = data.City;
      this.companyname = data.Company;
      this.selectedstate = data.State; // Fix missing semicolon
      this.jobtitle = data.JobTitle;
      this.zipcode = data.ZipCode;
      this.address = data.Address;
      this.citycode = data.AreaCode;
      this.selectedPriority = data.PriorityID;
      this.duration = data.Duration;
      this.selectedJobStatus = data.JobStausID;
      this.selectedJobType = data.JobTypeID;
      this.selectedPayType = data.PayRateTypeID;
      this.payrate = data.PayRate;
      this.selectedCurrency = data.PayRateCurrencyTypeID;
      this.selectedClient = data.ClientID;
      this.endclient = data.EndClient;
      this.clientjobid = data.ClientJobID;
      this.selectedInterviewMode = data.InterviewMode;
      this.selectedExperience = data.MinYearsOfExpInMonths;
      this.selectedLegalstatus = data.LegalStatus;
      this.skills = data.Skills;
      this.numberOfPositions = data.NoOfPosition;
      this.internaltaxterms = data.TaxTermID;
      this.selectedPrimaryRecruiter = data.PrimaryRecruiterID;
      this.recruitmentmanager = data.RecruitmentManagerID;
      this.salesmanager = data.SalesManagerID;
      this.accountsmanager = data.AccountManagerID;
      this.comments = data.Comments;
      this.JobDescription = data.JobDescription;
      this.billrate =data.BillRate;
      console.log(this.selectedCity);
    });
  }

  nextTab(tab: number) {
    if (tab === 1) {
      this.basicactive = 'active';
      this.reqactive = '';
      this.orginfoactive = '';
      this.previewinfo = '';
    } else if (tab === 2) {
      this.basicactive = '';
      this.reqactive = 'active';
      this.orginfoactive = '';
      this.previewinfo = '';
    } else if (tab === 3) {
      this.basicactive = '';
      this.reqactive = '';
      this.orginfoactive = 'active';
      this.previewinfo = '';
    } else if (tab === 4) {
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

  getJobPostData() {
    let Req = {
      TraineeID: this.TraineeID,
      OrgID: this.OrgID
    };
    this.service.getJobPostData(Req).subscribe((x: any) => {
      this.loading = false;
      if (this.routeType === '') {
        this.jobcode = x.NextJobId;
      }
      this.state = x.states || [];
      this.currencies = x.currencyTypes || [];
      this.payTypes = x.payTypes || [];
      this.taxTerms = x.taxTerms || [];
      this.jobTypeOptions = x.jobTypes || [];
      this.priorityOptions = x.priorities || [];
      this.jobStatusOptions = x.jobStatuses || [];
      this.clientOptions = x.clients || [];
      this.statusOptions = x.legalstatus || [];
      this.RecruiterStatusOptions = x.recruiters || [];
      this.admins = x.admins || [];
      this.jobbaordaccount = x.jobboardaccount || [];

      for (let i = 0; i < this.jobbaordaccount.length; i++) {
        this.JobboardSelection(this.jobbaordaccount[i]);
      }

      console.log(x);
    }, (error: any) => {
      console.error('Error occurred:', error);
      this.loading = false;
    });
  }

  PostJob(type: any) {
    this.loading = true;
    if (this.selectedLegalstatus && this.selectedLegalstatus.length > 0) {
      this.Legalstatus = this.selectedLegalstatus.map((item: { value: any }) => item.value).join(',');
    } else {
      this.Legalstatus = '';
    }
    console.log(this.internaltaxterms);
    console.log(this.selectedPrimaryRecruiter);
    console.log(this.jobtitle);
    console.log(this.selectedstate);
    console.log(this.selectedRespondBy);
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
        jobboardaccount: this.selectedJobboardaccount
      };

      console.log(Req);
      this.service.PostJob(Req).subscribe(
        (x: any) => {
          this.loading = false;
          this.messageService.add({ severity: 'success', summary: 'Job Posted Successfully' });
          this.router.navigate(['/jobpostings']);
        },
        (error: any) => {
          this.messageService.add({ severity: 'danger', summary: 'Job Not Posted. Please Try Again' });
          console.error('Error occurred:', error);
          this.loading = false;
        }
      );
    } else {
      alert('Please Enter all Mandatory Fields');
      this.loading = false;
    }
  }

  JobboardSelection(data: any) {
    if (data.Active) {
      this.selectedJobboardaccount.push(data);
    } else {
      const index = this.selectedJobboardaccount.indexOf(data);
      if (index !== -1) {
        this.selectedJobboardaccount.splice(index, 1);
      }
    }
    console.log(this.selectedJobboardaccount);
  }

  UpdateJob(type: any) {

    let formattedDate = this.selectedRespondBy ? new Date(this.selectedRespondBy).toISOString().split('T')[0] : '';
    let Req = {
      
      RecruiterID: this.selectedPrimaryRecruiter,
      JobID: this.routeType,
      OrgID: this.OrgID,
      JobTitle: this.jobtitle,
      Company: this.companyname,
      City: this.selectedCity,
      State: this.selectedstate,
      Country: this.selectedCountry,
      ZipCode: this.zipcode,
      Address: this.address,
      AreaCode: this.citycode,
      JobDescription: this.JobDescription,
      Skills: this.skills,
      JobCode: this.jobcode,
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
      RespondDate: formattedDate,
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
      jobboardaccount: this.selectedJobboardaccount
    };
    console.log(Req);

    this.service.UpdateJob(Req).subscribe((x: any) => {
      this.loading = false;
      this.messageService.add({ severity: 'success', summary: 'Job Updated Successfully' });
      this.router.navigate(['/jobpostings']);
    }, (error: any) => {
      this.messageService.add({ severity: 'danger', summary: 'Job Not Updated. Please Try Again' });
      console.error('Error occurred:', error);
      this.loading = false;
    });
  }

  
  getSanitizedJobDescription(description: string): SafeHtml {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = description;
    return this.sanitizer.bypassSecurityTrustHtml(tempDiv.textContent || tempDiv.innerText || '');
  }
}
