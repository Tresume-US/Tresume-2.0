import { Component, OnChanges, ViewChild, ElementRef } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { ReviewService } from './review.service';
import { MessageService } from 'primeng/api';
import { FormBuilder, Validators, FormGroup, AbstractControl } from '@angular/forms';
import { AppService } from '../app.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageModule } from 'primeng/message';
import { DatePipe } from '@angular/common';

@Component({
  templateUrl: './review-tresume.component.html',
  providers: [CookieService, ReviewService, MessageService,AppService],
  styleUrls: ['./review-tresume.component.scss']
})

export class ReviewTresumeComponent implements OnChanges {
  @ViewChild('videoPlayer') videoPlayer: ElementRef;
  showConfirmationDialog2: boolean;
  showConfirmationDialog3: boolean;
  showmovetotalentbench: boolean = false;
  myForm: any;
  LegalStatus: any;

  interviewForm: any;
  myFormSubmission: any;
  myFormFinancial: any;
  myFormFinancialinfo: any;
  FormGeneral: any;
  formData: any;
  FinancialNotes: any;
  salaryinfo: any;
  Perdeium: any;
  legalStatus: any;
  maritalStatus: any;
  stateTaxExemptions: any;
  stateTaxAllowance: any;
  federalTaxAllowance: any;
  federalAddAllowance: any;
  gcDate: any;
  gcWages: any;
  lcaDate: any;
  lcaRate: any;
  State: any;
  healthInsurance: boolean = false;
  lifeInsurance: boolean = false;

  Bankname2: any;
  Bankname1: any;
  accountType1: any;
  accountType2: any;
  routingnum2: any;
  routingnum1: any;
  salaryDepositType: any;
  howMuch: any;
  submissionList: any[] = []; 


  //general declaration
  recruiterName: any = 0;
  ReferredBy: any;
  currentStatus: any;
  legalStatusVal: Date;
  legalStatusValend: Date;
  division: any;
  OrgID: string;
  userName: string;
  tabIndex: any;
  routeType: any;
  title: any;
  showSaveButton: boolean;

  //generalinfo

  jobs: any[];
  SelectedRefered: string = '';
  firstName: string = '';
  test: string = '';
  middleName: string = '';
  lastName: string = '';
  phoneNumber: number;
  email: string = '';
  dealOffered: string = '';
  referredByExternal: string = '';
  statusDate: string = '';
  duiFelonyInfo: string = '';
  statusStartDate: string = '';
  statusEndtDate: string = '';
  ftcNotes: string = '';
  otherNotes: string = '';
  dob: Date;
  SelectedDivision: string = '';
  currentTabIndex: any;
  saveButtonLabel: string = 'Save';
  items: any[] = [
    {
      value1: 'Name 1',
      value2: 'Name 2',
      value3: 'Name 3',
      value4: 'Name 4',
      value5: 'Name 5',
      value6: 'Name 6',
    }
  ]

  referedby: string[] = [];

  divisions: string[] = [
    'PROJECT COORDINATOR',
    'SALES FORCE',
    'SALESFORCE ADMIN/BA',
    'SALESFORCE DEVELOPER & SALESFORCE/BA/DA/QA',
    'DEVOPS',
    'SYSTEM ANALYST',
    'DATA',
  ];

  generalFormData: any = {};
  interviewFormData: any = {};
  placementFormData: any = {};
  submissionFormData: any = {};
  financialInfoFormData: any = {};
  siteVisitFormData: any = {};
  emergencyContacts: any[] = [];

  contactName: string = '';
  contactPhone: string = '';
  contactEmail: string = '';
  passportNumber: string = '';
  passportvalStartdate: string = '';
  passportvalenddate: string = '';
  iNumber: string = '';
  iEndDate: string = '';
  personalInfoAddress: string = '';
  personalInfoAddress1: string = '';
  personalInfoCountry: string = '';
  personalState: string = '';
  personalCity: string = '';
  personalZipcode: string = '';
  addressType: string = '';

  TraineeID: string;
  interviewDate: string;
  interviewTime: string;
  selectedInterviewMode: string;
  interviewModes: string[] = ['Face to face', 'Zoom', 'Phone', 'Hangouts', 'WebEx', 'Skype', 'Others'];
  http: any;
  editRowIndex: number;
  showConfirmationDialog: boolean;
  deleteIndex: number;
  reviewService: any;
  placementList: any;
  candidateID:any;
  selectedcurrentstatus:string='';
  selectedStatus: string = '-PLACED/WORKING AT CLIENT LOCATION-';
  statuss: string[] = ['ON TRAINING', 'DIRECT MARKETTING', 'ON BENCH', 'MARKETTING ON HOLD', 'HAS OFFER', 'FIRST TIME CALLER', 'DROPPED TRAINING'];


  selectedLegalStatus: string = '-eligible to work in US-';

  legalstatuss: string[] = ['eligible to work in US', 'US CITIZEN', 'GC', 'F-1', 'F1-CPT', 'TSP-EAD', 'GC-EAD', 'L2-EAD'];

  //General - SSN
  ssn: string = '';
  showSSN: boolean = false;
  inputDisabled: boolean = true;
  loading:boolean = false;
  phoneNumberG:any 
  generalEmail:any 
  DealOffered:any 
  selectedrecruiterName: any;
  state: any;
  ReferredBy2: any;
  Currency: string = '1';
  BillRate: any;
  PayType: string = 'hour';
  TaxTerm: string = '0';
  ConsultantType: any;
  selectedstate: string = '0';
  selectedstate1: any;
  Availability: any = '0';
  txtComments: any;
  MarketerName: any;
  TresumeID:any = '';
  candiateName: any;
  ProfileVideoFile: any;
  profilevideoPath:any;
  videouploadDate: any;
  videoPlayershow: boolean = false;
skillSet: any;
  resumeFile: string | Blob;

  startShowingSSN() {
    this.showSSN = true;
    this.inputDisabled = false;
  }

