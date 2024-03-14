import { AllJobPostingsService } from './all-job-postings.service';
import { MatDialog } from '@angular/material/dialog';
import { Component, OnInit, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-all-job-postings',
  templateUrl: './all-job-postings.component.html',
  styleUrls: ['./all-job-postings.component.scss'],
  providers: [AllJobPostingsService, CookieService,MessageService],
})

export class AllJobPostingsComponent implements OnInit{
  loading:boolean = false;

  OrgID:string = '';
  JobID:string = '';
  TraineeID:string = '';
  jobs:any[];
  noResultsFound:boolean = true;

// roles: string[] = ["Recruiter", "Admin", "User"];

ngOnInit(): void {
  this.loading = true;
  this.OrgID = this.cookieService.get('OrgID');
  // this.JobID = this.cookieService.get('userName1');
  this.TraineeID = this.cookieService.get('TraineeID');
  this.fetchjobpostinglist();
}
  constructor(private dialog: MatDialog,private cookieService: CookieService, private service:AllJobPostingsService,private messageService: MessageService) {}


ngOnChanges(): void{
  // this.fetchuserlist();
}


fetchjobpostinglist(){
  let Req = {
    OrgID: this.OrgID,
  };
  this.service.getJobPostingList(Req).subscribe((x: any) => {
    this.jobs = x.result;
    this.noResultsFound = this.jobs.length === 0;
  this.loading = false;
  
  }),
  (error: any) => {
    // Error callback
    console.error('Error occurred:', error);
    // Handle error here
    this.loading = false; // Set loading to false on error
  };
}

jobOptions = ['My Jobs', 'Assigned Jobs', 'All Jobs'];


}
