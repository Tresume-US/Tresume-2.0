import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { MessageService } from 'primeng/api';
import { RecruiterViewJobsService } from './recruiter-view-jobs.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ViewChild } from '@angular/core';
import { TabsetComponent } from 'ngx-bootstrap/tabs';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-recruiter-view-jobs',
  templateUrl: './recruiter-view-jobs.component.html',
  providers: [CookieService, MessageService,RecruiterViewJobsService],
  styleUrls: ['./recruiter-view-jobs.component.scss']
})
export class RecruiterViewJobsComponent implements OnInit {
  @ViewChild('myTabs') myTabs: TabsetComponent;
  loading: boolean = false;
  basicactive: string = 'active';
  reqactive: string = '';
  orginfoactive = '';
  previewinfo = '';
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
  statusOptions: any[];
  selectedCountry: any = 'US';
  countries: string[] = ['United States'];
  selectedState: string = '';
  state: string[];
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
  internaltaxterms: string = '';
  selectedRespondBy: Date;
  selectedJobType: string = '';
  jobTypeOptions: any[];
  selectedPriority: string = '';
  priorityOptions: any[];
  selectedJobStatus: any = '';
  jobStatusOptions: any[];
  selectedClient: string = '';
  endclient: string = '';
  clientjobid: string = '';
  duration: string = '';
  clientOptions: any[];
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
  RecruiterStatusOptionsons: any[];
  admins: any[];
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

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private cookieService: CookieService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private service: RecruiterViewJobsService
  ) { }

  ngOnInit(): void {
    this.loading = true;
    this.OrgID = this.cookieService.get('OrgID');
    this.TraineeID = this.cookieService.get('TraineeID');
    this.username = this.cookieService.get('userName1');
    this.routeType = this.route.snapshot.params['jobId'];
    console.log(this.routeType)
    this.getJobPostData();
    if (this.routeType) {
      this.GetJobsbyJobID();
    }
  }

  GetJobsbyJobID() {
    let Req = {
      JobID: this.routeType
    };
    this.service.GetJobsbyJobID(Req).subscribe((x: any) => {
      let data = x.result[0];
      this.loading = false;
      this.jobcode = this.routeType;
      this.selectedCity = data.City;
      this.companyname = data.Company;
      this.jobtitle = data.JobTitle;
      this.zipcode = data.ZipCode;
      this.address = data.Address;
      this.citycode = data.AreaCode;
      this.selectedPriority = data.PriorityID;
      this.duration = data.Duration;
      this.selectedJobStatus = data.JobStatusID;
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
    });
    this.loading = false;
  }

  nextTab(tab: number) {
    if (tab == 1) {
      this.basicactive = 'active';
      this.reqactive = '';
      this.orginfoactive = '';
      this.previewinfo = '';
    } else if (tab == 2) {
      this.basicactive = '';
      this.reqactive = 'active';
      this.orginfoactive = '';
      this.previewinfo = '';
    } else if (tab == 3) {
      this.basicactive = '';
      this.reqactive = '';
      this.orginfoactive = 'active';
      this.previewinfo = '';
    } else if (tab == 4) {
      this.basicactive = '';
      this.reqactive = '';
      this.orginfoactive = '';
      this.previewinfo = 'active';
    }
  }

  onChange(event: { value: any }) {
    this.selectedLegalstatus = event.value;
  }

  onJobStatusChange(selectedValue: any) {
    const selectedOption = this.jobStatusOptions.find(option => option.Value === selectedValue);
    this.selectedJobStatus = selectedOption; 
  }

  getCity() {
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
      if (!this.routeType) {
        this.jobcode = x.NextJobId;
      }
      this.state = x.states;
      this.currencies = x.currencyTypes;
      this.payTypes = x.payTypes;
      this.taxTerms = x.taxTerms;
      this.jobTypeOptions = x.jobTypes;
      this.priorityOptions = x.priority;
      this.jobStatusOptions = x.jobStatus;
      this.clientOptions = x.clients;
      this.admins = x.admins;
      this.Legalstatus = x.LegalStatus;
      this.selectedCountry = x.CountryID;
    });
  }

  PostJob(type:any) {
    let Req = {
      City: this.selectedCity,
      JobCode: this.jobcode,
      Company: this.companyname,
      JobTitle: this.jobtitle,
      ZipCode: this.zipcode,
      Address: this.address,
      AreaCode: this.citycode,
      PriorityID: this.selectedPriority,
      Duration: this.duration,
      JobStatusID: this.selectedJobStatus,
      JobTypeID: this.selectedJobType,
      PayRateTypeID: this.selectedPayType,
      PayRate: this.payrate,
      PayRateCurrencyTypeID: this.selectedCurrency,
      ClientID: this.selectedClient,
      EndClient: this.endclient,
      ClientJobID: this.clientjobid,
      InterviewMode: this.selectedInterviewMode,
      MinYearsOfExpInMonths: this.selectedExperience,
      LegalStatus: this.selectedLegalstatus,
      Skills: this.skills,
      NoOfPosition: this.numberOfPositions,
      TaxTermID: this.selectedTaxTerm,
      PrimaryRecruiterID: this.selectedPrimaryRecruiter,
      RecruitmentManagerID: this.recruitmentmanager,
      SalesManagerID: this.salesmanager,
      AccountManagerID: this.accountsmanager,
      Comments: this.comments,
      JobDescription: this.JobDescription,
      CreatedBy: this.username,
      CreatedOn: new Date(),
      JobBoardAccount: this.selectedJobboardaccount,
      SecurityClearance: this.securityClearance
    };
    this.service.PostJob(Req).subscribe((x: any) => {
      if (x.result === 'success') {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Job posted successfully!'
        });
        this.router.navigate(['/jobs']);
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to post job.'
        });
      }
    });
  }

  UpdateJob(type:any) {
    let Req = {
      JobID:this.routeType,
      City: this.selectedCity,
      JobCode: this.jobcode,
      Company: this.companyname,
      JobTitle: this.jobtitle,
      ZipCode: this.zipcode,
      Address: this.address,
      AreaCode: this.citycode,
      PriorityID: this.selectedPriority,
      Duration: this.duration,
      JobStatusID: this.selectedJobStatus,
      JobTypeID: this.selectedJobType,
      PayRateTypeID: this.selectedPayType,
      PayRate: this.payrate,
      PayRateCurrencyTypeID: this.selectedCurrency,
      ClientID: this.selectedClient,
      EndClient: this.endclient,
      ClientJobID: this.clientjobid,
      InterviewMode: this.selectedInterviewMode,
      MinYearsOfExpInMonths: this.selectedExperience,
      LegalStatus: this.selectedLegalstatus,
      Skills: this.skills,
      NoOfPosition: this.numberOfPositions,
      TaxTermID: this.selectedTaxTerm,
      PrimaryRecruiterID: this.selectedPrimaryRecruiter,
      RecruitmentManagerID: this.recruitmentmanager,
      SalesManagerID: this.salesmanager,
      AccountManagerID: this.accountsmanager,
      Comments: this.comments,
      JobDescription: this.JobDescription,
      ModifiedBy: this.username,
      ModifiedOn: new Date(),
      JobBoardAccount: this.selectedJobboardaccount,
      SecurityClearance: this.securityClearance
    };
    // this.service.UpdateJob(Req).subscribe((x: any) => {
    //   if (x.result === 'success') {
    //     this.messageService.add({
    //       severity: 'success',
    //       summary: 'Success',
    //       detail: 'Job updated successfully!'
    //     });
    //     this.router.navigate(['/jobs']);
    //   } else {
    //     this.messageService.add({
    //       severity: 'error',
    //       summary: 'Error',
    //       detail: 'Failed to update job.'
    //     });
    //   }
    // });

   console.log(Req)
  }



  // selectedTab: string = 'basic-info';

  // selectTab(tab: string) {
  //   this.selectedTab = tab;
  // }

  // onContinue(nextTab: string) {
  //   this.selectedTab = nextTab;
  // }

  // draftJob() {
  //   console.log('Job drafted');
  // }

  // postJob() {
  //   console.log('Job posted');
  // }



}
