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
 BillableData: any [] = [];
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
    this.fetchBillableData();
    this.gethrmsLocation();
    // this.getTimesheetRole();
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
  sortDataByFromDate1(): void {
    this.rejectedData.sort((a, b) => {
      const dateA = new Date(a.fromdate).getTime();
      const dateB = new Date(b.fromdate).getTime();
      return this.sortByFromDateRecent ? dateB - dateA : dateA - dateB;
    });
    this.sortByFromDateRecent = !this.sortByFromDateRecent; // toggle sorting direction
  }

  sortDataByToDate1(): void {
    this.rejectedData.sort((a, b) => {
      const dateA = new Date(a.todate).getTime();
      const dateB = new Date(b.todate).getTime();
      return this.sortByToDateRecent ? dateB - dateA : dateA - dateB;
    });
    this.sortByToDateRecent = !this.sortByToDateRecent; // toggle sorting direction
  }


  sortDataByTotalHours1(): void {
    this.rejectedData.sort((a, b) => {
      return this.sortByTotalHoursAsc ? a.totalhrs - b.totalhrs : b.totalhrs - a.totalhrs;
    });
    this.sortByTotalHoursAsc = !this.sortByTotalHoursAsc; // toggle sorting direction
  }
  sortDataByCreatedOn1(): void {
    this.rejectedData.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return this.sortByCreatedOnRecent ? dateB - dateA : dateA - dateB;
    });
    this.sortByCreatedOnRecent = !this.sortByCreatedOnRecent; // toggle sorting direction
  }

  sortDataByCandidate2(): void {
    this.completedData.sort((a, b) => {
      if (a.Candidate < b.Candidate) return this.sortByCandidateAsc ? -1 : 1;
      if (a.Candidate > b.Candidate) return this.sortByCandidateAsc ? 1 : -1;
      return 0;
    });
    this.sortByCandidateAsc = !this.sortByCandidateAsc; // toggle sorting direction
  }
  sortDataByFromDate2(): void {
    this.completedData.sort((a, b) => {
      const dateA = new Date(a.fromdate).getTime();
      const dateB = new Date(b.fromdate).getTime();
      return this.sortByFromDateRecent ? dateB - dateA : dateA - dateB;
    });
    this.sortByFromDateRecent = !this.sortByFromDateRecent; // toggle sorting direction
  }

  sortDataByToDate2(): void {
    this.completedData.sort((a, b) => {
      const dateA = new Date(a.todate).getTime();
      const dateB = new Date(b.todate).getTime();
      return this.sortByToDateRecent ? dateB - dateA : dateA - dateB;
    });
    this.sortByToDateRecent = !this.sortByToDateRecent; // toggle sorting direction
  }


  sortDataByTotalHours2(): void {
    this.completedData.sort((a, b) => {
      return this.sortByTotalHoursAsc ? a.totalhrs - b.totalhrs : b.totalhrs - a.totalhrs;
    });
    this.sortByTotalHoursAsc = !this.sortByTotalHoursAsc; // toggle sorting direction
  }
  sortDataByCreatedOn2(): void {
    this.completedData.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return this.sortByCreatedOnRecent ? dateB - dateA : dateA - dateB;
    });
    this.sortByCreatedOnRecent = !this.sortByCreatedOnRecent; // toggle sorting direction
  }
  sortDataByCandidate3(): void {
    this.nonBillableData.sort((a, b) => {
      if (a.Candidate < b.Candidate) return this.sortByCandidateAsc ? -1 : 1;
      if (a.Candidate > b.Candidate) return this.sortByCandidateAsc ? 1 : -1;
      return 0;
    });
    this.sortByCandidateAsc = !this.sortByCandidateAsc; // toggle sorting direction
  }
  sortDataByFromDate3(): void {
    this.nonBillableData.sort((a, b) => {
      const dateA = new Date(a.fromdate).getTime();
      const dateB = new Date(b.fromdate).getTime();
      return this.sortByFromDateRecent ? dateB - dateA : dateA - dateB;
    });
    this.sortByFromDateRecent = !this.sortByFromDateRecent; // toggle sorting direction
  }

  sortDataByToDate3(): void {
    this.nonBillableData.sort((a, b) => {
      const dateA = new Date(a.todate).getTime();
      const dateB = new Date(b.todate).getTime();
      return this.sortByToDateRecent ? dateB - dateA : dateA - dateB;
    });
    this.sortByToDateRecent = !this.sortByToDateRecent; // toggle sorting direction
  }


  sortDataByTotalHours3(): void {
    this.nonBillableData.sort((a, b) => {
      return this.sortByTotalHoursAsc ? a.totalhrs - b.totalhrs : b.totalhrs - a.totalhrs;
    });
    this.sortByTotalHoursAsc = !this.sortByTotalHoursAsc; // toggle sorting direction
  }
  sortDataByCreatedOn3(): void {
    this.nonBillableData.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return this.sortByCreatedOnRecent ? dateB - dateA : dateA - dateB;
    });
    this.sortByCreatedOnRecent = !this.sortByCreatedOnRecent; // toggle sorting direction
  }
  

  // timesheetroles: number[] = []
  // getTimesheetRole() {
  //   let Req = {
  //     traineeID: this.TraineeID
  //   };

  //   this.service.gettimesheetrole(Req).subscribe((x: any) => {
  //     this.timesheetrole = x.result;
  //   });
  // }

