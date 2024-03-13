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
  noResultsFound: boolean = true;
  timesheetrole: any;
  id:string = '';
  username: any;

  constructor(private cookieService: CookieService, private service: TimesheetListService, private messageService: MessageService)
  {}

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
  }

  ngOnChanges(): void{
    // this.fetchtimesheet();
  }

  // fetchtimesheet(){
  //   let Req = {
  //     traineeID: this.TraineeID,
  //     timesheetrole:this.timesheetrole
  //   };
  //   this.service.getAllTimeList(Req).subscribe((x: any) => {
  //     this.tableData = x.result;
  //     this.noResultsFound = this.tableData.length === 0;
  //   });
  // }


    fetchPendingResult(){
    let Req = {
      traineeID: this.TraineeID,
      timesheetrole:this.timesheetrole,
      id: this.id,
      username:this.username
    };
    this.service.getPendingTimesheetResult(Req).subscribe((x: any) => {
      this.PendingData = x.result;
       this.noResultsFound = this.PendingData.length === 0;
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
      this.noResultsFound = this.rejectedData.length === 0;
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
      this.noResultsFound = this.completedData.length === 0;
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
      this.noResultsFound = this.nonBillableData.length === 0;
    });
    // this.loading = false;
  }

  firstname:any;
  lastname:any;
  candiateEmail:any;
  phonenumber:any;
  selectedGender:any;
  Locations: any;
  currentLocation: any;

  CandidateSave(){
    let req= {
      firstname: this.firstname,
      lastname:this.lastname,
      candiateEmail:this.candiateEmail,
      phonenumber:this.phonenumber,
      // selectedGender:this.selectedGender,
      currentLocation: this.currentLocation
    }
    console.log(req);

    this.service.insertTimesheetTraineeCandidate(req).subscribe(
      (x: any) => {
        this.messageService.add({ severity: 'success', summary: 'Success Message', detail: 'Candidate Added' });
      },
      (error: any) => {
        this.messageService.add({ severity: 'error', summary: 'Error Message', detail: 'Failed to Add Candidate' });
      }
    )
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
}