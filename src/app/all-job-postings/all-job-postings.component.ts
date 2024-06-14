import { AllJobPostingsService } from './all-job-postings.service';
import { MatDialog } from '@angular/material/dialog';
import { Component, OnInit, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { MessageService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { request } from 'http';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-all-job-postings',
  templateUrl: './all-job-postings.component.html',
  styleUrls: ['./all-job-postings.component.scss'],
  providers: [AllJobPostingsService, CookieService, MessageService],
})

export class AllJobPostingsComponent implements OnInit {
  emailForm: FormGroup;
  loading: boolean = false;

  OrgID: string = '';
  JobID: string = '';
  TraineeID: string = '';
  showConfirmationDialog: boolean = false;
  jobID: any;
  jobs: any[];
  noResultsFound: boolean = true;
  recruiterNames: any;
  deleteIndex: any;
  IsAdmin: string;
  usertype: string;
job: any;
recipientEmail: string;
selectedJobTitle: string;
selectedJobID: string;
selectedJobDescription: string;

  // roles: string[] = ["Recruiter", "Admin", "User"];

  ngOnInit(): void {
    this.loading = true;
    this.OrgID = this.cookieService.get('OrgID');
    this.IsAdmin = this.cookieService.get('IsAdmin');
    this.TraineeID = this.cookieService.get('TraineeID');
    this.usertype = this.cookieService.get('usertype');
    this.jobID = this.route.snapshot.params["jobID"];
console.log(this.usertype);
  
    this.fetchjobpostinglist();
    this.getAssigneelist();
   
  }
  constructor(private fb: FormBuilder,private dialog: MatDialog, private cookieService: CookieService, private service: AllJobPostingsService, private messageService: MessageService, private router: Router, private route: ActivatedRoute,private http: HttpClient) {
    this.jobID = this.route.snapshot.params["jobID"];

    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      message: ['', Validators.required]
    });
    
   }


  ngOnChanges(): void {
    // this.fetchuserlist();
  }


  fetchjobpostinglist() {
    let Req = {
      OrgID: this.OrgID,
      TraineeID:this.TraineeID,
      IsAdmin:this.IsAdmin
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

  getAssigneelist() {
    let Req = {
      TraineeID: this.TraineeID,
      orgID: this.OrgID,
    };
    this.service.fetchassigneeRecruiter(Req).subscribe((x: any) => {
      this.recruiterNames = x;
      
    }),
    (error: any) => {
      // Error callback
      console.error('Error occurred:', error);
      // Handle error here
      this.loading = false; // Set loading to false on error
    };
  }

  // updateSelected(traineeID: number) {
  //   this.loading = true;
  //  var req = {
  //   traineeid : traineeID,
  //  }
  //   this.service.TBassignee(req).subscribe((x: any) => {
  //     if(x.flag == 1){
  //       this.messageService.add({ severity: 'success', summary: 'Data Updated' });
  //       this.loading = false;
  //     }else{
  //       this.messageService.add({ severity: 'error', summary: 'Failed to Updated' });
  //       this.loading = false;
  //     }
  //   });
  //  }
  //   assginee(assginee: any) {
  //     throw new Error('Method not implemented.');
  //   }
  assignee: any;
  // updateSelected(traineeId: number, newValue: string) {
  //   const foundRecruiter = this.recruiterNames.find(name => name.TraineeID === traineeId);
  //   if (foundRecruiter) {
  //     foundRecruiter.assignee = newValue;
  //     console.log(`Assignee for TraineeID ${traineeId} changed to ${newValue}`);
  //   }
  // }
  updateSelected(selectedValue: any,JobID:any) {
    console.log("Selected value:", selectedValue);

    var req = {
      traineeid: this.TraineeID,
      selectedValue: selectedValue,
      JobID:JobID
    }
    this.service.TBassignee(req).subscribe((x: any) => {
      this.messageService.add({ severity: 'success', summary: 'Data Updated' });
      this.loading = false;
    }),
    (error: any) => {
      // Error callback
      console.error('Error occurred:', error);
      // Handle error here
      this.loading = false; // Set loading to false on error
    };
  }

  deletejobdata(JobID:any){
    this.deleteIndex = JobID;
    this.showConfirmationDialog = true;

  }
  deleteJobPosting(JobID:any) {
    var req = {
      JobID:this.deleteIndex,
    }
    this.service.deleteJobPost(req).subscribe((x: any) => {
      this.messageService.add({ severity: 'success', summary: 'Removed Job' });
      this.fetchjobpostinglist();
      this.showConfirmationDialog = false;

    }),
    (error: any) => {
      console.error('Error occurred:', error);
      this.loading = false;
    };
  }

  onRecruiterSelected(traineeID: number) {
    const selectedRecruiter = this.recruiterNames.find((name: { TraineeID: number; }) => name.TraineeID === +traineeID);
    console.log('Selected Recruiter:', selectedRecruiter);
  }


  openEmailModal(jobTitle: string, jobID: string,JobDescription: string) {
    this.selectedJobTitle = jobTitle;
    this.selectedJobID = jobID;
    this.selectedJobDescription= JobDescription;
    console.log(jobTitle,jobID,JobDescription)
  }

  
  sendEmail() {
    const req = {
      to: this.recipientEmail,
      subject: `Job Details: ${this.selectedJobTitle} -${this.selectedJobID}`,
      content: `Job Description: ${this.selectedJobDescription}`
    };
  console.log(req)
    this.loading = true;

    this.service.JdEmailSent(req).subscribe(
      (response: any) => {
        this.loading = false;
        if(response.flag === 1) {
          this.messageService.add({ severity: 'success', summary: 'Mail Sent Successfully' });
      this.loading = false;
        } else {
          alert('Failed to send email');
        }
      },
      (error: any) => {
        this.loading = false;
        console.error('Error occurred:', error);
      }
    );
  }
  
  
  // jobs: any[] = []; // Your job list
  selectedJob: any;
  // noResultsFound: boolean = false;
  isModalOpen: boolean = false;

  openJobDescriptionModal(job: any) {
    this.selectedJob = job;
    this.isModalOpen = true;
  }

  closeJobDescriptionModal(event: Event) {
    this.isModalOpen = false;
  }

}