  stopShowingSSN() {
    this.showSSN = false;
    this.inputDisabled = true;
  }

  saveData() {
    this.loading = true;
    switch (parseInt(this.currentTabIndex)) {
      case 0:
        this.saveGeneralFormData();
        break;
      case 1:
        this.saveSubmissionFormData();
        break;
      case 2:
        this.saveInterviewFormData();
        
        break;
      case 3:
        this.savePlacementFormData();
        
        break;
      case 4:
        this.saveFinancialInfoFormData();
        break;
      case 5:
        this.saveSiteVisitFormData();
        break;
      
      default:
        console.error('Invalid tab index');
    }
  }

  saveGeneralFormData() {
    console.log('Saving data for the General tab:', this.generalFormData);

    let Req = {
      firstName: this.firstName,
      middleName: this.middleName,
      lastName: this.lastName,
      recruiterName: this.selectedrecruiterName,
      phoneNumberG: this.phoneNumberG,
      generalEmail: this.generalEmail,
      refered: this.SelectedRefered,
      DealOffered: this.DealOffered,
      ReferredBy: this.SelectedRefered,
      ssn: this.ssn,
      statusDate: this.datePipe.transform(this.statusDate),
      duiFelonyInfo: this.duiFelonyInfo,
      selectedcurrentstatus: this.selectedcurrentstatus,
      legalStatusVal:  this.datePipe.transform(this.legalStatusVal),
      legalStatusValend:  this.datePipe.transform(this.legalStatusValend),
      selectedLegalStatus: this.selectedLegalStatus,
      ftcNotes: this.ftcNotes,
      otherNotes: this.otherNotes,
      division: this.division,
      dob: this.dob,
      TraineeID: this.candidateID,
      education: this.educations,
      experiance: this.experiences,
      EmergencyCname: this.contactName,
      EmergencyPhone: this.contactPhone,
      EmergencyEmail: this.contactEmail,
      PassportNumber: this.passportNumber,
      PassportValidityStartDate: this.passportvalStartdate,
      PassportValidityEndDate: this.passportvalenddate,
      I94Number: this.iNumber,
      I94ValidityEndDate: this.iEndDate,
      AddressLine1: this.personalInfoAddress,
      AddressLine2: this.personalInfoAddress1,
      Country: this.personalInfoCountry,
      State: this.personalState,
      City: this.personalCity,
      Zipcode: this.personalZipcode,
      AddressType: this.addressType,
      ReferredBy_external:this.referredByExternal,
      skill: this.skillSet
  };
  
    console.log(Req);
    
    console.log('Education Data:'+this.educations);

    console.log('Experience Data:');
    for (let i = 0; i < this.experiences.length; i++) {
      console.log(`Row ${i + 1}:`, this.experiences[i]);
    }

    console.log('Experience Data:');
    this.emergencyContacts.forEach((contact, index) => {
      console.log(`Emergency Contact ${index + 1}:`);
      Object.entries(contact).forEach(([key, value]) => {
        console.log(`${key}: ${value}`);
      });
      console.log('---');
    });

    this.service.updateGeneral(Req).subscribe(
      (x: any) => {
        this.handleSuccess(x);
      },
      (error: any) => {
        this.handleError(error);
      }
    );

    const formData = {
      'Emergency Contact Name': this.contactName,
      'Emergency Contact Phone': this.contactPhone,
      'Emergency Contact Email': this.contactEmail,
      'Passport Number': this.passportNumber,
      'Passport Validity Start Date': this.passportvalStartdate,
      'Passport Validity End Date': this.passportvalenddate,
      'I-94 Number': this.iNumber,
      'I-94 Validity End Date': this.iEndDate,
      'Address Line1': this.personalInfoAddress,
      'Address Line2': this.personalInfoAddress1,
      'Country': this.personalInfoCountry,
      'State': this.personalState,
      'City': this.personalCity,
      'Zipcode': this.personalZipcode,
      'Address Type': this.addressType
    };
      console.log("Personal-Info Tab")
      console.log(formData);
    
  }

  private handleSuccess(response: any): void {
    this.messageService.add({ severity: 'success', summary: response.message });
    console.log(response);
    this.loading = false;
    this.fetchinterviewlist();
  }
  
  private handleError(response: any): void {
    this.messageService.add({ severity: 'error', summary:  response.message });
    this.loading = false;
  }

  FetchProfileVideo(){
    let req={
      traineeid:this.candidateID
    }

    this.service.FetchProfileVideo(req).subscribe(
      (x: any) => {
        let result = x.result;
        if(result[0].profilevideoPath == '' || result[0].profilevideoPath == null){
          this.videoPlayershow = false
        }else{
          this.videoPlayershow = true
          this.profilevideoPath = result[0].profilevideoPath;
          this.videouploadDate = result[0].videouploadDate;
          this.FetchProfileVideo();
        }
        
        this.loading = false;
      },
      (error: any) => {
        this.loading = false;
      }
    );
  }

Resumepath: string = '';

FetchResume() {
  let req = {
    traineeid: this.candidateID
  };

  this.service.FetchResume(req).subscribe(
    (x: any) => {
      let result = x.result;
      if (result && result.length > 0 && result[0].ResumePath) {
        this.Resumepath = "https://tresume.us/" + result[0].ResumePath;
      }
      this.loading = false;
    },
    (error: any) => {
      console.error('Error fetching resume:', error);
      this.loading = false;
    }
  );
}
  // submitResume() {
  //   console.log('resume',this.resumeFile)
  //     console.log(this.candidateID)
  //   if (this.resumeFile) {
  //     const formData = new FormData();
  //     formData.append('resume', this.resumeFile);
  //     formData.append('traineeid', this.candidateID);
  
