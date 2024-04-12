import { TalentBenchService } from './talent-bench.service';
import { MatDialog } from '@angular/material/dialog';
import { Component, OnInit, OnChanges } from '@angular/core';
import { FormBuilder, Validators, FormGroup, AbstractControl } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { MessageService } from 'primeng/api';
import { ActivatedRoute } from '@angular/router';
import { ElementRef, Renderer2 } from '@angular/core';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-talent-bench',
  templateUrl: './talent-bench.component.html',
  styleUrls: ['./talent-bench.component.scss'],
  providers: [TalentBenchService, CookieService, MessageService],
})
export class TalentBenchComponent implements OnInit {

  loading: boolean = true;
  candidates: string[] = ['Candidate 1', 'Candidate 2', 'Candidate 3'];
  // formData: any = {};
  OrgID: string = '';
  userName: string = '';
  TraineeID: string = '';
  addCandidate: any;
  recruiterName: any;
  selectedcurrentstatus: any;
  currentStatusOptions: any = [];
  legalStatusOptions: any;
  legalStatus: string[] = [];
  tableData: any[] = [];
  searchTerm: string = '';
  noResultsFound: boolean = false;
  newGroupName: any;
  grouplistdata: any;
  groupOptions: any;
  groupname: any;
  candidateID:any;
  routeType: any;

  currentPage: number = 0;
  pageSize: number = 3;
  totalRecords: number;
  totalPages: number;
  pagesToShow: number = 10;
  searchInput:string = '';

  selectedOrgID: any;
  constructor(private dialog: MatDialog, private cookieService: CookieService, private service: TalentBenchService, private messageService: MessageService, private formBuilder: FormBuilder,private route: ActivatedRoute, private renderer: Renderer2, private el: ElementRef,private datePipe: DatePipe) {
    this.OrgID = this.cookieService.get('OrgID');
    this.userName = this.cookieService.get('userName1');
    this.TraineeID = this.cookieService.get('TraineeID');
    this.routeType = this.route.snapshot.params["routeType"];
    this.candidateID = this.route.snapshot.params["traineeID"];
  }

  recruiterNames: string[] = [];
  candidateStatuses: string[] = [];
  marketerNames: string[] = [''];
  marketerName: string[] = [''];
  referralTypes: string[] = ['Phone', 'Email', 'Others'];
  referralType: string[] = [''];
  formData: any = {};

  dataArray: any[] = [
    { groupname: 'Group A', candidateCount: 10 },
    { groupname: 'Group B', candidateCount: 5 },
  ];

  onIconClick() {
    alert('are you sure want to delete?');
  }


  ngOnInit(): void {
    this.loading = true;
    this.OrgID = this.cookieService.get('OrgID');
    this.userName = this.cookieService.get('userName1');
    this.TraineeID = this.cookieService.get('TraineeID');
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    this.startDate = this.datePipe.transform(firstDayOfMonth, 'yyyy-MM-dd')!;

    this.endDate = this.datePipe.transform(currentDate, 'yyyy-MM-dd')!;
    this.fetchgrouplist();
    this.fetchtalentbenchlist();
    this.getcandidaterstatus();
    this.getLegalStatusOptions();
    this.getOrgUserList();
    this.getGroupList();
    this.startDate = '';
    this.endDate = '';
    this.getOrganization();
    this.selectedOrgID = this.OrgID;

    this.addCandidate = this.formBuilder.group({
      FirstName: ['', [Validators.required, Validators.minLength(3)]],
      MiddleName: [''],
      LastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.minLength(3)]],
      Phone: ['', [Validators.required, Validators.minLength(3)]],
      Gender: ['male'],
      RecruiterName: [''],
      Degree: [''],
      University: [''],
      CandidateStatus: [''],
      Groups: [''],
      LegalStatus: [''],
      marketerName: ['', Validators.required],
      LocationConstraint: ['yes'],
      ReferralType: [''],
      Notes: [''],
    });
  }

  search: string = '';

  multiorgID:any;
  getOrganization() {
    const Req = {
      useremail:this.userName
    };
    this.service.fetchmultiorg(Req).subscribe((x: any) => {
      this.multiorgID = x;
    });
  }

