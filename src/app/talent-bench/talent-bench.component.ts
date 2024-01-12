import { TalentBenchService} from './talent-bench.service';
import { MatDialog } from '@angular/material/dialog';
import { Component, OnInit, OnChanges } from '@angular/core';
import { FormBuilder, Validators, FormGroup, AbstractControl } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-talent-bench',
  templateUrl: './talent-bench.component.html',
  styleUrls: ['./talent-bench.component.scss'],
  providers: [TalentBenchService, CookieService,MessageService],
})
export class TalentBenchComponent implements OnInit {
  loading:boolean = false;
  candidates: string[] = ['Candidate 1', 'Candidate 2', 'Candidate 3'];
  // formData: any = {};
  tableData:any = [];
  OrgID:string = '';
  userName:string = '';
  TraineeID:string = '';
  addCandidate: any;
  noResultsFound:boolean = true;
  recruiterName: any;
  selectedcurrentstatus: any;
  currentStatusOptions: any = [];
  legalStatusOptions: any;
  legalStatus: string[] = [];

  constructor(private dialog: MatDialog,private cookieService: CookieService, private service:TalentBenchService,private messageService: MessageService,private formBuilder: FormBuilder) {
    }

  recruiterNames: string[] = [];
  candidateStatuses: string[] = ['Active', 'Inactive', 'On Hold'];
  marketerNames: string[] = ['Marketer 1', 'Marketer 2', 'Marketer 3'];
  referralTypes: string[] = ['Type 1', 'Type 2', 'Type 3'];
  item = {
    groupName: 'group1'
  };

  groupOptions: any[] = [
    { value: 'group1', label: 'Group 1' },
    { value: 'group2', label: 'Group 2' },
    { value: 'group3', label: 'Group 3' }
  ];


  // onSubmit() {
  //   console.log('Form Data:', this.formData);
  // }

  dataArray: any[] = [
    { groupName: 'Group A', candidateCount: 10 },
    { groupName: 'Group B', candidateCount: 5 },
  ];

  onIconClick() {
    alert('are you sure want to delete?');
  }


  ngOnInit(): void {
    // this.cookieService.set('userName1','karthik@tresume.us');
    // this.cookieService.set('OrgID','82');
    // this.cookieService.set('TraineeID','569');
    // this.cookieService.set('TimesheetRole','1');
    // this.cookieService.set('RoleID','17');
    this.OrgID = this.cookieService.get('OrgID');
    this.userName = this.cookieService.get('userName1');
    this.TraineeID = this.cookieService.get('TraineeID');
    this.fetchtalentbenchlist();
    this.getcandidaterstatus();
    this.getLegalStatusOptions();


    this.addCandidate = this.formBuilder.group({
      FirstName: ['', [Validators.required, Validators.minLength(3)]],
      MiddleName: [''],
      LastName: ['', [Validators.required]],
      Email: ['', [Validators.required, Validators.minLength(3)]],
      Phone: ['', [Validators.required, Validators.minLength(3)]],
      Gender: ['male'],
      RecruiterName: [''],
      Degree: [''],
      University: [''],
      CandidateStatus: [''],
      Groups: [''],
      LegalStatus: [''],
      MarketerName: ['', Validators.required],
      LocationConstraint: ['yes'],
      ReferralType: [''],
      Notes: [''],
    });

  }
  getcandidaterstatus(){
    const Req = {
         };
    this.service.candidatestatus(Req).subscribe((x: any) => {
      this.currentStatusOptions = x;
      console.log(this.currentStatusOptions);
    });
  }

  getLegalStatusOptions() {
    const request = {};
  
    this.service.getLegalStatus(request).subscribe((response: any) => {
      this.legalStatusOptions = response;
      console.log(this.legalStatusOptions);
    });
  }

  saveData(){
    let Req = {
      FirstName: this.addCandidate.value.FirstName,
      MiddleName: this.addCandidate.value.MiddleName,
      LastName: this.addCandidate.value.LastName,
      Email: this.addCandidate.value.Email,
      Phone: this.addCandidate.value.Phone,
      Gender: this.addCandidate.value.Gender,
      RecruiterName: this.addCandidate.value.RecruiterName,
      Degree: this.addCandidate.value.Degree,
      University: this.addCandidate.value.University,
      CandidateStatus: this.selectedcurrentstatus,
      Groups: this.addCandidate.value.Groups,
      LegalStatus: this.addCandidate.value.LegalStatus,
      MarketerName: this.addCandidate.value.MarketerName,
      LocationConstraint: this.addCandidate.value.LocationConstraint,
      ReferralType: this.addCandidate.value.ReferralType,
      Notes: this.addCandidate.value.Notes,
    };

    console.log(Req);
    this.service.addTalentBenchList(Req).subscribe((x: any) => {
      console.log(x);
    });
  }
//   fetchtalentbenchlist(){
//     let Req = {
//       OrgID: this.OrgID,
//     };
//   this.service.getTalentBenchList(Req).subscribe((x: any) => {
//     this.tableData = x.result;
//     this.noResultsFound = this.tableData.length === 0;
//   });
// }
fetchtalentbenchlist() {
  let Req = {
    traineeID: this.TraineeID,
    OrganizationID:this.OrgID
  };
  this.service.getTalentBenchList(Req).subscribe((x: any) => {
    this.tableData = x.result;
    this.noResultsFound = this.tableData.length === 0;
  });
}
}