  //     // this.service.ProfileResumeUpload(formData).subscribe(
  //     //   response => {
  //     //     this.resumeUrl = response.path;
  //     //     this.resumeFileName = this.resumeFile?.name || '';
  //     //     this.resumeUploadDate = new Date(response.uploadDate);
  //     //     this.resumeUploaded = true;
  //     //   },
  //     //   error => {
  //     //     console.error('Upload failed', error);
  //     //   }
  //     // );
  //   }
  // }
  // submitResume(): void {
  //   if (this.resumeFile) {
  //     const formData = new FormData();
  //     formData.append('resume', this.resumeFile);
  //     formData.append('traineeid', this.candidateID);
      
  //     console.log('resume', this.resumeFile);
  //     console.log('candidateID', this.candidateID);
      
  //     if (this.resumeFile instanceof File) {
  //       console.log('Document path:', this.resumeFile.name);
  //     } else {
  //       console.log('Selected file is not of type File.');
  //     }
      
  //   } else {
  //     console.log('No resume file selected.');
  //   }
  // }
  
  // onFileSelectedResume(event: Event): void {
  //   const input = event.target as HTMLInputElement;
  //   if (input.files && input.files.length > 0) {
  //     this.resumeFile = input.files[0];
  //     console.log('Selected file:', this.resumeFile);
  //   }
  // }
  fileBlob: string | ArrayBuffer;
  fileHTML: string;