//Commented by mariya


  fetchPendingResult(){
    let Req = {
      traineeID: this.TraineeID,
      timesheetrole:this.timesheetrole,
      id: this.id,
      username:this.username,
      admin:this.TraineeID
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
      username:this.username,
      admin:this.TraineeID
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
      username:this.username,
      admin:this.TraineeID
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
      username:this.username,
      admin:this.TraineeID
    };
    this.service.getNonBillableTimesheetResult(Req).subscribe((x: any) => {
      this.nonBillableData = x.result;
    });
    // this.loading = false;
  }

  fetchBillableData(){
    let Req = {
      traineeID: this.TraineeID,
      timesheetrole:this.timesheetrole,
      username:this.username,
      admin:this.TraineeID
    };
    this.service.getBillableTimesheetResult(Req).subscribe((x: any) => {
      this.BillableData = x.result;
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
        this.messageService.add({ severity: 'error', summary: 'Notification', detail: 'Failed to Add Candidate' });
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
    this.loading=true;
    this.service.deleteTimesheet(Req).subscribe((x: any) => {
      var flag1 = x.flag;
      if (flag1 === 1) {
        this.messageService.add({
          severity: 'success',
          summary: 'Timesheet Deleted Successfully',
        });
        this.fetchPendingResult();
        this.fetchRejectedData();
        this.fetchCompletedData();
        this.fetchNonBillableData();
        this.loading=false;
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Please try again later',
        });
      }
    });
  }

  getBadgeColor(letter: string): string {
    const colorMap: { [key: string]: string } = {
      'A': 'lightblue',
      'B': 'lightsteelblue',
      'C': 'lightcyan',
      'D': 'indianred',
      'E': 'lightgreen',
      'F': 'lightpink',
      'G': 'gold',
      'H': 'lightcoral',
      'I': 'mediumorchid',
      'J': 'lemonchiffon',
      'K': 'khaki',
      'L': 'lavender',
      'M': 'mediumvioletred',
      'N': 'lightnavy',
      'O': 'lightsalmon',
      'P': 'plum',
      'Q': 'lightseagreen',
      'R': 'lightsalmon',
      'S': 'lightgrey',
      'T': 'lightcyan',
      'U': 'cornflowerblue',
      'V': 'violet',
      'W': 'wheat',
      'X': 'mediumseagreen',
      'Y': 'green',
      'Z': 'lightyellow', 
    };
    
  
    const defaultColor = '#4cacff'; 

    const color = colorMap[letter.toUpperCase()];
    return color ? color : defaultColor;
  }
  
  getStatusColor(status: number): string {
    switch (status) {
        case 1:
            return '#FFBF00'; 
        case 2:
            return 'red'; 
        default:
            return 'green'; 
    }
}

  
  
  
}