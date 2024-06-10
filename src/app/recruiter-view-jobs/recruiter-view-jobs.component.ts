import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { MessageService } from 'primeng/api';
import { RecruiterViewJobsService } from './recruiter-view-jobs.service';
@Component({
  selector: 'app-recruiter-view-jobs',
  templateUrl: './recruiter-view-jobs.component.html',
  providers: [CookieService, MessageService,RecruiterViewJobsService],
  styleUrls: ['./recruiter-view-jobs.component.scss']
})
export class RecruiterViewJobsComponent implements OnInit {

  jobID:any;
  constructor(private router: Router, private route: ActivatedRoute, private messageService: MessageService,private cookieService: CookieService,) { 
    this.jobID = this.route.snapshot.params["jobID"];
  }

  ngOnInit(): void {
  }

}