  handleFileInput(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.convertToBase64(file);
      this.convertToHTML(file);
    }
  }

  private convertToBase64(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        this.fileBlob = reader.result;
        const b64Data = (this.fileBlob as string).split(',')[1];
        this.saveResume(b64Data, file.name); 
      }
    };
    reader.readAsDataURL(file);
  }

  private convertToHTML(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        this.fileHTML = reader.result as string;
        console.log(this.fileHTML);
      }
    };
    reader.readAsText(file);
  }

  private saveResume(b64Data: string, filename: string): void {
    const saveResumeReq = {
      Filename: this.generalEmail+'_'+filename,
      Content: b64Data,
      userName: this.candidateID,
      emailID: this.generalEmail,
    };
    // console.log('Resume',saveResumeReq)
    this.service.saveResume(saveResumeReq).subscribe((response) => {
      this.messageService.add({ severity: 'success', summary: 'Resume Uploaded Successfully' });
    }, (error) => {
      this.messageService.add({ severity: 'error', summary: 'Resume upload failed' });
    });
  }
  

  onFileSelected(event: any) {
    this.ProfileVideoFile = event.target.files[0];
  }

  submitVideo(){
    this.loading = true;
    if (!this.ProfileVideoFile) {
      console.error('No file selected');
      return;
    }

    const formData = new FormData();
    formData.append('Profilevideo', this.ProfileVideoFile);
    formData.append('traineeid', this.candidateID);
    this.service.ProfileVideoUpload(formData).subscribe(
      (x: any) => {
        this.messageService.add({ severity: 'success', summary: x.message });
        this.loading = false;
      },
      (error: any) => {
        this.messageService.add({ severity: 'success', summary: error.message });
        this.loading = false;
      }
    );


  }

  saveInterviewFormData() {

    console.log('Saving data for the Interview tab:', this.interviewFormData);

    let Req = {
      interviewDate: this.myForm.get('interviewDate').value,
      interviewTime: this.myForm.get('interviewTime').value,
      interviewInfo: this.myForm.get('interviewInfo').value,
      client: this.myForm.get('client').value,
      vendor: this.myForm.get('vendor').value,
      subVendor: this.myForm.get('subVendor').value,
      assistedBy: this.myForm.get('assistedBy').value,
      typeOfAssistance: this.myForm.get('typeOfAssistance').value,
      interviewMode: this.myForm.get('interviewMode').value,
      interviewTimeZone:'EST',
      traineeID:this.candidateID,
      recruiterID:this.TraineeID,
      recruiteremail:this.userName,
      InterviewStatus:'SCHEDULED',
    };
    
    console.log(Req);

    this.service.insertTraineeInterview(Req).subscribe(
      (x: any) => {
        this.handleSuccess(x);
      },
      (error: any) => {
        this.handleError(error);
      }
    );

  }

  savePlacementFormData() {
    console.log('Saving data for the Placement tab:', this.placementFormData);
  }

  saveSubmissionFormData() {
    console.log('Saving data for the Submission tab:', this.submissionFormData);

    let Req = {
      title: this.myFormSubmission.value.title,
      submissionDate: this.myFormSubmission.value.submissionDate,
      notes: this.myFormSubmission.value.notes,
      vendorName: this.myFormSubmission.value.vendorName,
      rate: this.myFormSubmission.value.rate,
      clientName: this.myFormSubmission.value.clientName,
      recruiteremail:this.userName,
      MarketerID:this.TraineeID,
      CandidateID:this.candidateID
    };
    console.log(Req);
    this.service.insertSubmissionInfo(Req).subscribe(
      (x: any) => {
        this.handleSuccess(x);
        this.getSubmissionList();
      },
      (error: any) => {
        this.handleError(error);
      }
    );
  }

  saveFinancialInfoFormData() {
    console.log('Saving data for the Financial Info tab:', this.financialInfoFormData);

    let Req = {
      FinancialNotes: this.myFormFinancial.value.FinancialNotes,
      Salary: this.myFormFinancial.value.salaryinfo,
      Perdeium: this.myFormFinancial.value.Perdeium,
      LegalStatus: this.myFormFinancial.value.legalStatus,
      MaritalStatus: this.myFormFinancial.value.maritalStatus,
      StateTaxAllowance: this.myFormFinancial.value.stateTaxAllowance,
      StateTaxExemptions: this.myFormFinancial.value.stateTaxExemptions,
      FederalTaxAllowance: this.myFormFinancial.value.federalTaxAllowance,
      FederalTaxAdditionalAllowance: this.myFormFinancial.value.federalAddAllowance,
      Gcdate: this.myFormFinancial.value.gcDate,
      GCWages: this.myFormFinancial.value.gcWages,
      Lcadate: this.myFormFinancial.value.lcaDate,
      LCARate: this.myFormFinancial.value.lcaRate,
      state: this.selectedstate1,
      healthInsurance: this.myFormFinancial.value.healthInsurance,
      lifeInsurance: this.myFormFinancial.value.lifeInsurance,

      Bank1Name: this.myFormFinancial.value.Bankname1,
      Bank2Name: this.myFormFinancial.value.Bankname2,
      Bank1AccountType: this.myFormFinancial.value.accountType1,
      Bank2AccountType: this.myFormFinancial.value.accountType2,
      Bank1AccountNumber: this.myFormFinancial.value.accountnum1,
      Bank2AccountNumber: this.myFormFinancial.value.accountnum2,
      Bank1RoutingNumber: this.myFormFinancial.value.routingnum1,
      Bank2RoutingNumber: this.myFormFinancial.value.routingnum2,
      SalaryDepositType: this.myFormFinancial.value.salaryDepositType,
      HowMuch: this.myFormFinancial.value.howMuch,
      TraineeID:this.candidateID

    };
    console.log(Req);
    this.service.updateFinancial(Req).subscribe(
      (x: any) => {
        this.handleSuccess(x);
      },
      (error: any) => {
        this.handleError(error);
      }
    );
  }

  saveSiteVisitFormData() {
    console.log('Saving data for the Site Visit tab:', this.siteVisitFormData);
    this.showSaveButton = false
  }
  

  onTabChange(tabIndex: number) {
    if (tabIndex >= 0) {
      this.currentTabIndex = tabIndex;
      this.tabIndex = tabIndex;
      if(tabIndex === 3 || tabIndex ===6 || tabIndex===7|| tabIndex===8){
        this.showSaveButton = false
      }else{
        this.showSaveButton = true;
      }
      this.saveButtonLabel = `Save`;
      this.router.navigate(['/reviewtresume/'+this.routeType+'/'+this.candidateID+'/'+tabIndex]);
    }

    this.currentTabIndex = tabIndex;
    switch (tabIndex) {
      case 0:
        this.loading = true;
        this.getOrgUserList();
        break;
      case 1:
        this.fetchinterviewlist();
        break;
      case 2:
        this.getPlacementList();
        break;
      case 3:
        this.getSubmissionList();
        break;
      case 4:
        this.fetchCandidateInfo();
        break;
      default:
        break;
    }
  }

  constructor(private route: ActivatedRoute,private cookieService: CookieService, private service: ReviewService, private messageService: MessageService, private formBuilder: FormBuilder,private AppService:AppService, private router:Router, private datePipe: DatePipe) {
    
    this.candidateID = this.route.snapshot.params["traineeID"];
    this.candiateName  = this.route.snapshot.queryParams['firstName'];
    console.log(this.candidateID);
    console.log('First Name:', this.candiateName);
    this.tabIndex = this.route.snapshot.params["tabIndex"];
    this.OrgID = this.cookieService.get('OrgID');
    this.userName = this.cookieService.get('userName1');
    this.TraineeID = this.cookieService.get('TraineeID');
    this.routeType = this.route.snapshot.params["routeType"];
    this.onTabChange(parseInt(this.tabIndex));
    this.candidateID = this.route.snapshot.params["traineeID"];

   }

  ngOnInit(): void {
    this.fetchinterviewlist();
    this.getPlacementList();
    this.fetchCandidateInfo();
    this.getSubmissionList() ;
    this.getOrgUserList();
    this.fetchCandidateInfo();
    this.getmarketername();
    this.getcandidaterstatus();
    this.getLegalStatusOptions();
    this.getState();
    this.getdivision();
    this.FetchProfileVideo();
    this.FetchResume();

    this.currentTabIndex = this.tabIndex;
    
    this.FormGeneral = this.formBuilder.group({
      phoneNumberG: ['', [Validators.required]],
      generalEmail: ['', [Validators.required]],
      recruiterName: [''],
      legalStatusVal: [''],
      firstname: [''],
      middleName: [''],
      lastName: [''],
      refered: [''],
      DealOffered: [''],
      ReferredBy: [''],
      ssnInput: [''],
      statusDate: [''],
      duiFelonyInfo: [''],
      status: [''],
      legalStatusValend: [''],
      selectedLegalStatus: [''],
      ftcNotes: [''],
      otherNotes: [''],
      division: [''],
      dob: [''],
      selectedcurrentstatus:[''],
    });
    
    this.myForm = this.formBuilder.group({
      interviewInfo: ['', [Validators.required, Validators.minLength(3)]],
      client: ['', [Validators.required, Validators.minLength(3)]],
      vendor: ['', [Validators.required, Validators.minLength(3)]],
      subVendor: ['', [Validators.required, Validators.minLength(3)]],
      assistedBy: ['', [Validators.required, Validators.minLength(3)]],
      typeOfAssistance: ['', [Validators.required, Validators.minLength(3)]],
      interviewMode: ['', [Validators.required, this.atLeastOneSelectedValidator]],
      interviewDate: ['', [Validators.required, this.futureDateValidator]],
      interviewTime: ['', [Validators.required, this.validTimeValidator]],
    });

    this.myFormSubmission = this.formBuilder.group({
      submissionDate: ['', [Validators.required, this.futureDateValidator]],
      title: ['', [Validators.required, Validators.minLength(3)]],
      notes: ['', [Validators.required, Validators.minLength(3)]],
      vendorName: ['', [Validators.required, Validators.minLength(3)]],
      rate: ['', [Validators.required, Validators.minLength(3)]],
      clientName: ['', [Validators.required, Validators.minLength(3)]],
      
    });

    this.myFormFinancial = this.formBuilder.group({
      accountnum1: ['', [Validators.required, Validators.pattern(/^\d{12}$/)]],
      accountnum2: ['', [Validators.required, Validators.pattern(/^\d{12}$/)]],
       FinancialNotes: [''],
      salaryinfo: [''],
      maritalStatus: ['Married'],
      legalStatus: [''],
      Perdeium: [''],
      federalAddAllowance: [''],
      federalTaxAllowance: [''],
      stateTaxExemptions: [''],
      stateTaxAllowance: [''],
      lcaRate: [''],
      lcaDate: [''],
      gcWages: [''],
      gcDate: [''],
      State: [''],
      healthInsurance: [''],
      lifeInsurance: [false],

      Bankname1: [''],
      Bankname2: [''],
      accountType1: [''],
      accountType2: [''],
      salaryDepositType: [''],
      howMuch: [''],
      routingnum1: [''],
      routingnum2: [''],
      
      
    });

    // this.disableFormGroup(this.myFormFinancial);
    var viewaccess = this.AppService.checkViewOnly(2);
    if(!viewaccess){
      this.disableGeneralFields();
      this.disableInterviewFields();
      this.disableSubmissionFields();
      this.disableFinancialFields();
    }
    
  }
  

  disableGeneralFields() {
    Object.keys(this.FormGeneral.controls).forEach(controlName => {
      this.FormGeneral.get(controlName)?.disable();
    });
  }
  disableInterviewFields() {
    Object.keys(this.myForm.controls).forEach(controlName => {
      this.myForm.get(controlName)?.disable();
    });
  }
  disableSubmissionFields() {
    Object.keys(this.myFormSubmission.controls).forEach(controlName => {
      this.myFormSubmission.get(controlName)?.disable();
    });
  }
  disableFinancialFields() {
    Object.keys(this.myFormFinancial.controls).forEach(controlName => {
      this.myFormFinancial.get(controlName)?.disable();
    });
  }

  // interview - form - validation - function 
  futureDateValidator(control: { value: string | number | Date; }) {
    const currentDate = new Date();
    const selectedDate = new Date(control.value);

    if (selectedDate <= currentDate) {
      return { futureDate: true };
    }
    return null;
  }

  validTimeValidator(control: { value: string; }) {
    const timeRegex = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;

    if (!timeRegex.test(control.value)) {
      return { invalidTimeFormat: true };
    }
    return null;
  }

  atLeastOneSelectedValidator(control: AbstractControl) {
    const selectedMode = control.value;

    if (selectedMode === null || selectedMode === '') {
      return { atLeastOneSelected: true };
    }
    return null;
  }

  // Submission - form - validation - function 

  ngOnChanges(): void {
  }


  getPlacementList() {
    this.TraineeID = this.cookieService.get('TraineeID');

    const Req = {
      TraineeID: this.candidateID
    };
    this.service.getPlacementList(Req).subscribe((x: any) => {
      this.placementList = x.result;
    });
  }

  // emailPlacementTracker() {
    
  //   const req = {
  //     TraineeID: this.candidateID,
  //     OrgID: this.OrgID,
  //   };
   
  //   this.service.Sendplacementmail(req).subscribe((x: any) => {
  //     this.TraineeID = x.result;
  //     this.OrgID = x.result;
  //   });

  //   alert(this.candidateID);
  // }

  emailPlacementTracker() {
    this.loading = true;
    const req = {
      TraineeID: this.candidateID,
      OrgID: this.OrgID,
      placementList: this.placementList
    };
  
    this.service.Sendplacementmail(req).subscribe(
      (response: any) => {
        console.log('Email sent successfully:', response);
        this.messageService.add({ severity: 'success', summary: 'Mail Sent Successfully' });
        this.loading = false;
      },
      (error: any) => {
        console.error('Error sending email:', error);
        this.messageService.add({ severity: 'error', summary: 'Failed to send Mail' });
        this.loading = false;
      }
    );
  }
  

  
  
  getSubmissionList() {
    const req = {
      TraineeID: this.candidateID,
    };

    this.service.getSubmissionList(req).subscribe((x: any) => {
      this.submissionList = x.result;
    });
  }
  
  fetchinterviewlist() {
    let Req = {
      TraineeID: this.candidateID,
    };
    this.service.getInterviewList(Req).subscribe((x: any) => {
      this.interview = x.result;
    });
  }
  recruiterNames: string[] = [];
  marketerNames: string[] = [''];
  currentStatusOptions: any = [];

  getmarketername() {
    let Req = {
      TraineeID: this.TraineeID,
      orgID: this.OrgID
    };
    this.service.fetchrecruiter(Req).subscribe((x: any) => {
      this.recruiterNames = x;
      this.marketerNames = x;
    });
  }
  getcandidaterstatus() {
    const Req = {
    };
    this.service.candidatestatus(Req).subscribe((x: any) => {
      this.currentStatusOptions = x;
    });
  }

  getdivision() {
    const Req = {
    };
    this.service.divisiondropdown(Req).subscribe((x: any) => {
      this.divisions = x;
    });
  }

  getLegalStatusOptions() {
    const request = {};

    this.service.getLegalStatus(request).subscribe((response: any) => {
      this.legalStatusOptions = response;
    });
  }

  getState() {
    let Req = {
      TraineeID: this.TraineeID,
    };
    this.service.getLocation(Req).subscribe((x: any) => {
      this.state = x.result;
    });
    console.log(this.selectedstate1);
  }
  
  getOrgUserList() {
    let Req = {
      TraineeID: this.candidateID,
      OrgID:this.OrgID
    };
    this.service.getOrgUserList(Req).subscribe((x: any) => {
    this.referedby = x.result;
    this.recruiterName = x.result;
    this.loading = false;
    }),(error: any) => {
      this.loading = false;
    };
  }
  
  fetchCandidateInfo() {
    let Req = {
      TraineeID: this.candidateID,
    };
    this.service.getCandidateInfo(Req).subscribe((x: any) => {
      console.log(x.result[0].Candidatestatus);
      this.test = x.result[0].Candidatestatus;  
      this.selectedcurrentstatus = x.result[0].Candidatestatus;
      this.middleName = x.result[0].MiddleName || '';
      this.skillSet = x.result[0].Skill || '';
      this.phoneNumberG = x.result[0].PhoneNumber || ''; 
      this.generalEmail = x.result[0].UserName || '';
      this.selectedrecruiterName = x.result[0].RecruiterName || '';
      this.legalStatusVal = x.result[0].Legalstartdate || ''; 
      this.firstName = x.result[0].FirstName || '';
      this.middleName = x.result[0].MiddleName || '';
      this.lastName = x.result[0].LastName || '';
      this.SelectedRefered = x.result[0].ReferredBy || '';
      this.DealOffered = x.result[0].DealOffered || '';
      this.referredByExternal = x.result[0].ReferredBy_external || '';
      this.ssn = x.result[0].SSn || '';
      this.statusDate = x.result[0].statusdate || '';
      this.duiFelonyInfo = x.result[0].DuiFelonyInfo || '';
      this.MarketerName = x.result[0].marketername || '';
      this.legalStatusValend = x.result[0].Legalenddate || '';
      this.selectedLegalStatus = x.result[0].LegalStatus || '';  
      this.ftcNotes = x.result[0].FTCNotes || '';
      this.otherNotes = x.result[0].Notes || '';
      this.division = x.result[0].division || '';
      this.dob = x.result[0].DOB || '';
      this.contactName = x.result[0].EmergConName || '';
      this.contactPhone = x.result[0].EmergConPhone || '';
      this.contactEmail = x.result[0].EmergConemail || '';
      this.passportNumber = x.result[0].PassportNumber || '';
      this.personalInfoAddress = x.result[0].Address || '';
      this.personalInfoAddress1 = x.result[0].addressline2 || '';
      this.personalInfoCountry = x.result[0].Country || '';
      this.personalState = x.result[0].state || '';
      this.personalCity = x.result[0].City || '';
      this.personalZipcode = x.result[0].Zipcode || '';
      this.addressType = x.result[0].AddressType || '';
      this.passportvalStartdate = x.result[0].PassvalidateStartdate || '';
      this.passportvalenddate = x.result[0].Passvalidateenddate || '';
      if(x.tresumeInfo.length ===0){
        // this.addRow();
        // this.addRow1();
      }else{
        var tinfo = x.tresumeInfo
        tinfo.forEach((item: { TresumeNodeTypeID?: any; Title?: string; Org?: string; NodeDate?: string; NodeDateTo?: string; 
          Location?: any; TresumeNodeID?: string; TresumeID?: string; Skill?: string; }) => {
          // Check the value of TresumeNodeTypeID
          if (item.TresumeNodeTypeID === 1) {
            this.educations.push(item);
            this.TresumeID = item.TresumeID;
          } else if (item.TresumeNodeTypeID === 2) {
            this.experiences.push(item);
            this.TresumeID = item.TresumeID;
          }
        });
        if(this.educations.length ===0){
          // this.addRow();
        }
        if(this.experiences.length ===0){
          // this.addRow1();
        }
      }

      // this.FormGeneral.patchValue({
        
  
      // });
      this.myFormFinancial.patchValue({
        accountnum1: x.result[0].Bank1AccountNumber || '',
        accountnum2: x.result[0].Bank2AccountNumber || '',
         FinancialNotes: x.result[0]. FinancialNotes || '',
        salaryinfo: x.result[0].Salary || '',
        maritalStatus: x.result[0].MaritalStatus || 'Married',
        legalStatus: x.result[0].LegalStatus || '',
        Perdeium: x.result[0].Perdeium || '',
        federalAddAllowance: x.result[0].FederalTaxAdditionalAllowance || '',
        federalTaxAllowance: x.result[0].FederalTaxAllowance || '',
        stateTaxExemptions: x.result[0].StateTaxExemptions || '',
        stateTaxAllowance: x.result[0].StateTaxAllowance || '',
        lcaRate: x.result[0].LCARate || '',
        lcaDate: x.result[0].LCADate || '',
        gcWages: x.result[0].GCWages || '',
        gcDate: x.result[0].GCDate || '',
        State: x.result[0].FState || '',
        healthInsurance: x.result[0].HealthInsurance || '',
        lifeInsurance: x.result[0].LifeInsurance || false,
        Bankname1: x.result[0].Bank1Name || '',
        Bankname2: x.result[0].Bank2Name || '',
        accountType1: x.result[0].Bank1AccountType || '',
        accountType2: x.result[0].Bank2AccountType || '',
        salaryDepositType: x.result[0].SalaryDepositType || '',
        howMuch: x.result[0].HowMuch || '',
        routingnum1: x.result[0].Bank1RoutingNumber || '',
        routingnum2: x.result[0].Bank2RoutingNumber || '',
      });
    });
  }

  interviewInfo: string = '';
  client: string = '';
  vendor: string = '';
  subVendor: string = '';
  assistedBy: string = '';
  typeOfAssistance: string = '';
  interview: any[] = [];

  onSaveClick() {
    const job = {
      Date: this.interviewDate,
      interviewTime: this.interviewTime,
      Notes: this.interviewInfo,
      client: this.client,
      vendor: this.vendor,
      subVendor: this.subVendor,
      Assigned: this.assistedBy,
      typeOfAssistance: this.typeOfAssistance,
      InterviewMode: this.selectedInterviewMode,
    };

    this.interview.push(job);
    console.log('Form Values:', job);
    this.clearInputFields();
  }

  clearInputFields() {
    this.interviewDate = '';
    this.interviewTime = '';
    this.interviewInfo = '';
    this.client = '';
    this.vendor = '';
    this.subVendor = '';
    this.assistedBy = '';
    this.typeOfAssistance = '';
    this.selectedInterviewMode = '';
  }

  // INTERVIEW - DELETE
  deleteinterviewdata(TraineeInterviewID: number) {
    this.deleteIndex = TraineeInterviewID;
    console.log(this.deleteIndex);
    this.showConfirmationDialog = true;
  }
  confirmDelete() {
    console.log(this.deleteIndex);
    let Req = {
      TraineeInterviewID: this.deleteIndex,
    };
    this.service.deleteinterviewdata(Req).subscribe((x: any) => {
      var flag = x.flag;
      console.log(x);
      this.fetchinterviewlist();

      if (flag === 1) {
        this.messageService.add({
          severity: 'success',
          summary: 'interviewdata Deleted Sucessfully',
        });
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Please try again later',
        });
      }
    });
    this.showConfirmationDialog = false;
  }
  cancelDelete() {
    console.log(this.showConfirmationDialog);
    this.showConfirmationDialog = false;
  }

  canceldeletesubmission(){
    console.log(this.showConfirmationDialog3);
    this.showConfirmationDialog3 = false;
  }

  //placement tab

  // currentStatusOptions: string[] = ['ON TRAINING', 'DIRECT MARKETING', 'REQUIREMENT BASED MARKETING/SOURCING', 'ON BENCH', 'MARKETING ON HOLD', 'HAS OFFER', 'PLACED/WORKING AT THE CLIENT LOCATION', 'FIRST TIME CALLER', 'DROPPED-TRAINING', 'DROPPED-MARKETING', 'DROPED-OTHER', 'TERMINATE', 'REPLACED AS CLIENT SITE'];
  selectOptions: string = '';
  workStartDate: string = '';
  workEndDate: string = '';
  positionTitle: string = '';
  endClientName: string = '';
  vendorplacement: string = '';
  endClientAddress: string = '';

  // PLACEMENT - DELETE 
  deleteplacementdata(PID: number) {
    this.deleteIndex = PID;
    console.log(this.deleteIndex);
    this.showConfirmationDialog2 = true;
  }
  confirmDeleteplacement() {
    console.log(this.deleteIndex);
    let Req = {
      PID: this.deleteIndex,
    };
    this.service.deleteplacementdata(Req).subscribe((x: any) => {
      var flag1 = x.flag;
      if (flag1 === 1) {
        this.messageService.add({
          severity: 'success',
          summary: 'Placement Deleted Sucessfully',
        });
        this.getPlacementList();
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Please try again later',
        });
        this.getPlacementList();
      }
    });
    this.showConfirmationDialog2 = false;
  }
  cancelDeleteplacement() {
    console.log(this.showConfirmationDialog2);
    this.showConfirmationDialog2 = false;
  }

  // submission delete