isCandidateVisible(candidate: any): boolean {
  const searchValue = this.search.toLowerCase();
  return (
    candidate.FirstName.toLowerCase().includes(searchValue) ||
    candidate.LastName.toLowerCase().includes(searchValue) ||
    candidate.UserName.toLowerCase().includes(searchValue)
  );
}

updateSelected(selectedId: string, traineeID: number,type:any) {
  this.loading = true;
 var req = {}
 if(type == 1){
  req = {
    traineeid : traineeID,
    groupid : selectedId,
    marketername : ''
  }
 }else{
  req = {
    traineeid : traineeID,
    groupid : '',
    marketername : selectedId
  }
}
  this.service.TBupdateSelected(req).subscribe((x: any) => {
    if(x.flag == 1){
      this.messageService.add({ severity: 'success', summary: 'Data Updated' });
      this.loading = false;
    }else{
      this.messageService.add({ severity: 'error', summary: 'Failed to Updated' });
      this.loading = false;
    }
  });
 }


  fetchgrouplist() {
    let Req = {
      orgID: this.OrgID
    };
    this.service.fetchGroupList(Req).subscribe((x: any) => {
      this.groupOptions = x.result;
      this.loading = false;
    });
    
  }

  getcandidaterstatus() {
    const Req = {
    };
    this.service.candidatestatus(Req).subscribe((x: any) => {
      this.currentStatusOptions = x;
    });

  }

  downloadSubmission(candidateID:string) {
    this.loading = true;
  
    this.service.downloadcandidatesubmission(candidateID).subscribe(
      (blob: Blob) => {
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = 'submissions.xlsx';
        link.click();
        this.loading = false; 
      },
      (error: any) => {
        this.loading = false;   
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No Record Found' });
      }
    );
  }
  
  downloadInterview(candidateID:string) {
    this.loading = true;
  
    this.service.downloadcandidateInterview(candidateID).subscribe(
      (blob: Blob) => {
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = 'Interview.xlsx';
        link.click();
        this.loading = false; 
      },
      (error: any) => {
        this.loading = false;
        // this.handleError(error);
        // this.messageService.add({ severity: 'error',  });
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No Record Found' });

      }
    );
  }

  placementrecdownload(candidateID:string){
    this.loading = true;
  
    this.service.downloadcandidatePlacement(candidateID).subscribe(
      (blob: Blob) => {
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = 'Placement.xlsx';
        link.click();
        this.loading = false; 
      },
      (error: any) => {
        this.loading = false;      
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No Record Found' });
      }
    );
  }

  addGroup(){
    if (this.newGroupName.trim() !== '') {
      this.loading = true;
      const request = {
        orgID: this.OrgID,
        groupName: this.newGroupName.trim(),
        Active: 1,
        createby: this.userName
      };
  
      this.service.addGroup(request).subscribe(
        (response: any) => {
          if (response.flag === 1) {
            this.getGroupList();
            this.messageService.add({ severity: 'success', summary: response.message });
          } else {
            this.loading = false;
            // console.error('Error adding group!');
            this.messageService.add({ severity: 'error', summary: response.message });
          }
        },
        (error: any) => {
          this.loading = false;
          this.messageService.add({ severity: 'error', summary: 'Error adding group' });
          // console.error('Error adding group:', error);
        }
      );
    }
  }
  
  deleteGroup(GID:any){
    this.loading = true;
    let Req = {
      GID: GID,
    };
    this.service.deleteGroup(Req).subscribe((x: any) => {
      var flag = x.flag;
  
      if (flag === 1) {
        this.fetchgrouplist();
        this.getGroupList();
        this.messageService.add({
          severity: 'success',
          summary: 'Submission Deleted Sucessfully',
        });
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Please try again later',
        });
        this.loading = false;
      }
    });
  }
  
  getGroupList() {
    const request = {
      OrganizationID: this.OrgID,
    };
  
    this.service.getGroupList(request).subscribe(
      (res) => {
        this.grouplistdata = res.result;
        // console.error('No active clients found!');
        this.loading = false
      },
      (error) => {
        // console.error('Error fetching data:', error);
        this.loading = false;
      }
    );
  }

  dsrdownload() {
    this.loading = true;

    this.service.DSRReportDownload({
      OrgID: this.OrgID,
      startdate: this.startDate,
      enddate: this.endDate,
      options: { responseType: 'blob' } // Include options object
    }).subscribe(
      (res) => {
        console.log(res);
        this.saveFile(res, 'DSR_Report.xlsx');
        this.loading = false;
      },
      (error) => {
        this.loading = false;
        console.error('Error downloading file:', error);
      }
    );
  }

  interviewdownload() {
    this.loading = true;

    this.service.InterviewReportDownload({
      OrgID: this.OrgID,
      startdate: this.startDate,
      enddate: this.endDate,
      options: { responseType: 'blob' } // Include options object
    }).subscribe(
      (res) => {
        console.log(res);
        this.saveFile(res, 'Interview_Report.xlsx');
        this.loading = false;
      },
      (error) => {
        this.loading = false;
        console.error('Error downloading file:', error);
      }
    );
  }

  placementdownload() {
    this.loading = true;

    this.service.PlacementReportDownload({
      OrgID: this.OrgID,
      startdate: this.startDate,
      enddate: this.endDate,
      options: { responseType: 'blob' } // Include options object
    }).subscribe(
      (res) => {
        console.log(res);
        this.saveFile(res, 'Placement_Report.xlsx');
        this.loading = false;
      },
      (error) => {
        this.loading = false;
        console.error('Error downloading file:', error);
      }
    );
  }


  private saveFile(data: any, filename: string) {
    const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
  }

  getLegalStatusOptions() {
    const request = {};

    this.service.getLegalStatus(request).subscribe((response: any) => {
      this.legalStatusOptions = response;
    });
  }

  saveData() {

    let Req = {
      firstName: this.addCandidate.value.FirstName,
      middleName: this.addCandidate.value.MiddleName,
      lastName: this.addCandidate.value.LastName,
      email: this.addCandidate.value.Email,
      Phone: this.addCandidate.value.Phone,
      gender: this.addCandidate.value.Gender,
      recruiterName: this.recruiterName,
      degree: this.addCandidate.value.Degree,
      University: this.addCandidate.value.University,
      candidateStatus: this.selectedcurrentstatus,
      Groups: this.addCandidate.value.Groups,
      legalStatus: this.addCandidate.value.LegalStatus,
      MaketerName: this.marketerName,
      locationConstraint: this.addCandidate.value.LocationConstraint,
      referralType: this.addCandidate.value.referralType,
      notes: this.addCandidate.value.Notes,
      orgID: this.selectedOrgID,
      createby: this.userName,
      followupon: '',
      currentLocation: ''
    };

    console.log(Req);
    this.service.AddTalentBenchList(Req).subscribe(
      (x: any) => {
        this.handleSuccess(x);
        this.fetchtalentbenchlist();
      },
      (error: any) => {
        this.handleError(error);
      }
    );

  }

  getOrgUserList() {
    let Req = {
      TraineeID: this.TraineeID,
      orgID: this.OrgID
    };
    this.service.fetchrecruiter(Req).subscribe((x: any) => {
      this.recruiterNames = x;
      this.marketerNames = x;
    });
  }

  fetchtalentbenchlist() {
    this.loading = true;
    let Req = {
      traineeID: this.TraineeID,
      OrganizationID: this.OrgID,
      username:this.userName,
      Page: this.currentPage,
      searchterm: this.searchInput,
      startdate:'',
      enddate:''
    };
    this.service.getTalentBenchList(Req).subscribe((x: any) => {
      this.tableData = x.result;
      this.noResultsFound = this.tableData.length === 0;
      if(this.tableData.length === 0){
        this.messageService.add({ severity: 'danger', summary: 'No Records Found Please Try Again'});
        this.loading = false;
      }else{
        this.loading = false;
        this.tableData.forEach(item => {
          const age = item.age;
        });
      }
    });

  }

  searchhtalentbenchlist(searchterm:string) {
this.loading = true;
    let Req = {
      traineeID: this.TraineeID,
      OrganizationID: this.OrgID,
      username:this.userName,
      Page: 0,
      searchterm:this.searchInput,
      startdate:'',
      enddate:''
    };
    this.service.getTalentBenchList(Req).subscribe((x: any) => {
      this.tableData = x.result;
      this.noResultsFound = this.tableData.length === 0;
      if(this.tableData.length === 0){
        this.messageService.add({ severity: 'danger', summary: 'No Records Found Please Try Again'});
        this.loading = false;
      }else{
        this.loading = false;
        this.tableData.forEach(item => {
          const age = item.age;
        });
      }
     
    });

  }


  getBackgroundColor(age: number | null): string {
    if (age === null) {
      return 'transparent'; 
    } else if (age >= 0 && age <= 30) {
      return '#a4e73466';
    } else if (age >= 31 && age <= 90) {
      return '#f4963980';
    } else {
      return '#e7602e99';
    }
  }  

  startDate: string = '';  
  endDate: string = '';
  filteredTableData: any[];  

  isFilterButtonEnabled(): boolean {
    return !!this.startDate && !!this.endDate;
  }

  filterTableData() {
    const startDateTime = this.startDate ? new Date(this.startDate) : null;
    const endDateTime = this.endDate ? new Date(this.endDate) : null;
    this.searchInput = '';
    let Req = {
      traineeID: this.TraineeID,
      OrganizationID: this.OrgID,
      username:this.userName,
      Page: 0,
      searchterm:'',
      startdate:startDateTime,
      enddate:endDateTime
    };
    this.service.getTalentBenchList(Req).subscribe((x: any) => {
      this.tableData = x.result;
      this.noResultsFound = this.tableData.length === 0;
      if(this.tableData.length === 0){
        this.messageService.add({ severity: 'danger', summary: 'No Records Found Please Try Again'});
        this.loading = false;
      }else{
        this.loading = false;
        this.tableData.forEach(item => {
          const age = item.age;
        });
      }
     
    });

    
    this.loading = false;
  }

  initializeData() {
    this.filterTableData();
    this.loading = true;
  }

  clearDates(): void {
    this.startDate = '';
    this.endDate = '';
    this.filteredTableData = this.tableData; 
  }

  emailvalidation: boolean = false;
  emailvalidationmessage: string = '';
  onEmailInput() {
    this.checkEmail();
  }

  checkEmail() {
    const email = this.addCandidate.get('email').value;

    if (email) {
      let Req = {
        email: email,
        orgID: this.OrgID
      };
      this.service.checkEmail(Req).subscribe((x: any) => {
        var flag = x.flag;
        if (flag === 2) {
          this.emailvalidation = true;
          this.emailvalidationmessage = x.message;
        } 
        else if (flag === 1){
          this.emailvalidation = false;
          this.emailvalidationmessage = '';

        }
      });
    }
  }
    // Add interview 
    myForm: any;
    interviewFormData: any = {};
    submissionFormData: any = {};
    interviewModes: string[] = ['Face to face', 'Zoom', 'Phone', 'Hangouts', 'WebEx', 'Skype', 'Others'];
    interviewDate: any; 
    interviewTime: string;
    interviewInfo: string;
    client: string;
    vendor: string;
    subVendor: string;
    assistedBy: string;
    typeOfAssistance: string;
    interviewMode: string;
    submissionList: any[] = []; 
    title: string;
    submissionDate: any;
    notes: string;
    vendorName: string;
    rate: any;
    clientName: string;
  
    saveInterviewData() {
      let Req = {
        interviewDate: this.interviewDate,
        interviewTime: this.interviewTime,
        interviewInfo: this.interviewInfo,
        client: this.client,
        vendor: this.vendor,
        subVendor: this.subVendor,
        assistedBy: this.assistedBy,
        typeOfAssistance: this.typeOfAssistance,
        interviewMode: this.interviewMode,
        interviewTimeZone: 'EST',
        traineeID: this.candidateID,
        recruiterID: this.TraineeID,
        recruiteremail: this.userName,
        InterviewStatus: 'SCHEDULED',
      };
      this.service.insertTraineeInterview(Req).subscribe(
        (x: any) => {
          this.handleSuccess(x);
          this.clearFields();
        },
        (error: any) => {
          this.handleError(error);
          this.clearFields();
        }
      );
    }
  
    clearFields() {
      this.interviewDate = null;
      this.interviewTime = '';
      this.interviewInfo = '';
      this.client = '';
      this.vendor = '';
      this.subVendor = '';
      this.assistedBy = '';
      this.typeOfAssistance = '';
      this.interviewMode = '';
      this.candidateID = '';
      this.TraineeID = '';
      this.userName = '';
    }
    openInterviewModal(candidateID: string) {
      this.candidateID = candidateID;
    }
  
    getSubmissionList() {
      let Req = {
        title: this.title,
        submissionDate: this.submissionDate,
        notes: this.notes,
        vendorName: this.vendorName,
        rate: this.rate,
        clientName: this.clientName,
        recruiteremail:this.userName,
        MarketerID:this.TraineeID,
        CandidateID:this.candidateID
      };
      this.service.insertSubmissionInfo(Req).subscribe((x: any) => {
        this.handleSuccess(x);
        this.clearFieldsSubmission();
      },
      (error: any) => {
        this.handleError(error);
      }
    );
    }
    clearFieldsSubmission() {
      this.title = '';
      this.submissionDate = '';
      this.notes = '';
      this.vendorName = '';
      this.rate = '';
      this.clientName = '';
    }
  
    openSubmissionModal(candidateID: string) {
      this.candidateID = candidateID;
    }
  
    private handleSuccess(response: any): void {
      this.messageService.add({ severity: 'success', summary: response.message });
      this.loading = false;
    }
    
    private handleError(response: any): void {
      this.messageService.add({ severity: 'error', summary:  response.message });
      this.loading = false;
    }

    onPageChange(pageNumber: number) {
      this.currentPage = pageNumber;
      this.fetchtalentbenchlist();
    }

  
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
        this.fetchtalentbenchlist();
      }
    }
  
    previousPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.fetchtalentbenchlist();
      }
    }
  
    calculatePageRange(): number[] {
      const currentPageIndex = this.currentPage - 1;
      const halfPagesToShow = Math.floor(this.pagesToShow / 2);
      let startPage: number, endPage: number;
  
      if (this.totalPages <= this.pagesToShow) {
        startPage = 1;
        endPage = this.totalPages;
      } else if (currentPageIndex - halfPagesToShow <= 0) {
        startPage = 1;
        endPage = this.pagesToShow;
      } else if (currentPageIndex + halfPagesToShow >= this.totalPages) {
        startPage = this.totalPages - this.pagesToShow + 1;
        endPage = this.totalPages;
      } else {
        startPage = currentPageIndex - halfPagesToShow + 1;
        endPage = startPage + this.pagesToShow - 1;
      }
  
      return Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);
    }
}
