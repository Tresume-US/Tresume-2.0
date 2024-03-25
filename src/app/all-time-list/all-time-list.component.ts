import { Component, OnInit, OnChanges } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { TimesheetListService } from './all-time-list.service';
import { MessageService } from 'primeng/api';
@Component({
  selector: 'app-all-time-list',
  templateUrl: './all-time-list.component.html',
  providers: [CookieService,TimesheetListService,MessageService],
  styleUrls: ['./all-time-list.component.scss']
})
export class AllTimeListComponent implements OnChanges {
  loading:boolean = false;
  PendingData: any [] = [];
  rejectedData: any [] = [];
  completedData: any[] = [];
  nonBillableData: any [] = [];
  showConfirmationDialog: boolean = false;
  router: any;
  OrgID:string = '';
  TraineeID:string = '';
  noResultsFound: boolean = false;
  timesheetrole: any;
  id:string = '';
  username: any;
  firstname:any;
  lastname:any;
  candidateEmail:any;
  phonenumber:any;
  selectedGender:any;
  Locations: any;
  currentLocation: any;
  userName: any;
  sortByCandidateAsc: boolean = true;
  sortByTotalHoursAsc: boolean = true;
  sortByCreatedOnRecent: boolean = true;
  sortByFromDateRecent: boolean = true; 
  sortByToDateRecent: boolean = true;
  constructor(private cookieService: CookieService, private service: TimesheetListService, private messageService: MessageService)
  {
    this.OrgID = this.cookieService.get('OrgID');
    this.userName = this.cookieService.get('userName1');
    this.TraineeID = this.cookieService.get('TraineeID');
  }

  ngOnInit(): void {
    this.loading = true;
    this.OrgID = this.cookieService.get('OrgID');
    this.TraineeID = this.cookieService.get('TraineeID');
    this.id = this.cookieService.get('id');
    this.timesheetrole = this.cookieService.get('timesheet_role');
    this.username = this.cookieService.get('userName1');
    // this.fetchtimesheet();
    this.fetchPendingResult();
    this.fetchRejectedData();
    this.fetchCompletedData();
    this.fetchNonBillableData();
    this.gethrmsLocation();
    this.getTimesheetRole();
  }

  ngOnChanges(){
  }

  sortDataByFromDate(): void {
    this.PendingData.sort((a, b) => {
      const dateA = new Date(a.fromdate).getTime();
      const dateB = new Date(b.fromdate).getTime();
      return this.sortByFromDateRecent ? dateB - dateA : dateA - dateB;
    });
    this.sortByFromDateRecent = !this.sortByFromDateRecent; // toggle sorting direction
  }

  sortDataByToDate(): void {
    this.PendingData.sort((a, b) => {
      const dateA = new Date(a.todate).getTime();
      const dateB = new Date(b.todate).getTime();
      return this.sortByToDateRecent ? dateB - dateA : dateA - dateB;
    });
    this.sortByToDateRecent = !this.sortByToDateRecent; // toggle sorting direction
  }


  sortDataByTotalHours(): void {
    this.PendingData.sort((a, b) => {
      return this.sortByTotalHoursAsc ? a.totalhrs - b.totalhrs : b.totalhrs - a.totalhrs;
    });
    this.sortByTotalHoursAsc = !this.sortByTotalHoursAsc; // toggle sorting direction
  }
  sortDataByCreatedOn(): void {
    this.PendingData.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return this.sortByCreatedOnRecent ? dateB - dateA : dateA - dateB;
    });
    this.sortByCreatedOnRecent = !this.sortByCreatedOnRecent; // toggle sorting direction
  }

  sortDataByCandidate(): void {
    this.PendingData.sort((a, b) => {
      if (a.Candidate < b.Candidate) return this.sortByCandidateAsc ? -1 : 1;
      if (a.Candidate > b.Candidate) return this.sortByCandidateAsc ? 1 : -1;
      return 0;
    });
    this.sortByCandidateAsc = !this.sortByCandidateAsc; // toggle sorting direction
  }
  sortDataByCandidate1(): void {
    this.rejectedData.sort((a, b) => {
      if (a.Candidate < b.Candidate) return this.sortByCandidateAsc ? -1 : 1;
      if (a.Candidate > b.Candidate) return this.sortByCandidateAsc ? 1 : -1;
      return 0;
    });
    this.sortByCandidateAsc = !this.sortByCandidateAsc; // toggle sorting direction
  }

  // timesheetroles: number[] = []
  getTimesheetRole() {
    let Req = {
      traineeID: this.TraineeID
    };

    this.service.gettimesheetrole(Req).subscribe((x: any) => {
      this.timesheetrole = x.result;
    });
  }



  fetchPendingResult(){
    let Req = {
      traineeID: this.TraineeID,
      timesheetrole:this.timesheetrole,
      id: this.id,
      username:this.username
    };
    this.service.getPendingTimesheetResult(Req).subscribe((x: any) => {
        this.PendingData = x.result;
        this.loading = false;
    });
}


  fetchRejectedData(){
    let Req = {
      traineeID: this.TraineeID,
      timesheetrole:this.timesheetrole,
      username:this.username
    };
    this.service.getRejectedTimesheetResult(Req).subscribe((x: any) => {
      this.rejectedData = x.result;
    // this.loading = false;

    });
  }

  fetchCompletedData(){
    let Req = {
      traineeID: this.TraineeID,
      timesheetrole:this.timesheetrole,
      username:this.username
    };
    this.service.getCompletedTimesheetResult(Req).subscribe((x: any) => {
      this.completedData = x.result;
    // this.loading = false;

    });
  }

  fetchNonBillableData(){
    let Req = {
      traineeID: this.TraineeID,
      timesheetrole:this.timesheetrole,
      username:this.username
    };
    this.service.getNonBillableTimesheetResult(Req).subscribe((x: any) => {
      this.nonBillableData = x.result;
    });
    // this.loading = false;
  }

  CandidateSave() {
    let req = {
      userName: this.cookieService.get('userName1'), // Assuming userName is stored in the cookie
      firstName: this.firstname,
      lastName: this.lastname,
      email: this.candidateEmail,
      phone: this.phonenumber,
      currentLocation: this.currentLocation,
      orgID: this.OrgID,
    };
    console.log(req);
    this.service.insertTimesheetTraineeCandidate(req).subscribe(
      (x: any) => {
        this.messageService.add({ severity: 'success', summary: 'Successfully', detail: 'Candidate Added' });
      },
      (error: any) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to Add Candidate' });
      }
    );
  }
  
  
  gethrmsLocation() {
    let Req = {
      TraineeID: this.TraineeID,
      orgID: this.OrgID
    };
    this.service.getLocation(Req).subscribe((x: any) => {
      this.Locations = x;
    });
  }

  deleteItem(id: any): void {
    let Req = {
      Id: id,
    };
  
    this.service.deleteTimesheet(Req).subscribe((x: any) => {
      var flag1 = x.flag;
      if (flag1 === 1) {
        this.messageService.add({
          severity: 'success',
          summary: 'Timesheet Deleted Successfully',
        });
        this.fetchPendingResult();
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Please try again later',
        });
      }
    });    
  }
  
}