deletesubmissiondata(submissionid: number) {
  this.deleteIndex = submissionid;
  console.log(this.deleteIndex);
  this.showConfirmationDialog3 = true;
}
confirmdeletesubmission() {
  console.log(this.deleteIndex);
  let Req = {
    submissionid: this.deleteIndex,
  };
  this.service.deletesubmissiondata(Req).subscribe((x: any) => {
    var flag = x.flag;
    this.getSubmissionList();

    if (flag === 1) {
      this.messageService.add({
        severity: 'success',
        summary: 'Submission Deleted Sucessfully',
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Please try again later',
      });
    }
  });
  this.showConfirmationDialog3 = false;
}
cancelDeletesubmission() {
  console.log(this.showConfirmationDialog3);
  this.showConfirmationDialog3 = false;
}

  //financialinfo

  options = ['Single', 'Married', 'Married with hold'];
  selectedOptions: string[] = [];
  updateArray(option: string): void {
    if (this.selectedOptions.includes(option)) {
      this.selectedOptions = this.selectedOptions.filter(item => item !== option);
    } else {
      this.selectedOptions.push(option);
    }
  }
  legalStatusOptions: string[] = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'District of Columbia', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa'];
  selectedOption: string = '';
  GoTonext() {
    this.router.navigate(['/candidateView/:id/sitevisit']);
  }
