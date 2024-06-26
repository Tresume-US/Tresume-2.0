import { Component, OnInit } from '@angular/core';
import { JobApplicationService } from './job-application.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { CookieService } from 'ngx-cookie-service';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-job-appication',
  templateUrl: './job-application.component.html',
  styleUrls: ['./job-application.component.scss'],
  providers: [JobApplicationService, CookieService, MessageService],
})
export class JobApplicationComponent implements OnInit {
  loading:boolean = false;
jobs: any;
editmode: boolean = false;
selectedDate: string = '';
selectedOption: string = '';
showDateOptions: boolean = false;
OrgID:string = '';
JobID:string = '';
TraineeID:string = '';
noResultsFound:boolean = false;

ngOnInit(): void {
  this.loading = true;
  this.OrgID = this.cookieService.get('OrgID');
  this.JobID = this.cookieService.get('userName1');
  this.TraineeID = this.cookieService.get('TraineeID');
  this.fetchjobApplicationlist();
}


  fetchjobApplicationlist(){
    let Req = {
      OrgID: this.OrgID,
    };
    this.loading = false;
    this.service.getJobApplicationList(Req).subscribe((x: any) => {
      this.jobs = x.result;
      this.noResultsFound = this.jobs.length === 0;
    });
  }

  container: any;
  constructor(private dialog: MatDialog, private cookieService: CookieService, private service: JobApplicationService, private messageService: MessageService, private fb: FormBuilder,
    ){ }


  saveAs(format: string): void {
    console.log(`Save as ${format}`);
  }
  scrollLeft() {
    this.container.nativeElement.scrollLeft -= 50;
  }

  scrollRight() {
    this.container.nativeElement.scrollLeft += 50;
  }

  saveDate() {
    console.log('Selected Date:', this.selectedDate);
    console.log('Selected Option:', this.selectedOption);
  }

  cancelDate() {
    this.showDateOptions = false;
  }
  }