// Venkat Tracker Code 
  addRecruitmentTracker() {
    this.loading = true;
    let Req = {
      CandidateName: this.firstName +' '+this.lastName,
      TraineeID: this.candidateID,
      OrgID: this.OrgID,
      FinancialNotes: this.myFormFinancial.value.FinancialNotes,
      Salary: this.myFormFinancial.value.salaryinfo,
      Perdeium: this.myFormFinancial.value.Perdeium,
      LegalStatus: this.myFormFinancial.value.legalStatus,
      MaritalStatus: this.myFormFinancial.value.maritalStatus,
      StateTaxAllowance: this.myFormFinancial.value.stateTaxAllowance,
      StateTaxExemptions: this.myFormFinancial.value.stateTaxExemptions,
      FederalTaxAllowance: this.myFormFinancial.value.federalTaxAllowance,
      FederalTaxAdditionalAllowance: this.myFormFinancial.value.federalAddAllowance,
      Gcdate: this.myFormFinancial.value.gcDate,
      GCWages: this.myFormFinancial.value.gcWages,
      Lcadate: this.myFormFinancial.value.lcaDate,
      LCARate: this.myFormFinancial.value.lcaRate,
      FState: this.myFormFinancial.value.FState,
      healthInsurance: this.myFormFinancial.value.healthInsurance,
      lifeInsurance: this.myFormFinancial.value.lifeInsurance,

      Bank1Name: this.myFormFinancial.value.Bankname1,
      Bank2Name: this.myFormFinancial.value.Bankname2,
      Bank1AccountType: this.myFormFinancial.value.accountType1,
      Bank2AccountType: this.myFormFinancial.value.accountType2,
      Bank1AccountNumber: this.myFormFinancial.value.accountnum1,
      Bank2AccountNumber: this.myFormFinancial.value.accountnum2,
      Bank1RoutingNumber: this.myFormFinancial.value.routingnum1,
      Bank2RoutingNumber: this.myFormFinancial.value.routingnum2,
      SalaryDepositType: this.myFormFinancial.value.salaryDepositType,
      HowMuch: this.myFormFinancial.value.howMuch,
    };

    console.log('Form values:', this.myFormFinancial.value);
    this.service.insertRecruitmentTracker(Req).subscribe(
      (x: any) => {
        this.messageService.add({ severity: 'success', summary: 'Mail Sent Successfully' });
        this.loading = false;
      },
      (error: any) => {
        this.messageService.add({ severity: 'error', summary: 'Failed to send Mail' });
        this.loading = false;
      }
    );

  }

  // Education
  educations:any[] = [];

  addRow() {
this.loading = true;
    let req = {
      TraineeID:this.candidateID,
      TresumeID:this.TresumeID,
      username:this.userName,
      type:1
    };
    this.service.addTresumeNode(req).subscribe(
      (x: any) => {
        this.educations.push({
          Title: '',
          Org: '',
          NodeDate: '',
          NodeDateTo: '',
          Location: '',
          TresumeNodeID:x.TresumeNodeID,
          TresumeID:x.TresumeID
        });
        this.loading = false;
      },
      (error: any) => {
        this.messageService.add({ severity: 'danger', summary: 'Error adding Education. Please try again' });
        this.loading = false;
      }
    );

  }

  //Above function will remove all row in education tab
  deleteRow(index: number,TresumeNodeID:any) {
    this.loading = true;
    let req = {
      TresumeNodeID:TresumeNodeID,  
    };
    this.service.DeleteTresumeNode(req).subscribe(
      (x: any) => {
        this.messageService.add({ severity: 'Success', summary: 'Education Deleted Successfully' });
        this.educations.splice(index, 1);
        this.loading=false;
      },
      (error: any) => {
        this.messageService.add({ severity: 'danger', summary: 'Error adding Experience. Please try again' });
        this.loading = false;
      }
    );
      
    
  }

  // Experience
  experienceForm: FormGroup;
  experiences:any = [];

  addRow1() {
this.loading = true;
    let req = {
      TraineeID:this.TraineeID,
      TresumeID:this.TresumeID,
      username:this.userName,
      type:2
    };
    this.service.addTresumeNode(req).subscribe(
      (x: any) => {
        this.experiences.push({
          Title: '',
          Org: '',
          NodeDate: '',
          NodeDateTo: '',
          Location: '',
          TresumeNodeID:x.TresumeNodeID,
          TresumeID:x.TresumeID,
          Skill:''
        });
        this.loading = false
      },
      (error: any) => {
        this.messageService.add({ severity: 'danger', summary: 'Error adding Experience. Please try again' });
        this.loading = false;
      }
    );
   
  }

  UpdateTresumeNode(type:any,data:any){
    console.log(data);
    let req = {
      data:data,
    };
    this.service.UpdateTresumeNode(req).subscribe(
      (x: any) => {
        
      },
      (error: any) => {
        this.messageService.add({ severity: 'danger', summary: 'Error adding Experience. Please try again' });
        this.loading = false;
      }
    );
  }

  deleteRow1(index: number,TresumeNodeID:any) {
    this.loading = true;
    let req = {
      TresumeNodeID:TresumeNodeID,  
    };
    this.service.DeleteTresumeNode(req).subscribe(
      (x: any) => {
        this.messageService.add({ severity: 'Success', summary: 'Experiance Deleted Successfully' });
        this.experiences.splice(index, 1);
        this.loading = false;
      },
      (error: any) => {
        this.messageService.add({ severity: 'danger', summary: 'Error adding Experience. Please try again' });
        this.loading = false;
      }
    );
      
  }

  // download DSR Submission tab 

  showOptionsFlag: boolean = false;
  excelOptionDisplay: string = 'none';

  showOptions() {
    this.showOptionsFlag = !this.showOptionsFlag;
    this.excelOptionDisplay = this.showOptionsFlag ? 'block' : 'none';
  }

  downloadExcel() {
    const data = this.submissionList;

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Title,SubmissionDate,MarketerName,VendorName,ClientName,Note,Rate\n";
    
    data.forEach(submission => {
      csvContent += `${submission.Title},${submission.SubmissionDate},${submission.MarketerName},${submission.VendorName},${submission.ClientName},${submission.Note},${submission.Rate}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "submission_data.csv");
    document.body.appendChild(link);
    link.click();
  }

  movetoTB() {

    this.showmovetotalentbench = true;
  }
  cancelMoveTB(){
    this.showmovetotalentbench = false;
  }

  movetotalentbench() {
    let Req = {
      TraineeID: this.candidateID || '',
      Name: (this.firstName || '') + ' ' + (this.lastName || ''),
      ReferredBy: this.ReferredBy2 || '',
      Currency: this.Currency || '',
      BillRate: this.BillRate || 0,
      PayType: this.PayType || '',
      TaxTerm: this.TaxTerm || '',
      ConsultantType: this.ConsultantType || '',
      JobTitle: this.title || '',
      LocationPreference: this.selectedstate || '',
      BenchStatus: 'ACTIVEBENCH',
      Availability: this.Availability || '',
      txtComments: this.txtComments || '',
      CreateBy: this.userName || ''
    };
  
    this.service.MoveToTalentBench(Req).subscribe(
      (x: any) => {
        this.handleSuccess(x);
        this.cancelMoveTB();
      },
      (error: any) => {
        this.handleError(error);
        this.cancelMoveTB();
      }
    );
  }
  

  movetoBack(){
    if(this.routeType == 1){
      this.router.navigate(['/candidates/1']);
    }else if(this.routeType ==3){
      this.router.navigate(['/talentBench']);
    }
  }

  togglePlayPause() {
    if (this.videoPlayer.nativeElement.paused) {
      this.videoPlayer.nativeElement.play();
    } else {
      this.videoPlayer.nativeElement.pause();
    }
  }

  stop() {
    this.videoPlayer.nativeElement.pause();
    this.videoPlayer.nativeElement.currentTime = 0;
  }

}
